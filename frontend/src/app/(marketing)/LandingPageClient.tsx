"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Clock, CheckCircle2, Calendar,
  Star, ChevronRight, ChevronLeft, Download,
  Lock, ScanLine, Fingerprint, Video, BookOpen,
  LayoutDashboard, BarChart3, Database, ChevronDown, HelpCircle
} from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import { AlternatingFeatures } from '@/components/AlternatingFeatures';

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
      <Link href={to} onClick={onClick} className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] font-bold overflow-hidden shadow-[0_0_20px_rgba(245,159,89,0.2)] hover:shadow-[0_0_30px_rgba(245,159,89,0.4)] transition-all flex items-center justify-center gap-2">
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
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-transparent text-center">
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center w-full mt-2">
        <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.1] mb-5 text-white tracking-tight">
          <div className="fade-up-element stagger-1">{safeData.heroTitle || "India's Fastest-Growing"}</div>
          <div className="fade-up-element stagger-2 text-transparent bg-clip-text bg-gradient-to-r from-amber to-peach">
            {safeData.heroSubtitle || "Forensic Science Education Hub"}
          </div>
        </h1>
        
        <p className="text-base md:text-lg text-white/70 mb-8 max-w-2xl font-medium fade-up-element stagger-3 leading-relaxed">
          {safeData.heroDescription || "Led by Priyanshi. Join our community of 1,50,000+ Forensic Enthusiasts and get access to the best courses and guidance."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 fade-up-element stagger-3 w-full sm:w-auto mb-10">
          <HeroButton to="https://app.forensicbypriyanshi.com/login" primary={true}>
            Login / Sign up <ArrowRight className="w-5 h-5" />
          </HeroButton>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16 fade-up-element stagger-4 mt-4">
          {[
            { label: 'Active Learners', subLabel: '(on platform)', end: parseInt((safeData.stats1Value || "10000").replace(/[^0-9]/g, '')) || 10000, suffix: "+", isLive: false },
            { label: 'Community of Forensic Enthusiasts', subLabel: '', end: ytSubs || parseInt((safeData.stats2Value || "150000").replace(/[^0-9]/g, '')) || 150000, suffix: "+", isLive: true },
            { label: 'Students Taught', subLabel: '(so far)', end: parseInt((safeData.stats3Value || "25000").replace(/[^0-9]/g, '')) || 25000, suffix: "+" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="font-display text-3xl font-bold text-white mb-1">
                <AnimatedNumber end={stat.end} suffix={stat.suffix} isLive={stat.isLive} />
              </span>
              <div className="flex flex-col items-center mt-1">
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-tight">{stat.label}</span>
                {stat.subLabel && <span className="text-[11px] text-white/40 font-medium tracking-wide mt-1">{stat.subLabel}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70 animate-bounce cursor-pointer z-20 hover:opacity-100 transition-opacity"
        onClick={() => {
          const nextSection = document.getElementById('guidance') || document.getElementById('features');
          nextSection?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#b07dff]">Scroll</span>
        <ChevronDown className="w-4 h-4 text-[#b07dff]" />
      </div>
    </section>
  );
};

// 1-on-1 Guidance
const OneOnOneGuidance = ({ data }: { data: any }) => {
  const safeData = data || {};
  return (
    <section id="guidance" className="min-h-[100svh] w-full bg-[#451952] relative overflow-hidden flex flex-col pt-32 pb-20 border-b border-white/5">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 my-auto">
        <div className="w-full lg:w-[60%] fade-up-element flex flex-col justify-center text-left shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold tracking-[0.2em] uppercase mb-6 w-max">
            <Star className="w-3 h-3 text-amber" /> 1-on-1 Guidance
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white leading-[1.2]">
            {safeData.guidanceTitle || "Get One-on-One Career Guidance Directly from Priyanshi ma'am"}
          </h2>
          <p className="text-white/70 text-lg md:text-xl font-medium mb-10 leading-relaxed max-w-2xl">
            {safeData.guidanceSubtitle || "Get clarity on anything & everything that you have in your head related to Forensic Science."}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 border-t border-white/10 mt-auto lg:mt-0">
            <div>
              <p className="text-white/50 text-xs uppercase font-bold tracking-wider mb-1">Session Pass</p>
              <p className="text-white font-display text-4xl font-bold">{safeData.guidancePrice || "₹999"}</p>
            </div>
            <HeroButton to={safeData.guidanceUrl || "/student/counselling"} primary>
              Book Your Session <Calendar className="w-5 h-5" />
            </HeroButton>
          </div>
        </div>
      </div>
    </section>
  );
};

// Courses Listing
const Courses = ({ initialCourses = [] }: { initialCourses?: any[] }) => {
  return (
    <section id="courses" className="min-h-[100svh] py-24 bg-[#1D1A39] relative z-10 border-b border-white/10 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16 fade-up-element">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">Premium <span className="text-amber">Courses</span></h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium">Click on any course card to reveal curriculum details and enrollment options.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto fade-up-element stagger-2">
          {initialCourses.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white/5 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-display font-bold text-white mb-2">New Batches Launching Soon</h3>
              <p className="text-white/60 font-medium">We are currently updating our premium course catalog. Check back shortly!</p>
            </div>
          )}
          {initialCourses.map((course, i) => (
             <div key={i} className="bg-white rounded-[2rem] border border-[#1D1A39]/10 shadow-xl overflow-hidden flex flex-col justify-between">
               <div className="h-48 bg-gradient-to-br from-peach to-amber flex items-center justify-center p-6 relative">
                 <h3 className="font-display text-2xl font-bold text-[#1D1A39] text-center leading-tight shadow-sm-white">{course.title}</h3>
               </div>
               <div className="p-8 flex flex-col justify-between flex-grow">
                 <div className="text-[#1D1A39] font-bold text-xl mb-6">{course.price}</div>
                 <PremiumButton to="https://app.forensicbypriyanshi.com/login" primary>Enroll Now</PremiumButton>
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
    <section id="tests-section" className="min-h-[100svh] py-24 bg-[#451952] relative z-10 border-b border-white/10 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16 fade-up-element">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">Mock Tests & <span className="text-peach">Test Series</span></h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium">Evaluate your exam preparation level with our simulated testing interfaces.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto fade-up-element stagger-2">
          {tests.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-white/60 font-medium">New test slots opening shortly.</p>
            </div>
          ) : (
            tests.map((test, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col justify-between text-left">
                <div>
                  <span className="text-[10px] font-extrabold text-amber uppercase tracking-widest">{test.category || 'General'}</span>
                  <h3 className="font-bold text-base text-white mt-2 mb-6 font-display line-clamp-2">{test.title}</h3>
                </div>
                <a href="https://app.forensicbypriyanshi.com/login" className="text-xs text-peach font-bold hover:underline">Start Test Series →</a>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

// Study Notes / Materials Section
const StudyNotes = ({ materials = [] }: { materials?: any[] }) => {
  return (
    <section id="materials-section" className="min-h-[100svh] py-24 bg-[#1D1A39] relative z-10 border-b border-white/10 flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16 fade-up-element">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">Study Notes & <span className="text-amber">Resources</span></h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium">Download high-yield, chapter-wise notes compiled by Priyanshi Jain.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto fade-up-element stagger-2">
          {materials.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-white/60 font-medium">Notes uploads are currently updating.</p>
            </div>
          ) : (
            materials.map((mat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between text-left">
                <div>
                  <h3 className="font-bold text-lg text-white mb-2 font-display">{mat.title}</h3>
                  <p className="text-white/60 text-xs font-semibold leading-relaxed mb-6 line-clamp-3">{mat.description}</p>
                </div>
                <a href="https://app.forensicbypriyanshi.com/login" className="text-xs text-amber font-bold hover:underline flex items-center gap-1">Download Resource File →</a>
              </div>
            ))
          )}
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
    return ytMatch && ytMatch[1] ? `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` : 'https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png';
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
    <section id="podcasts" className="min-h-[100svh] py-24 bg-[#1D1A39] overflow-hidden flex flex-col justify-center border-b border-white/5">
      <div className="text-center mb-12 max-w-4xl mx-auto px-6">
        <span className="text-amber font-bold uppercase tracking-widest text-xs mb-2 block">Interviews & Case Study Discussions</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Podcast Series</h2>
        <p className="text-white/70 text-base font-semibold leading-relaxed max-w-lg mx-auto">
          Tap on any card to listen to Priyanshi Ma'am discuss forensic breakthroughs and career paths.
        </p>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-8 relative fade-up-element stagger-2">
        {podcasts.length === 0 ? (
          <p className="text-white/40 text-center py-10 font-medium">No podcasts linked yet.</p>
        ) : (
          <div className="animate-marquee flex gap-6 w-max">
            {marqueeItems.map((pod, i) => {
              const thumb = pod.imageUrl || parseThumbnail(pod.url);
              return (
                <a 
                  key={i} 
                  href={pod.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-[260px] shrink-0 bg-[#1D1A39] border border-white/10 rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300"
                >
                  <div className="aspect-video w-full relative overflow-hidden bg-black flex items-center justify-center">
                    <img src={thumb} alt={pod.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-sm line-clamp-2 leading-snug font-display">{pod.title}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

// YouTube Video Shorts (Marquee)
const YouTubeVideos = ({ videos }: { videos: any[] }) => {
  return (
    <section id="live-shorts" className="min-h-[100svh] pt-24 pb-8 bg-[#451952] overflow-hidden flex flex-col justify-center border-b border-white/5">
      <div className="text-center mb-12 max-w-4xl mx-auto px-6">
        <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2">Live Updates & Video Guides</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Latest YouTube Shorts</h2>
        <p className="text-white/80 text-base font-semibold leading-relaxed">
          Stay up-to-date with quick forensic facts, case studies, and prep tips.
        </p>
      </div>
      
      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-8 relative group fade-up-element stagger-2">
         <div className="animate-marquee flex gap-6 w-max items-center">
           {videos.length === 0 && <div className="text-white/50 font-bold px-12">Loading live updates...</div>}
           {[...videos, ...videos, ...videos, ...videos].map((vid, i) => (
             <a key={i} href={vid.url} target="_blank" rel="noopener noreferrer" className="block w-[200px] md:w-[260px] shrink-0 bg-[#1D1A39] rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-transform duration-300">
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
         </div>
      </div>
    </section>
  );
};

// Free Resources
const FreeResources = () => {
  return (
    <section id="free-resources" className="min-h-[100svh] py-24 bg-[#451952] relative overflow-hidden border-b border-white/10 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20 w-full">
        <div className="flex-1 fade-up-element order-2 md:order-1 relative">
          <div className="w-full aspect-square md:aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent rounded-[3rem] flex items-center justify-center relative overflow-hidden">
             <Lock className="w-40 h-40 text-white/5 absolute blur-xl" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-peach/20 rounded-full blur-3xl"></div>
             <div className="relative z-10 w-48 h-48 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/10 flex items-center justify-center -rotate-6">
               <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Resources" className="w-24 h-24 object-contain" />
             </div>
          </div>
        </div>
        <div className="flex-1 fade-up-element order-1 md:order-2">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
            <Lock className="w-10 h-10 text-amber" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">The Free Resource <span className="text-peach">Vault</span></h2>
          <p className="text-white/70 text-xl mb-10 font-medium leading-relaxed max-w-lg">
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
    <section id="testimonials" className="min-h-[100svh] flex flex-col justify-center py-20 bg-[#1D1A39] relative overflow-hidden border-b border-white/5">
      <div className="w-full text-center mb-16 relative z-10 fade-up-element">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-widest uppercase">
          Success Stories
        </h2>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-8 relative group fade-up-element stagger-2 z-10">
         <div className="animate-marquee flex gap-6 w-max items-stretch hover:[animation-play-state:paused] py-4 px-6">
           {marqueeItems.map((t, i) => (
              <div key={i} className="w-[320px] md:w-[400px] shrink-0 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-xl flex flex-col justify-between whitespace-normal transition-transform duration-300 hover:-translate-y-2">
                 <div className="flex gap-1 text-amber mb-6">
                   {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                 </div>
                 <p className="text-white/80 text-sm font-semibold leading-relaxed mb-8 italic">"{t.text}"</p>
                 <div className="flex items-center gap-4 mt-auto">
                   {t.image ? (
                     <img src={t.image} alt={t.author} className="w-12 h-12 rounded-full object-cover shadow-md shrink-0" />
                   ) : (
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-white shrink-0">
                       {t.author?.slice(0, 2)}
                     </div>
                   )}
                   <div>
                     <h4 className="text-white font-bold text-sm leading-none flex items-center gap-1">
                       {t.author}
                       <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                     </h4>
                     <p className="text-[10px] text-white/50 font-extrabold uppercase tracking-widest mt-1.5">{t.rank}</p>
                   </div>
                 </div>
              </div>
           ))}
         </div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQs = ({ faqs = [] }: { faqs?: any[] }) => {
  return (
    <section id="faq" className="min-h-[100svh] flex flex-col justify-center py-20 bg-[#1D1A39] relative overflow-hidden">
      <div className="w-full text-center mb-16 relative z-10">
        <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-wide">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="max-w-3xl mx-auto px-6 w-full relative z-10 space-y-6 fade-up-element stagger-2">
        {faqs.length === 0 ? (
          <p className="text-white/40 text-center font-medium">FAQs are updating.</p>
        ) : (
          faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
              <h4 className="font-bold text-base text-white mb-2 font-display flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber shrink-0" />
                Q: {faq.question}
              </h4>
              <p className="text-white/60 text-sm leading-relaxed font-semibold pl-7">
                A: {faq.answer}
              </p>
            </div>
          ))
        )}
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
    <section id="blog-carousel" className="min-h-[100svh] py-24 bg-[#451952] overflow-hidden flex flex-col justify-center border-b border-white/5">
      <div className="text-center mb-12 max-w-4xl mx-auto px-6">
        <span className="text-amber font-bold uppercase tracking-widest text-xs mb-2 block">Latest Case Files & Insights</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Featured Blogs</h2>
        <p className="text-white/70 text-base font-semibold leading-relaxed max-w-lg mx-auto">
          Explore deep dives in DNA profiling, cyber forensics, ballistics, and more.
        </p>
      </div>

      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-8 relative group fade-up-element stagger-2 z-10">
         <div className="animate-marquee flex gap-6 w-max items-stretch hover:[animation-play-state:paused] py-4 px-6">
           {marqueeItems.map((blog, i) => (
              <a key={i} href={`/blogs/${blog.slug}`} className="w-[300px] md:w-[400px] shrink-0 bg-[#1D1A39]/90 border border-white/10 rounded-3xl shadow-xl flex flex-col whitespace-normal transition-transform duration-300 hover:-translate-y-2 overflow-hidden group/card">
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
         </div>
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

  const sections = props.landingPageData?.sectionOrder || [
    'hero', 'features', 'guidance', 'courses', 'tests', 'materials', 'freeResources', 'podcasts', 'youtube', 'testimonials', 'blogs', 'faq'
  ];

  return (
    <div className="w-full relative overflow-x-hidden pt-0 pb-0 flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-screen z-0 overflow-hidden pointer-events-none">
        <HeroBackground />
      </div>
      {sections.map((sectionName: string) => {
        switch (sectionName) {
          case 'hero':
            return <Hero key="hero" data={props.landingPageData} ytSubs={ytSubs} />;
          case 'features':
            return <AlternatingFeatures 
              key="features" 
              features={props.landingPageData?.features || DEFAULT_FEATURES} 
              headerTitle={props.landingPageData?.featuresSectionTitle}
              headerSubtitle={props.landingPageData?.featuresSectionSubtitle}
            />;
          case 'guidance':
            return <OneOnOneGuidance key="guidance" data={props.landingPageData} />;
          case 'courses':
            return <Courses key="courses" initialCourses={props.initialCourses} />;
          case 'tests':
            return <MockTests key="tests" tests={props.initialTests} />;
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
          case 'faq':
            return <FAQs key="faq" faqs={props.initialFaqs} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
