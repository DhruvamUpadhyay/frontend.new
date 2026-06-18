"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import toast from "react-hot-toast";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console and toast notification
    console.error("Global Application Error:", error);
    toast.error("A server error occurred. Please try again.", {
      id: "global-error", // Prevent duplicate toasts
    });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[#1D1A39]">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#F59F59] rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 glass-card p-12 rounded-3xl max-w-2xl w-full flex flex-col items-center border border-white/10 shadow-2xl">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 shadow-inner border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
          System Malfunction
        </h1>
        
        <p className="text-white/70 text-lg mb-10 max-w-md leading-relaxed font-medium">
          Our forensic servers encountered an unexpected error while processing your request. Don't worry, the evidence is safe.
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
