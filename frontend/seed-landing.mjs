import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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
