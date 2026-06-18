import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F59F59] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E8BCB9] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 glass-card p-12 rounded-3xl max-w-2xl w-full flex flex-col items-center border border-white/10 shadow-2xl">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner border border-white/10">
          <SearchX className="w-12 h-12 text-[#F59F59]" />
        </div>
        
        <h1 className="font-display text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#F59F59] to-[#E8BCB9]">
          404
        </h1>
        
        <h2 className="text-3xl font-bold text-white mb-6">Lost in the Crime Scene?</h2>
        
        <p className="text-white/70 text-lg mb-10 max-w-md leading-relaxed font-medium">
          We've investigated thoroughly, but the page you're looking for seems to have vanished without a trace.
        </p>
        
        <Link 
          href="/" 
          className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] font-bold overflow-hidden shadow-[0_0_20px_rgba(245,159,89,0.2)] hover:shadow-[0_0_30px_rgba(245,159,89,0.4)] transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          <span className="relative z-10 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Return to Headquarters
          </span>
        </Link>
      </div>
    </div>
  );
}
