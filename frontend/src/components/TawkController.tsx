"use client";
import { useEffect } from 'react';

export function TawkController() {
  useEffect(() => {
    const handleScroll = () => {
      // Toggle class based on whether we have scrolled past 100px
      if (window.scrollY > 100) {
        document.documentElement.classList.add('tawk-hidden');
      } else {
        document.documentElement.classList.remove('tawk-hidden');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null;
}
