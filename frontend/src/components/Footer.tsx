"use client";
import { useState } from 'react';
import { Microscope, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
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
    <footer className="snap-start border-t border-plum relative overflow-hidden bg-navy flex flex-col justify-center">
      
      {/* CTA Banner Section */}
      <div className="bg-purple w-full py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white">
            Ready to Accelerate Your <br /> Forensic Career?
          </h2>
          <p className="text-peach text-lg md:text-xl font-sans max-w-2xl mx-auto">
            Join thousands of students who have cracked their exams and built successful careers with Priyanshi.
          </p>
          <div className="pt-6">
            <a 
              href="https://app.forensicbypriyanshi.com/signup"
              className="inline-flex items-center justify-center gap-2 bg-amber hover:bg-[#e68d48] text-navy font-bold font-display text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Sign Up Now For Free <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 group">
              <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Forensics By Priyanshi Logo" className="w-12 h-12 object-contain group-hover:scale-105 transition-transform shrink-0" />
              <span className="font-display text-xl font-bold tracking-wide text-white leading-tight">
                Forensics By<br/>Priyanshi<span className="text-amber">.</span>
              </span>
            </div>
            <p className="text-peach leading-relaxed mb-6 font-medium text-sm font-sans">
              {footerData?.description || "India's Fastest-Growing Forensic Science Education Hub Led by Priyanshi. The premier destination for your career."}
            </p>
            <div className="flex gap-4 items-center">
              <a href="https://youtube.com/@forensicsbypriyanshi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:text-navy hover:bg-peach transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://instagram.com/forensicsbypriyanshi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:text-navy hover:bg-peach transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-6 flex items-center gap-2">Explore</h3>
            <ul className="space-y-4">
              {(footerData?.exploreLinks || [
                { label: 'Mentorship', url: '#mentorship' },
                { label: 'Courses & Programs', url: '#courses' },
                { label: 'Study Notes', url: '#notes' },
                { label: 'Mock Tests', url: '#mock-tests' },
                { label: 'Free Resources', url: '#free-resources' }
              ]).map((link: any, i: number) => (
                <li key={i}>
                  <a href={link.url} className="text-peach hover:text-white font-sans text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-plum group-hover:bg-amber transition-colors"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-6 flex items-center gap-2">Company</h3>
            <ul className="space-y-4">
              {(footerData?.companyLinks || [
                { label: 'About Priyanshi', url: '#about' },
                { label: 'Success Stories', url: '#testimonials' },
                { label: 'Upcoming Events', url: '#events' },
                { label: 'Blogs & News', url: '/blogs' },
                { label: 'Contact Us', url: 'mailto:contact@forensicbypriyanshi.com' }
              ]).map((link: any, i: number) => (
                <li key={i}>
                  <Link href={link.url} className="text-peach hover:text-white font-sans text-sm font-medium transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-plum group-hover:bg-amber transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-display font-bold text-lg mb-6 flex items-center gap-2">Stay Updated</h3>
            <p className="text-peach text-sm mb-6 leading-relaxed font-sans">
              Subscribe to get the latest exam updates, free materials, and career tips directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-plum" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                className="w-full pl-10 pr-12 py-3 bg-white/5 border border-plum/50 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber transition-colors font-sans text-sm"
              />
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-amber text-navy rounded-lg hover:bg-[#e68d48] transition-colors disabled:opacity-50"
              >
                {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-plum flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-peach text-sm font-medium font-sans">
            © {new Date().getFullYear()} Forensics By Priyanshi. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link href="/privacy" className="text-peach hover:text-white transition-colors font-sans">Privacy Policy</Link>
            <Link href="/terms" className="text-peach hover:text-white transition-colors font-sans">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
