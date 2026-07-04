"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, FileText, ChevronLeft, ChevronRight, BookOpen, Clock } from 'lucide-react';

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Recent';
    // Use explicit 'en-US' locale to prevent server/client hydration mismatch
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export default function BlogsClient({ initialBlogs = [] }: { initialBlogs: any[] }) {
  const [search, setSearch] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  // Filter out featured posts for the grid, showing everything matching search
  const filteredBlogs = initialBlogs.filter(blog => 
    blog.title?.toLowerCase().includes(search.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
    blog.content?.toLowerCase().includes(search.toLowerCase())
  );

  const featuredBlogs = initialBlogs.slice(0, 3); // Top 3 posts for carousel

  // Auto-play carousel
  useEffect(() => {
    if (featuredBlogs.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % featuredBlogs.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredBlogs.length]);

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + featuredBlogs.length) % featuredBlogs.length);
  };

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % featuredBlogs.length);
  };

  return (
    <div className="space-y-16">
      
      {/* 1. Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber text-xs font-bold tracking-[0.2em] uppercase mb-2">
          <BookOpen className="w-3.5 h-3.5" /> FBP Case Files
        </div>
        <h1 className="text-4xl md:text-6xl font-bold font-display text-white tracking-tight leading-none">
          Forensic <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber to-peach">Investigation Hub</span>
        </h1>
        <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto font-semibold leading-relaxed">
          Deep-dives into chemical analysis, cyber forensics, and ballistics toolmarks compiled by Priyanshi Jain.
        </p>
      </div>

      {/* 2. Featured Blogs Carousel Section */}
      {featuredBlogs.length > 0 && (
        <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#1D1A39]/10 backdrop-blur-lg p-6 md:p-10 shadow-2xl flex flex-col md:flex-row gap-8 items-center min-h-[400px]">
          {/* Active Slide Content */}
          {featuredBlogs.map((blog, idx) => {
            if (idx !== activeSlide) return null;
            return (
              <div key={blog.id} className="w-full flex flex-col md:flex-row gap-8 items-center animate-in fade-in slide-in-from-right-10 duration-500">
                {/* Left Side: Article Details */}
                <div className="flex-1 space-y-5 text-left order-2 md:order-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-extrabold text-amber uppercase bg-[#F59F59]/10 px-3 py-1 rounded-full tracking-widest border border-[#F59F59]/20">
                      Featured Post
                    </span>
                    <span className="text-xs text-white/50 font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {blog.createdAt ? formatDate(blog.createdAt) : 'Recent'}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-4xl font-bold font-display text-white leading-tight hover:text-amber transition-colors">
                    <Link href={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h2>
                  
                  <p className="text-white/70 text-sm md:text-base leading-relaxed font-semibold">
                    {blog.excerpt || 'Read this in-depth guide on modern forensic techniques and tools.'}
                  </p>

                  <div className="pt-2">
                    <Link 
                      href={`/blogs/${blog.slug}`}
                      className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-amber to-peach text-[#1D1A39] font-bold text-sm shadow-[0_4px_14px_rgba(245,159,89,0.3)] hover:scale-[1.02] transition-all"
                    >
                      Read Case Study
                    </Link>
                  </div>
                </div>

                {/* Right Side: Cover Image */}
                <div className="w-full md:w-[45%] shrink-0 aspect-video md:aspect-[4/3] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-xl order-1 md:order-2 relative group">
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-peach/20 to-amber/20 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D1A39]/60 to-transparent pointer-events-none" />
                </div>
              </div>
            );
          })}

          {/* Carousel Arrows */}
          {featuredBlogs.length > 1 && (
            <>
              <button 
                onClick={handlePrevSlide}
                className="absolute left-4 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Previous featured post"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextSlide}
                className="absolute right-4 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Next featured post"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {featuredBlogs.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {featuredBlogs.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeSlide ? 'bg-[#F59F59] w-6' : 'bg-white/20'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Search and Feed Area */}
      <div className="space-y-8 pt-8 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl md:text-2xl font-bold font-display text-white">All Investigation Case Files</h2>
          
          {/* Search Input */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords..."
              className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-amber text-white font-medium text-sm placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Feed Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <Link 
              key={blog.id} 
              href={`/blogs/${blog.slug}`}
              className="group bg-[#1D1A39]/10 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between hover:-translate-y-1.5 hover:border-amber/40 hover:shadow-2xl transition-all duration-300 h-full"
            >
              <div>
                <div className="aspect-video w-full relative bg-white/5 overflow-hidden border-b border-white/10">
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-peach/10 to-amber/10 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3 text-left">
                  <span className="text-[10px] font-extrabold text-amber uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {blog.createdAt ? formatDate(blog.createdAt) : 'Recent'}
                  </span>
                  <h3 className="text-lg font-bold font-display text-white group-hover:text-amber transition-colors line-clamp-2 leading-tight">
                    {blog.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed font-semibold line-clamp-3">
                    {blog.excerpt || 'No short summary provided.'}
                  </p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 flex items-center gap-1 text-xs text-peach font-bold">
                Read Article →
              </div>
            </Link>
          ))}

          {filteredBlogs.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/50 font-medium">
              <FileText className="w-12 h-12 text-white/20 mb-4 animate-bounce" />
              <p className="text-lg">No forensic articles match your search.</p>
              <p className="text-sm text-white/30 mt-1">Try other search terms or browse the archive.</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
