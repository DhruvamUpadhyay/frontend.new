"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { 
  Save, Loader2, RefreshCw, Star, Edit3, Plus, 
  Trash2, ArrowUp, ArrowDown, X, Layers, Image as ImageIcon,
  BookOpen, TestTube, FileText, Mic, Settings2, PlusCircle, Check
} from 'lucide-react';

export default function AdminVisualEditor() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Db Data states
  const [landingData, setLandingData] = useState<any>({
    heroTitle: "India's Fastest-Growing",
    heroSubtitle: "Forensic Science Education Hub",
    heroDescription: "Led by Priyanshi. Join our community of 1,50,000+ Forensic Enthusiasts and get access to the best courses and guidance.",
    stats1Value: "10000",
    stats1Label: "Active Learners",
    stats2Value: "150000",
    stats2Label: "Forensic Enthusiasts",
    stats3Value: "25000",
    stats3Label: "Students Taught",
    features: [],
    sectionOrder: [
      'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter'
    ]
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [newsletterCount, setNewsletterCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);

  const [navData, setNavData] = useState<any>({
    mainLinks: [
      { label: "Mentorship", url: "#guidance" },
      { label: "Courses", url: "#courses" },
      { label: "Notes", url: "#materials-section" },
      { label: "Test Series", url: "#tests-section" }
    ],
    dropdownLinks: [
      { label: "Free Resources", url: "#free-resources" },
      { label: "Upcoming Events", url: "#events" },
      { label: "Testimonials", url: "#testimonials" },
      { label: "Blogs", url: "/blogs" },
      { label: "About Us", url: "#about" },
      { label: "FAQ", url: "#faq" }
    ]
  });

  const [footerData, setFooterData] = useState<any>({
    exploreLinks: [
      { label: "CUET PG Courses", url: "/#courses" },
      { label: "AIFSET Prep", url: "/#courses" },
      { label: "Study Materials", url: "#materials-section" },
      { label: "Book Mentorship", url: "#guidance" }
    ],
    companyLinks: [
      { label: "About Us", url: "/" },
      { label: "Success Stories", url: "/" },
      { label: "Privacy Policy", url: "/" },
      { label: "Terms of Service", url: "/" }
    ]
  });

  const [mediaSelectorTarget, setMediaSelectorTarget] = useState<{ type: 'feature' | 'testimonial' | 'modal_input'; index?: number; key?: string } | null>(null);

  // Theme settings
  const [themeData, setThemeData] = useState<any>({
    primaryColor: '#1D1A39',
    accentColor: '#F59F59',
    secondaryColor: '#E8BCB9',
    baseFontSize: '14.4px',
    customCss: ''
  });

  const [aboutData, setAboutData] = useState<any>({
    heroImage: "", title: "", subtitle: "", description: "", missionStatement: "", stat1Value: "", stat1Label: "", stat2Value: "", stat2Label: "", stat3Value: "", stat3Label: "", stat4Value: "", stat4Label: ""
  });

  // Drawer/Modal Management states
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
  const [drawerData, setDrawerData] = useState<any>(null);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Custom Modal Prompt/Confirm states
  const [modalConfig, setModalConfig] = useState<{
    type: 'prompt' | 'confirm';
    title: string;
    description?: string;
    inputs: { key: string; label: string; placeholder?: string; type?: string; defaultValue?: string }[];
    onConfirm: (values: Record<string, string>) => void | Promise<void>;
  } | null>(null);
  const [modalInputValues, setModalInputValues] = useState<Record<string, string>>({});

  const toProxyUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/media')) return url;
    const match = url.match(/res\.cloudinary\.com\/[^/]+\/image\/upload\/(.+)/);
    if (match && match[1]) {
      return `/media/${match[1]}`;
    }
    return url;
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const safeGet = async (collection: string) => {
        try { return await apiClient.get(collection); }
        catch (e) { console.warn(`Failed to fetch ${collection}:`, e); return []; }
      };

      const landingSnap = await safeGet('landing_page');
      const coursesSnap = await safeGet('courses');
      const testsSnap = await safeGet('tests');
      const materialsSnap = await safeGet('materials');
      const podcastsSnap = await safeGet('podcasts');
      const testimonialsSnap = await safeGet('testimonials');
      const faqsSnap = await safeGet('faqs');
      const newsletterSnap = await safeGet('newsletter');
      const blogsSnap = await safeGet('blogs');
      const themeSnap = await safeGet('settings');
      const navigationSnap = await safeGet('navigation');

      const globalDoc = landingSnap.find((d: any) => d.id === 'global');
      if (globalDoc) {
        const defaultOrder = [
          'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter'
        ];
        let finalOrder = globalDoc.sectionOrder || defaultOrder;
        if (!finalOrder.includes('latestVideos') || !finalOrder.includes('about') || !finalOrder.includes('ctaFooter')) {
          finalOrder = defaultOrder;
        }

        setLandingData({
          ...globalDoc,
          sectionOrder: finalOrder
        });
      }

      const sysDoc = themeSnap.find((s: any) => s.id === 'system');
      if (sysDoc) {
        setThemeData({
          primaryColor: sysDoc.primaryColor || '#1D1A39',
          accentColor: sysDoc.accentColor || '#F59F59',
          secondaryColor: sysDoc.secondaryColor || '#E8BCB9',
          baseFontSize: sysDoc.baseFontSize || '14.4px',
          customCss: sysDoc.customCss || ''
        });
      }

      const aboutDoc = themeSnap.find((s: any) => s.id === 'aboutUs');
      if (aboutDoc) {
        setAboutData(aboutDoc);
      }

      const mainNav = navigationSnap.find((d: any) => d.id === 'main');
      if (mainNav) {
        setNavData({
          mainLinks: mainNav.mainLinks || [],
          dropdownLinks: mainNav.dropdownLinks || []
        });
      }

      const footerNav = navigationSnap.find((d: any) => d.id === 'footer');
      if (footerNav) {
        setFooterData({
          exploreLinks: footerNav.exploreLinks || [],
          companyLinks: footerNav.companyLinks || []
        });
      }

      setCourses(coursesSnap);
      setTests(testsSnap);
      setMaterials(materialsSnap);
      setPodcasts(podcastsSnap);
      setTestimonials(testimonialsSnap);
      setFaqs(faqsSnap);
      setNewsletterCount(newsletterSnap.length);
      setBlogCount(blogsSnap.length);

      // Load media for selection
      const mediaSnap = await apiClient.get('media');
      setMediaList(mediaSnap);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch some collections.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleMoveSection = async (secName: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering visual editor drawers
    const sections = [...(landingData.sectionOrder || [ 'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter' ])];
    const index = sections.indexOf(secName);
    if (index === -1) return;
    
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= sections.length) return;
    
    // Swap elements
    const temp = sections[index];
    sections[index] = sections[nextIndex];
    sections[nextIndex] = temp;
    
    const updated = { ...landingData, sectionOrder: sections };
    setLandingData(updated);
    
    try {
      await apiClient.put('landing_page', 'global', updated);
    } catch (err: any) {
      alert("Failed to save layout order: " + err.message);
    }
  };

  const handleDeleteSection = async (secName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalConfig({
      type: 'confirm',
      title: 'Remove Section',
      description: `Are you sure you want to remove the ${secName} section from the homepage?`,
      inputs: [],
      onConfirm: async () => {
        const sections = (landingData.sectionOrder || [ 'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter' ]).filter((s: string) => s !== secName);
        
        const updated = { ...landingData, sectionOrder: sections };
        setLandingData(updated);
        try {
          await apiClient.put('landing_page', 'global', updated);
        } catch (err: any) {
          setError("Failed to delete section: " + err.message);
        }
      }
    });
  };

  const handleOpenDrawer = (drawerName: string) => {
    setActiveDrawer(drawerName);
    if (drawerName === 'hero') {
      setDrawerData({ ...landingData });
    } else if (drawerName === 'features') {
      setDrawerData({ features: landingData.features || [] });
    } else if (drawerName === 'counselling') {
      setDrawerData({
        guidanceTitle: landingData.guidanceTitle || "Get One-on-One Career Guidance Directly from Priyanshi ma'am",
        guidanceSubtitle: landingData.guidanceSubtitle || "Get clarity on anything & everything that you have in your head related to Forensic Science.",
        guidancePrice: landingData.guidancePrice || "₹1,999",
        guidanceUrl: landingData.guidanceUrl || "/student/counselling",
        guidanceImage: landingData.guidanceImage || "/counselling.jpg"
      });
    } else if (drawerName === 'courses') {
      setDrawerData({ list: [...courses] });
    } else if (drawerName === 'tests') {
      setDrawerData({ list: [...tests] });
    } else if (drawerName === 'materials') {
      setDrawerData({ list: [...materials] });
    } else if (drawerName === 'podcasts') {
      setDrawerData({ list: [...podcasts] });
    } else if (drawerName === 'testimonials') {
      setDrawerData({ list: [...testimonials] });
    } else if (drawerName === 'faqs') {
      setDrawerData({ list: [...faqs] });
    } else if (drawerName === 'theme') {
      setDrawerData({ ...themeData });
    } else if (drawerName === 'navbar') {
      setDrawerData({
        mainLinks: [...(navData.mainLinks || [])],
        dropdownLinks: [...(navData.dropdownLinks || [])]
      });
    } else if (drawerName === 'about') {
        setDrawerData({
          aboutTitle: landingData.aboutTitle,
          aboutDescription: landingData.aboutDescription,
          aboutImage: landingData.aboutImage
        });
      } else if (drawerName === 'ctaFooter') {
        setDrawerData({
          ctaTitle: landingData.ctaTitle,
          ctaSubtitle: landingData.ctaSubtitle,
          ctaButtonText: landingData.ctaButtonText,
          ctaButtonLink: landingData.ctaButtonLink
        });
      } else if (drawerName === 'footer') {
      setDrawerData({
        exploreLinks: [...(footerData.exploreLinks || [])],
        companyLinks: [...(footerData.companyLinks || [])]
      });
    } else if (drawerName === 'aboutUs') {
      setDrawerData({ ...aboutData });
    }
  };

  const handleSaveDrawer = async () => {
    try {
      if (activeDrawer === 'hero') {
        const merged = { ...landingData, ...drawerData };
        await apiClient.put('landing_page', 'global', merged);
        setLandingData(merged);
      } else if (activeDrawer === 'features') {
        const merged = { ...landingData, features: drawerData.features };
        await apiClient.put('landing_page', 'global', merged);
        setLandingData(merged);
      } else if (activeDrawer === 'counselling') {
        const merged = { ...landingData, ...drawerData };
        await apiClient.put('landing_page', 'global', merged);
        setLandingData(merged);
      } else if (activeDrawer === 'courses') {
        await loadAllData();
      } else if (activeDrawer === 'tests') {
        await loadAllData();
      } else if (activeDrawer === 'materials') {
        await loadAllData();
      } else if (activeDrawer === 'podcasts') {
        await loadAllData();
      } else if (activeDrawer === 'testimonials') {
        for (const item of drawerData.list) {
          if (item.id) {
            await apiClient.put('testimonials', item.id, item);
          } else {
            await apiClient.post('testimonials', item);
          }
        }
        await loadAllData();
      } else if (activeDrawer === 'faqs') {
        await loadAllData();
      } else if (activeDrawer === 'theme') {
        await apiClient.put('settings', 'system', drawerData);
        setThemeData(drawerData);
      } else if (activeDrawer === 'navbar') {
        await apiClient.put('navigation', 'main', drawerData);
        setNavData(drawerData);
      } else if (activeDrawer === 'about') {
          const merged = { ...landingData, ...drawerData };
          await apiClient.put('landing_page', 'global', merged);
          setLandingData(merged);
        } else if (activeDrawer === 'ctaFooter') {
          const merged = { ...landingData, ...drawerData };
          await apiClient.put('landing_page', 'global', merged);
          setLandingData(merged);
        } else if (activeDrawer === 'footer') {
        await apiClient.put('navigation', 'footer', drawerData);
        setFooterData(drawerData);
      } else if (activeDrawer === 'aboutUs') {
        await apiClient.put('settings', 'aboutUs', drawerData);
        setAboutData(drawerData);
      }
      alert('Changes saved and published to website live!');
      setActiveDrawer(null);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  // Automated YouTube/Spotify Thumbnail Parser
  const parsePodcastThumbnail = (url: string) => {
    if (!url) return '';
    // YouTube video ID match
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    // Fallback Spotify or other
    return 'https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1D1A39]">
        <Loader2 className="w-12 h-12 animate-spin text-[#F59F59]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      
      {/* 1. TOP METRICS DASHBOARD SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1D1A39] font-display">Live Website Editor</h1>
            <p className="text-gray-500 text-sm font-medium">Click on any section of the mock homepage layout below to edit it live.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Add Section Dropdown Selector */}
            {(() => {
              const currentOrder = landingData.sectionOrder || [ 'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter' ];
              const ALL_SECTIONS = [ 'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter' ];
              const unusedSections = ALL_SECTIONS.filter(s => !currentOrder.includes(s));
              
              if (unusedSections.length === 0) return null;
              
              return (
                <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 px-3 py-2 rounded-xl text-xs">
                  <span className="font-bold text-gray-500">Add Section:</span>
                  <select 
                    onChange={async (e) => {
                      const selected = e.target.value;
                      if (!selected) return;
                      const sections = [...currentOrder, selected];
                      const updated = { ...landingData, sectionOrder: sections };
                      setLandingData(updated);
                      try {
                        await apiClient.put('landing_page', 'global', updated);
                        e.target.value = "";
                      } catch (err: any) {
                        alert("Failed to add section: " + err.message);
                      }
                    }}
                    className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="">Select section...</option>
                    {unusedSections.map(s => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })()}
            
            <button onClick={loadAllData} className="p-2 border rounded-xl hover:bg-gray-50 text-gray-500 flex items-center gap-2 font-bold text-sm">
              <RefreshCw className="w-4 h-4" /> Sync DB
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Active Courses', val: courses.length, icon: BookOpen },
            { label: 'Mock Tests', val: tests.length, icon: TestTube },
            { label: 'Notes Uploaded', val: materials.length, icon: FileText },
            { label: 'Subscribers', val: newsletterCount, icon: Star },
            { label: 'Blogs Published', val: blogCount, icon: Layers },
            { label: 'Podcasts Links', val: podcasts.length, icon: Mic },
          ].map((m, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#F59F59]">
                <m.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{m.label}</p>
                <p className="text-lg font-extrabold text-[#1D1A39]">{m.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. HOMEPAGE REPLICA CONTAINER */}
      <div 
        className="w-full rounded-[2.5rem] overflow-hidden border-4 border-gray-300 shadow-2xl relative select-none"
        style={{ backgroundColor: '#1D1A39' }} // Force matching dark theme base
      >
        
        {/* EDIT OVERLAY HOVER HINTS */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-[#1D1A39] font-bold text-xs px-4 py-1.5 rounded-full z-40 shadow flex items-center gap-2">
          <Layers className="w-4 h-4" /> Hover & click any section outline to edit live!
        </div>

        {/* MOCK NAVBAR */}
        <div 
          onClick={() => handleOpenDrawer('navbar')}
          className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer p-4 transition-all"
        >
          <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Edit Navbar
          </div>
          <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6 text-white relative z-30">
            <div className="flex items-center gap-2">
              <img src="https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png" className="w-10 h-10 object-contain" />
              <span className="font-bold text-lg font-display">Forensics By Priyanshi<span className="text-[#F59F59]">.</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm font-bold text-white/85">
              {(navData.mainLinks || []).map((link: any, i: number) => (
                <span key={i} className="hover:text-[#F59F59] transition-colors">{link.label}</span>
              ))}
              {(navData.dropdownLinks || []).slice(0, 2).map((link: any, i: number) => (
                <span key={i} className="text-white/50">{link.label}</span>
              ))}
              <span className="bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] px-4 py-1.5 rounded-full text-xs font-bold">Sign Up</span>
            </div>
          </div>
        </div>

        {/* DYNAMIC SECTIONS LOOP */}
        {(landingData.sectionOrder || [ 'hero', 'guidance', 'courses', 'materials', 'tests', 'latestVideos', 'youtube', 'freeResources', 'blogs', 'testimonials', 'podcasts', 'about', 'faq', 'ctaFooter' ]).map((secName: string) => {
          switch (secName) {
            case 'hero':
              return (
                <div 
                  key="hero"
                  onClick={() => handleOpenDrawer('hero')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-24 px-6 text-center transition-all"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('hero', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('hero', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('hero', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Hero
                  </div>
                  
                  <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold font-display text-white leading-tight">
                      {landingData.heroTitle} <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59F59] to-[#E8BCB9]">{landingData.heroSubtitle}</span>
                    </h1>
                    <p className="text-white/70 max-w-xl mx-auto text-base font-medium leading-relaxed">{landingData.heroDescription}</p>
                    
                    <div className="flex justify-center gap-4 pt-4">
                      <span className="px-6 py-3 rounded-full border border-white/20 text-white bg-white/5 font-bold text-sm">Login</span>
                      <span className="px-6 py-3 rounded-full bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] font-bold text-sm">Sign Up</span>
                    </div>

                    <div className="flex justify-center gap-12 pt-10">
                      {[
                        { label: landingData.stats1Label || 'Active Learners', val: landingData.stats1Value || '10,000+' },
                        { label: landingData.stats2Label || 'Forensic Enthusiasts', val: landingData.stats2Value || '1,50,000+' },
                        { label: landingData.stats3Label || 'Students Taught', val: landingData.stats3Value || '25,000+' }
                      ].map((s, i) => (
                        <div key={i} className="text-center">
                          <p className="text-2xl font-bold text-white font-display">{s.val}</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );

            case 'features':
              return (
                <div 
                  key="features"
                  onClick={() => handleOpenDrawer('features')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 transition-all"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('features', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('features', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('features', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Features
                  </div>

                  <div className="max-w-5xl mx-auto space-y-16">
                    {(landingData.features || []).length === 0 ? (
                      <p className="text-white/40 text-center py-10 font-bold italic">No alternating features added. Add them inside the editor panel.</p>
                    ) : (
                      (landingData.features || []).map((feat: any, idx: number) => (
                        <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 ${feat.reverse ? 'md:flex-row-reverse' : ''}`}>
                          <div className="flex-1 space-y-4 text-left">
                            <span className="text-[#F59F59] text-xs font-extrabold uppercase tracking-widest">{feat.subtitle}</span>
                            <h3 className="text-2xl md:text-3xl font-bold font-display text-white">{feat.title}</h3>
                            <p className="text-white/70 text-sm font-medium leading-relaxed">{feat.description}</p>
                            <ul className="space-y-2 text-white/80 text-sm font-semibold">
                              {(feat.features || []).map((p: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">✓ {p}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex-1 w-full aspect-video rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                            {feat.image ? (
                              <img src={feat.image.startsWith('/media') ? feat.image : toProxyUrl(feat.image)} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-12 h-12 text-white/20" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );

            case 'guidance':
              return (
                <div 
                  key="guidance"
                  onClick={() => handleOpenDrawer('counselling')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 bg-[#fafafa]/5 backdrop-blur-md transition-all text-left"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('guidance', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('guidance', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('guidance', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Guidance
                  </div>

                  <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-4">
                      <span className="text-xs font-extrabold text-[#F59F59] uppercase tracking-wider">1-ON-1 GUIDANCE</span>
                      <h2 className="text-3xl md:text-4xl font-bold font-display text-white">{landingData.guidanceTitle || "Get One-on-One Career Guidance Directly from Priyanshi ma'am"}</h2>
                      <p className="text-white/70 text-sm font-medium leading-relaxed">{landingData.guidanceSubtitle || "Get clarity on anything & everything that you have in your head related to Forensic Science."}</p>
                    </div>
                    <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl shrink-0">
                      <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Session Pass</p>
                        <p className="text-2xl font-extrabold text-white font-display">{landingData.guidancePrice || "₹999"}</p>
                      </div>
                      <span className="bg-[#1D1A39] text-[#F59F59] border border-[#F59F59]/25 hover:bg-[#F59F59] hover:text-white transition-all px-6 py-3 rounded-full font-bold text-sm">Book Session</span>
                    </div>
                  </div>
                </div>
              );

            case 'courses':
              return (
                <div 
                  key="courses"
                  onClick={() => handleOpenDrawer('courses')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 transition-all"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('courses', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('courses', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('courses', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Courses
                  </div>

                  <div className="max-w-5xl mx-auto space-y-12">
                    <h2 className="text-3xl font-bold font-display text-white text-center">Premium <span className="text-[#F59F59]">Courses</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {courses.map((course) => (
                        <div key={course.id} className="bg-white rounded-[2rem] overflow-hidden flex flex-col justify-between border shadow-xl">
                          <div className="h-40 bg-gradient-to-br from-[#E8BCB9] to-[#F59F59] flex items-center justify-center p-4">
                            <h3 className="font-bold text-xl text-[#1D1A39] text-center font-display">{course.title}</h3>
                          </div>
                          <div className="p-6 space-y-4">
                            <p className="text-2xl font-bold text-[#1D1A39] font-display">{course.price}</p>
                            <span className="w-full bg-[#1D1A39] text-white py-3 rounded-full font-bold text-center block text-xs">Enroll Now</span>
                          </div>
                        </div>
                      ))}
                      {courses.length === 0 && <p className="col-span-full text-center text-white/40">No premium courses added yet.</p>}
                    </div>
                  </div>
                </div>
              );

            case 'tests':
              return (
                <div 
                  key="tests"
                  onClick={() => handleOpenDrawer('tests')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 bg-[#451952]/30 transition-all"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('tests', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('tests', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('tests', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Tests
                  </div>

                  <div className="max-w-5xl mx-auto space-y-12">
                    <h2 className="text-3xl font-bold font-display text-white text-center">Mock Tests & <span className="text-[#E8BCB9]">Test Series</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {tests.map((test) => (
                        <div key={test.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/10 transition-colors">
                          <span className="text-[10px] font-extrabold text-[#F59F59] uppercase tracking-widest">{test.category || 'General'}</span>
                          <h3 className="font-bold text-base text-white mt-1 mb-4 font-display truncate">{test.title}</h3>
                          <span className="text-xs text-[#E8BCB9] font-bold block">Start Test Series</span>
                        </div>
                      ))}
                      {tests.length === 0 && <p className="col-span-full text-center text-white/40">No mock tests added yet.</p>}
                    </div>
                  </div>
                </div>
              );

            case 'materials':
              return (
                <div 
                  key="materials"
                  onClick={() => handleOpenDrawer('materials')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 transition-all"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('materials', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('materials', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('materials', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Notes
                  </div>

                  <div className="max-w-5xl mx-auto space-y-12">
                    <h2 className="text-3xl font-bold font-display text-white text-center">Study Notes & <span className="text-[#F59F59]">Resource Material</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {materials.map((mat) => (
                        <div key={mat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between text-left">
                          <div>
                            <h3 className="font-bold text-lg text-white mb-2 font-display">{mat.title}</h3>
                            <p className="text-white/60 text-xs font-medium line-clamp-2 leading-relaxed mb-4">{mat.description}</p>
                          </div>
                          <span className="text-[#F59F59] text-xs font-bold flex items-center gap-1 cursor-pointer">Download File →</span>
                        </div>
                      ))}
                      {materials.length === 0 && <p className="col-span-full text-center text-white/40">No notes added yet.</p>}
                    </div>
                  </div>
                </div>
              );

            case 'freeResources':
              return (
                <div 
                  key="freeResources"
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 py-20 px-6 transition-all bg-[#451952]/30 text-left"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('freeResources', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('freeResources', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('freeResources', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Layers className="w-3 h-3" /> Vault (Static Section)
                  </div>
                  <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 text-white">
                    <div className="flex-1 space-y-4">
                      <span className="text-[#F59F59] text-xs font-extrabold uppercase tracking-widest">Locked Resources</span>
                      <h3 className="text-3xl font-bold font-display">The Free Resource Vault</h3>
                      <p className="text-white/70 text-sm font-medium leading-relaxed">Exclusive access to previous year question papers, syllabuses, and high-yield flashcards. Strictly reserved for signed-up members.</p>
                      <span className="inline-block bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] px-6 py-2.5 rounded-full text-xs font-bold">Unlock Vault</span>
                    </div>
                  </div>
                </div>
              );

            case 'podcasts':
              return (
                <div 
                  key="podcasts"
                  onClick={() => handleOpenDrawer('podcasts')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 bg-[#E8BCB9]/20 transition-all"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('podcasts', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('podcasts', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('podcasts', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Podcasts
                  </div>

                  <div className="max-w-5xl mx-auto space-y-8 text-center">
                    <h2 className="text-3xl font-bold font-display text-white">Latest Podcasts Carousel</h2>
                    <p className="text-white/60 text-sm font-semibold max-w-lg mx-auto">Past podcast links. Tapping a card redirects to the media link.</p>
                    
                    <div className="flex gap-4 justify-center overflow-x-auto pb-4">
                      {podcasts.map((pod) => (
                        <div key={pod.id} className="w-64 bg-white/5 rounded-2xl border border-white/10 overflow-hidden shrink-0 flex flex-col text-left">
                          <div className="h-36 bg-black relative">
                            <img src={pod.imageUrl || parsePodcastThumbnail(pod.url)} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <h4 className="text-sm font-bold text-white truncate font-display">{pod.title}</h4>
                          </div>
                        </div>
                      ))}
                      {podcasts.length === 0 && <p className="text-white/40 text-center py-6 font-medium">No podcast links added yet.</p>}
                    </div>
                  </div>
                </div>
              );

            case 'youtube':
              return (
                <div 
                  key="youtube"
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 py-20 px-6 transition-all text-center bg-[#E8BCB9]/10"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('youtube', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('youtube', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('youtube', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Layers className="w-3 h-3" /> YouTube Shorts Feed (Static Feed)
                  </div>
                  <div className="max-w-5xl mx-auto space-y-4">
                    <span className="text-white/60 text-xs font-extrabold uppercase tracking-widest">Live Guides</span>
                    <h3 className="text-2xl font-bold font-display text-white">Latest YouTube Shorts</h3>
                    <p className="text-white/50 text-xs font-medium max-w-md mx-auto">Stay up-to-date with quick forensic facts, case studies, and exam preparation guides directly from Priyanshi's channel.</p>
                  </div>
                </div>
              );

            case 'testimonials':
              return (
                <div 
                  key="testimonials"
                  onClick={() => handleOpenDrawer('testimonials')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 transition-all"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('testimonials', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('testimonials', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('testimonials', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit Testimonials
                  </div>

                  <div className="max-w-5xl mx-auto space-y-12">
                    <h2 className="text-3xl font-bold font-display text-white text-center uppercase tracking-widest">Hear Our Success Stories</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {testimonials.map((t) => (
                        <div key={t.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-left flex flex-col justify-between">
                          <div className="flex text-[#F59F59] mb-4">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                          </div>
                          <p className="text-white/80 text-xs font-medium leading-relaxed italic mb-6">"{t.text}"</p>
                          <div className="flex items-center gap-3">
                            {t.image ? (
                              <img src={t.image.startsWith('/media') ? t.image : toProxyUrl(t.image)} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex items-center justify-center font-bold text-white text-xs shrink-0">
                                {t.author?.slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-bold text-white leading-none">{t.author}</h4>
                              <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{t.rank}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {testimonials.length === 0 && <p className="col-span-full text-center text-white/40">No success stories uploaded.</p>}
                    </div>
                  </div>
                </div>
              );

            case 'blogs':
              return (
                <div 
                  key="blogs"
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 py-20 px-6 transition-all text-left bg-[#1D1A39]"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('blogs', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('blogs', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('blogs', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Layers className="w-3 h-3" /> Blogs Section (Featured Carousel)
                  </div>
                  <div className="max-w-5xl mx-auto space-y-8">
                    <h2 className="text-3xl font-bold font-display text-white text-center">Featured <span className="text-[#F59F59]">Case Files</span></h2>
                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 items-center text-left">
                      <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden bg-white/15 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-12 h-12 text-white/20" />
                      </div>
                      <div className="space-y-4 flex-grow text-white">
                        <span className="text-xs font-extrabold text-[#F59F59] tracking-wider">LATEST CASE FILE</span>
                        <h3 className="text-2xl font-bold font-display">Genetic Fingerprinting in Modern Forensics</h3>
                        <p className="text-white/60 text-xs font-medium leading-relaxed line-clamp-3">Explore how DNA analysis revolutionized forensics, solving cold cases and securing convictions...</p>
                        <span className="text-[#E8BCB9] text-xs font-bold block">Read Article →</span>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case 'faq':
              return (
                <div 
                  key="faq"
                  onClick={() => handleOpenDrawer('faqs')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 bg-[#1D1A39]/80 transition-all text-left"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('faq', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('faq', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('faq', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit FAQs
                  </div>

                  <div className="max-w-3xl mx-auto space-y-12">
                    <h2 className="text-3xl font-bold font-display text-white text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                      {faqs.map((faq, i) => (
                        <div key={faq.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <h4 className="font-bold text-white mb-2 font-display">Q: {faq.question}</h4>
                          <p className="text-white/60 text-sm leading-relaxed font-semibold">A: {faq.answer}</p>
                        </div>
                      ))}
                      {faqs.length === 0 && <p className="text-center text-white/40">No FAQ list provided.</p>}
                    </div>
                  </div>
                </div>
              );
                        case 'latestVideos':
              return (
                <div 
                  key="latestVideos"
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 bg-[#1D1A39]/60 transition-all text-center"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('latestVideos', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('latestVideos', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('latestVideos', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <span>(Auto-Fetched from YouTube)</span>
                  </div>
                  <h2 className="text-3xl font-bold font-display text-white mb-2">Latest YouTube Videos</h2>
                  <p className="text-white/60 text-sm font-semibold max-w-lg mx-auto">Displays the 10 most recent videos directly from the channel.</p>
                </div>
              );
            case 'about':
              return (
                <div 
                  key="about"
                  onClick={() => handleOpenDrawer('about')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-20 px-6 bg-white transition-all text-left"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('about', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('about', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('about', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit About Section
                  </div>
                  <div className="max-w-4xl mx-auto flex items-center gap-12">
                    <div className="w-48 h-64 bg-gray-200 rounded-3xl overflow-hidden shrink-0">
                      {landingData.aboutImage ? <img src={landingData.aboutImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">Image</div>}
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold font-display text-[#1D1A39] mb-4">{landingData.aboutTitle || 'Meet Priyanshi Jain'}</h2>
                      <p className="text-gray-600 font-semibold line-clamp-3">{landingData.aboutDescription || 'Priyanshi Jain is India\'s leading Forensic Science educator...'}</p>
                    </div>
                  </div>
                </div>
              );
            case 'ctaFooter':
              return (
                <div 
                  key="ctaFooter"
                  onClick={() => handleOpenDrawer('ctaFooter')}
                  className="relative group border-b border-white/5 hover:border-dashed hover:border-yellow-400 cursor-pointer py-24 px-6 bg-gradient-to-br from-[#1D1A39] to-purple-900 transition-all text-center"
                >
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
                    <button onClick={(e) => handleMoveSection('ctaFooter', 'up', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Up"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleMoveSection('ctaFooter', 'down', e)} className="p-1 hover:bg-black/15 rounded mr-0.5" title="Move Down"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => handleDeleteSection('ctaFooter', e)} className="p-1 hover:bg-black/15 text-red-700 rounded mr-1" title="Delete Section"><Trash2 className="w-3.5 h-3.5" /></button>
                    <Edit3 className="w-3 h-3" /> Edit CTA Footer
                  </div>
                  <h2 className="text-5xl font-bold font-display text-white mb-6">{landingData.ctaTitle || 'Ready to Crack Your Exams?'}</h2>
                  <p className="text-[#F59F59] text-xl font-medium mb-8">{landingData.ctaSubtitle || 'Join India\'s fastest-growing forensic science community.'}</p>
                  <div className="inline-block bg-[#F59F59] text-white px-8 py-4 rounded-2xl font-bold">{landingData.ctaButtonText || 'Start Learning for Free'}</div>
                </div>
              );
              default:
                return null;
            }
          })}

        {/* MOCK FOOTER */}
        <div 
          onClick={() => handleOpenDrawer('footer')}
          className="relative group border-t border-white/10 hover:border-dashed hover:border-yellow-400 cursor-pointer p-12 transition-all bg-[#1D1A39] text-left"
        >
          <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute top-4 right-4 bg-yellow-500 text-[#1D1A39] text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> Edit Footer
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-white/80 z-30 relative">
            <div className="space-y-3">
              <span className="font-bold text-lg text-white font-display">Priyanshi<span className="text-[#F59F59]">.</span></span>
              <p className="text-xs text-white/50 leading-relaxed">The premier destination for forensic science education, combining expert mentorship with modern learning.</p>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Explore</h4>
              <div className="flex flex-col gap-2 text-xs text-white/50">
                {(footerData.exploreLinks || []).map((link: any, i: number) => (
                  <span key={i} className="hover:text-white transition-colors">{link.label}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Company</h4>
              <div className="flex flex-col gap-2 text-xs text-white/50">
                {(footerData.companyLinks || []).map((link: any, i: number) => (
                  <span key={i} className="hover:text-white transition-colors">{link.label}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-4">Contact Info</h4>
              <div className="flex flex-col gap-2 text-xs text-white/50">
                <span>support@priyanshi.com</span>
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
          <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-white/30 text-xs">
            © 2026 Priyanshi Academy. All rights reserved. Powered by headless CMS.
          </div>
        </div>

      </div>

      {/* 3. FLOATING THEME MANAGER TRIGGER */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
        <button 
          onClick={() => handleOpenDrawer('aboutUs')}
          className="bg-white text-[#1D1A39] border border-white/20 hover:bg-gray-100 transition-colors p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 font-extrabold text-sm"
        >
          <BookOpen className="w-5 h-5" /> Edit About Us Page
        </button>
        <button 
          onClick={() => handleOpenDrawer('theme')}
          className="bg-[#1D1A39] text-[#F59F59] border border-[#F59F59]/30 hover:border-[#F59F59] transition-colors p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 font-extrabold text-sm"
        >
          <Settings2 className="w-5 h-5 animate-spin-slow" /> Custom Theme Editor
        </button>
      </div>

      {/* 4. MODAL SLIDE-OVER DRAWER COMPONENT */}
      {activeDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-[#1D1A39] uppercase font-display">Edit: {activeDrawer}</h3>
                <p className="text-xs text-gray-500 mt-1 font-semibold">Modify properties and submit to update the live website database.</p>
              </div>
              <button onClick={() => setActiveDrawer(null)} className="p-2 border rounded-xl hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* HERO DRAWER */}
              {activeDrawer === 'hero' && drawerData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-1">Hero Title</label>
                    <textarea 
                      value={drawerData.heroTitle || ''} 
                      onChange={e => setDrawerData({ ...drawerData, heroTitle: e.target.value })}
                      className="w-full bg-[#fafafa] border rounded-xl p-3 text-sm focus:outline-none min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-1">Hero Subtitle</label>
                    <textarea 
                      value={drawerData.heroSubtitle || ''} 
                      onChange={e => setDrawerData({ ...drawerData, heroSubtitle: e.target.value })}
                      className="w-full bg-[#fafafa] border rounded-xl p-3 text-sm focus:outline-none min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-1">Hero Description</label>
                    <textarea 
                      value={drawerData.heroDescription || ''} 
                      onChange={e => setDrawerData({ ...drawerData, heroDescription: e.target.value })}
                      className="w-full bg-[#fafafa] border rounded-xl p-3 text-sm focus:outline-none min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Stat 1 Value</label>
                      <input type="text" value={drawerData.stats1Value || ''} onChange={e => setDrawerData({ ...drawerData, stats1Value: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Stat 1 Label</label>
                      <input type="text" value={drawerData.stats1Label || ''} onChange={e => setDrawerData({ ...drawerData, stats1Label: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Stat 2 Value</label>
                      <input type="text" value={drawerData.stats2Value || ''} onChange={e => setDrawerData({ ...drawerData, stats2Value: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Stat 2 Label</label>
                      <input type="text" value={drawerData.stats2Label || ''} onChange={e => setDrawerData({ ...drawerData, stats2Label: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Stat 3 Value</label>
                      <input type="text" value={drawerData.stats3Value || ''} onChange={e => setDrawerData({ ...drawerData, stats3Value: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Stat 3 Label</label>
                      <input type="text" value={drawerData.stats3Label || ''} onChange={e => setDrawerData({ ...drawerData, stats3Label: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* FEATURES DRAWER */}
              {activeDrawer === 'features' && drawerData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
                    <div>
                      <label className="block text-sm font-bold text-[#1D1A39] mb-1">Section Title</label>
                      <input type="text" value={drawerData.featuresSectionTitle || ''} onChange={e => setDrawerData({ ...drawerData, featuresSectionTitle: e.target.value })} placeholder="e.g. Why Choose Us?" className="w-full bg-[#fafafa] border rounded-xl p-3 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#1D1A39] mb-1">Section Subtitle</label>
                      <input type="text" value={drawerData.featuresSectionSubtitle || ''} onChange={e => setDrawerData({ ...drawerData, featuresSectionSubtitle: e.target.value })} placeholder="e.g. DISCOVER THE DIFFERENCE" className="w-full bg-[#fafafa] border rounded-xl p-3 text-sm focus:outline-none" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#1D1A39]">Alternating Sections list</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        const updated = drawerData.features ? [...drawerData.features] : [];
                        updated.push({ title: 'New Feature title', subtitle: 'New feature subtitle', description: 'Brief description details.', image: '', features: ['Bullet 1'], reverse: false });
                        setDrawerData({ ...drawerData, features: updated });
                      }}
                      className="text-xs font-bold text-[#F59F59] hover:underline flex items-center gap-1"
                    >
                      + Add New Section
                    </button>
                  </div>
                  
                  {drawerData.features.map((feat: any, index: number) => (
                    <div key={index} className="p-4 border rounded-xl bg-gray-50 relative space-y-3">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            if (index === 0) return;
                            const copy = [...drawerData.features];
                            const temp = copy[index];
                            copy[index] = copy[index - 1];
                            copy[index - 1] = temp;
                            setDrawerData({ features: copy });
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            if (index === drawerData.features.length - 1) return;
                            const copy = [...drawerData.features];
                            const temp = copy[index];
                            copy[index] = copy[index + 1];
                            copy[index + 1] = temp;
                            setDrawerData({ features: copy });
                          }}
                          disabled={index === drawerData.features.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            const copy = [...drawerData.features];
                            copy.splice(index, 1);
                            setDrawerData({ features: copy });
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Feature Title</label>
                          <input type="text" value={feat.title} onChange={e => {
                            const copy = [...drawerData.features];
                            copy[index].title = e.target.value;
                            setDrawerData({ features: copy });
                          }} className="w-full bg-white border rounded-lg p-2 text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Feature Subtitle</label>
                          <input type="text" value={feat.subtitle} onChange={e => {
                            const copy = [...drawerData.features];
                            copy[index].subtitle = e.target.value;
                            setDrawerData({ features: copy });
                          }} className="w-full bg-white border rounded-lg p-2 text-xs" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                        <textarea value={feat.description} onChange={e => {
                          const copy = [...drawerData.features];
                          copy[index].description = e.target.value;
                          setDrawerData({ features: copy });
                        }} className="w-full bg-white border rounded-lg p-2 text-xs min-h-[50px]" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Image URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={feat.image} onChange={e => {
                              const copy = [...drawerData.features];
                              copy[index].image = e.target.value;
                              setDrawerData({ features: copy });
                            }} placeholder="https://res.cloudinary.com/..." className="flex-grow bg-white border rounded-lg p-2 text-xs focus:outline-none" />
                            <button
                              type="button"
                              onClick={() => {
                                setMediaSelectorTarget({ type: 'feature', index });
                                setShowMediaSelector(true);
                              }}
                              className="px-3 py-1.5 bg-white border text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 shrink-0"
                            >
                              Choose
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Bullet Points (Comma split)</label>
                          <input type="text" value={Array.isArray(feat.features) ? feat.features.join(', ') : feat.features} onChange={e => {
                            const copy = [...drawerData.features];
                            copy[index].features = e.target.value.split(',').map(s => s.trim());
                            setDrawerData({ features: copy });
                          }} className="w-full bg-white border rounded-lg p-2 text-xs" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={feat.reverse} id={`rev-${index}`} onChange={e => {
                          const copy = [...drawerData.features];
                          copy[index].reverse = e.target.checked;
                          setDrawerData({ features: copy });
                        }} />
                        <label htmlFor={`rev-${index}`} className="text-xs font-bold text-gray-500 cursor-pointer">Reverse layout (Image left)</label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 1-ON-1 COUNSELLING DRAWER */}
              {activeDrawer === 'counselling' && drawerData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-1">Section Title</label>
                    <input type="text" value={drawerData.guidanceTitle} onChange={e => setDrawerData({ ...drawerData, guidanceTitle: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-3 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-1">Description Subtitle</label>
                    <textarea value={drawerData.guidanceSubtitle} onChange={e => setDrawerData({ ...drawerData, guidanceSubtitle: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-3 text-sm min-h-[60px]" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Price Tag</label>
                      <input type="text" value={drawerData.guidancePrice} onChange={e => setDrawerData({ ...drawerData, guidancePrice: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Booking Form Url</label>
                      <input type="text" value={drawerData.guidanceUrl} onChange={e => setDrawerData({ ...drawerData, guidanceUrl: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1D1A39] mb-1">Poster Image URL</label>
                    <div className="flex gap-2">
                      <input type="text" value={drawerData.guidanceImage || ''} onChange={e => setDrawerData({ ...drawerData, guidanceImage: e.target.value })} placeholder="https://..." className="flex-grow bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      <label className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer">
                        <ImageIcon className="w-4 h-4" /> Upload
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              e.target.parentElement!.style.opacity = '0.5';
                              const { signature, timestamp, cloudName, apiKey } = await apiClient.getCloudinarySignature('fbp_assets');
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('api_key', apiKey);
                              formData.append('timestamp', timestamp.toString());
                              formData.append('signature', signature);
                              formData.append('folder', 'fbp_assets');
                              
                              const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                method: 'POST',
                                body: formData,
                              });
                              const uploadData = await uploadRes.json();
                              if (uploadData.error) throw new Error(uploadData.error.message);
                              
                              await apiClient.post('media', {
                                url: uploadData.secure_url,
                                publicId: uploadData.public_id,
                                filename: file.name,
                                createdAt: new Date().toISOString()
                              });
                              
                              setDrawerData((prev: any) => ({ 
                                ...prev, 
                                guidanceImage: uploadData.secure_url.replace(/^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload/, '/media') 
                              }));
                            } catch (err) {
                              alert("Upload failed. See console.");
                              console.error(err);
                            } finally {
                              e.target.parentElement!.style.opacity = '1';
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* COURSES DRAWER */}
              {activeDrawer === 'courses' && drawerData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-bold text-[#1D1A39]">Active Courses ({drawerData.list.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalInputValues({ title: '', price: '₹4,999', image: '', details: '' });
                        setModalConfig({
                          type: 'prompt',
                          title: 'Add New Course',
                          inputs: [
                            { key: 'title', label: 'Course Title', placeholder: 'Enter Course Title' },
                            { key: 'price', label: 'Price Tag', placeholder: 'Enter price tag (e.g. ₹4,999)' },
                            { key: 'image', label: 'Poster Image URL', placeholder: 'https://...', type: 'image' },
                            { key: 'details', label: 'Course Details', placeholder: 'Curriculum info...', type: 'textarea' }
                          ],
                          onConfirm: async (values) => {
                            if (!values.title) return;
                            const course = await apiClient.post('courses', { title: values.title, price: values.price || 'Free', image: values.image || '', details: values.details || '' });
                            setDrawerData({ list: [...drawerData.list, course] });
                          }
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#F59F59] hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Add New Course
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drawerData.list.map((c: any, index: number) => (
                      <div key={c.id || index} className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {c.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border bg-white">
                              <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-[#1D1A39]">{c.title}</h4>
                            <p className="text-xs text-gray-500 font-semibold mt-1">Price: {c.price}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalInputValues({ title: c.title, price: c.price, image: c.image || '', details: c.details || '' });
                              setModalConfig({
                                type: 'prompt',
                                title: 'Update Course',
                                inputs: [
                                  { key: 'title', label: 'Course Title', placeholder: 'Update Course Title' },
                                  { key: 'price', label: 'Price Tag', placeholder: 'Update Course Price' },
                                  { key: 'image', label: 'Poster Image URL', placeholder: 'https://...', type: 'image' },
                                  { key: 'details', label: 'Course Details', placeholder: 'Curriculum info...', type: 'textarea' }
                                ],
                                onConfirm: async (values) => {
                                  if (!values.title) return;
                                  const updated = await apiClient.put('courses', c.id, { ...c, title: values.title, price: values.price, image: values.image || '', details: values.details || '' });
                                  const updatedList = [...drawerData.list];
                                  updatedList[index] = updated;
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalConfig({
                                type: 'confirm',
                                title: 'Delete Course',
                                description: `Are you sure you want to delete the course "${c.title}"?`,
                                inputs: [],
                                onConfirm: async () => {
                                  await apiClient.delete('courses', c.id);
                                  const updatedList = drawerData.list.filter((x: any) => x.id !== c.id);
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MOCK TESTS DRAWER */}
              {activeDrawer === 'tests' && drawerData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-bold text-[#1D1A39]">Active Mock Tests ({drawerData.list.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalInputValues({ title: '', category: 'NFSU Entrance' });
                        setModalConfig({
                          type: 'prompt',
                          title: 'Add Mock Test',
                          inputs: [
                            { key: 'title', label: 'Test Title', placeholder: 'Enter Test Title' },
                            { key: 'category', label: 'Category', placeholder: 'Enter Category (e.g. NFSU, CUET)' }
                          ],
                          onConfirm: async (values) => {
                            if (!values.title) return;
                            const test = await apiClient.post('tests', { title: values.title, category: values.category || 'Entrance' });
                            setDrawerData({ list: [...drawerData.list, test] });
                          }
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#F59F59] hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Mock Test
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drawerData.list.map((t: any, index: number) => (
                      <div key={t.id || index} className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-[#1D1A39]">{t.title}</h4>
                          <span className="text-[10px] bg-[#1D1A39]/10 text-[#1D1A39] px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block">{t.category}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalInputValues({ title: t.title, category: t.category });
                              setModalConfig({
                                type: 'prompt',
                                title: 'Update Mock Test',
                                inputs: [
                                  { key: 'title', label: 'Test Title', placeholder: 'Update Test Title' },
                                  { key: 'category', label: 'Category', placeholder: 'Update Category' }
                                ],
                                onConfirm: async (values) => {
                                  if (!values.title) return;
                                  const updated = await apiClient.put('tests', t.id, { ...t, title: values.title, category: values.category });
                                  const updatedList = [...drawerData.list];
                                  updatedList[index] = updated;
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalConfig({
                                type: 'confirm',
                                title: 'Delete Mock Test',
                                description: `Are you sure you want to delete the test "${t.title}"?`,
                                inputs: [],
                                onConfirm: async () => {
                                  await apiClient.delete('tests', t.id);
                                  const updatedList = drawerData.list.filter((x: any) => x.id !== t.id);
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STUDY MATERIALS NOTES DRAWER */}
              {activeDrawer === 'materials' && drawerData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-bold text-[#1D1A39]">Active Material Uploads ({drawerData.list.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalInputValues({ title: '', description: '' });
                        setModalConfig({
                          type: 'prompt',
                          title: 'Add Notes Upload',
                          inputs: [
                            { key: 'title', label: 'Notes Title', placeholder: 'Enter Notes Title' },
                            { key: 'description', label: 'Short Description', placeholder: 'Enter Short Description' }
                          ],
                          onConfirm: async (values) => {
                            if (!values.title) return;
                            const material = await apiClient.post('materials', { title: values.title, description: values.description || '' });
                            setDrawerData({ list: [...drawerData.list, material] });
                          }
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#F59F59] hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Notes Upload
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drawerData.list.map((m: any, index: number) => (
                      <div key={m.id || index} className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                        <div className="max-w-[70%]">
                          <h4 className="font-bold text-[#1D1A39] truncate">{m.title}</h4>
                          <p className="text-xs text-gray-500 truncate">{m.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalInputValues({ title: m.title, description: m.description });
                              setModalConfig({
                                type: 'prompt',
                                title: 'Update Notes Upload',
                                inputs: [
                                  { key: 'title', label: 'Notes Title', placeholder: 'Update Notes Title' },
                                  { key: 'description', label: 'Description', placeholder: 'Update Description' }
                                ],
                                onConfirm: async (values) => {
                                  if (!values.title) return;
                                  const updated = await apiClient.put('materials', m.id, { ...m, title: values.title, description: values.description });
                                  const updatedList = [...drawerData.list];
                                  updatedList[index] = updated;
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalConfig({
                                type: 'confirm',
                                title: 'Delete Resource',
                                description: `Are you sure you want to delete the notes "${m.title}"?`,
                                inputs: [],
                                onConfirm: async () => {
                                  await apiClient.delete('materials', m.id);
                                  const updatedList = drawerData.list.filter((x: any) => x.id !== m.id);
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PODCASTS DRAWER */}
              {activeDrawer === 'podcasts' && drawerData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-bold text-[#1D1A39]">Active Podcasts ({drawerData.list.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalInputValues({ title: '', url: '' });
                        setModalConfig({
                          type: 'prompt',
                          title: 'Link Podcast',
                          inputs: [
                            { key: 'title', label: 'Podcast Title', placeholder: 'Enter Podcast Title' },
                            { key: 'url', label: 'Video/Audio URL', placeholder: 'Paste video/audio URL' }
                          ],
                          onConfirm: async (values) => {
                            if (!values.title || !values.url) return;
                            const imageUrl = parsePodcastThumbnail(values.url);
                            const podcast = await apiClient.post('podcasts', { title: values.title, url: values.url, imageUrl });
                            setDrawerData({ list: [...drawerData.list, podcast] });
                          }
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#F59F59] hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Link Podcast
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drawerData.list.map((pod: any, index: number) => (
                      <div key={pod.id || index} className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={pod.imageUrl || parsePodcastThumbnail(pod.url)} className="w-12 h-12 object-cover rounded-lg" />
                          <div>
                            <h4 className="font-bold text-xs text-[#1D1A39] truncate max-w-[200px]">{pod.title}</h4>
                            <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{pod.url}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalInputValues({ title: pod.title, url: pod.url });
                              setModalConfig({
                                type: 'prompt',
                                title: 'Update Podcast',
                                inputs: [
                                  { key: 'title', label: 'Podcast Title', placeholder: 'Update Podcast Title' },
                                  { key: 'url', label: 'Podcast URL', placeholder: 'Update Podcast URL' }
                                ],
                                onConfirm: async (values) => {
                                  if (!values.title || !values.url) return;
                                  const imageUrl = parsePodcastThumbnail(values.url);
                                  const updated = await apiClient.put('podcasts', pod.id, { ...pod, title: values.title, url: values.url, imageUrl });
                                  const updatedList = [...drawerData.list];
                                  updatedList[index] = updated;
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalConfig({
                                type: 'confirm',
                                title: 'Delete Podcast Link',
                                description: `Are you sure you want to delete the podcast "${pod.title}"?`,
                                inputs: [],
                                onConfirm: async () => {
                                  await apiClient.delete('podcasts', pod.id);
                                  const updatedList = drawerData.list.filter((x: any) => x.id !== pod.id);
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TESTIMONIALS DRAWER */}
              {activeDrawer === 'testimonials' && drawerData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-bold text-[#1D1A39]">Active Testimonials ({drawerData.list.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...drawerData.list];
                        updated.push({ author: '', rank: '', text: '', image: '' });
                        setDrawerData({ list: updated });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#F59F59] hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Success Story
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drawerData.list.map((t: any, index: number) => (
                      <div key={t.id || index} className="p-4 border rounded-xl bg-gray-50 flex flex-col gap-3 relative animate-fade-in">
                        <button
                          type="button"
                          onClick={() => {
                            setModalConfig({
                              type: 'confirm',
                              title: 'Remove Testimonial',
                              description: 'Are you sure you want to remove this testimonial?',
                              inputs: [],
                              onConfirm: async () => {
                                if (t.id) {
                                  await apiClient.delete('testimonials', t.id);
                                }
                                const updatedList = drawerData.list.filter((_: any, idx: number) => idx !== index);
                                setDrawerData({ list: updatedList });
                              }
                            });
                          }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600 bg-white p-1 rounded-lg border shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Author Name</label>
                            <input 
                              type="text" 
                              value={t.author || ''} 
                              onChange={e => {
                                const copy = [...drawerData.list];
                                copy[index].author = e.target.value;
                                setDrawerData({ list: copy });
                              }}
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Rank / Details (e.g. NFSU)</label>
                            <input 
                              type="text" 
                              value={t.rank || ''} 
                              onChange={e => {
                                const copy = [...drawerData.list];
                                copy[index].rank = e.target.value;
                                setDrawerData({ list: copy });
                              }}
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Note / Text Content</label>
                          <textarea 
                            value={t.text || ''} 
                            onChange={e => {
                              const copy = [...drawerData.list];
                              copy[index].text = e.target.value;
                              setDrawerData({ list: copy });
                            }}
                            className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none min-h-[60px]" 
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Avatar Image</label>
                          <div className="flex gap-3 items-center">
                            {t.image ? (
                              <img src={t.image.startsWith('/media') ? t.image : toProxyUrl(t.image)} className="w-10 h-10 rounded-full object-cover border" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 border flex items-center justify-center text-xs font-bold text-gray-500">
                                {t.author?.slice(0, 2) || '?'}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setMediaSelectorTarget({ type: 'testimonial', index });
                                setShowMediaSelector(true);
                              }}
                              className="px-3 py-1.5 bg-white border text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100"
                            >
                              Choose Image
                            </button>
                            {t.image && (
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...drawerData.list];
                                  copy[index].image = '';
                                  setDrawerData({ list: copy });
                                }}
                                className="text-red-500 hover:underline text-xs font-bold"
                              >
                                Remove Image
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* FAQS DRAWER */}
              {activeDrawer === 'faqs' && drawerData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-bold text-[#1D1A39]">Active FAQs ({drawerData.list.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalInputValues({ question: '', answer: '' });
                        setModalConfig({
                          type: 'prompt',
                          title: 'Add FAQ',
                          inputs: [
                            { key: 'question', label: 'Question', placeholder: 'Enter Question' },
                            { key: 'answer', label: 'Answer', placeholder: 'Enter Answer' }
                          ],
                          onConfirm: async (values) => {
                            if (!values.question || !values.answer) return;
                            const newFaq = await apiClient.post('faqs', { question: values.question, answer: values.answer });
                            setDrawerData({ list: [...drawerData.list, newFaq] });
                          }
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#F59F59] hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drawerData.list.map((faq: any, index: number) => (
                      <div key={faq.id || index} className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
                        <div className="max-w-[70%]">
                          <h4 className="font-bold text-[#1D1A39] truncate">{faq.question}</h4>
                          <p className="text-xs text-gray-500 truncate">{faq.answer}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setModalInputValues({ question: faq.question, answer: faq.answer });
                              setModalConfig({
                                type: 'prompt',
                                title: 'Update FAQ',
                                inputs: [
                                  { key: 'question', label: 'Question', placeholder: 'Update Question' },
                                  { key: 'answer', label: 'Answer', placeholder: 'Update Answer' }
                                ],
                                onConfirm: async (values) => {
                                  if (!values.question || !values.answer) return;
                                  const updated = await apiClient.put('faqs', faq.id, { ...faq, question: values.question, answer: values.answer });
                                  const updatedList = [...drawerData.list];
                                  updatedList[index] = updated;
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-white border text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setModalConfig({
                                type: 'confirm',
                                title: 'Delete FAQ',
                                description: `Are you sure you want to delete this FAQ?`,
                                inputs: [],
                                onConfirm: async () => {
                                  await apiClient.delete('faqs', faq.id);
                                  const updatedList = drawerData.list.filter((x: any) => x.id !== faq.id);
                                  setDrawerData({ list: updatedList });
                                }
                              });
                            }}
                            className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* NAVBAR DRAWER */}
              {activeDrawer === 'navbar' && drawerData && (
                <div className="space-y-6">
                  {/* Main Links Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-[#1D1A39] text-base">Main Navigation Links</h4>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = [...drawerData.mainLinks];
                          updated.push({ label: 'New Link', url: '#' });
                          setDrawerData({ ...drawerData, mainLinks: updated });
                        }}
                        className="text-xs font-bold text-[#F59F59] hover:underline flex items-center gap-1"
                      >
                        + Add Main Link
                      </button>
                    </div>
                    
                    {drawerData.mainLinks.map((link: any, index: number) => (
                      <div key={index} className="p-3 border rounded-xl bg-gray-50 flex items-center gap-3 relative">
                        <div className="flex-grow grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Label</label>
                            <input 
                              type="text" 
                              value={link.label} 
                              onChange={e => {
                                const copy = [...drawerData.mainLinks];
                                copy[index].label = e.target.value;
                                setDrawerData({ ...drawerData, mainLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none font-bold" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">URL</label>
                            <input 
                              type="text" 
                              value={link.url} 
                              onChange={e => {
                                const copy = [...drawerData.mainLinks];
                                copy[index].url = e.target.value;
                                setDrawerData({ ...drawerData, mainLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-1 shrink-0 pt-3">
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === 0) return;
                              const copy = [...drawerData.mainLinks];
                              const temp = copy[index];
                              copy[index] = copy[index - 1];
                              copy[index - 1] = temp;
                              setDrawerData({ ...drawerData, mainLinks: copy });
                            }}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === drawerData.mainLinks.length - 1) return;
                              const copy = [...drawerData.mainLinks];
                              const temp = copy[index];
                              copy[index] = copy[index + 1];
                              copy[index + 1] = temp;
                              setDrawerData({ ...drawerData, mainLinks: copy });
                            }}
                            disabled={index === drawerData.mainLinks.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              const copy = [...drawerData.mainLinks];
                              copy.splice(index, 1);
                              setDrawerData({ ...drawerData, mainLinks: copy });
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {drawerData.mainLinks.length === 0 && (
                      <p className="text-gray-400 text-xs italic text-center py-2">No main links. Click add to create one.</p>
                    )}
                  </div>

                  {/* Dropdown Links Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-[#1D1A39] text-base">Dropdown Menu Links ("More")</h4>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = [...drawerData.dropdownLinks];
                          updated.push({ label: 'New Dropdown Link', url: '#' });
                          setDrawerData({ ...drawerData, dropdownLinks: updated });
                        }}
                        className="text-xs font-bold text-[#F59F59] hover:underline flex items-center gap-1"
                      >
                        + Add Dropdown Link
                      </button>
                    </div>
                    
                    {drawerData.dropdownLinks.map((link: any, index: number) => (
                      <div key={index} className="p-3 border rounded-xl bg-gray-50 flex items-center gap-3 relative">
                        <div className="flex-grow grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Label</label>
                            <input 
                              type="text" 
                              value={link.label} 
                              onChange={e => {
                                const copy = [...drawerData.dropdownLinks];
                                copy[index].label = e.target.value;
                                setDrawerData({ ...drawerData, dropdownLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none font-bold" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">URL</label>
                            <input 
                              type="text" 
                              value={link.url} 
                              onChange={e => {
                                const copy = [...drawerData.dropdownLinks];
                                copy[index].url = e.target.value;
                                setDrawerData({ ...drawerData, dropdownLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-1 shrink-0 pt-3">
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === 0) return;
                              const copy = [...drawerData.dropdownLinks];
                              const temp = copy[index];
                              copy[index] = copy[index - 1];
                              copy[index - 1] = temp;
                              setDrawerData({ ...drawerData, dropdownLinks: copy });
                            }}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === drawerData.dropdownLinks.length - 1) return;
                              const copy = [...drawerData.dropdownLinks];
                              const temp = copy[index];
                              copy[index] = copy[index + 1];
                              copy[index + 1] = temp;
                              setDrawerData({ ...drawerData, dropdownLinks: copy });
                            }}
                            disabled={index === drawerData.dropdownLinks.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              const copy = [...drawerData.dropdownLinks];
                              copy.splice(index, 1);
                              setDrawerData({ ...drawerData, dropdownLinks: copy });
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {drawerData.dropdownLinks.length === 0 && (
                      <p className="text-gray-400 text-xs italic text-center py-2">No dropdown links. Click add to create one.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ABOUT US DRAWER */}
              {activeDrawer === 'aboutUs' && drawerData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Hero Image URL</label>
                    <input type="text" value={drawerData.heroImage || ''} onChange={e => setDrawerData({ ...drawerData, heroImage: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                    <input type="text" value={drawerData.title || ''} onChange={e => setDrawerData({ ...drawerData, title: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Subtitle</label>
                    <textarea value={drawerData.subtitle || ''} onChange={e => setDrawerData({ ...drawerData, subtitle: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm min-h-[60px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                    <textarea value={drawerData.description || ''} onChange={e => setDrawerData({ ...drawerData, description: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm min-h-[100px]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Mission Statement</label>
                    <textarea value={drawerData.missionStatement || ''} onChange={e => setDrawerData({ ...drawerData, missionStatement: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm min-h-[60px]" />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-[#1D1A39] text-sm mb-4">Stats Config</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 1 Value</label>
                        <input type="text" value={drawerData.stat1Value || ''} onChange={e => setDrawerData({ ...drawerData, stat1Value: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 1 Label</label>
                        <input type="text" value={drawerData.stat1Label || ''} onChange={e => setDrawerData({ ...drawerData, stat1Label: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 2 Value</label>
                        <input type="text" value={drawerData.stat2Value || ''} onChange={e => setDrawerData({ ...drawerData, stat2Value: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 2 Label</label>
                        <input type="text" value={drawerData.stat2Label || ''} onChange={e => setDrawerData({ ...drawerData, stat2Label: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 3 Value</label>
                        <input type="text" value={drawerData.stat3Value || ''} onChange={e => setDrawerData({ ...drawerData, stat3Value: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 3 Label</label>
                        <input type="text" value={drawerData.stat3Label || ''} onChange={e => setDrawerData({ ...drawerData, stat3Label: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 4 Value</label>
                        <input type="text" value={drawerData.stat4Value || ''} onChange={e => setDrawerData({ ...drawerData, stat4Value: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stat 4 Label</label>
                        <input type="text" value={drawerData.stat4Label || ''} onChange={e => setDrawerData({ ...drawerData, stat4Label: e.target.value })} className="w-full bg-[#fafafa] border rounded-xl p-2 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

                            {/* ABOUT DRAWER */}
              {activeDrawer === 'about' && drawerData && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#1D1A39] border-b pb-2">About Priyanshi Section</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Heading</label>
                    <input 
                      type="text" 
                      value={drawerData.aboutTitle || ''} 
                      onChange={(e) => setDrawerData({...drawerData, aboutTitle: e.target.value})}
                      className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]"
                      placeholder="e.g., Meet Priyanshi Jain"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Description Paragraph</label>
                    <textarea 
                      value={drawerData.aboutDescription || ''} 
                      onChange={(e) => setDrawerData({...drawerData, aboutDescription: e.target.value})}
                      className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59] h-32"
                      placeholder="Write the bio here..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Profile Image URL</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={drawerData.aboutImage || ''} 
                        onChange={(e) => setDrawerData({...drawerData, aboutImage: e.target.value})}
                        className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]"
                        placeholder="e.g., /priyanshi.jpg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CTA FOOTER DRAWER */}
              {activeDrawer === 'ctaFooter' && drawerData && (
                <div className="space-y-4">
                  <h3 className="font-bold text-[#1D1A39] border-b pb-2">CTA Footer Section</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Main Heading</label>
                    <input 
                      type="text" 
                      value={drawerData.ctaTitle || ''} 
                      onChange={(e) => setDrawerData({...drawerData, ctaTitle: e.target.value})}
                      className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]"
                      placeholder="e.g., Ready to Crack Your Exams?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Subheading</label>
                    <input 
                      type="text" 
                      value={drawerData.ctaSubtitle || ''} 
                      onChange={(e) => setDrawerData({...drawerData, ctaSubtitle: e.target.value})}
                      className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]"
                      placeholder="e.g., Join India's fastest-growing forensic community."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Button Text</label>
                      <input 
                        type="text" 
                        value={drawerData.ctaButtonText || ''} 
                        onChange={(e) => setDrawerData({...drawerData, ctaButtonText: e.target.value})}
                        className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Button Link</label>
                      <input 
                        type="text" 
                        value={drawerData.ctaButtonLink || ''} 
                        onChange={(e) => setDrawerData({...drawerData, ctaButtonLink: e.target.value})}
                        className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59F59]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER DRAWER */}
              {activeDrawer === 'footer' && drawerData && (
                <div className="space-y-6">
                  {/* Explore Links Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-[#1D1A39] text-base">Explore Links Column</h4>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = [...drawerData.exploreLinks];
                          updated.push({ label: 'New Link', url: '#' });
                          setDrawerData({ ...drawerData, exploreLinks: updated });
                        }}
                        className="text-xs font-bold text-[#F59F59] hover:underline flex items-center gap-1"
                      >
                        + Add Link
                      </button>
                    </div>
                    
                    {drawerData.exploreLinks.map((link: any, index: number) => (
                      <div key={index} className="p-3 border rounded-xl bg-gray-50 flex items-center gap-3 relative">
                        <div className="flex-grow grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Label</label>
                            <input 
                              type="text" 
                              value={link.label} 
                              onChange={e => {
                                const copy = [...drawerData.exploreLinks];
                                copy[index].label = e.target.value;
                                setDrawerData({ ...drawerData, exploreLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none font-bold" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">URL</label>
                            <input 
                              type="text" 
                              value={link.url} 
                              onChange={e => {
                                const copy = [...drawerData.exploreLinks];
                                copy[index].url = e.target.value;
                                setDrawerData({ ...drawerData, exploreLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-1 shrink-0 pt-3">
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === 0) return;
                              const copy = [...drawerData.exploreLinks];
                              const temp = copy[index];
                              copy[index] = copy[index - 1];
                              copy[index - 1] = temp;
                              setDrawerData({ ...drawerData, exploreLinks: copy });
                            }}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === drawerData.exploreLinks.length - 1) return;
                              const copy = [...drawerData.exploreLinks];
                              const temp = copy[index];
                              copy[index] = copy[index + 1];
                              copy[index + 1] = temp;
                              setDrawerData({ ...drawerData, exploreLinks: copy });
                            }}
                            disabled={index === drawerData.exploreLinks.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              const copy = [...drawerData.exploreLinks];
                              copy.splice(index, 1);
                              setDrawerData({ ...drawerData, exploreLinks: copy });
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {drawerData.exploreLinks.length === 0 && (
                      <p className="text-gray-400 text-xs italic text-center py-2">No links. Click add to create one.</p>
                    )}
                  </div>

                  {/* Company Links Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-bold text-[#1D1A39] text-base">Company Links Column</h4>
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = [...drawerData.companyLinks];
                          updated.push({ label: 'New Link', url: '#' });
                          setDrawerData({ ...drawerData, companyLinks: updated });
                        }}
                        className="text-xs font-bold text-[#F59F59] hover:underline flex items-center gap-1"
                      >
                        + Add Link
                      </button>
                    </div>
                    
                    {drawerData.companyLinks.map((link: any, index: number) => (
                      <div key={index} className="p-3 border rounded-xl bg-gray-50 flex items-center gap-3 relative">
                        <div className="flex-grow grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">Label</label>
                            <input 
                              type="text" 
                              value={link.label} 
                              onChange={e => {
                                const copy = [...drawerData.companyLinks];
                                copy[index].label = e.target.value;
                                setDrawerData({ ...drawerData, companyLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none font-bold" 
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-0.5">URL</label>
                            <input 
                              type="text" 
                              value={link.url} 
                              onChange={e => {
                                const copy = [...drawerData.companyLinks];
                                copy[index].url = e.target.value;
                                setDrawerData({ ...drawerData, companyLinks: copy });
                              }} 
                              className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-1 shrink-0 pt-3">
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === 0) return;
                              const copy = [...drawerData.companyLinks];
                              const temp = copy[index];
                              copy[index] = copy[index - 1];
                              copy[index - 1] = temp;
                              setDrawerData({ ...drawerData, companyLinks: copy });
                            }}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              if (index === drawerData.companyLinks.length - 1) return;
                              const copy = [...drawerData.companyLinks];
                              const temp = copy[index];
                              copy[index] = copy[index + 1];
                              copy[index + 1] = temp;
                              setDrawerData({ ...drawerData, companyLinks: copy });
                            }}
                            disabled={index === drawerData.companyLinks.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-20"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              const copy = [...drawerData.companyLinks];
                              copy.splice(index, 1);
                              setDrawerData({ ...drawerData, companyLinks: copy });
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {drawerData.companyLinks.length === 0 && (
                      <p className="text-gray-400 text-xs italic text-center py-2">No links. Click add to create one.</p>
                    )}
                  </div>
                </div>
              )}

              {/* FAQS DRAWER */}
              {activeDrawer === 'faqs' && drawerData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="font-bold text-[#1D1A39]">Frequently Asked Questions ({drawerData.list.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setModalInputValues({ question: '', answer: '' });
                        setModalConfig({
                          type: 'prompt',
                          title: 'Add New FAQ',
                          inputs: [
                            { key: 'question', label: 'FAQ Question', placeholder: 'Enter FAQ Question' },
                            { key: 'answer', label: 'FAQ Answer', placeholder: 'Enter FAQ Answer' }
                          ],
                          onConfirm: async (values) => {
                            if (!values.question || !values.answer) return;
                            const faq = await apiClient.post('faqs', { question: values.question, answer: values.answer });
                            setDrawerData({ list: [...drawerData.list, faq] });
                          }
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-[#F59F59] hover:underline"
                    >
                      <PlusCircle className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {drawerData.list.map((faq: any, index: number) => (
                      <div key={faq.id || index} className="p-4 border rounded-xl bg-gray-50 relative">
                        <button
                          type="button"
                          onClick={() => {
                            setModalConfig({
                              type: 'confirm',
                              title: 'Delete FAQ',
                              description: `Are you sure you want to delete the FAQ: "${faq.question}"?`,
                              inputs: [],
                              onConfirm: async () => {
                                await apiClient.delete('faqs', faq.id);
                                const updatedList = drawerData.list.filter((x: any) => x.id !== faq.id);
                                setDrawerData({ list: updatedList });
                              }
                            });
                          }}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <h4 className="font-bold text-xs text-[#1D1A39] pr-8">Q: {faq.question}</h4>
                        <p className="text-xs text-gray-500 mt-1">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GLOBAL THEME EDITOR DRAWER */}
              {activeDrawer === 'theme' && drawerData && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-[#1D1A39] mb-4">Website Colors & Custom Layout</h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Primary Background Color (Theme)</label>
                        <div className="flex gap-4">
                          <input type="color" value={drawerData.primaryColor} onChange={e => setDrawerData({ ...drawerData, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border" />
                          <input type="text" value={drawerData.primaryColor} onChange={e => setDrawerData({ ...drawerData, primaryColor: e.target.value })} className="flex-grow bg-[#fafafa] border rounded-xl p-2 text-sm" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Accent Highlight Color (Buttons, Links)</label>
                        <div className="flex gap-4">
                          <input type="color" value={drawerData.accentColor} onChange={e => setDrawerData({ ...drawerData, accentColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border" />
                          <input type="text" value={drawerData.accentColor} onChange={e => setDrawerData({ ...drawerData, accentColor: e.target.value })} className="flex-grow bg-[#fafafa] border rounded-xl p-2 text-sm" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Secondary Accent Color (Cards, Highlights)</label>
                        <div className="flex gap-4">
                          <input type="color" value={drawerData.secondaryColor} onChange={e => setDrawerData({ ...drawerData, secondaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border" />
                          <input type="text" value={drawerData.secondaryColor} onChange={e => setDrawerData({ ...drawerData, secondaryColor: e.target.value })} className="flex-grow bg-[#fafafa] border rounded-xl p-2 text-sm" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Global Base Font Size ({drawerData.baseFontSize || '14.4px'})</label>
                        <input 
                          type="range" 
                          min="12" 
                          max="20" 
                          step="0.5"
                          value={parseFloat(drawerData.baseFontSize || '14.4')} 
                          onChange={e => setDrawerData({ ...drawerData, baseFontSize: `${e.target.value}px` })} 
                          className="w-full cursor-pointer accent-[#F59F59]" 
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1 mt-1">
                          <span>Small (12px)</span>
                          <span>Default (14.4px)</span>
                          <span>Large (20px)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Custom CSS Inject</label>
                    <textarea 
                      value={drawerData.customCss || ''} 
                      onChange={e => setDrawerData({ ...drawerData, customCss: e.target.value })}
                      placeholder="e.g. .custom-class { border: 2px solid var(--color-amber); }"
                      className="w-full bg-[#1D1A39] text-[#F59F59] font-mono border rounded-xl p-3 text-xs min-h-[150px]"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setActiveDrawer(null)}
                className="px-6 py-2.5 border rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm"
              >
                Discard
              </button>
              
              {/* Only show Save button for properties directly stored inside unified objects */}
              {(activeDrawer === 'hero' || activeDrawer === 'features' || activeDrawer === 'counselling' || activeDrawer === 'theme' || activeDrawer === 'navbar' || activeDrawer === 'footer' || activeDrawer === 'testimonials') && (
                <button 
                  type="button" 
                  onClick={handleSaveDrawer}
                  className="px-6 py-2.5 bg-[#1D1A39] hover:bg-[#1D1A39]/90 text-white rounded-xl font-bold transition-colors text-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Save & Publish
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. MEDIA SELECTOR MODAL (OVERLAY ABOVE DRAWER) */}
      {showMediaSelector && mediaSelectorTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-[#1D1A39] font-display">Select Image from Media Library</h3>
                <p className="text-xs text-gray-500 mt-0.5">Click on any image to select it for your {mediaSelectorTarget.type}.</p>
              </div>
              <button 
                onClick={() => {
                  setShowMediaSelector(false);
                  setMediaSelectorTarget(null);
                }} 
                className="p-2 border rounded-xl hover:bg-gray-100 animate-hover-scale"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Media Grid */}
            <div className="flex-grow overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mediaList.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      const proxyUrl = toProxyUrl(m.url);
                      if (mediaSelectorTarget.type === 'feature') {
                        const copy = [...drawerData.features];
                        copy[mediaSelectorTarget.index!].image = proxyUrl;
                        setDrawerData({ ...drawerData, features: copy });
                      } else if (mediaSelectorTarget.type === 'testimonial') {
                        const copy = [...drawerData.list];
                        copy[mediaSelectorTarget.index!].image = proxyUrl;
                        setDrawerData({ list: copy });
                      } else if (mediaSelectorTarget.type === 'modal_input' && mediaSelectorTarget.key) {
                        setModalInputValues(prev => ({ ...prev, [mediaSelectorTarget.key!]: proxyUrl }));
                      }
                      setShowMediaSelector(false);
                      setMediaSelectorTarget(null);
                    }}
                    className="cursor-pointer border border-gray-200 rounded-xl overflow-hidden aspect-video bg-gray-50 flex items-center justify-center hover:ring-2 hover:ring-[#F59F59] transition-all group relative shadow-sm"
                  >
                    <img src={toProxyUrl(m.url)} alt={m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Select Image
                    </div>
                  </div>
                ))}
                {mediaList.length === 0 && (
                  <p className="col-span-full py-16 text-center text-gray-400 font-semibold">No media uploads found. Upload images in the Media Manager tab first.</p>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button 
                type="button" 
                onClick={() => {
                  setShowMediaSelector(false);
                  setMediaSelectorTarget(null);
                }}
                className="px-6 py-2 border rounded-xl text-gray-600 font-bold hover:bg-gray-100 text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. CUSTOM PROMPT/CONFIRM MODAL */}
      {modalConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#1D1A39] font-display">{modalConfig.title}</h3>
              <button 
                onClick={() => setModalConfig(null)} 
                className="p-1.5 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {modalConfig.description && (
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">{modalConfig.description}</p>
              )}
              {modalConfig.type === 'prompt' && modalConfig.inputs.map((input) => (
                <div key={input.key} className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{input.label}</label>
                  {input.type === 'textarea' ? (
                    <textarea
                      value={modalInputValues[input.key] || ''}
                      onChange={(e) => setModalInputValues({ ...modalInputValues, [input.key]: e.target.value })}
                      placeholder={input.placeholder}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59] min-h-[100px] resize-y"
                      autoFocus={input.key === modalConfig.inputs[0].key}
                    />
                  ) : input.type === 'image' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={modalInputValues[input.key] || ''}
                        onChange={(e) => setModalInputValues({ ...modalInputValues, [input.key]: e.target.value })}
                        placeholder={input.placeholder}
                        className="flex-grow bg-[#fafafa] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59]"
                      />
                      <label className="shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer">
                        <ImageIcon className="w-4 h-4" /> Upload
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              // Optional: you can show a loading indicator here by setting some state, 
                              // but since it's a small image upload it's usually very fast.
                              e.target.parentElement!.style.opacity = '0.5';
                              const { signature, timestamp, cloudName, apiKey } = await apiClient.getCloudinarySignature('fbp_assets');
                              const formData = new FormData();
                              formData.append('file', file);
                              formData.append('api_key', apiKey);
                              formData.append('timestamp', timestamp.toString());
                              formData.append('signature', signature);
                              formData.append('folder', 'fbp_assets');
                              
                              const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                method: 'POST',
                                body: formData,
                              });
                              const uploadData = await uploadRes.json();
                              if (uploadData.error) throw new Error(uploadData.error.message);
                              
                              // Save to media library as well
                              await apiClient.post('media', {
                                url: uploadData.secure_url,
                                publicId: uploadData.public_id,
                                filename: file.name,
                                createdAt: new Date().toISOString()
                              });
                              
                              // Auto fill the input with proxy URL
                              setModalInputValues(prev => ({ 
                                ...prev, 
                                [input.key]: uploadData.secure_url.replace(/^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload/, '/media') 
                              }));
                            } catch (err) {
                              alert("Upload failed. See console.");
                              console.error(err);
                            } finally {
                              e.target.parentElement!.style.opacity = '1';
                            }
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <input
                      type={input.type || 'text'}
                      value={modalInputValues[input.key] || ''}
                      onChange={(e) => setModalInputValues({ ...modalInputValues, [input.key]: e.target.value })}
                      placeholder={input.placeholder}
                      className="w-full bg-[#fafafa] border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F59F59]/20 focus:border-[#F59F59]"
                      autoFocus={input.key === modalConfig.inputs[0].key}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-2.5">
              <button 
                type="button" 
                onClick={() => setModalConfig(null)}
                className="px-4 py-2 border rounded-xl text-gray-600 font-bold hover:bg-gray-100 text-xs transition-colors"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  await modalConfig.onConfirm(modalInputValues);
                  setModalConfig(null);
                }}
                className={`px-5 py-2 text-white rounded-xl font-bold text-xs transition-colors ${
                  modalConfig.type === 'confirm' && modalConfig.title.toLowerCase().includes('delete')
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-[#1D1A39] hover:bg-[#1D1A39]/90'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
