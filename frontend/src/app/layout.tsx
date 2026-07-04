import type { Metadata } from "next";
import { Inter, Poppins, DM_Serif_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ToastProvider } from '@/components/ToastProvider';
import { ErrorSuppressor } from '@/components/ErrorSuppressor';
import { TawkController } from '@/components/TawkController';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://forensicsbypriyanshi.com';

export async function generateMetadata(): Promise<Metadata> {
  let title = "Forensics By Priyanshi — India's Premier Forensic Science Academy";
  let description = "India's leading forensic science education and exam preparation platform. Premium courses for CUET PG, NFSU Entrance, UGC NET, study notes, and direct 1-on-1 mentorship from Priyanshi Jain.";
  let ogImage = "https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png";

  try {
    const themeSnap = await getDoc(doc(db, 'theme', 'global'));
    if (themeSnap.exists()) {
      const data = themeSnap.data();
      title = data.siteTitle || title;
      description = data.metaDescription || description;
      ogImage = data.ogImage || ogImage;
    }
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
  }

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: '/',
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: SITE_URL,
      siteName: 'Forensics By Priyanshi',
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    other: {
      'theme-color': '#1D1A39',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Forensics By Priyanshi",
    "url": "https://forensicsbypriyanshi.com",
    "logo": "https://forensicsbypriyanshi.com/favicon.svg",
    "sameAs": [
      "https://www.youtube.com/@ForensicsByPriyanshi",
      "https://www.instagram.com/forensicsbypriyanshi"
    ],
    "description": "India's premier forensic science education platform, founded by Priyanshi Jain. Expert preparation for CUET PG, NFSU Entrance, and UGC NET."
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${dmSerifDisplay.variable} antialiased scroll-smooth`}>
      <body className="min-h-screen flex flex-col bg-[#1D1A39] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <ErrorSuppressor />
        <TawkController />
        <ToastProvider />
        {children}
        <Script 
          id="tawk" 
          strategy="lazyOnload" 
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              Tawk_API.customStyle = {
                visibility: {
                  desktop: {
                    position: 'br',
                    xOffset: 15,
                    yOffset: 15
                  },
                  mobile: {
                    position: 'br',
                    xOffset: 10,
                    yOffset: 10
                  }
                }
              };
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/6a32dfb7c770bc1d46b1f98f/1jrbbjq28';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
