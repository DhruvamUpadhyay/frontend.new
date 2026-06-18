import { db } from '@/config/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import LandingPageClient from './LandingPageClient';

// This is a Next.js Server Component!
// It runs ONLY on the server, ensuring API keys are never leaked to the browser.
// It fetches data and pre-renders the HTML for perfect SEO.

// Revalidate every 60 seconds (ISR caching)
export const revalidate = 60;

export default async function Page() {
  let courses = [];
  let events = [];
  let tests = [];
  let materials = [];
  let landingPageData = null;

  try {
    // Parallel fetching for performance
    const [coursesSnap, eventsSnap, testsSnap, materialsSnap, landingSnap] = await Promise.all([
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'events')),
      getDocs(collection(db, 'tests')),
      getDocs(collection(db, 'materials')),
      getDoc(doc(db, 'landing_page', 'global'))
    ]);

    courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    events = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    tests = testsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    materials = materialsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    if (landingSnap.exists()) {
      landingPageData = { id: landingSnap.id, ...landingSnap.data() };
    }
  } catch (error) {
    console.error("Error fetching data for landing page:", error);
  }

  return (
    <LandingPageClient 
      initialCourses={courses}
      initialEvents={events}
      initialTests={tests}
      initialMaterials={materials}
      landingPageData={landingPageData}
    />
  );
}
