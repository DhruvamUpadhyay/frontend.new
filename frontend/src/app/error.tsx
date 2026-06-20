"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import toast from "react-hot-toast";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { CustomMarkdown } from "@/components/CustomMarkdown";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [customPage, setCustomPage] = useState<any>(null);

  useEffect(() => {
    console.error("Global Application Error:", error);
    toast.error("A server error occurred. Please try again.", { id: "global-error" });

    const fetchCustomErrorPage = async () => {
      try {
        const q = query(
          collection(db, 'pages'),
          where('slug', '==', 'error'),
          where('published', '==', true),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setCustomPage(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Failed to load custom error page:", err);
      }
    };
    fetchCustomErrorPage();
  }, [error]);

  if (customPage) {
    return (
      <div className="min-h-screen pt-40 pb-20 max-w-4xl mx-auto px-6 relative z-10 text-left bg-[#1D1A39]">
        <article className="space-y-8 bg-[#1D1A39]/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <div className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs font-extrabold text-red-400 uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              Application Error
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white leading-tight">
              {customPage.title}
            </h1>
          </div>
          <div className="text-white/80 font-medium leading-relaxed text-base font-sans max-w-none">
            <CustomMarkdown content={customPage.content || ''} />
          </div>
          <div className="pt-6 border-t border-white/10 flex gap-4">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link href="/" className="px-6 py-2.5 rounded-xl bg-[#F59F59]/20 border border-[#F59F59]/30 text-[#F59F59] font-bold hover:bg-[#F59F59]/30 transition-all flex items-center justify-center gap-2 text-sm">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </article>
      </div>
    );
  }

  // Fallback default error layout
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#1D1A39]">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#F59F59] rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>

      <div className="relative z-10 glass-card p-12 rounded-3xl max-w-2xl w-full flex flex-col items-center border border-white/10 shadow-2xl">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 shadow-inner border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
          An Error Occurred
        </h1>
        
        <p className="text-white/70 text-lg mb-10 max-w-md leading-relaxed font-medium">
          We encountered an unexpected error while processing your request. Please try again or return to the homepage.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => reset()}
            className="group relative px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Try Again
          </button>
          
          <Link 
            href="/" 
            className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] font-bold overflow-hidden shadow-[0_0_20px_rgba(245,159,89,0.2)] hover:shadow-[0_0_30px_rgba(245,159,89,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Home className="w-5 h-5" />
              Return Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
