import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { VisitorTracker } from '@/components/VisitorTracker';

import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  
  let navData = { mainLinks: [], dropdownLinks: [] };
  let footerData = { exploreLinks: [], companyLinks: [] };
  let systemData: any = null;
  
  try {
    const [navSnap, footerSnap, systemSnap] = await Promise.all([
      getDoc(doc(db, 'navigation', 'main')),
      getDoc(doc(db, 'navigation', 'footer')),
      getDoc(doc(db, 'settings', 'system'))
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

    if (systemSnap.exists()) {
      systemData = systemSnap.data();
    }
  } catch (err) {
    console.error("Failed to fetch layouts or system settings data", err);
  }

  const primaryColor = systemData?.primaryColor || '#1D1A39';
  const accentColor = systemData?.accentColor || '#F59F59';
  const secondaryColor = systemData?.secondaryColor || '#E8BCB9';
  const baseFontSize = systemData?.baseFontSize || '14.4px';
  const customCss = systemData?.customCss || '';

  // Render Maintenance Mode Screen if Active
  if (systemData?.maintenanceMode) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-navy"
        style={{ backgroundColor: primaryColor }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          :root {
            --color-navy: ${primaryColor} !important;
            --color-amber: ${accentColor} !important;
            --color-peach: ${secondaryColor} !important;
          }
          html {
            font-size: ${baseFontSize} !important;
          }
          ${customCss}
        `}} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F59F59] rounded-full mix-blend-multiply filter blur-[128px] opacity-15"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E8BCB9] rounded-full mix-blend-multiply filter blur-[128px] opacity-15"></div>

        <div className="relative z-10 glass-card p-12 rounded-3xl max-w-xl w-full border border-white/10 shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-inner">
            <span className="text-3xl">🔬</span>
          </div>
          <h1 className="font-display text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber to-peach">
            Evidence Lab Upgrading
          </h1>
          <p className="text-white/70 text-base mb-6 leading-relaxed font-medium">
            Our systems are currently undergoing scheduled upgrades. Rest assured, all case files and evidence databases remain highly secure.
          </p>
          <div className="text-xs font-bold text-white/40 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
            Back Online Shortly
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col" style={{ backgroundColor: primaryColor }}>
      {/* Inject System Theme Variable Overrides & Custom CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --color-navy: ${primaryColor} !important;
          --color-amber: ${accentColor} !important;
          --color-peach: ${secondaryColor} !important;
        }
        html {
          font-size: ${baseFontSize} !important;
        }
        ${customCss}
      `}} />

      {/* Broadcast Banner Announcement */}
      {systemData?.bannerActive && (
        <div 
          className="text-center py-2 px-4 text-xs font-extrabold text-white z-50 relative flex items-center justify-center gap-2 shadow-md"
          style={{ backgroundColor: systemData.bannerColor || '#F59F59' }}
        >
          <span>📢 {systemData.bannerText}</span>
        </div>
      )}

      <VisitorTracker />
      <Navbar navData={navData} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer footerData={footerData} />
    </div>
  );
};
