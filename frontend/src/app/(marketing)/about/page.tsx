import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Users, Trophy, Star, GraduationCap, Mic } from 'lucide-react';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Priyanshi Jain',
  description: 'Learn about Priyanshi Jain, founder of Forensics By Priyanshi, and her mission to revolutionize forensic science education in India.',
};

export default async function AboutPage() {
  let aboutData: any = {};
  try {
    const docRef = doc(db, 'settings', 'aboutUs');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      aboutData = snap.data();
    }
  } catch (err) {
    console.error("Failed to fetch about us data", err);
  }

  const safeData = {
    heroImage: aboutData.heroImage || "https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png",
    title: aboutData.title || "Meet Priyanshi Jain",
    subtitle: aboutData.subtitle || "Forensic Expert, Educator, and the visionary behind India's fastest-growing forensic science community.",
    description: aboutData.description || "With a deep passion for criminal investigations and a commitment to academic excellence, Priyanshi founded this academy to bridge the gap between theoretical knowledge and practical forensic application. Her guidance has helped thousands of students clear the toughest entrance exams like CUET PG, NFSU, and UGC NET.",
    missionStatement: aboutData.missionStatement || "To democratize high-quality forensic science education across India, empowering the next generation of crime scene investigators, toxicologists, and cyber experts with the skills they need to seek the truth.",
    stat1Value: aboutData.stat1Value || "10,000+",
    stat1Label: aboutData.stat1Label || "Students Guided",
    stat2Value: aboutData.stat2Value || "95%",
    stat2Label: aboutData.stat2Label || "Success Rate",
    stat3Value: aboutData.stat3Value || "100+",
    stat3Label: aboutData.stat3Label || "Mock Tests",
    stat4Value: aboutData.stat4Value || "50+",
    stat4Label: aboutData.stat4Label || "Podcast Episodes",
  };

  return (
    <div className="min-h-screen pt-40 pb-20 relative bg-[#1D1A39] text-left">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-amber hover:text-peach transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber/20 to-peach/20 rounded-[3rem] transform -rotate-6 scale-105" />
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
              <img 
                src={safeData.heroImage} 
                alt="Instructor" 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold tracking-[0.2em] uppercase mb-2">
              <Star className="w-3 h-3 text-amber" /> The Instructor
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1]" dangerouslySetInnerHTML={{ __html: safeData.title.replace('Priyanshi Jain', '<span class="text-transparent bg-clip-text bg-gradient-to-r from-amber to-peach">Priyanshi Jain</span>') }}>
            </h1>
            <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed">
              {safeData.subtitle}
            </p>
            <div className="pt-6 border-t border-white/10">
              <p className="text-white/60 leading-relaxed font-medium">
                {safeData.description}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {[
            { icon: Users, label: safeData.stat1Label, value: safeData.stat1Value },
            { icon: Trophy, label: safeData.stat2Label, value: safeData.stat2Value },
            { icon: GraduationCap, label: safeData.stat3Label, value: safeData.stat3Value },
            { icon: Mic, label: safeData.stat4Label, value: safeData.stat4Value },
          ].map((stat, i) => (
            <div key={i} className="bg-[#451952] border border-white/5 p-6 rounded-2xl flex flex-col items-center text-center">
              <stat.icon className="w-8 h-8 text-amber mb-4" />
              <h3 className="font-display text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="bg-[#451952] border border-white/5 rounded-[3rem] p-10 md:p-16 text-center max-w-4xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber rounded-full mix-blend-multiply filter blur-[100px] opacity-10" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-white/80 text-lg md:text-xl font-medium leading-relaxed italic">
            "{safeData.missionStatement}"
          </p>
        </div>

      </div>
    </div>
  );
}
