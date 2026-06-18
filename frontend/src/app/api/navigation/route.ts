import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_NAVIGATION = {
  mainLinks: [
    { label: "Mentorship", url: "#guidance" },
    { label: "Courses", url: "#courses" },
    { label: "Notes", url: "#materials-section" },
    { label: "Test Series", url: "#tests-section" }
  ],
  dropdownLinks: [
    { label: "Free Resources", url: "#free-resources" },
    { label: "Upcoming Events", url: "#events" },
    { label: "Testimonials", url: "#testimonials" },
    { label: "Blogs", url: "/blogs" },
    { label: "About Us", url: "#about" },
    { label: "FAQ", url: "#faq" }
  ]
};

export async function GET() {
  try {
    const docRef = doc(db, 'navigation', 'main');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      // Auto-seed if it doesn't exist yet!
      await setDoc(docRef, DEFAULT_NAVIGATION);
      return NextResponse.json(DEFAULT_NAVIGATION);
    }
  } catch (error) {
    console.error('Navigation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
