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

  const navLinkClass = "text-[14px] md:text-[15px] font-medium text-white hover:text-amber transition-colors font-sans";

  // Ignoring navData temporarily to force the exact layout the user requested
  const mainLinks = [
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
    <>
      <div className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out flex justify-center ${
        isScrolled ? 'top-4 px-4' : 'top-0 px-0'
      }`}>
        <nav className={`transition-all duration-300 relative z-50 flex items-center ${
        isScrolled 
          ? 'w-max max-w-[95%] py-3 px-6 sm:px-10 bg-[#1D1A39] shadow-2xl rounded-full border border-white/10' 
          : 'w-full py-6 sm:py-8 px-6 lg:px-12 xl:px-20 bg-transparent'
      }`}>
        <div className={`flex flex-col lg:flex-row items-center justify-between w-full ${isScrolled ? 'gap-8 lg:gap-12' : ''}`}>
          
          {/* Mobile Top Row / Desktop Left */}
          <div className={`flex items-center justify-between w-full lg:flex-none z-50 ${isScrolled ? 'lg:w-auto w-auto' : 'lg:w-[30%]'}`}>
            <Link href="/" className="flex items-center gap-2 lg:gap-3 group" onClick={() => setIsMobileMenuOpen(false)}>
              <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Logo" className="w-10 h-10 lg:w-12 lg:h-12 object-contain group-hover:scale-105 transition-transform shrink-0" />
              {/* Logo text hides entirely on scroll */}
              <span className={`font-display font-bold text-lg lg:text-xl tracking-wide text-white transition-all duration-300 whitespace-nowrap flex items-center ${isScrolled ? 'hidden' : 'block'}`}>
                {navData?.logoText ? navData.logoText : "Forensic Science By Priyanshi"}
              </span>
            </Link>
            
            {/* Hamburger Button for Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-amber focus:outline-none z-50"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Center (Links) */}
          <div className={`hidden lg:flex items-center justify-center z-40 ${isScrolled ? 'flex-none' : 'flex-1'}`}>
            <div className="flex items-center gap-10 xl:gap-14 px-2">
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
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 bg-peach border border-navy/10 rounded-xl shadow-2xl py-2 flex flex-col z-50">
                    {moreOptions.map((opt: any, i: number) => (
                      opt.url.startsWith('/') ? 
                      <Link key={i} href={opt.url} className="px-5 py-2.5 text-[14px] text-navy hover:text-navy hover:bg-navy/10 font-bold font-sans transition-colors" onClick={() => setIsDropdownOpen(false)}>{opt.label}</Link>
                      :
                      <a key={i} href={opt.url} className="px-5 py-2.5 text-[14px] text-navy hover:text-navy hover:bg-navy/10 font-bold font-sans transition-colors" onClick={() => setIsDropdownOpen(false)}>{opt.label}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Right (Login / Signup) */}
          <div className={`hidden lg:flex items-center justify-end z-50 ${isScrolled ? 'lg:w-auto w-auto' : 'lg:w-[30%]'}`}>
            {isScrolled ? (
              <a 
                href="https://app.forensicbypriyanshi.com/login" 
                className="px-6 py-2.5 rounded-full bg-amber text-navy font-bold text-[14px] shadow-lg hover:shadow-xl hover:scale-105 transition-all font-sans whitespace-nowrap"
              >
                Login / Sign Up
              </a>
            ) : (
              <div className="flex items-center gap-4 border-l border-plum/50 pl-6">
                <a 
                  href="https://app.forensicbypriyanshi.com/login" 
                  className="text-white hover:text-amber font-medium text-[14px] md:text-[15px] transition-colors font-sans whitespace-nowrap"
                >
                  Login
                </a>
                <span className="text-white/80">/</span>
                <a 
                  href="https://app.forensicbypriyanshi.com/signup" 
                  className="text-white hover:text-amber font-medium text-[14px] md:text-[15px] transition-colors font-sans whitespace-nowrap"
                >
                  SignUp
                </a>
              </div>
            )}
          </div>

        </div>
      </nav>
      </div>

      {/* Overlay to darken background when mobile menu is open */}
      <div 
        className={`lg:hidden fixed inset-0 bg-navy/80 backdrop-blur-sm z-30 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Dropdown */}
      <div className={`lg:hidden fixed inset-0 top-0 pt-24 bg-navy z-40 transition-all duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
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
              <span className="text-sm font-bold text-white mb-4 block uppercase tracking-wider">More Resources</span>
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
                className="w-full py-4 text-center text-white border border-white/50 rounded-xl font-bold font-sans text-lg hover:bg-white/10 transition-colors"
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
    </>
  );
}

