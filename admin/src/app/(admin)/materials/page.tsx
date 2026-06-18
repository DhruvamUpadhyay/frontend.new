"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function ManageMaterials() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('PDF Notes');
  const [size, setSize] = useState('2.4 MB');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState('BookOpen');

  const fetchMaterials = async () => {
    try { setMaterials(await apiClient.get('materials')); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const resetForm = () => {
    setTitle(''); setFormat('PDF Notes'); setSize('2.4 MB'); setDesc(''); setIcon('BookOpen');
    setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (material: any) => {
    setTitle(material.title); setFormat(material.format); setSize(material.size);
    setDesc(material.desc); setIcon(material.icon);
    setEditingId(material.id); setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      await apiClient.delete('materials', id);
      fetchMaterials();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, format, size, desc, icon };
    try {
      if (editingId) await apiClient.put('materials', editingId, data);
      else await apiClient.post('materials', data);
      resetForm(); fetchMaterials();
    } catch (err) { alert("Failed to save material"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39]">Manage Materials</h1>
          <p className="text-[#1D1A39]/60 font-medium">Add, edit, or remove free resources.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Material
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Material' : 'Create Material'}</h2>
            <button onClick={resetForm}><X className="w-6 h-6"/></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block font-bold mb-2">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Format</label><input required value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">File Size</label><input required value={size} onChange={e => setSize(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div>
                <label className="block font-bold mb-2">Icon</label>
                <select value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3">
                  <option value="BookOpen">BookOpen (Notes)</option>
                  <option value="Video">Video (Lectures)</option>
                  <option value="FileText">FileText (Documents)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold mb-2">Description</label>
              <textarea required value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3 h-24" />
            </div>
            <button type="submit" className="bg-[#F59F59] px-8 py-3 rounded-xl font-bold text-white">Save Material</button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {materials.map(material => (
            <div key={material.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#1D1A39]/10 relative">
              <h3 className="font-bold text-xl mb-2">{material.title}</h3>
              <p className="text-gray-500 mb-6">{material.format} • {material.size}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(material)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold">Edit</button>
                <button onClick={() => handleDelete(material.id)} className="bg-red-50 text-red-500 p-2 rounded-lg">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
