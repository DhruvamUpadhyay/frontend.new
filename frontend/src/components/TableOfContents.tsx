"use client";

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

export function TableOfContents({ toc }: { toc: { level: number, text: string, id: string }[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    toc.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <div className="sticky top-32 bg-[#1D1A39]/80 border border-white/10 p-6 rounded-2xl shadow-xl backdrop-blur-md hidden xl:block w-[300px]">
      <h4 className="font-display font-bold text-white mb-4 uppercase tracking-widest text-xs border-b border-white/10 pb-4">Table of Contents</h4>
      <ul className="space-y-3">
        {toc.map((heading, i) => (
          <li 
            key={i} 
            className={`transition-all flex items-start gap-2 ${heading.level === 3 ? 'ml-4' : ''} ${activeId === heading.id ? 'text-amber font-bold' : 'text-white/60 hover:text-white font-medium'}`}
          >
            {activeId === heading.id && <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />}
            <a 
              href={`#${heading.id}`}
              className="text-sm leading-tight block"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
