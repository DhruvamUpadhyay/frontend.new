const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Read the .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');

const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
});

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY ? env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
  })
});

async function run() {
  const db = admin.firestore();
  const snapshot = await db.collection('admins').get();
  
  console.log(`Found ${snapshot.size} admins.`);
  
  let deletedCount = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    // Assuming phone numbers might not have an '@' symbol
    const id = doc.id;
    if (!id.includes('@') && id.match(/\d+/)) {
      console.log(`Deleting phone number admin: ${id}`);
      await db.collection('admins').doc(id).delete();
      deletedCount++;
    }
  }
  
  console.log(`Successfully deleted ${deletedCount} phone number admins.`);
}

run().catch(console.error);
