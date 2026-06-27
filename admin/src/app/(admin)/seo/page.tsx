"use client";
import { useState, useEffect } from 'react';
import { db } from '@/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Loader2, Globe, Image as ImageIcon } from 'lucide-react';

export default function SEOSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoData, setSeoData] = useState({
    siteTitle: "Forensics By Priyanshi — India's Premier Forensic Science Academy",
    metaDescription: "India's leading forensic science education and exam preparation platform. Premium courses for CUET PG, NFSU Entrance, UGC NET, study notes, and direct 1-on-1 mentorship from Priyanshi Jain.",
    ogImage: "https://res.cloudinary.com/dikk1fy3i/image/upload/v1781625041/fbp_assets/SpIm4monkTVnlRNMgyMZBBMpY.png"
  });

  useEffect(() => {
    let mounted = true;
    const fetchSeo = async () => {
      try {
        const snap = await getDoc(doc(db, 'theme', 'global'));
        if (!mounted) return;
        if (snap.exists()) {
          const data = snap.data();
          setSeoData({
            siteTitle: data.siteTitle || seoData.siteTitle,
            metaDescription: data.metaDescription || seoData.metaDescription,
            ogImage: data.ogImage || seoData.ogImage
          });
        }
      } catch (err) {
        console.error("Error fetching SEO data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSeo();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'theme', 'global'), seoData, { merge: true });
      alert("SEO Settings saved successfully!");
    } catch (err) {
      console.error("Error saving SEO", err);
      alert("Failed to save SEO settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Global SEO & Meta Tags</h1>
          <p className="text-gray-500">Configure how your site appears on Google Search and Social Media (WhatsApp, Twitter).</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save SEO Settings
        </button>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          Search Engine Settings
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Global Page Title</label>
            <input
              type="text"
              value={seoData.siteTitle}
              onChange={(e) => setSeoData({ ...seoData, siteTitle: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              placeholder="e.g. Forensics By Priyanshi"
            />
            <p className="text-xs text-gray-500 mt-2">This appears in the browser tab and Google search results.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
            <textarea
              rows={4}
              value={seoData.metaDescription}
              onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="Briefly describe the website..."
            />
            <p className="text-xs text-gray-500 mt-2">Optimal length is 150-160 characters. Appears below the title in search results.</p>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-500" />
              Social Media Preview (OpenGraph)
            </h2>
            <label className="block text-sm font-semibold text-gray-700 mb-2">OpenGraph Image URL</label>
            <input
              type="text"
              value={seoData.ogImage}
              onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-sm"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-2">The image shown when the link is shared on WhatsApp, LinkedIn, Twitter, etc. (Recommended: 1200x630px)</p>
            
            {seoData.ogImage && (
              <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden max-w-sm">
                <img src={seoData.ogImage} alt="OG Preview" className="w-full h-auto object-cover" />
                <div className="p-3 bg-gray-50">
                  <p className="text-sm font-bold text-gray-800 truncate">{seoData.siteTitle}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seoData.metaDescription}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
