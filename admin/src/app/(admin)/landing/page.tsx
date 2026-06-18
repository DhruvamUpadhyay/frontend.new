"use client";
import { useState, useEffect } from 'react';
import { Save, Loader2, RefreshCw } from 'lucide-react';
import { apiClient } from '@/api/client';


export default function LandingPageEditor() {
  const [data, setData] = useState<any>({
    heroTitle: "India's Fastest-Growing",
    heroSubtitle: "Forensic Science Education Hub",
    heroDescription: "Led by Priyanshi. Join our community of 1,50,000+ Forensic Enthusiasts and get access to the best courses and guidance.",
    heroButtonText: "Enroll Now", // Legacy field, replaced by hardcoded Login/Signup on frontend
    heroButtonLink: "https://app.forensicbypriyanshi.com",
    heroImage: "",
    stats1Value: "10000",
    stats1Label: "Active Learners",
    stats2Value: "150000",
    stats2Label: "Forensic Enthusiasts",
    stats3Value: "25000",
    stats3Label: "Students Taught",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchContent = async () => {
    setLoading(true);
    try {
      const docs = await apiClient.get('landing_page');
      const globalDoc = docs.find((d: any) => d.id === 'global');
      if (globalDoc) {
        setData(globalDoc);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load landing page content.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Always use PUT (PATCH in firestore) because it will create or update the 'global' document.
      await apiClient.put('landing_page', 'global', data);
      alert('Landing page content saved successfully! The public frontend will update immediately.');
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F59F59]" /></div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1A39] mb-2">Landing Page Editor</h1>
          <p className="text-[#1D1A39]/60 font-medium">Update the text and images on your public landing page.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchContent}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#1D1A39]/10 rounded-xl font-bold text-[#1D1A39] hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-[#1D1A39] text-white rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-8">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#1D1A39]/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#1D1A39]/10 bg-gray-50">
          <h2 className="text-lg font-bold text-[#1D1A39]">Hero Section</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#1D1A39] mb-2">Main Title</label>
            <textarea
              value={data.heroTitle || ''}
              onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-medium text-[#1D1A39] min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1D1A39] mb-2">Subtitle</label>
            <textarea
              value={data.heroSubtitle || ''}
              onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-medium text-[#1D1A39] min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#1D1A39] mb-2">Button Text</label>
              <input
                type="text"
                value={data.heroButtonText || ''}
                onChange={(e) => setData({ ...data, heroButtonText: e.target.value })}
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-medium text-[#1D1A39]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1D1A39] mb-2">Button Link</label>
              <input
                type="text"
                value={data.heroButtonLink || ''}
                onChange={(e) => setData({ ...data, heroButtonLink: e.target.value })}
                className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-medium text-[#1D1A39]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1D1A39] mb-2">Hero Image URL (Copy from Media Manager)</label>
            <input
              type="text"
              value={data.heroImage || ''}
              onChange={(e) => setData({ ...data, heroImage: e.target.value })}
              placeholder="https://res.cloudinary.com/..."
              className="w-full px-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] font-medium text-[#1D1A39]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#1D1A39]/10 overflow-hidden shadow-sm mt-8">
        <div className="p-6 border-b border-[#1D1A39]/10 bg-gray-50">
          <h2 className="text-lg font-bold text-[#1D1A39]">Hero Statistics</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D1A39] mb-1">Stat 1 Value</label>
              <input
                type="text"
                value={data.stats1Value || ''}
                onChange={(e) => setData({ ...data, stats1Value: e.target.value })}
                className="w-full px-4 py-2 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D1A39] mb-1">Stat 1 Label</label>
              <input
                type="text"
                value={data.stats1Label || ''}
                onChange={(e) => setData({ ...data, stats1Label: e.target.value })}
                className="w-full px-4 py-2 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none font-medium"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D1A39] mb-1">Stat 2 Value</label>
              <input
                type="text"
                value={data.stats2Value || ''}
                onChange={(e) => setData({ ...data, stats2Value: e.target.value })}
                className="w-full px-4 py-2 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D1A39] mb-1">Stat 2 Label</label>
              <input
                type="text"
                value={data.stats2Label || ''}
                onChange={(e) => setData({ ...data, stats2Label: e.target.value })}
                className="w-full px-4 py-2 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D1A39] mb-1">Stat 3 Value</label>
              <input
                type="text"
                value={data.stats3Value || ''}
                onChange={(e) => setData({ ...data, stats3Value: e.target.value })}
                className="w-full px-4 py-2 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1D1A39] mb-1">Stat 3 Label</label>
              <input
                type="text"
                value={data.stats3Label || ''}
                onChange={(e) => setData({ ...data, stats3Label: e.target.value })}
                className="w-full px-4 py-2 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
