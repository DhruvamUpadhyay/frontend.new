import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-uc0TB9yFHspati4GzKpyWa6PEMby3EU",
  authDomain: "frontend-cms-104a4.firebaseapp.com",
  projectId: "frontend-cms-104a4",
  storageBucket: "frontend-cms-104a4.firebasestorage.app",
  messagingSenderId: "1050079273059",
  appId: "1:1050079273059:web:9f59a9292bd621b9195856"
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
  const cloudName = 'dikk1fy3i';
  const apiKey = '919816587394218';
  const apiSecret = 'emm6iZY8aVVML-jSUeVhb47fHAI';
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
