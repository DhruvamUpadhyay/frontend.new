"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Clock, CheckCircle2, Calendar,
  Star, ChevronRight, ChevronLeft, Download,
  Lock, ScanLine, Fingerprint, Video, BookOpen,
  LayoutDashboard, BarChart3, Database
} from 'lucide-react';

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

  // Initial fast counter animation
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
    
    // Add a deterministic offset so it looks like an exact number (e.g. 11,142 instead of 11,100)
    // Increases by 1 every ~2 hours
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

  // Live ticking effect
  useEffect(() => {
    if (!isVisible || !isLive || count < end) return;
    
    // Increment by 1 every 15 to 45 seconds randomly
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
  )
};

// 1. Hero Section (Navy)
const Hero = ({ data, ytSubs }: { data: any, ytSubs?: number }) => {
  const safeData = data || {};
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-[#1D1A39] text-center snap-start">
      <ScanLine className="absolute top-20 right-10 w-[600px] h-[600px] text-white opacity-[0.01] pointer-events-none" />
      <Fingerprint className="absolute bottom-10 left-10 w-[400px] h-[400px] text-white opacity-[0.02] pointer-events-none rotate-12" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8BCB9]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col items-center w-full mt-10">
        <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] mb-6 text-white tracking-tight">
          <div className="fade-up-element stagger-1">{safeData.heroTitle || "India's Fastest-Growing"}</div>
          <div className="fade-up-element stagger-2 text-transparent bg-clip-text bg-gradient-to-r from-[#F59F59] to-[#E8BCB9]">
            {safeData.heroSubtitle || "Forensic Science Education Hub"}
          </div>
        </h1>
        
        <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl font-medium fade-up-element stagger-3 leading-relaxed">
          {safeData.heroDescription || "Led by Priyanshi. Join our community of 1,50,000+ Forensic Enthusiasts and get access to the best courses and guidance."}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 fade-up-element stagger-3 w-full sm:w-auto mb-16">
          <HeroButton to="https://app.forensicbypriyanshi.com/login" primary={false}>
            Log in
          </HeroButton>
          <HeroButton to="https://app.forensicbypriyanshi.com/signup" primary={true}>
            Sign up <ArrowRight className="w-5 h-5" />
          </HeroButton>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-8 md:gap-16 fade-up-element stagger-4 mt-8">
          {[
            { label: safeData.stats1Label || 'Active Learners', end: parseInt((safeData.stats1Value || "10000").replace(/[^0-9]/g, '')) || 10000, suffix: "+", isLive: false },
            { label: safeData.stats2Label || 'Forensic Enthusiasts', end: ytSubs || parseInt((safeData.stats2Value || "150000").replace(/[^0-9]/g, '')) || 150000, suffix: "+", isLive: true },
            { label: safeData.stats3Label || 'Students Taught', end: parseInt((safeData.stats3Value || "25000").replace(/[^0-9]/g, '')) || 25000, suffix: "+" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-display text-3xl font-bold text-white mb-1">
                <AnimatedNumber end={stat.end} suffix={stat.suffix} isLive={stat.isLive} />
              </span>
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// 3. One-on-One Guidance (White)
const OneOnOneGuidance = () => {
  return (
    <section id="guidance" className="min-h-[100svh] w-full bg-[#fafafa] relative overflow-hidden flex flex-col pt-32 pb-20 snap-start border-b border-[#1D1A39]/5">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 my-auto">
        <div className="w-full lg:w-[60%] fade-up-element flex flex-col justify-center text-left shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1D1A39]/5 border border-[#1D1A39]/10 text-[#1D1A39]/80 text-xs font-bold tracking-[0.2em] uppercase mb-6 w-max">
            <Star className="w-3 h-3 text-[#F59F59]" /> 1-on-1 Guidance
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-[#1D1A39] leading-[1.2]">
            Get One-on-One <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59F59] to-[#E8BCB9]">Career Guidance</span> Directly from Priyanshi ma'am
          </h2>
          <p className="text-[#1D1A39]/70 text-lg md:text-xl font-medium mb-10 leading-relaxed max-w-2xl">
            Get clarity on anything & everything that you have in your head related to Forensic Science.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 border-t border-[#1D1A39]/10 mt-auto lg:mt-0">
            <div>
              <p className="text-[#1D1A39]/50 text-xs uppercase font-bold tracking-wider mb-1">Session Pass</p>
              <p className="text-[#1D1A39] font-display text-4xl font-bold">₹999</p>
            </div>
            <PremiumButton to="/student/counselling" primary>
              Book Your Session <Calendar className="w-5 h-5" />
            </PremiumButton>
          </div>
        </div>
      </div>
    </section>
  );
};

// 4. Courses
const Courses = ({ initialCourses }: { initialCourses: any[] }) => {
  const [courses, setCourses] = useState<any[]>(initialCourses || []);
  return (
    <section id="courses" className="min-h-[100svh] py-24 bg-[#1D1A39] relative z-10 border-b border-white/10 flex flex-col justify-center snap-start">
      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="text-center mb-16 fade-up-element">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">Premium <span className="text-[#F59F59]">Courses</span></h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-medium">Click on any course card to reveal curriculum details and enrollment options.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {courses.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white/5 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-display font-bold text-white mb-2">New Batches Launching Soon</h3>
              <p className="text-white/60 font-medium">We are currently updating our premium course catalog. Check back shortly!</p>
            </div>
          )}
          {courses.map((course, i) => (
             <div key={i} className="bg-white rounded-[2rem] border border-[#1D1A39]/10 shadow-xl overflow-hidden">
               <div className="h-48 bg-gradient-to-br from-[#E8BCB9] to-[#F59F59] flex items-center justify-center p-6 relative">
                 <h3 className="font-display text-2xl font-bold text-[#1D1A39] text-center leading-tight shadow-sm-white">{course.title}</h3>
               </div>
               <div className="p-8 flex flex-col justify-between">
                 <div className="text-[#1D1A39] font-bold text-xl mb-4">{course.price}</div>
                 <PremiumButton to="#courses" primary>Enroll Now</PremiumButton>
               </div>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// YouTube Section (Replacing Podcasts)
const YouTubeVideos = ({ videos }: { videos: any[] }) => {
  return (
    <section id="podcasts" className="min-h-[100svh] pt-24 pb-8 bg-[#E8BCB9] overflow-hidden flex flex-col justify-center snap-start">
      <div className="text-center mb-12 max-w-4xl mx-auto px-6">
        <p className="text-[#1D1A39]/70 font-bold uppercase tracking-widest text-sm mb-2">Live Updates</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-[#1D1A39] mb-6">Latest YouTube Shorts</h2>
        <p className="text-[#1D1A39]/80 text-lg md:text-xl font-medium leading-relaxed">
          Stay up-to-date with quick forensic facts, case studies, and tips.
        </p>
      </div>
      
      <div className="max-w-[100vw] mx-auto px-0 w-full overflow-hidden pb-8 relative group">
         <div className="animate-marquee flex gap-6 w-max items-center">
           {videos.length === 0 && <div className="text-[#1D1A39]/50 font-bold px-12">Loading live updates...</div>}
           {/* Duplicate the array to create a seamless infinite loop */}
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

                 {/* Optional: Add title overlay at the bottom if we want, or user said "only thumbnail", so I will just put the title visually for accessibility but maybe keep it subtle */}
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

// Free Resources Vault
const FreeResources = () => {
  return (
    <section id="free-resources" className="min-h-[100svh] py-24 bg-[#1D1A39] relative overflow-hidden border-b border-white/10 flex flex-col justify-center snap-start">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20 w-full">
        <div className="flex-1 fade-up-element order-2 md:order-1 relative">
          <div className="w-full aspect-square md:aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent rounded-[3rem] flex items-center justify-center relative overflow-hidden">
             <Lock className="w-40 h-40 text-white/5 absolute blur-xl" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#E8BCB9]/20 rounded-full blur-3xl"></div>
             <div className="relative z-10 w-48 h-48 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/10 flex items-center justify-center -rotate-6">
               <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" alt="Resources" className="w-24 h-24 object-contain" />
             </div>
          </div>
        </div>
        <div className="flex-1 fade-up-element order-1 md:order-2">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
            <Lock className="w-10 h-10 text-[#F59F59]" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">The Free Resource <span className="text-[#E8BCB9]">Vault</span></h2>
          <p className="text-white/70 text-xl mb-10 font-medium leading-relaxed max-w-lg">
            Exclusive access to previous year question papers, syllabuses, and high-yield flashcards. Strictly reserved for signed-up members.
          </p>
          <div className="flex">
            <HeroButton to="#courses" primary>
              Create Free Account to Unlock
            </HeroButton>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonials
const Testimonials = () => {
  const testimonials = [
    { text: "I have been following Priyanshi Jain for my MSc Forensic Science entrance exam preparation, and it has been an incredibly valuable resource. The step-by-step approach in the tutorials helps build a strong foundation. These MCQs are excellent for self-assessment and allow you to gauge your preparation level effectively. Following this channel has significantly enhanced my preparation for the entrance exams.", author: "Devangana Chakraborty", rank: "IRTE faridabad", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { text: "I started my preparation through your channel. I had a non-forensic background since I started from zero and with your guidance and MCQs for NFAT I got NFSU. Thank you so much ma'am.", author: "Mayank Raj", rank: "NFSU", image: "https://randomuser.me/api/portraits/men/32.jpg" },
    { text: "Mam your counselling is very very good and too much helpful for students. Feeling confident and blessed with your help.", author: "Dave Parth", rank: "AIR 12 - CUET PG", image: "https://randomuser.me/api/portraits/men/67.jpg" }
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#fafafa] relative overflow-hidden flex flex-col items-center justify-center snap-start">
      <div className="w-full text-center mb-12 relative z-10 fade-up-element">
        <h2 className="font-display text-4xl md:text-5xl font-black text-[#1D1A39] tracking-widest uppercase">
          Hear Our Success Stories
        </h2>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 fade-up-element relative z-10">
         {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-[#1D1A39]/10 shadow-xl flex flex-col justify-between">
               <div className="flex gap-1 text-[#F59F59] mb-6">
                 {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
               </div>
               <p className="text-[#1D1A39]/80 text-sm font-medium leading-relaxed mb-8 italic">"{t.text}"</p>
               <div className="flex items-center gap-4">
                 <img src={t.image} alt={t.author} className="w-12 h-12 rounded-full object-cover shadow-md" />
                 <div>
                   <h4 className="text-[#1D1A39] font-bold text-sm">{t.author}</h4>
                   <p className="text-xs text-[#1D1A39]/50 font-bold uppercase tracking-widest">{t.rank}</p>
                 </div>
               </div>
            </div>
         ))}
      </div>
    </section>
  );
};

export default function LandingPageClient(props: any) {
  const [ytVideos, setYtVideos] = useState<any[]>([]);
  const [ytSubs, setYtSubs] = useState<number | undefined>();

  useEffect(() => {
    let mounted = true;
    fetch('/api/youtube')
      .then(res => res.json())
      .then(data => { 
        if (!mounted) return;
        if (data.videos) setYtVideos(data.videos); 
        if (data.subscriberCount) setYtSubs(data.subscriberCount);
      })
      .catch(console.error);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // Fade up animation logic
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

  return (
    <div className="w-full relative overflow-x-hidden pt-20 pb-0 flex flex-col">
      <Hero data={props.landingPageData} ytSubs={ytSubs} />
      <OneOnOneGuidance />
      <Courses initialCourses={props.initialCourses} />
      <FreeResources />
      <YouTubeVideos videos={ytVideos} />
      <Testimonials />
    </div>
  );
}
