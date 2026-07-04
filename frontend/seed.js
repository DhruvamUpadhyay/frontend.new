import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedNavigation() {
  console.log("Seeding Navigation...");
  await setDoc(doc(db, 'navigation', 'main'), {
    mainLinks: [
      { label: "Courses", url: "#courses" },
      { label: "Tests", url: "#tests" },
      { label: "Materials", url: "#materials" }
    ],
    dropdownLinks: [
      { label: "Mock Tests", url: "/mock-tests" },
      { label: "Previous Year Papers", url: "/pyq" },
      { label: "Study Materials", url: "/materials" },
      { label: "Syllabus", url: "/syllabus" },
      { label: "Contact Support", url: "#contact" }
    ]
  });

  await setDoc(doc(db, 'navigation', 'footer'), {
    exploreLinks: [
      { label: "Courses", url: "#courses" },
      { label: "Tests", url: "#tests" },
      { label: "Materials", url: "#materials" }
    ],
    companyLinks: [
      { label: "About Us", url: "/about" },
      { label: "Careers", url: "/careers" },
      { label: "Privacy Policy", url: "/privacy" },
      { label: "Terms of Service", url: "/terms" }
    ]
  });
  console.log("Navigation seeded successfully.");
}

async function seedMedia() {
  console.log("Fetching existing media from Cloudinary...");
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary credentials. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local');
  }

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image`, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
  
  if (!res.ok) {
    throw new Error(`Cloudinary API Error: ${await res.text()}`);
  }

  const data = await res.json();
  const images = data.resources || [];
  console.log(`Found ${images.length} images in Cloudinary. Checking against Firestore...`);

  const mediaCol = collection(db, 'media');
  const existingMediaSnap = await getDocs(mediaCol);
  const existingUrls = new Set();
  existingMediaSnap.forEach(doc => {
    existingUrls.add(doc.data().url);
  });

  let added = 0;
  for (const img of images) {
    if (!existingUrls.has(img.secure_url)) {
      await addDoc(mediaCol, {
        url: img.secure_url,
        publicId: img.public_id,
        filename: img.public_id.split('/').pop() || 'image',
        createdAt: img.created_at || new Date().toISOString()
      });
      added++;
    }
  }
  
  console.log(`Synced ${added} old Cloudinary images to the Media database.`);
}

async function run() {
  try {
    await seedNavigation();
    await seedMedia();
    console.log("All done!");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
