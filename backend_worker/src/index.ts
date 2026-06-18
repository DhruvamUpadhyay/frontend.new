import { importX509, jwtVerify } from 'jose';

export interface Env {
  FIREBASE_PROJECT_ID: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  ADMIN_PHONE_NUMBER: string;
  TAWK_PROPERTY_ID: string;
  TAWK_WIDGET_ID: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Verify Firebase JWT token
async function verifyFirebaseToken(token: string, projectId: string): Promise<any> {
  const keysRes = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  const keys = await keysRes.json() as Record<string, string>;
  
  // Extract kid from unverified token header
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
  const kid = header.kid;
  
  if (!keys[kid]) throw new Error('Key not found');
  
  const publicKey = await importX509(keys[kid], 'RS256');
  
  const { payload } = await jwtVerify(token, publicKey, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  
  return payload;
}

// Convert JSON to Firestore document
function jsonToFirestore(data: any): any {
  const fields: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') fields[key] = { stringValue: value };
    else if (typeof value === 'number') {
      if (Number.isInteger(value)) fields[key] = { integerValue: value.toString() };
      else fields[key] = { doubleValue: value };
    }
    else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    else if (Array.isArray(value)) {
      fields[key] = { arrayValue: { values: value.map(v => jsonToFirestore({ v }).v) } };
    }
  }
  return fields;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- Cloudinary Upload Signature Endpoint ---
    if (url.pathname === '/api/cloudinary-signature' && request.method === 'GET') {
      // Very basic auth check
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      try {
        await verifyFirebaseToken(authHeader.split(' ')[1], env.FIREBASE_PROJECT_ID);
        
        const timestamp = Math.round((new Date).getTime() / 1000);
        const signatureString = `timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
        
        const msgUint8 = new TextEncoder().encode(signatureString);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return new Response(JSON.stringify({
          signature,
          timestamp,
          cloudName: env.CLOUDINARY_CLOUD_NAME,
          apiKey: env.CLOUDINARY_API_KEY
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } catch (err) {
        return new Response('Unauthorized token', { status: 401, headers: corsHeaders });
      }
    }

    // --- Firebase Collections CRUD ---
    if (url.pathname.startsWith('/api/')) {
      const parts = url.pathname.split('/').filter(Boolean);
      // Expected: api, collection, [id]
      if (parts.length < 2) return new Response("Not Found", { status: 404, headers: corsHeaders });
      
      const collection = parts[1];
      const docId = parts[2]; // Might be undefined
      
      const allowedCollections = ['courses', 'tests', 'materials', 'events', 'podcasts', 'settings', 'newsletter', 'media', 'landing_page'];
      if (!allowedCollections.includes(collection)) {
        return new Response("Not Found", { status: 404, headers: corsHeaders });
      }

      // Handle Read (Public, Cached)
      if (request.method === 'GET') {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`;
        try {
          const response = await fetch(firestoreUrl);
          if (!response.ok) throw new Error(`Firestore error: ${response.status}`);
          const data = await response.json() as any;
          
          const documents = data.documents || [];
          const formatted = documents.map((doc: any) => {
             const id = doc.name.split('/').pop();
             const fields = doc.fields || {};
             const parsed: any = { id };
             for (const [key, value] of Object.entries(fields)) {
               const val = value as any;
               if (val.stringValue !== undefined) parsed[key] = val.stringValue;
               else if (val.integerValue !== undefined) parsed[key] = parseInt(val.integerValue, 10);
               else if (val.booleanValue !== undefined) parsed[key] = val.booleanValue;
               else if (val.arrayValue !== undefined) {
                 parsed[key] = (val.arrayValue.values || []).map((v: any) => v.stringValue || v.integerValue);
               }
             }

             // Inject secrets into settings payload
             if (collection === 'settings') {
                parsed.tawkPropertyId = env.TAWK_PROPERTY_ID;
                parsed.tawkWidgetId = env.TAWK_WIDGET_ID;
             }

             return parsed;
          });

          // If settings is completely empty, still return the Tawk variables
          if (collection === 'settings' && formatted.length === 0) {
             formatted.push({
                tawkPropertyId: env.TAWK_PROPERTY_ID,
                tawkWidgetId: env.TAWK_WIDGET_ID
             });
          }

          return new Response(JSON.stringify(formatted), {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              // Cache data for 60 seconds at edge
              "Cache-Control": "public, max-age=60"
            }
          });
        } catch (error: any) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
        }
      }

      // Handle Write Operations (POST, PUT, DELETE) - Require Authentication
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        // Exception: Anyone can subscribe to newsletter
        if (collection === 'newsletter' && request.method === 'POST') {
           // Allow public POST for newsletter
        } else {
           return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }
      } else {
        try {
          await verifyFirebaseToken(authHeader.split(' ')[1], env.FIREBASE_PROJECT_ID);
        } catch (err: any) {
          return new Response(`Unauthorized: ${err.message}`, { status: 401, headers: corsHeaders });
        }
      }

      const firebaseUrlBase = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}`;

      try {
        if (request.method === 'POST') {
          const body = await request.json();
          const firestoreFields = jsonToFirestore(body);
          
          let url = firebaseUrlBase;
          if (body.id) {
             url += `?documentId=${body.id}`;
             delete firestoreFields.id;
          }
          
          const res = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ fields: firestoreFields }),
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          return new Response(JSON.stringify(data), { status: res.status, headers: corsHeaders });
        }
        
        if (request.method === 'PUT' && docId) {
          const body = await request.json();
          const firestoreFields = jsonToFirestore(body);
          
          // Note: Firestore REST uses PATCH for updates. updateMask is needed.
          const updateMask = Object.keys(body).map(k => `updateMask.fieldPaths=${k}`).join('&');
          const res = await fetch(`${firebaseUrlBase}/${docId}?${updateMask}`, {
            method: 'PATCH',
            body: JSON.stringify({ fields: firestoreFields }),
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();
          return new Response(JSON.stringify(data), { status: res.status, headers: corsHeaders });
        }

        if (request.method === 'DELETE' && docId) {
          const res = await fetch(`${firebaseUrlBase}/${docId}`, {
            method: 'DELETE'
          });
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        }
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response("FBP Backend Worker is running!", { headers: corsHeaders });
  },
};
