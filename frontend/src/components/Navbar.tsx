"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';

export function Navbar({ navData }: { navData?: any }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    
    const handleScroll = (e?: Event) => {
      if (scrollContainer) {
        setIsScrolled(scrollContainer.scrollTop > 50);
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
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

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinkClass = "text-[15px] md:text-base font-medium text-white hover:text-amber transition-colors font-sans";

  const mainLinks = navData?.mainLinks || [
    { label: "Mentorship", url: "#mentorship" },
    { label: "Courses", url: "#courses" },
    { label: "Notes", url: "#notes" },
    { label: "Test Series", url: "#mock-tests" }
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
    <div className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out flex justify-center ${
      isScrolled ? 'top-4 px-4' : 'top-0 px-0'
    }`}>
      <nav className={`transition-all duration-300 relative z-50 ${
        isScrolled 
          ? 'w-full md:w-auto py-3 px-4 sm:px-6 md:px-8 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] rounded-[2rem] md:rounded-full border border-white/20' 
          : 'w-full max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 bg-transparent'
      }`}>
        <div className={`flex flex-col md:flex-row items-center transition-all duration-300 ${isScrolled ? 'justify-center md:gap-10' : 'justify-between w-full'}`}>
          
          {/* Mobile Top Row / Desktop Left */}
          <div className="flex items-center justify-between w-full md:w-auto md:flex-none z-50">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
              <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-105 transition-transform shrink-0" />
              <span className={`font-display font-bold text-lg md:text-xl tracking-wide text-white transition-all duration-300 whitespace-nowrap flex items-center ${isScrolled ? 'w-auto opacity-100 md:w-0 md:opacity-0 md:overflow-hidden' : 'w-auto opacity-100'}`}>
                {navData?.logoText ? navData.logoText : "Forensic Science By Priyanshi"}
              </span>
            </Link>
            
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-peach hover:text-white focus:outline-none z-50"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Center (Links) */}
          <div className={`hidden md:flex flex-1 items-center justify-center transition-all duration-300 ${isScrolled ? 'flex-none' : ''}`}>
            <div className="flex items-center gap-6 px-2">
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-purple border border-plum rounded-xl shadow-2xl py-2 flex flex-col z-50">
                    {moreOptions.map((opt: any, i: number) => (
                      opt.url.startsWith('/') ? 
                      <Link key={i} href={opt.url} className="px-5 py-2.5 text-[14px] text-peach hover:text-white hover:bg-plum/40 font-sans transition-colors" onClick={() => setIsDropdownOpen(false)}>{opt.label}</Link>
                      :
                      <a key={i} href={opt.url} className="px-5 py-2.5 text-[14px] text-peach hover:text-white hover:bg-plum/40 font-sans transition-colors" onClick={() => setIsDropdownOpen(false)}>{opt.label}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Right (Login / Signup) */}
          <div className={`hidden md:flex md:flex-none items-center gap-4 transition-all duration-300 ${isScrolled ? 'border-l border-plum pl-6 ml-2' : ''}`}>
            <a 
              href="https://app.forensicbypriyanshi.com/login" 
              className="text-peach hover:text-white font-medium text-[15px] transition-colors font-sans"
            >
              Login
            </a>
            <span className="text-white/40">/</span>
            <a 
              href="https://app.forensicbypriyanshi.com/signup" 
              className="text-peach hover:text-white font-medium text-[15px] transition-colors font-sans"
            >
              SignUp
            </a>
          </div>

          {/* Mobile Menu Dropdown */}
          <div className={`md:hidden fixed inset-0 top-0 pt-24 bg-navy z-40 transition-all duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
            <div className="flex-1 overflow-y-auto px-6 pb-24">
              <div className="flex flex-col gap-6">
                {mainLinks.map((link: any, i: number) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    className="text-2xl font-display font-bold text-white border-b border-plum/30 pb-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                
                <div className="pt-2">
                  <span className="text-sm font-bold text-peach mb-4 block uppercase tracking-wider">More Resources</span>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    {moreOptions.map((opt: any, i: number) => (
                      opt.url.startsWith('/') ? 
                      <Link key={i} href={opt.url} className="text-lg text-white/80 font-sans" onClick={() => setIsMobileMenuOpen(false)}>{opt.label}</Link>
                      :
                      <a key={i} href={opt.url} className="text-lg text-white/80 font-sans" onClick={() => setIsMobileMenuOpen(false)}>{opt.label}</a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-plum/30">
                  <a 
                    href="https://app.forensicbypriyanshi.com/login" 
                    className="w-full py-4 text-center text-peach border border-peach/50 rounded-xl font-bold font-sans text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </a>
                  <a 
                    href="https://app.forensicbypriyanshi.com/signup" 
                    className="w-full py-4 text-center bg-amber text-navy rounded-xl font-bold font-display text-lg shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign up
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay to darken background when mobile menu is open */}
      <div 
        className={`md:hidden fixed inset-0 bg-navy/80 backdrop-blur-sm z-30 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </div>
  );
}
