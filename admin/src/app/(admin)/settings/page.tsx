"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Paintbrush, Code, Save } from 'lucide-react';

export default function ThemeSettings() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  
  const [primaryColor, setPrimaryColor] = useState('#1D1A39'); // Default Dark Blue
  const [accentColor, setAccentColor] = useState('#F59F59'); // Default Orange
  const [secondaryColor, setSecondaryColor] = useState('#E8BCB9'); // Default Pink
  const [customCss, setCustomCss] = useState('');

  const fetchSettings = async () => {
    try {
      const data = await apiClient.get('settings');
      if (data && data.length > 0) {
        const s = data[0];
        setSettingsId(s.id);
        setPrimaryColor(s.primaryColor || '#1D1A39');
        setAccentColor(s.accentColor || '#F59F59');
        setSecondaryColor(s.secondaryColor || '#E8BCB9');
        setCustomCss(s.customCss || '');
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { primaryColor, accentColor, secondaryColor, customCss };
    try {
      if (settingsId) await apiClient.put('settings', settingsId, data);
      else await apiClient.post('settings', data);
      alert('Theme Settings Saved! Refresh the main site to see changes.');
    } catch (err) { alert("Failed to save settings"); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1D1A39]">Theme & Customization</h1>
        <p className="text-[#1D1A39]/60 font-medium">Edit colors and global CSS for the public site.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10 space-y-8">
        
        {/* Colors */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Paintbrush className="w-5 h-5 text-[#F59F59]" /> Global Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-bold mb-2 text-sm">Primary Color (Nav, Dark BG)</label>
              <div className="flex items-center gap-4">
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 bg-[#fafafa] border rounded-xl px-4 py-2" />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-2 text-sm">Accent Color (Buttons, Highlights)</label>
              <div className="flex items-center gap-4">
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 bg-[#fafafa] border rounded-xl px-4 py-2" />
              </div>
            </div>
            <div>
              <label className="block font-bold mb-2 text-sm">Secondary Color (Light Backgrounds)</label>
              <div className="flex items-center gap-4">
                <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="flex-1 bg-[#fafafa] border rounded-xl px-4 py-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Code className="w-5 h-5 text-[#F59F59]" /> Custom CSS</h2>
          <p className="text-sm text-gray-500 mb-2">Inject custom CSS directly into the public frontend. Use with caution.</p>
          <textarea 
            value={customCss} 
            onChange={e => setCustomCss(e.target.value)} 
            placeholder=".my-custom-class { display: none; }"
            className="w-full h-48 bg-[#1D1A39] text-[#F59F59] font-mono border rounded-xl p-4 focus:outline-none" 
          />
        </div>

        <button type="submit" className="bg-[#1D1A39] px-8 py-4 rounded-xl font-bold text-white flex items-center gap-2 hover:bg-[#1D1A39]/90">
          <Save className="w-5 h-5" /> Save Theme Settings
        </button>

      </form>
    </div>
  );
};
