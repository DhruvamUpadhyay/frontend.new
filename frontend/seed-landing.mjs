import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

const pdfData = {
  heroTitle: "India's Fastest-Growing",
  heroSubtitle: "Forensic Science Education Hub",
  heroDescription: "Led by Priyanshi. Join our community of 1,50,000+ Forensic Enthusiasts and get access to the best courses and guidance.",
  heroButtonText: "Enroll Now",
  heroButtonLink: "https://app.forensicbypriyanshi.com",
  heroImage: "",
  stats1Value: "10000",
  stats1Label: "Active Learners",
  stats2Value: "150000",
  stats2Label: "Forensic Enthusiasts",
  stats3Value: "25000",
  stats3Label: "Students Taught",
  updatedAt: new Date().toISOString()
};

setDoc(doc(db, 'landing_page', 'global'), pdfData, { merge: true })
  .then(() => {
    console.log("Successfully seeded landing_page/global with PDF content!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding data:", err);
    process.exit(1);
  });
