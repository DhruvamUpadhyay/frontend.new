import type { Metadata } from "next";
import { Manrope, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ToastProvider } from '@/components/ToastProvider';

export const revalidate = 60; // Cache SEO data for 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  try {
    const themeSnap = await getDoc(doc(db, 'theme', 'global'));
    if (themeSnap.exists()) {
      const data = themeSnap.data();
      return {
        title: data.siteTitle || "FBP - Master Forensic Science",
        description: data.metaDescription || "Master Forensic Science with Expert Guidance",
      };
    }
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
  }
  
  return {
    title: "FBP - Master Forensic Science",
    description: "Master Forensic Science with Expert Guidance",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#1D1A39] text-white">
        <ToastProvider />
        {children}
        <Script 
          id="tawk" 
          strategy="lazyOnload" 
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
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
