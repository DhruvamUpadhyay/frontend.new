"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Clock, CheckCircle2, Calendar,
  Star, ChevronRight, ChevronLeft, Download,
  Lock, ScanLine, Fingerprint, Video, BookOpen,
  LayoutDashboard, BarChart3, Database, ChevronDown, HelpCircle, Mouse, Timer, Play,
  Heart
} from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import { AlternatingFeatures } from '@/components/AlternatingFeatures';
import { DraggableMarquee } from '@/components/DraggableMarquee';

// Default Fallback Features if Database is Empty
const DEFAULT_FEATURES = [
  {
    title: "Master High-Tech Lab Analysis",
    subtitle: "Hands-on experience with industry-standard protocols.",
    description: "Go beyond theory. Our curriculum bridges the gap between academic knowledge and real-world laboratory practice. Learn the exact protocols used by modern forensic investigators to analyze trace evidence, toxicology reports, and DNA profiles with uncompromising accuracy.",
    image: "/images/forensic_lab_analysis.png",
    alt: "Forensic Lab Analysis",
    features: ["Advanced Spectrometry", "Trace Evidence Analysis", "Toxicology Screening"],
    reverse: false
  },
  {
    title: "Digital Forensics & Cyber Security",
    subtitle: "Track digital footprints across the dark web.",
    description: "In the modern era, crimes leave a digital trail. Master the art of recovering deleted data, tracing encrypted communications, and securing compromised networks. Our digital forensics modules are built to train you for the fastest-growing sector of modern investigations.",
    image: "/images/digital_forensics.png",
    alt: "Digital Forensics",
    features: ["Data Recovery", "Network Tracking", "Cryptanalysis"],
    reverse: true
  }
];

// Reusable Premium Button
const PremiumButton = ({ to, children, primary = false, onClick }: any) => {
  if (primary) {
    return (
      <Link href={to} onClick={onClick} className="group relative px-8 py-4 rounded-full bg-[#1D1A39] text-white font-bold overflow-hidden shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 border border-white/10">
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    );
  }
  return (
    <Link href={to} onClick={onClick} className="group px-8 py-4 rounded-full border border-[#1D1A39]/20 bg-transparent text-[#1D1A39] font-bold hover:bg-[#1D1A39] hover:text-white transition-all flex items-center justify-center gap-2">
      {children}
    </Link>
  );
};

// Hero Button (Light variant for dark backgrounds)
const HeroButton = ({ to, children, primary = false, onClick }: any) => {
  if (primary) {
    return (
      <Link href={to} onClick={onClick} className="group relative px-8 py-4 text-base md:text-lg rounded-full bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] font-bold overflow-hidden shadow-[0_0_20px_rgba(245,159,89,0.2)] hover:shadow-[0_0_30px_rgba(245,159,89,0.4)] transition-all flex items-center justify-center gap-2">
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    );
  }
  return (
    <Link href={to} onClick={onClick} className="group px-8 py-4 rounded-full border border-white/20 bg-white/10 text-white font-bold hover:bg-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2">
      {children}
    </Link>
  );
};

// Animated Number Counter
const AnimatedNumber = ({ end, suffix = "", isLive = false }: { end: number, suffix?: string, isLive?: boolean }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    let timer: any;

    const liveOffset = isLive ? Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 120)) % 100 : 0;
    const finalTarget = end + liveOffset;

    const animate = () => {
      start += increment;
      if (start < finalTarget) {
        setCount(Math.floor(start));
        timer = requestAnimationFrame(animate);
      } else {
        setCount(finalTarget);
      }
    };
    timer = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(timer);
  }, [isVisible, end, isLive]);

  useEffect(() => {
    if (!isVisible || !isLive || count < end) return;
    const tick = () => {
      setCount(prev => prev + 1);
      const nextDelay = Math.random() * 30000 + 15000;
      setTimeout(tick, nextDelay);
    };
    const timeout = setTimeout(tick, Math.random() * 30000 + 15000);
    return () => clearTimeout(timeout);
  }, [isVisible, isLive, end]);

  const formattedStr = new Intl.NumberFormat('en-US').format(count);
  return (
    <span ref={ref} className="inline-flex items-center font-display leading-none">
      {formattedStr}{suffix}
    </span>
  );
};

