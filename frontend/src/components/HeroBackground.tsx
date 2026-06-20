"use client";

import React, { useEffect, useState } from "react";
import { Search, Folder, User, ShieldCheck, Fingerprint, Activity, FileText, Dna, ScanFace } from "lucide-react";

export function HeroBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full bg-[#1D1A39] overflow-hidden">
      {/* ---------------------------------------------------- */}
      {/* BACKGROUND EFFECTS & GRID                              */}
      {/* Hex/Dot Grid Texture */}
      <div 
        className="absolute inset-0 opacity-[0.2]" 
        style={{
          backgroundImage: 'radial-gradient(#F59F59 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Deep Purple Radial Glow (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2E205E]/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Ambient Glows */}
      <div className="absolute top-[20%] left-[30%] w-[600px] h-[600px] bg-[#E8BCB9]/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-[#F59F59]/5 rounded-full blur-[150px]" />

      {/* ---------------------------------------------------- */}
      {/* MASSIVE BACKGROUND VISUALS                             */}
      {/* ---------------------------------------------------- */}

      {/* ---------------------------------------------------- */}
      {/* HOLOGRAPHIC HUD PANELS (Visible on Desktop)            */}
      {/* ---------------------------------------------------- */}
      <div className="hidden lg:block absolute inset-0 opacity-90 pointer-events-none">
        
        {/* ---------------------------------------------------- */}
        {/* DIAGONAL EVIDENCE CHAIN (Left Side)                    */}
        {/* ---------------------------------------------------- */}
        <div className="absolute top-[10%] left-[8%] w-[300px] h-[700px]">
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_8px_rgba(176,125,255,0.5)]" viewBox="0 0 300 700">
            <path 
              d="M 50 50 L 150 150 L 180 230 L 100 450 L 140 550 L 80 650" 
              fill="none" 
              stroke="#b07dff" 
              strokeWidth="1.5" 
              strokeDasharray="4 6" 
              className="opacity-60 animate-[dash_20s_linear_infinite]"
            />
            {/* Small intermediate nodes */}
            <circle cx="150" cy="150" r="4" fill="#b07dff" className="opacity-80 animate-ping-slow" />
            <circle cx="150" cy="150" r="4" fill="#b07dff" className="opacity-100" />
            <circle cx="180" cy="230" r="4" fill="#b07dff" className="opacity-80 animate-ping-slow" style={{ animationDelay: '1s' }} />
            <circle cx="180" cy="230" r="4" fill="#b07dff" className="opacity-100" />
            <circle cx="140" cy="550" r="4" fill="#b07dff" className="opacity-80 animate-ping-slow" style={{ animationDelay: '0.5s' }} />
            <circle cx="140" cy="550" r="4" fill="#b07dff" className="opacity-100" />
          </svg>

          {/* Top Node: ANALYZE */}
          <div className="absolute top-[30px] left-[30px] flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full border border-[#b07dff] flex items-center justify-center bg-[#1D1A39] shadow-[0_0_25px_rgba(176,125,255,0.4)] relative">
              <div className="absolute inset-0 rounded-full bg-[#b07dff]/20 animate-ping-slow" />
              <Search className="w-4 h-4 text-[#b07dff] relative z-10" />
            </div>
            <span className="text-[#b07dff] text-xs font-bold tracking-widest uppercase opacity-80">Analyze</span>
          </div>

          {/* Middle Node: IDENTIFY */}
          <div className="absolute top-[430px] left-[80px] flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full border border-[#b07dff] flex items-center justify-center bg-[#1D1A39] shadow-[0_0_25px_rgba(176,125,255,0.4)] relative">
              <div className="absolute inset-0 rounded-full bg-[#b07dff]/20 animate-ping-slow" style={{ animationDelay: '1.5s' }} />
              <Fingerprint className="w-4 h-4 text-[#b07dff] relative z-10" />
            </div>
            <span className="text-[#b07dff] text-xs font-bold tracking-widest uppercase opacity-80">Identify</span>
          </div>

          {/* Bottom Node: EVIDENCE */}
          <div className="absolute top-[630px] left-[60px] flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full border border-[#b07dff] flex items-center justify-center bg-[#1D1A39] shadow-[0_0_25px_rgba(176,125,255,0.4)] relative">
              <div className="absolute inset-0 rounded-full bg-[#b07dff]/20 animate-ping-slow" style={{ animationDelay: '0.8s' }} />
              <Folder className="w-4 h-4 text-[#b07dff] relative z-10" />
            </div>
            <span className="text-[#b07dff] text-xs font-bold tracking-widest uppercase opacity-80">Evidence</span>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VERTICAL EVIDENCE CHAIN (Far Right Edge)               */}
        {/* ---------------------------------------------------- */}
        <div className="absolute top-[25%] right-[5%] flex flex-col items-center gap-10">
          
          {/* Vertical Dotted Line */}
          <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-[#F59F59]/30 to-transparent border-l border-dashed border-[#F59F59]/50 animate-[dash_10s_linear_infinite]" />

          {/* Node: Evidence */}
          <div className="relative group flex flex-col items-center gap-2">
            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-sm border border-white/20 bg-[#1D1A39] shadow-[0_0_20px_rgba(245,159,89,0.3)]">
              <div className="absolute inset-0 bg-[#F59F59]/10 animate-ping-slow" />
              {/* Target brackets */}
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-white/30" />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-white/30" />
              <Search className="w-4 h-4 text-[#F59F59]" />
            </div>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Evidence</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#F59F59] absolute -bottom-6 shadow-[0_0_8px_#F59F59]" />
          </div>

          {/* Node: Analysis */}
          <div className="relative group flex flex-col items-center gap-2 mt-4">
            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-sm border border-white/10 bg-[#1D1A39] shadow-[0_0_15px_rgba(245,159,89,0.1)]">
              {/* Target brackets */}
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-white/30" />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-white/30" />
              <Activity className="w-4 h-4 text-[#E8BCB9]" />
            </div>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Analysis</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8BCB9] absolute -bottom-6 shadow-[0_0_8px_#E8BCB9]" />
          </div>

          {/* Node: Identification */}
          <div className="relative group flex flex-col items-center gap-2 mt-4">
            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-sm border border-white/10 bg-[#1D1A39] shadow-[0_0_15px_rgba(245,159,89,0.1)]">
              {/* Target brackets */}
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-white/30" />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-white/30" />
              <Fingerprint className="w-4 h-4 text-[#F59F59]" />
            </div>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Identification</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#F59F59] absolute -bottom-6 shadow-[0_0_8px_#F59F59]" />
          </div>

          {/* Node: Truth */}
          <div className="relative group flex flex-col items-center gap-2 mt-4">
            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-sm border border-white/10 bg-[#1D1A39] shadow-[0_0_15px_rgba(245,159,89,0.1)]">
              {/* Target brackets */}
              <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-white/30" />
              <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-white/30" />
              <ShieldCheck className="w-4 h-4 text-[#E8BCB9]" />
            </div>
            <span className="absolute right-14 top-1/2 -translate-y-1/2 text-[9px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">Truth</span>
          </div>

        </div>

      </div>

    </div>
  );
}
