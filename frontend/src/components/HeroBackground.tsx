"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Fingerprint, Activity, Microscope } from "lucide-react";

export function HeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full bg-navy overflow-hidden">
      
      {/* ---------------------------------------------------- */}
      {/* FLOATING FORENSIC ELEMENTS                             */}
      {/* ---------------------------------------------------- */}
      
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        
        {/* Floating Icon 1 */}
        <div className="absolute top-[15%] left-[10%] animate-[float-slow_20s_infinite_ease-in-out]">
          <svg className="w-20 h-20 text-white opacity-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="7" strokeWidth="2" />
            <path d="M15 15l6 6" strokeWidth="3" strokeLinecap="round" />
            <path d="M7 7c1-1 3-1 4.5 0" strokeWidth="1" stroke="currentColor" opacity="0.6" />
            <circle cx="10" cy="10" r="4.5" strokeWidth="0.5" strokeDasharray="2 2" opacity="0.5" />
            <path d="M16 16l3 3" strokeWidth="4" strokeLinecap="round" stroke="currentColor" />
          </svg>
        </div>

        {/* Floating Icon 2 */}
        <div className="absolute top-[60%] left-[20%] animate-[float-complex_25s_infinite_ease-in-out]" style={{ animationDelay: '2s' }}>
          <Fingerprint className="w-24 h-24 text-amber opacity-30" />
        </div>

        {/* Floating Icon 3 */}
        <div className="absolute top-[20%] right-[15%] animate-[float-slow_22s_infinite_ease-in-out]" style={{ animationDelay: '1s' }}>
          <Microscope className="w-20 h-20 text-white opacity-40" />
        </div>

        {/* Floating Icon 4 */}
        <div className="absolute top-[70%] right-[25%] animate-[float-complex_30s_infinite_ease-in-out]" style={{ animationDelay: '3s' }}>
          <Activity className="w-16 h-16 text-amber opacity-40" />
        </div>
        
        {/* Floating Icon 5 */}
        <div className="absolute top-[40%] right-[5%] animate-[float-slow_18s_infinite_ease-in-out]" style={{ animationDelay: '4s' }}>
          <ShieldCheck className="w-12 h-12 text-white opacity-30" />
        </div>

      </div>
      

    </div>
  );
}