// Hero Section
const Hero = ({ data, ytSubs }: { data: any, ytSubs?: number }) => {
  const safeData = data || {};
  return (
    <section className="relative snap-start h-[100svh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-transparent text-center">
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center w-full mt-2">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-5 text-white tracking-tight">
          <div className="fade-up-element stagger-1">{safeData.heroTitle || "India's Fastest-Growing"}</div>
          <div className="fade-up-element stagger-2 text-transparent bg-clip-text bg-gradient-to-r from-amber to-peach">
            {safeData.heroSubtitle || "Forensic Science Education Hub"}
          </div>
        </h1>

        <p className="text-base md:text-lg text-white/70 mb-10 max-w-3xl font-medium fade-up-element stagger-3 leading-relaxed">
          {safeData.heroDescription || "Led by Priyanshi. Join our community of 1,50,000+ Forensic Enthusiasts and get access to the best courses and guidance."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 fade-up-element stagger-3 w-full sm:w-auto mb-10">
          <HeroButton to="https://app.forensicbypriyanshi.com/login" primary={true}>
            Login / Sign up <ArrowRight className="w-5 h-5" />
          </HeroButton>
        </div>

        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-12 md:gap-8 fade-up-element stagger-4 mt-8">
          {[
            { label: 'Active Learners', subLabel: '(on platform)', end: parseInt((safeData.stats1Value || "10000").replace(/[^0-9]/g, '')) || 10000, suffix: "+", isLive: false },
            { label: 'Community of Forensic Enthusiasts', subLabel: '', end: ytSubs || parseInt((safeData.stats2Value || "150000").replace(/[^0-9]/g, '')) || 150000, suffix: "+", isLive: true },
            { label: 'Students Taught', subLabel: '(so far)', end: parseInt((safeData.stats3Value || "25000").replace(/[^0-9]/g, '')) || 25000, suffix: "+" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                <AnimatedNumber end={stat.end} suffix={stat.suffix} isLive={stat.isLive} />
              </span>
              <span className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-snug">
                {stat.label}<br/>{stat.subLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="absolute bottom-8 left-8 flex flex-col items-center gap-2 opacity-60 cursor-pointer z-20 hover:opacity-100 transition-opacity group"
        onClick={() => {
          const nextSection = document.getElementById('guidance') || document.getElementById('courses');
          nextSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 transition-all">
          <Mouse className="w-5 h-5 text-white/80 animate-bounce group-hover:text-white" />
        </div>
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors">
          Scroll Down
        </span>
      </div>
    </section>
  );
};

// 1-on-1 Guidance
const OneOnOneGuidance = ({ data }: { data: any }) => {
  const safeData = data || {};
  return (
    <section id="guidance" className="snap-start h-[100svh] w-full bg-peach relative overflow-hidden flex flex-col pt-28 pb-20 border-b border-white/5 text-navy">
      <div className="w-full px-6 lg:px-12 xl:px-20 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 my-auto">
        <div className="w-full lg:w-[40%] fade-up-element flex flex-col justify-center text-left shrink-0">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 text-navy leading-[1.2]">
            {safeData.guidanceTitle || "Get One-on-One Career Guidance Directly from Priyanshi ma'am"}
          </h2>
          <p className="text-purple text-lg md:text-xl font-medium mb-6 leading-relaxed max-w-2xl">
            {safeData.guidanceSubtitle || "Get clarity on anything & everything that you have in your head related to Forensic Science."}
          </p>
          
          <ul className="space-y-3 mb-4 fade-up-element stagger-2">
            {[
              "Scope of forensic science (jobs, salary, etc.)?",
              "Is this field for you or not?",
              "Best colleges to study forensic science?",
              "Exams to qualify for a job?",
              "How should you prepare yourself?",
              "Course to pursue?"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-navy font-bold text-[15px] sm:text-[17px]">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/40 flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-purple" />
                </div>
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="text-navy font-bold text-[17px] mb-4 fade-up-element stagger-2 italic">
            And many more questions...
          </p>

          <div className="lg:hidden flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-5 border-t border-purple/20 mt-4">
            <div>
              <p className="text-purple text-xs uppercase font-bold tracking-wider mb-1">Session Pass</p>
              <p className="text-navy font-display text-4xl font-bold">{safeData.guidancePrice || "₹999"}</p>
            </div>
            <HeroButton to={safeData.guidanceUrl || "/student/counselling"} primary>
              Book Your Session <Calendar className="w-5 h-5" />
            </HeroButton>
          </div>
        </div>

        {/* Center Empty Space Pricing Block (Desktop only) */}
        <div className="hidden lg:flex lg:w-[25%] flex-col items-center justify-center shrink-0 fade-up-element stagger-2 p-6 rounded-[2rem] bg-white/40 border border-white/60 shadow-xl">
          <p className="text-purple text-sm uppercase font-bold tracking-[0.15em] mb-3">Session Pass</p>
          <p className="text-navy font-display text-5xl font-bold mb-6">{safeData.guidancePrice || "₹999"}</p>
          <HeroButton to={safeData.guidanceUrl || "/student/counselling"} primary>
            Book Session <Calendar className="w-5 h-5" />
          </HeroButton>
        </div>

        {/* Right Side Image Window */}
        <div className="w-full lg:w-[30%] fade-up-element stagger-2 flex justify-center lg:justify-end mt-12 lg:mt-0">
          <div className="w-full max-w-[320px] lg:max-w-sm aspect-[3/4] rounded-[2rem] overflow-hidden flex flex-col items-center justify-center relative shadow-2xl bg-white/40 border border-white/60">
            {safeData.guidanceImage ? (
              <img src={safeData.guidanceImage} alt="1-on-1 Guidance" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent z-0"></div>
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-4 text-purple shadow-sm">
                    <ScanLine className="w-8 h-8" />
                  </div>
                  <p className="text-navy font-bold text-lg mb-2 font-display">Poster Placeholder</p>
                  <p className="text-purple/80 text-sm font-semibold">
                    (Upload a poster in the Admin CMS to display it here)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Courses Listing
const Courses = ({ initialCourses = [] }: { initialCourses?: any[] }) => {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const toggleFlip = (index: number) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <section id="courses" className="snap-start h-[100svh] pt-32 pb-16 bg-white relative z-10 border-b border-navy/10 flex flex-col justify-start overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-10 fade-up-element">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-navy">Premium <span className="text-rose">Courses</span></h2>
          <p className="text-navy/70 max-w-2xl mx-auto text-lg font-medium">Click on any course card to reveal curriculum details and enrollment options.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto fade-up-element stagger-2">
          {initialCourses.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-navy/5 rounded-3xl border border-navy/10">
              <h3 className="text-2xl font-display font-bold text-navy mb-2">New Batches Launching Soon</h3>
              <p className="text-navy/70 font-medium">We are currently updating our premium course catalog. Check back shortly!</p>
            </div>
          )}
          {initialCourses.map((course, i) => (
            <div 
              key={i} 
              className="group w-full aspect-[3/4] min-h-[450px] cursor-pointer [perspective:1000px]"
              onClick={() => toggleFlip(i)}
            >
              <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${flipped[i] ? '[transform:rotateY(180deg)]' : ''}`}>
                
                {/* FRONT FACE */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-navy rounded-[2rem] border border-white/10 shadow-xl overflow-hidden flex flex-col">
                  {course.image ? (
                    <div className="h-[75%] w-full relative shrink-0 bg-[#0a0514] flex items-center justify-center p-2">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                    </div>
                  ) : (
                    <div className="h-[75%] w-full shrink-0 bg-gradient-to-br from-peach to-amber flex items-center justify-center p-6 relative">
                      {/* Fallback pattern */}
                    </div>
                  )}
                  <div className="flex flex-col justify-center flex-grow text-center relative z-10 bg-navy p-4">
                    <h3 className="font-display text-2xl font-bold text-white leading-tight line-clamp-2">{course.title}</h3>
                    
                    <div className="flex items-center justify-center gap-2 text-amber font-bold text-xs uppercase tracking-widest mt-2 hover:text-white transition-colors">
                      Learn More
                      <ArrowRight className="w-4 h-4 animate-bounce-x" />
                    </div>
                  </div>
                </div>

                {/* BACK FACE */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-navy rounded-[2rem] border border-amber/40 shadow-xl overflow-hidden flex flex-col justify-between p-8">
                  <div className="overflow-y-auto custom-scrollbar pr-2 flex-grow mb-6">
                    <h3 className="font-display text-2xl font-bold text-amber mb-4 border-b border-white/10 pb-3">{course.title}</h3>
                    <p className="text-white/80 text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                      {course.details || "Comprehensive curriculum designed to master this subject. Includes interactive modules, regular mock tests, and 1-on-1 mentorship sessions."}
                    </p>
                  </div>
                  
                  <div className="pt-5 border-t border-white/10 shrink-0">
                    <div className="flex items-center justify-between mb-5 bg-white/5 p-3 rounded-xl border border-white/10">
                      <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Enrollment Fee</span>
                      <span className="text-white font-bold text-2xl">{course.price}</span>
                    </div>
                    <PremiumButton 
                      to="https://app.forensicbypriyanshi.com/login" 
                      primary 
                      onClick={(e: any) => e.stopPropagation()} // Prevent card flip when clicking button
                    >
                      Enroll Now
                    </PremiumButton>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Mock Tests Section
const MockTests = ({ tests = [] }: { tests?: any[] }) => {
  return (
    <section id="tests-section" className="snap-start h-[100svh] py-24 bg-navy relative z-10 border-b border-plum flex flex-col justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-plum/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-5 fade-up-element text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 rounded-full bg-amber/10 border border-amber/20 text-amber text-xs font-bold uppercase tracking-widest mb-6">
              Simulate Your Success
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              Mock Tests & <br/><span className="text-amber">Test Series</span>
            </h2>
            <p className="text-peach text-lg font-medium leading-relaxed mb-8">
              Evaluate your exam preparation level with our state-of-the-art simulated testing interfaces. Experience the real exam pressure before the actual day.
            </p>
            
            <ul className="space-y-4 mb-10 text-left max-w-md mx-auto lg:mx-0">
              {['Real NTA-style Exam Interface', 'Instant Detailed Analytics & Solutions', 'All India Ranking & Percentile', 'Curated by Top Subject Experts'].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-white/90 font-semibold">
                  <div className="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-amber" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            
            <a href="https://app.forensicbypriyanshi.com/login" className="inline-flex items-center justify-center gap-2 bg-amber text-navy px-8 py-4 rounded-xl font-bold text-lg hover:bg-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(245,159,89,0.4)]">
              Explore All Tests <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Right Cards Grid */}
          <div className="lg:col-span-7 fade-up-element stagger-2 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {(tests.length === 0 ? [
                { title: "CUET PG Forensic Science Mock Test 2024", category: "CUET PG" },
                { title: "NFSU Entrance Full Syllabus Mock", category: "NFSU" },
                { title: "UGC NET Paper 2 Forensic Science Exam", category: "UGC NET" },
                { title: "DU M.Sc Forensic Science Entrance Prep", category: "DU" }
              ] : tests).map((test, i) => (
                  <div key={i} className="group w-full aspect-[3/4] min-h-[450px] bg-purple/40 backdrop-blur-md border border-plum hover:border-amber/50 rounded-[2rem] p-8 hover:bg-purple/60 transition-all duration-300 flex flex-col justify-between text-left shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-3 py-1 bg-amber/20 text-amber text-[10px] font-extrabold uppercase tracking-widest rounded-lg">
                          {test.category || 'General'}
                        </span>
                        <Timer className="w-5 h-5 text-peach opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="font-bold text-xl md:text-2xl text-white mb-4 font-display line-clamp-3 leading-tight">{test.title}</h3>
                      <p className="text-peach/80 text-sm font-medium line-clamp-2 mb-6">
                        Comprehensive mock test designed to evaluate your readiness for the upcoming examinations.
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-auto">
                      <span className="text-white font-bold text-sm">View Details</span>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-amber group-hover:text-navy transition-colors text-white">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

// Study Notes / Materials Section
const StudyNotes = ({ materials = [] }: { materials?: any[] }) => {
  return (
    <section id="materials-section" className="snap-start h-[100svh] py-24 bg-peach relative z-10 border-b border-white/10 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-6 w-full text-navy">
        <div className="text-center mb-16 fade-up-element">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-navy">Study Notes & <span className="text-plum">Resources</span></h2>
          <p className="text-purple max-w-2xl mx-auto text-lg font-medium">Download high-yield, chapter-wise notes compiled by Priyanshi Jain.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto fade-up-element stagger-2">
          {(materials.length === 0 ? [
            { title: "Crime Scene Investigation Complete Guide", description: "In-depth notes on crime scene processing, evidence collection, and photography.", type: "PDF" },
            { title: "Forensic Toxicology Cheat Sheet", description: "A quick revision guide covering major poisons, their mechanisms, and extraction methods.", type: "Document" },
            { title: "Fingerprint Analysis & Ridge Patterns", description: "Detailed diagrams and explanations of friction ridge analysis and fingerprint classification.", type: "PDF" }
          ] : materials).map((mat, i) => (
              <div key={i} className="bg-purple/10 border border-purple/20 rounded-2xl p-6 flex flex-col justify-between text-left hover:bg-purple/20 transition-colors">
                <div>
                  <h3 className="font-bold text-lg text-navy mb-2 font-display">{mat.title}</h3>
                  <p className="text-purple text-xs font-semibold leading-relaxed mb-6 line-clamp-3">{mat.description}</p>
                </div>
                <a href="https://app.forensicbypriyanshi.com/login" className="text-xs text-rose font-bold hover:underline flex items-center gap-1">Download Resource File →</a>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

// Dynamic Podcasts Carousel
const Podcasts = ({ podcasts = [] }: { podcasts?: any[] }) => {
  const parseThumbnail = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return ytMatch && ytMatch[1] ? `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg` : 'https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png';
  };

  // Dynamically repeat items to ensure the marquee container has enough elements to loop continuously
  const marqueeItems: any[] = [];
  if (podcasts.length > 0) {
    const repeats = Math.max(3, Math.ceil(15 / podcasts.length));
    for (let r = 0; r < repeats; r++) {
      marqueeItems.push(...podcasts);
    }
  }

  return (
    <section id="podcasts" className="snap-start h-[100svh] py-24 bg-peach overflow-hidden flex flex-col justify-center border-b border-plum/20 relative z-10">
      <div className="text-center mb-12 md:mb-16 max-w-5xl mx-auto px-6 fade-up-element">
        <span className="text-plum font-extrabold uppercase tracking-widest text-xs md:text-sm mb-3 block">Interviews & Big Collaborations</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-navy mb-6 leading-tight">Priyanshi on Top Podcasts</h2>
        <p className="text-purple text-lg md:text-xl font-semibold leading-relaxed max-w-2xl mx-auto">
          Watch Priyanshi Ma'am break down complex forensic science cases and career paths with India's biggest YouTubers.
        </p>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-12 relative fade-up-element stagger-2">
        {podcasts.length === 0 ? (
          <p className="text-peach font-medium text-center py-10">No podcasts linked yet.</p>
        ) : (
          <DraggableMarquee speed={1.5}>
            {marqueeItems.map((pod, i) => {
              const thumb = pod.imageUrl || parseThumbnail(pod.url);
              return (
                <a
                  key={i}
                  href={pod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-[320px] md:w-[500px] shrink-0 bg-navy border border-plum rounded-3xl shadow-2xl overflow-hidden hover:-translate-y-3 transition-transform duration-300 group"
                >
                  <div className="aspect-video w-full relative overflow-hidden bg-black flex items-center justify-center">
                    <img src={thumb} alt={pod.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-white font-bold text-lg md:text-xl line-clamp-2 leading-snug font-display drop-shadow-md">{pod.title}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </DraggableMarquee>
        )}
      </div>
    </section>
  );
};

// YouTube Video Shorts (Marquee)
const YouTubeVideos = ({ videos }: { videos: any[] }) => {
  return (
    <section id="live-shorts" className="snap-start h-[100svh] pt-24 pb-8 bg-navy overflow-hidden flex flex-col justify-center border-b border-plum">
      <div className="text-center mb-12 max-w-4xl mx-auto px-6">
        <p className="text-peach font-bold uppercase tracking-widest text-xs mb-2">Live Updates & Video Guides</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Latest YouTube Shorts</h2>
        <p className="text-white/80 text-base font-semibold leading-relaxed">
          Stay up-to-date with quick forensic facts, case studies, and prep tips.
        </p>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-8 relative group fade-up-element stagger-2">
        <DraggableMarquee speed={1.2}>
          {videos.length === 0 && <div className="text-white/50 font-bold px-12">Loading live updates...</div>}
          {[...videos, ...videos, ...videos, ...videos].map((vid, i) => (
            <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" className="block w-[200px] md:w-[260px] shrink-0 bg-purple rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300">
              <div className="aspect-[9/16] w-full relative overflow-hidden flex items-center justify-center bg-black">
                <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 opacity-90 hover:opacity-100" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 pointer-events-none"></div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-t-transparent border-b-transparent border-l-white ml-1"></div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4">
                  <p className="text-white font-bold text-sm line-clamp-2 leading-snug drop-shadow-md">{vid.title}</p>
                </div>
              </div>
            </a>
          ))}
        </DraggableMarquee>
      </div>
    </section>
  );
};

// Latest Channel Videos (Dynamic YouTube RSS)
const LatestChannelVideos = ({ videos = [] }: { videos?: any[] }) => {
  const parseThumbnail = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    return ytMatch && ytMatch[1] ? `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg` : '';
  };
  
  const marqueeItems: any[] = [];
  if (videos.length > 0) {
    const repeats = Math.max(3, Math.ceil(15 / videos.length));
    for (let r = 0; r < repeats; r++) {
      marqueeItems.push(...videos);
    }
  }

  return (
    <section id="latest-videos" className="snap-start h-[100svh] py-24 bg-peach overflow-hidden flex flex-col justify-center border-b border-plum/20 relative z-10">
      <div className="text-center mb-12 md:mb-16 max-w-5xl mx-auto px-6 fade-up-element">
        <span className="text-plum font-extrabold uppercase tracking-widest text-xs md:text-sm mb-3 block">From the Channel</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-navy mb-6 leading-tight">Latest Videos</h2>
        <p className="text-purple text-lg md:text-xl font-semibold leading-relaxed max-w-2xl mx-auto">
          Watch the newest uploads directly from the Forensic Science by Priyanshi YouTube channel.
        </p>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-12 relative fade-up-element stagger-2">
        {videos.length === 0 ? (
          <p className="text-peach font-medium text-center py-10">Loading latest videos...</p>
        ) : (
          <DraggableMarquee speed={1.5}>
            {marqueeItems.map((vid, i) => {
              const thumb = vid.thumbnail || parseThumbnail(vid.url);
              return (
                <a
                  key={i}
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-[320px] md:w-[400px] shrink-0 bg-purple border border-plum rounded-3xl shadow-2xl overflow-hidden hover:-translate-y-3 transition-transform duration-300 group mx-4"
                >
                  <div className="aspect-video w-full relative overflow-hidden bg-black flex items-center justify-center">
                    {thumb ? (
                      <img src={thumb} alt={vid.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    ) : (
                      <div className="w-full h-full bg-navy flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-b-8 border-l-[14px] border-t-transparent border-b-transparent border-l-white ml-1"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-white font-bold text-base md:text-lg line-clamp-2 leading-snug font-display drop-shadow-md">{vid.title}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </DraggableMarquee>
        )}
      </div>
    </section>
  );
};

// About Priyanshi
const AboutPriyanshi = ({ data }: { data: any }) => {
  return (
    <section id="about" className="snap-start h-[100svh] py-24 bg-white relative overflow-hidden flex flex-col justify-center border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="fade-up-element relative order-2 md:order-1">
          <div className="w-[85%] aspect-[4/5] bg-peach/30 rounded-[3rem] relative overflow-hidden flex items-center justify-center shadow-lg">
            {data?.aboutImage ? (
              <img src={data.aboutImage} alt="Priyanshi Jain" className="w-full h-full object-cover" />
            ) : (
              <div className="text-purple font-display text-xl font-bold">Image Placeholder</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent mix-blend-overlay"></div>
          </div>
          <div className="absolute -bottom-8 -right-8 md:right-4 bg-amber p-6 rounded-3xl shadow-xl border border-white/20 transform rotate-6 hidden md:block">
            <p className="font-display font-bold text-navy text-2xl">111K+</p>
            <p className="text-navy/70 text-xs font-bold uppercase tracking-widest">Subscribers</p>
          </div>
        </div>
        <div className="fade-up-element order-1 md:order-2 space-y-8">
          <div>
            <span className="text-amber font-bold uppercase tracking-widest text-xs md:text-sm mb-3 block">About Your Mentor</span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
              {data?.aboutTitle ? (
                typeof data.aboutTitle === 'string' ? data.aboutTitle.replace('Priyanshi Jain', 'Priyanshi\u00A0Jain') : data.aboutTitle
              ) : (
                <>Meet <span className="whitespace-nowrap">Priyanshi Jain</span></>
              )}
            </h2>
          </div>
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed font-medium">
            {data?.aboutDescription ? (
              <p className="whitespace-pre-line">{data.aboutDescription}</p>
            ) : (
              <>
                <p>Priyanshi Jain is India's leading Forensic Science educator and content creator, dedicated to bridging the gap between academic theory and practical application.</p>
                <p>With a mission to make forensic education accessible, she has built a massive community of enthusiasts and professionals, helping thousands of students crack top exams like CUET PG, NFAT, and UGC NET.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// CTA Footer
const CTAFooter = ({ data }: { data: any }) => {
  return (
    <section id="cta" className="snap-start h-[100svh] bg-gradient-to-br from-navy to-purple relative flex flex-col justify-between overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      {/* CTA Content */}
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-6 relative z-10 fade-up-element space-y-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <h2 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight">
            {data?.ctaTitle || "Ready to Crack Your Exams?"}
          </h2>
          <p className="text-peach text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            {data?.ctaSubtitle || "Join India's fastest-growing forensic science community and take the first step toward your dream career."}
          </p>
          <div className="flex justify-center">
            <HeroButton to={data?.ctaButtonLink || "https://app.forensicbypriyanshi.com/signup"} primary>
              {data?.ctaButtonText || "Start Learning for Free"}
            </HeroButton>
          </div>
        </div>
      </div>

      {/* Actual Footer */}
      <footer className="relative z-10 border-t border-plum/30 bg-navy/40 backdrop-blur-md pt-16 pb-8 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-white text-xl">Forensic By Priyanshi</span>
            </div>
            <p className="text-peach/80 text-sm leading-relaxed font-medium">
              India's leading forensic science educator, dedicated to bridging the gap between academic theory and practical application.
            </p>
          </div>
          
          {/* Nested grid for Quick Links and Support to be side-by-side on mobile */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-8 md:gap-12">
            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Quick Links</h4>
              <ul className="space-y-3 text-peach/80 text-sm font-medium">
                <li><a href="#courses" className="hover:text-amber transition-colors">Premium Courses</a></li>
                <li><a href="#materials" className="hover:text-amber transition-colors">Study Materials</a></li>
                <li><a href="#tests" className="hover:text-amber transition-colors">Mock Tests</a></li>
                <li><a href="#podcasts" className="hover:text-amber transition-colors">Interviews & Podcasts</a></li>
              </ul>
            </div>
            
            {/* Column 3: Support */}
            <div>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-3 text-peach/80 text-sm font-medium">
                <li><a href="mailto:dev.forensicsbypriyanshi@gmail.com" className="hover:text-amber transition-colors">Contact Us</a></li>
                <li><a href="#faq" className="hover:text-amber transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-amber transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Column 4: Social */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="https://youtube.com/@forensicsciencebypriyanshi" target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-amber hover:text-navy transition-all border border-white/10">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-amber hover:text-navy transition-all border border-white/10">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-amber hover:text-navy transition-all border border-white/10">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-plum/20 text-center flex justify-center items-center gap-4">
          <p className="text-peach/60 text-xs font-medium">
            © {new Date().getFullYear()} Forensic By Priyanshi. All rights reserved.
          </p>
        </div>
      </footer>
    </section>
  );
};

// Free Resources
const FreeResources = () => {
  return (
    <section id="free-resources" className="snap-start h-[100svh] py-24 bg-peach relative overflow-hidden border-b border-plum/20 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20 w-full">
        <div className="flex-1 fade-up-element order-2 md:order-1 relative">
          <div className="w-full aspect-square md:aspect-[4/3] bg-gradient-to-br from-purple/10 to-transparent rounded-[3rem] flex items-center justify-center relative overflow-hidden">
            <Lock className="w-40 h-40 text-navy/5 absolute blur-xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 w-48 h-48 bg-navy/90 rounded-[2rem] shadow-2xl border border-plum/30 flex items-center justify-center -rotate-6 backdrop-blur-md">
              <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Resources" className="w-24 h-24 object-contain brightness-110" />
            </div>
          </div>
        </div>
        <div className="flex-1 fade-up-element order-1 md:order-2">
          <div className="w-20 h-20 bg-navy/5 rounded-3xl flex items-center justify-center mb-8 border border-navy/10">
            <Lock className="w-10 h-10 text-amber" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-navy leading-tight">The Free Resource <span className="text-amber">Vault</span></h2>
          <p className="text-navy/70 text-xl mb-10 font-medium leading-relaxed max-w-lg">
            Exclusive access to previous year question papers, syllabuses, and high-yield flashcards. Strictly reserved for signed-up members.
          </p>
          <div className="flex">
            <HeroButton to="https://app.forensicbypriyanshi.com/login" primary>
              Create Free Account to Unlock
            </HeroButton>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials
const Testimonials = ({ testimonials = [] }: { testimonials?: any[] }) => {
  const defaultTestimonials = [
    { text: "I have been following Priyanshi Jain for my MSc Forensic Science entrance exam preparation, and it has been an incredibly valuable resource.", author: "Devangana Chakraborty", rank: "IRTE Farte", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { text: "I started my preparation through your channel. I had a non-forensic background since I started from zero and got NFSU. Thank you so much ma'am.", author: "Mayank Raj", rank: "NFSU", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { text: "Mam your counselling is very very good and too much helpful for students. Feeling confident and blessed with your help.", author: "Dave Parth", rank: "AIR 12 - CUET PG", image: "https://randomuser.me/api/portraits/men/67.jpg" }
  ];

  const displayList = testimonials.length > 0 ? testimonials : defaultTestimonials;

  const marqueeItems: any[] = [];
  if (displayList.length > 0) {
    const repeats = Math.max(4, Math.ceil(15 / displayList.length));
    for (let r = 0; r < repeats; r++) {
      marqueeItems.push(...displayList);
    }
  }

  return (
    <section id="testimonials" className="snap-start h-[100svh] flex flex-col justify-center py-16 bg-white relative overflow-hidden border-b border-navy/10">
      {/* Ambient background glow to fill empty space */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full text-center mb-10 relative z-10 fade-up-element px-6 max-w-4xl mx-auto">
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold text-navy tracking-wide mb-4">
          Don't just take <span className="text-amber">our word</span> for it.
        </h2>
        <p className="text-navy/70 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
          Join thousands of successful students who have transformed their careers and achieved top ranks with our specialized forensic science programs.
        </p>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-4 relative group fade-up-element stagger-2 z-10">
        <DraggableMarquee speed={1.2}>
          {marqueeItems.map((t, i) => (
            <div key={i} className="w-[350px] md:w-[450px] lg:w-[550px] min-h-[280px] lg:min-h-[320px] shrink-0 bg-navy p-8 md:p-10 rounded-[2rem] border border-plum shadow-xl flex flex-col justify-between whitespace-normal transition-all duration-300 hover:-translate-y-2 hover:shadow-amber/10 hover:border-amber/30 mx-4">
              <div className="flex gap-1 text-amber mb-4 md:mb-6">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 md:w-5 md:h-5 fill-current" />)}
              </div>
              <p className="text-peach text-base md:text-lg font-semibold leading-relaxed mb-6 md:mb-8 italic">"{t.text}"</p>
              <div className="flex items-center gap-4 mt-auto">
                {t.image ? (
                  <img src={t.image} alt={t.author} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shadow-lg shrink-0 border border-plum" />
                ) : (
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-purple flex items-center justify-center font-bold text-white text-xl shrink-0 border border-plum">
                    {t.author?.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h4 className="text-white font-bold text-base md:text-lg leading-none flex items-center gap-1.5">
                    {t.author}
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  </h4>
                  <p className="text-[10px] md:text-xs text-white/60 font-extrabold uppercase tracking-widest mt-1.5">{t.rank}</p>
                </div>
              </div>
            </div>
          ))}
        </DraggableMarquee>
      </div>
    </section>
  );
};

// FAQ Section
const FAQs = ({ faqs = [] }: { faqs?: any[] }) => {
  return (
    <section id="faq" className="snap-start h-[100svh] flex flex-col justify-center py-20 bg-peach relative overflow-hidden text-navy border-b border-plum/30">
      <div className="w-full text-center mb-8 relative z-10">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-navy tracking-wide">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="max-w-3xl mx-auto px-6 w-full relative z-10 space-y-3 fade-up-element stagger-2">
        {(faqs.length === 0 ? [
          { question: "Is this program suitable for CUET PG Forensic Science preparation?", answer: "Yes, our programs are specifically designed keeping in mind the syllabus and exam pattern of CUET PG and NFSU entrance examinations. We cover all topics comprehensively." },
          { question: "Are the study notes chapter-wise or topic-wise?", answer: "All our study notes are meticulously organized chapter-wise to ensure a logical flow of learning. We also provide dedicated topic-wise cheat sheets for quick revision." },
          { question: "Can I access the mock tests on my mobile phone?", answer: "Absolutely. Our platform is fully responsive, and you can attempt all mock tests, read study notes, and watch video lectures seamlessly from both your mobile phone and desktop." },
          { question: "How does the 1-on-1 mentorship work?", answer: "When you enroll, you can book direct 1-on-1 video sessions with Priyanshi. These sessions are meant to solve your specific doubts, craft a personalized study plan, and provide career guidance." }
        ] : faqs).map((faq, i) => (
            <div key={i} className="bg-purple/10 border border-purple/20 rounded-2xl p-4 md:p-5 text-left">
              <h4 className="font-bold text-sm md:text-base text-navy mb-1.5 font-display flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose shrink-0" />
                Q: {faq.question}
              </h4>
              <p className="text-purple text-xs md:text-sm leading-relaxed font-semibold pl-7">
                A: {faq.answer}
              </p>
            </div>
          ))}
      </div>
    </section>
  );
};

const BlogCarousel = ({ blogs = [] }: { blogs?: any[] }) => {
  if (blogs.length === 0) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const marqueeItems: any[] = [];
  const repeats = Math.max(4, Math.ceil(15 / blogs.length));
  for (let r = 0; r < repeats; r++) {
    marqueeItems.push(...blogs);
  }

  return (
    <section id="blog-carousel" className="snap-start h-[100svh] py-24 bg-navy overflow-hidden flex flex-col justify-center border-b border-plum">
      <div className="text-center mb-12 max-w-4xl mx-auto px-6">
        <span className="text-amber font-bold uppercase tracking-widest text-xs mb-2 block">Latest Case Files & Insights</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Featured Blogs</h2>
        <p className="text-peach text-base font-semibold leading-relaxed max-w-lg mx-auto">
          Explore deep dives in DNA profiling, cyber forensics, ballistics, and more.
        </p>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-8 relative group fade-up-element stagger-2 z-10">
        <DraggableMarquee speed={1.2}>
          {marqueeItems.map((blog, i) => (
            <a key={i} href={`/blogs/${blog.slug}`} className="w-[300px] md:w-[400px] shrink-0 bg-purple border border-plum rounded-3xl shadow-xl flex flex-col whitespace-normal transition-transform duration-300 hover:-translate-y-2 overflow-hidden group/card">
              <div className="w-full aspect-[16/9] relative overflow-hidden bg-black shrink-0">
                <img
                  src={blog.coverImage || 'https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png'}
                  alt={blog.title}
                  className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover/card:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow text-left">
                <div>
                  <div className="flex items-center gap-2 text-peach font-bold text-[10px] uppercase tracking-widest mb-3">
                    <Calendar className="w-3 h-3" />
                    {formatDate(blog.createdAt)}
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-bold text-white mb-3 leading-tight line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>
                <div className="mt-auto text-[#F59F59] font-bold text-xs uppercase tracking-widest flex items-center gap-1 group-hover/card:gap-2 transition-all">
                  Read Article <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </DraggableMarquee>
      </div>
    </section>
  );
};

export default function LandingPageClient(props: any) {
  const [ytVideos, setYtVideos] = useState<any[]>([]);
  const [ytSubs, setYtSubs] = useState<number | undefined>();

  useEffect(() => {
    let mounted = true;

    // Check local storage cache first
    const cachedData = typeof window !== 'undefined' ? localStorage.getItem('fbp_yt_cache') : null;
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Cache valid for 30 minutes
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setYtVideos(parsed.videos || []);
          setYtSubs(parsed.subscriberCount);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached YT data", e);
      }
    }

    fetch('/api/youtube')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return;
        if (data.videos) setYtVideos(data.videos);
        if (data.subscriberCount) setYtSubs(data.subscriberCount);

        // Save to cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('fbp_yt_cache', JSON.stringify({
            videos: data.videos,
            subscriberCount: data.subscriberCount,
            timestamp: Date.now()
          }));
        }
      })
      .catch(console.error);
    return () => { mounted = false; };
  }, []);



  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.classList.add('snap-y', 'snap-mandatory');
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.classList.remove('snap-y', 'snap-mandatory');
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });
    document.querySelectorAll('.fade-up-element').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const DEFAULT_ORDER = [
    'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter'
  ];

  let sections = DEFAULT_ORDER;

  return (
    <div className="w-full relative flex flex-col pt-0 pb-0">
      <div className="absolute top-0 left-0 right-0 h-screen z-0 overflow-hidden pointer-events-none">
        <HeroBackground />
      </div>
      {sections.map((sectionName: string) => {
        switch (sectionName) {
          case 'hero':
            return <Hero key="hero" data={props.landingPageData} ytSubs={ytSubs} />;
          case 'guidance':
            return <OneOnOneGuidance key="guidance" data={props.landingPageData} />;
          case 'courses':
            return <Courses key="courses" initialCourses={props.initialCourses} />;
          case 'tests':
            return <MockTests key="tests" tests={props.initialTests} />;
          case 'latestVideos':
            return <LatestChannelVideos key="latestVideos" videos={props.latestYouTubeVideos} />;
          case 'materials':
            return <StudyNotes key="materials" materials={props.initialMaterials} />;
          case 'freeResources':
            return <FreeResources key="freeResources" />;
          case 'podcasts':
            return <Podcasts key="podcasts" podcasts={props.initialPodcasts} />;
          case 'youtube':
            return <YouTubeVideos key="youtube" videos={ytVideos} />;
          case 'testimonials':
            return <Testimonials key="testimonials" testimonials={props.initialTestimonials} />;
          case 'blogs':
            return <BlogCarousel key="blogs" blogs={props.initialBlogs || []} />;
          case 'about':
            return <AboutPriyanshi key="about" data={props.landingPageData} />;
          case 'faq':
            return <FAQs key="faq" faqs={props.initialFaqs} />;
          case 'ctaFooter':
            return <CTAFooter key="ctaFooter" data={props.landingPageData} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
