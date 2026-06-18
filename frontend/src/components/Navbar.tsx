"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export function Navbar({ navData }: { navData?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = "text-[15px] md:text-base font-bold text-white/80 hover:text-amber transition-colors";

  const mainLinks = navData?.mainLinks || [
    { label: "Mentorship", url: "#guidance" },
    { label: "Courses", url: "#courses" },
    { label: "Notes", url: "#materials-section" },
    { label: "Test Series", url: "#tests-section" }
  ];

  const moreOptions = navData?.dropdownLinks || [
    { label: "Free Resources", url: "#free-resources" },
    { label: "Upcoming Events", url: "#events" },
    { label: "Testimonials", url: "#testimonials" },
    { label: "Blogs", url: "/blogs" },
    { label: "About Us", url: "#about" },
    { label: "FAQ", url: "#faq" }
  ];

  return (
    <div className={`fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out flex justify-center ${
      isScrolled ? 'top-4 px-4' : 'top-0 px-0'
    }`}>
      <nav className={`transition-all duration-500 ${
        isScrolled 
          ? 'w-full md:w-auto py-3 px-4 sm:px-6 md:px-8 bg-navy/95 backdrop-blur-xl border border-peach/20 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-[2rem] md:rounded-full' 
          : 'w-full max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 bg-transparent'
      }`}>
        <div className={`flex flex-col md:flex-row items-center transition-all duration-500 ${isScrolled ? 'justify-center md:gap-10' : 'justify-between w-full'}`}>
          
          {/* Mobile Top Row / Desktop Left */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Logo" className="w-10 h-10 md:w-14 md:h-14 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] shrink-0" />
              <span className={`font-display font-bold text-lg md:text-2xl tracking-wide text-white transition-all duration-300 whitespace-nowrap flex items-center ${isScrolled ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
                Forensics By Priyanshi<span className="text-amber">.</span>
              </span>
            </Link>
            
            <div className={`md:hidden flex items-center overflow-hidden transition-all duration-500 ${isScrolled ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>

            </div>
          </div>

          {/* Mobile Bottom Row */}
          <div className="flex md:hidden w-full items-center justify-center gap-4 border-t border-white/10 pt-3 pb-1 flex-wrap">
            {mainLinks.map((link: any, i: number) => (
               <a key={i} href={link.url} className={navLinkClass}>{link.label}</a>
            ))}
            <div className="flex items-center gap-3 w-full justify-center pt-2 mt-1 border-t border-white/5">
              <a href="https://app.forensicbypriyanshi.com/login" className="text-white/80 hover:text-white font-medium text-[14px]">Log in</a>
              <a href="https://app.forensicbypriyanshi.com/signup" className="bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] px-4 py-1.5 rounded-full font-bold text-[14px]">Sign up</a>
            </div>
          </div>

          {/* Desktop Right Side (Links & Button) */}
          <div className={`hidden md:flex items-center transition-all duration-500 ${isScrolled ? 'gap-6' : 'gap-0'}`}>
            
            {/* Desktop Links */}
            <div className="flex items-center gap-8 px-2">
              {mainLinks.map((link: any, i: number) => (
                 <a key={i} href={link.url} className={navLinkClass}>{link.label}</a>
              ))}
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  className={`flex items-center gap-1 focus:outline-none ${navLinkClass}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  More <ChevronDown className="w-4 h-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 w-56 bg-[#1D1A39] border border-white/10 rounded-2xl shadow-2xl py-3 flex flex-col z-50">
                    {moreOptions.map((opt: any, i: number) => (
                      opt.url.startsWith('/') ? 
                      <Link key={i} href={opt.url} className="px-5 py-2.5 text-[15px] text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors" onClick={() => setIsDropdownOpen(false)}>{opt.label}</Link>
                      :
                      <a key={i} href={opt.url} className="px-5 py-2.5 text-[15px] text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors" onClick={() => setIsDropdownOpen(false)}>{opt.label}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Right - Login / Signup */}
            <div className={`hidden md:flex items-center gap-4 border-l border-white/10 pl-6 ml-2 transition-all duration-500 ${isScrolled ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
              <a 
                href="https://app.forensicbypriyanshi.com/login" 
                className="text-white/80 hover:text-white font-medium text-[15px] transition-colors"
              >
                Log in
              </a>
              <a 
                href="https://app.forensicbypriyanshi.com/signup" 
                className="bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] hover:opacity-90 text-[#1D1A39] px-6 py-2.5 rounded-full font-bold text-[15px] shadow-[0_4px_14px_rgba(245,159,89,0.3)] transition-all flex items-center gap-2"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
