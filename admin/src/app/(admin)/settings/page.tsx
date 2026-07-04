"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Save, Loader2, RefreshCw, AlertTriangle, Bell, ShieldAlert, History } from 'lucide-react';

export default function SystemSettings() {
  const [data, setData] = useState<any>({
    maintenanceMode: false,
    bannerActive: false,
    bannerText: "",
    bannerColor: "#F59F59"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const allSettings = await apiClient.get('settings');
      const systemDoc = allSettings.find((s: any) => s.id === 'system');
      if (systemDoc) {
        setData({
          maintenanceMode: systemDoc.maintenanceMode || false,
          bannerActive: systemDoc.bannerActive || false,
          bannerText: systemDoc.bannerText || "",
          bannerColor: systemDoc.bannerColor || "#F59F59"
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load system settings.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await apiClient.put('settings', 'system', data);
      alert('System settings saved successfully! Changes will take effect on the public site immediately.');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59F59]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1A39] mb-2 font-display">System Settings</h1>
          <p className="text-[#1D1A39]/60 font-medium">Control maintenance status and alert banners on the live website.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#1D1A39]/10 rounded-xl font-bold text-[#1D1A39] hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1D1A39] text-white rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Maintenance Mode */}
        <div className="bg-white p-6 rounded-2xl border border-[#1D1A39]/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#1D1A39]">Maintenance Mode</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-6">
              When activated, the public website will immediately display a premium "Under Maintenance" landing screen, blocking access to all features except this dashboard.
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <span className="font-bold text-[#1D1A39]">Activate Maintenance</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={data.maintenanceMode}
                onChange={(e) => setData({ ...data, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </label>
          </div>
        </div>

        {/* Global Broadcast Notification Banner */}
        <div className="bg-white p-6 rounded-2xl border border-[#1D1A39]/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-[#1D1A39]">Announcement Banner</h2>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-6">
              Display a dynamic alert banner at the very top of the public website page to broadcast announcements or live news instantly.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
              <span className="font-bold text-[#1D1A39]">Activate Banner</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.bannerActive}
                  onChange={(e) => setData({ ...data, bannerActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1D1A39]"></div>
              </label>
            </div>
            
            {data.bannerActive && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1D1A39] mb-1">Banner Alert Text</label>
                  <input
                    type="text"
                    value={data.bannerText}
                    onChange={(e) => setData({ ...data, bannerText: e.target.value })}
                    placeholder="E.g. Admission open for MSc Forensic Science batches!"
                    className="w-full px-4 py-2 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1D1A39] mb-1">Theme Color</label>
                  <div className="flex gap-4">
                    {['#F59F59', '#af445a', '#1D1A39', '#1D1A39'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setData({ ...data, bannerColor: c })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${data.bannerColor === c ? 'border-amber scale-110 shadow-md' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
