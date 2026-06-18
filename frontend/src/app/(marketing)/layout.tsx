import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  
  let navData = { mainLinks: [], dropdownLinks: [] };
  let footerData = { exploreLinks: [], companyLinks: [] };
  
  try {
    const [navSnap, footerSnap] = await Promise.all([
      getDoc(doc(db, 'navigation', 'main')),
      getDoc(doc(db, 'navigation', 'footer'))
    ]);

    if (navSnap.exists() && navSnap.data().mainLinks?.length > 0) {
      navData = navSnap.data() as any;
    } else {
      navData = undefined as any;
    }

    if (footerSnap.exists() && footerSnap.data().exploreLinks?.length > 0) {
      footerData = footerSnap.data() as any;
    } else {
      footerData = undefined as any;
    }
  } catch (err) {
    console.error("Failed to fetch nav/footer data", err);
  }

  return (
    <div className="min-h-screen bg-[#1D1A39] flex flex-col">
      <Navbar navData={navData} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer footerData={footerData} />
    </div>
  );
};
