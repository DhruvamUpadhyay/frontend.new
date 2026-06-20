"use client";
import { useState } from 'react';
import { Microscope, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export const Footer = ({ footerData }: { footerData?: any }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      toast.success('Thanks for subscribing! Check your inbox for updates.');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err: any) {
      console.error("Newsletter error", err);
      toast.error(err.message || 'Failed to subscribe. Please try again.');
      setStatus('idle');
    }
  };
  return (
    <footer className="snap-start border-t border-[#451952] relative overflow-hidden bg-[#1D1A39] min-h-[60svh] flex flex-col justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f59f59] to-transparent opacity-50"></div>
      
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16 border-t border-[#451952] pt-16">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 group">
              <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Forensics By Priyanshi Logo" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform" />
              <span className="font-display text-xl font-bold tracking-wide text-white leading-tight">Forensics By<br/>Priyanshi<span className="text-[#f59f59]">.</span></span>
            </div>
            <p className="text-[#e8bcb9] leading-relaxed mb-6 font-medium text-sm">
              The premier destination for forensic science education, combining expert mentorship with modern learning.
            </p>
            <div className="flex gap-4 items-center">
              <a href="https://youtube.com/@forensicsbypriyanshi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#F59F59] hover:-translate-y-1 transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://instagram.com/forensicsbypriyanshi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#E8BCB9] hover:-translate-y-1 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://linkedin.com/in/priyanshijain" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#1D1A39] hover:-translate-y-1 transition-all border border-transparent hover:border-white/20">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Explore</h4>
            <ul className="space-y-4 text-[#e8bcb9] text-sm font-medium">
              {(footerData?.exploreLinks || [
                { label: "CUET PG Courses", url: "/#courses" },
                { label: "AIFSET Prep", url: "/#courses" },
                { label: "Study Materials", url: "#materials-section" },
                { label: "Book Mentorship", url: "#guidance" }
              ]).map((link: any, i: number) => (
                 <li key={i}><Link href={link.url} className="hover:text-white transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
            <ul className="space-y-4 text-[#e8bcb9] text-sm font-medium">
              {(footerData?.companyLinks || [
                { label: "About Us", url: "/about" },
                { label: "Success Stories", url: "/#testimonials" },
                { label: "Privacy Policy", url: "/p/privacy" },
                { label: "Terms of Service", url: "/p/terms" }
              ]).map((link: any, i: number) => (
                 <li key={i}><Link href={link.url} className="hover:text-white transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 tracking-wide">Contact Us</h4>
            <ul className="space-y-4 text-[#e8bcb9] text-sm font-medium">
              <li><a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a></li>
              <li><a href="tel:+919876543211" className="hover:text-white transition-colors">+91 98765 43211</a></li>
              <li><a href="mailto:support@priyanshiacademy.com" className="hover:text-white transition-colors">support@priyanshi.com</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
             <h4 className="text-white font-bold mb-6 tracking-wide">Stay Updated</h4>
             <p className="text-[#e8bcb9] text-sm mb-4 font-medium">Exam notifications & free resources.</p>
             <form onSubmit={handleSubscribe} className="flex bg-[#451952]/30 border border-[#662549] rounded-full p-1 focus-within:border-[#f59f59] transition-colors relative">
               <input 
                  type="email" 
                  placeholder="Email address" 
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status !== 'idle'}
                  className="bg-transparent px-4 py-2 text-white w-full focus:outline-none text-sm placeholder:text-[#e8bcb9]/50 rounded-l-full [&:-webkit-autofill]:transition-[background-color] [&:-webkit-autofill]:duration-[5000s] [&:-webkit-autofill]:[-webkit-text-fill-color:white]" 
                />
               <button type="submit" disabled={status !== 'idle'} className="bg-[#f59f59] rounded-full p-2 text-[#1D1A39] hover:bg-white transition-colors disabled:opacity-50">
                 {status === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <ArrowRight className="w-4 h-4" />}
               </button>
             </form>
             {status === 'success' && <p className="text-green-400 text-xs mt-2 ml-4">Thanks for subscribing!</p>}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[#e8bcb9] text-sm font-medium">
          <p>© {new Date().getFullYear()} Priyanshi Academy. All rights reserved.</p>
          <a href="https://veerbhanushali.in/fsp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Designed for Excellence.</a>
        </div>
      </div>
    </footer>
  );
};
