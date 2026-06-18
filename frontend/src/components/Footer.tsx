"use client";
import { useState } from 'react';
import { Microscope, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export const Footer = ({ footerData }: { footerData?: any }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await addDoc(collection(db, "newsletter"), { email, createdAt: new Date() });
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error("Newsletter error", err);
      setStatus('idle');
    }
  };
  return (
    <footer className="mt-20 border-t border-[#451952] relative overflow-hidden bg-[#1D1A39]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#f59f59] to-transparent opacity-50"></div>
      
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16 border-t border-[#451952] pt-16">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Microscope className="text-[#f59f59] w-6 h-6" />
              <span className="font-display text-2xl font-bold tracking-wide text-white">Priyanshi<span className="text-[#f59f59]">.</span></span>
            </div>
            <p className="text-[#e8bcb9] leading-relaxed mb-6 font-medium text-sm">
              The premier destination for forensic science education, combining expert mentorship with modern learning.
            </p>
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
                { label: "About Us", url: "/" },
                { label: "Success Stories", url: "/" },
                { label: "Privacy Policy", url: "/" },
                { label: "Terms of Service", url: "/" }
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
