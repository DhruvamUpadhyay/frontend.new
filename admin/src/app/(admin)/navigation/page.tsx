"use client";
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

export default function NavigationManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [navData, setNavData] = useState<any>({ mainLinks: [], dropdownLinks: [] });
  const [footerData, setFooterData] = useState<any>({ exploreLinks: [], companyLinks: [] });

  useEffect(() => {
    let mounted = true;
    const fetchNavData = async () => {
      try {
        const [navSnap, footerSnap] = await Promise.all([
          getDoc(doc(db, 'navigation', 'main')),
          getDoc(doc(db, 'navigation', 'footer'))
        ]);
        if (!mounted) return;
        if (navSnap.exists()) setNavData(navSnap.data());
        if (footerSnap.exists()) setFooterData(footerSnap.data());
      } catch (err) {
        console.error("Error fetching navigation data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchNavData();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        setDoc(doc(db, 'navigation', 'main'), navData),
        setDoc(doc(db, 'navigation', 'footer'), footerData)
      ]);
      alert("Navigation saved successfully!");
    } catch (err) {
      console.error("Error saving navigation", err);
      alert("Failed to save navigation.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = (stateUpdater: any, category: string) => {
    stateUpdater((prev: any) => ({
      ...prev,
      [category]: [...(prev[category] || []), { label: "New Link", url: "/" }]
    }));
  };

  const handleUpdateLink = (stateUpdater: any, category: string, index: number, field: string, value: string) => {
    stateUpdater((prev: any) => {
      const newArray = [...prev[category]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [category]: newArray };
    });
  };

  const handleRemoveLink = (stateUpdater: any, category: string, index: number) => {
    stateUpdater((prev: any) => {
      const newArray = [...prev[category]];
      newArray.splice(index, 1);
      return { ...prev, [category]: newArray };
    });
  };

  const renderLinkEditor = (title: string, state: any, stateUpdater: any, category: string) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={() => handleAddLink(stateUpdater, category)} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>
      
      <div className="space-y-4">
        {(state[category] || []).map((link: any, index: number) => (
          <div key={index} className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Label</label>
                <input 
                  type="text" 
                  value={link.label}
                  onChange={(e) => handleUpdateLink(stateUpdater, category, index, 'label', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">URL Destination</label>
                <input 
                  type="text" 
                  value={link.url}
                  onChange={(e) => handleUpdateLink(stateUpdater, category, index, 'url', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>
            <button 
              onClick={() => handleRemoveLink(stateUpdater, category, index)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {(!state[category] || state[category].length === 0) && (
          <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
            No links added yet. Click 'Add Link' to create one.
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  const renderTextInput = (label: string, value: string, onChange: (val: string) => void, placeholder = "") => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Copy & Navigation Manager</h1>
          <p className="text-gray-500">Manage website header, footer text, and all global links directly.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (confirm('This will populate the fields with the default website links. You will still need to click Save. Proceed?')) {
                setNavData({
                  mainLinks: [
                    { label: "Courses", url: "/#courses" },
                    { label: "Tests", url: "/#tests" },
                    { label: "Materials", url: "/#materials" }
                  ],
                  dropdownLinks: [
                    { label: "Mock Tests", url: "/mock-tests" },
                    { label: "Previous Year Papers", url: "/pyq" },
                    { label: "Study Materials", url: "/materials" },
                    { label: "Syllabus", url: "/syllabus" },
                    { label: "Contact Support", url: "/#contact" }
                  ]
                });
                setFooterData({
                  exploreLinks: [
                    { label: "Courses", url: "/#courses" },
                    { label: "Tests", url: "/#tests" },
                    { label: "Materials", url: "/#materials" },
                    { label: "Blog", url: "/blog" }
                  ],
                  companyLinks: [
                    { label: "About Us", url: "/about" },
                    { label: "Careers", url: "/careers" },
                    { label: "Privacy Policy", url: "/privacy" },
                    { label: "Terms of Service", url: "/terms" }
                  ]
                });
              }
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            Load Defaults
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            Top Navigation Bar
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Navbar Text Settings</h3>
            {renderTextInput("Logo Text (Use dot '.' to color it amber)", navData.logoText, (val) => setNavData({...navData, logoText: val}), "Forensics By Priyanshi.")}
          </div>
          {renderLinkEditor("Main Navigation Links (Visible)", navData, setNavData, "mainLinks")}
          {renderLinkEditor("Dropdown Menu Links ('More')", navData, setNavData, "dropdownLinks")}
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 mt-4">
            Website Footer
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Footer Text Settings</h3>
            {renderTextInput("Footer Description", footerData.description, (val) => setFooterData({...footerData, description: val}), "The premier destination for forensic science education...")}
            {renderTextInput("Contact Us Title", footerData.contactTitle, (val) => setFooterData({...footerData, contactTitle: val}), "Contact Us")}
            {renderTextInput("Copyright Text", footerData.copyrightText, (val) => setFooterData({...footerData, copyrightText: val}), "© 2026 Priyanshi Academy. All rights reserved.")}
            <div className="grid grid-cols-2 gap-4 mt-4">
               {renderTextInput("Developer Text", footerData.developerText, (val) => setFooterData({...footerData, developerText: val}), "Designed for Excellence.")}
               {renderTextInput("Developer Link", footerData.developerLink, (val) => setFooterData({...footerData, developerLink: val}), "https://...")}
            </div>
          </div>
          {renderLinkEditor("Explore Column", footerData, setFooterData, "exploreLinks")}
          {renderLinkEditor("Company Column", footerData, setFooterData, "companyLinks")}
          {renderLinkEditor("Contact Links", footerData, setFooterData, "contactLinks")}
        </section>
      </div>
    </div>
  );
}
