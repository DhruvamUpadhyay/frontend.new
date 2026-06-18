"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function ManagePodcasts() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  const fetchData = async () => {
    try {
      setPodcasts(await apiClient.get('podcasts'));
      setMediaList(await apiClient.get('media'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setTitle(''); setUrl(''); setImageUrl('');
    setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (podcast: any) => {
    setTitle(podcast.title); setUrl(podcast.url); setImageUrl(podcast.imageUrl);
    setEditingId(podcast.id); setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this podcast?')) {
      await apiClient.delete('podcasts', id);
      fetchData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, url, imageUrl };
    try {
      if (editingId) await apiClient.put('podcasts', editingId, data);
      else await apiClient.post('podcasts', data);
      resetForm(); fetchData();
    } catch (err) { alert("Failed to save podcast"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39]">Manage Podcasts</h1>
          <p className="text-[#1D1A39]/60 font-medium">Add or edit podcast media gallery.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Podcast
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Podcast' : 'Create Podcast'}</h2>
            <button onClick={resetForm}><X className="w-6 h-6"/></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block font-bold mb-2">Podcast Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Video/Audio URL</label><input required value={url} onChange={e => setUrl(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
            </div>
            
            <div>
              <label className="block font-bold mb-2">Thumbnail Image</label>
              <div className="flex gap-4 items-center">
                {imageUrl && <img src={imageUrl} alt="Thumbnail" className="w-16 h-16 object-cover rounded-lg" />}
                <button type="button" onClick={() => setShowMediaSelector(!showMediaSelector)} className="bg-[#fafafa] border border-dashed border-[#1D1A39]/20 px-4 py-3 rounded-xl flex items-center gap-2 font-medium hover:bg-[#1D1A39]/5">
                  <ImageIcon className="w-5 h-5" /> Select from Media Manager
                </button>
              </div>
              
              {showMediaSelector && (
                <div className="mt-4 p-4 border rounded-xl bg-gray-50 grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                  {mediaList.map(m => (
                    <div key={m.id} onClick={() => { setImageUrl(m.url); setShowMediaSelector(false); }} className="cursor-pointer hover:ring-2 hover:ring-[#F59F59] rounded-lg overflow-hidden h-24 bg-white flex items-center justify-center">
                       <img src={m.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {mediaList.length === 0 && <p className="col-span-4 text-sm text-gray-500">No media found. Upload in Media Manager first.</p>}
                </div>
              )}
            </div>

            <button type="submit" disabled={!imageUrl} className="bg-[#F59F59] px-8 py-3 rounded-xl font-bold text-white disabled:opacity-50">Save Podcast</button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {podcasts.map(pod => (
            <div key={pod.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#1D1A39]/10 relative">
              <img src={pod.imageUrl} className="w-full h-40 object-cover rounded-xl mb-4" />
              <h3 className="font-bold mb-2 truncate">{pod.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(pod)} className="flex-1 bg-gray-100 py-1 rounded-lg text-sm font-bold">Edit</button>
                <button onClick={() => handleDelete(pod.id)} className="bg-red-50 text-red-500 py-1 px-3 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
