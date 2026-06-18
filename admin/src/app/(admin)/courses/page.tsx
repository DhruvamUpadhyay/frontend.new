"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';

export default function ManageCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [highlights, setHighlights] = useState(['', '', '']);
  const [benefits, setBenefits] = useState(['', '', '', '']);

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('courses');
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchMedia = async () => {
    try {
      const data = await apiClient.get('media');
      setMediaList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchMedia();
  }, []);

  const resetForm = () => {
    setTitle(''); setTag(''); setDuration(''); setPrice(''); setImageUrl('');
    setHighlights(['', '', '']); setBenefits(['', '', '', '']);
    setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (course: any) => {
    setTitle(course.title); setTag(course.tag); setDuration(course.duration);
    setPrice(course.price); setImageUrl(course.imageUrl || '');
    setHighlights(course.highlights || ['', '', '']);
    setBenefits(course.benefits || ['', '', '', '']);
    setEditingId(course.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await apiClient.delete('courses', id);
      fetchCourses();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title, tag, duration, price, imageUrl,
      highlights: highlights.filter(h => h.trim() !== ''),
      benefits: benefits.filter(b => b.trim() !== '')
    };

    try {
      if (editingId) await apiClient.put('courses', editingId, data);
      else await apiClient.post('courses', data);
      resetForm();
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert('Failed to save course.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39]">Manage Courses</h1>
          <p className="text-[#1D1A39]/60 font-medium">Create and update premium courses.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Course
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Course' : 'Create Course'}</h2>
            <button onClick={resetForm}><X className="w-6 h-6"/></button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block font-bold mb-2">Course Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Tag (e.g. Best Seller)</label><input value={tag} onChange={e => setTag(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Duration</label><input required value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Price</label><input required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
            </div>

            {/* Media Selector Field */}
            <div>
              <label className="block font-bold mb-2">Course Thumbnail (Optional)</label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold mb-2">Highlights (Front of card)</label>
                {highlights.map((h, i) => (
                  <input key={i} value={h} onChange={e => { const n = [...highlights]; n[i] = e.target.value; setHighlights(n); }} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3 mb-2" placeholder="e.g. 50+ Hours Content" />
                ))}
              </div>
              <div>
                <label className="block font-bold mb-2">Benefits (Back of card)</label>
                {benefits.map((b, i) => (
                  <input key={i} value={b} onChange={e => { const n = [...benefits]; n[i] = e.target.value; setBenefits(n); }} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3 mb-2" placeholder="e.g. 1-on-1 Mentorship included" />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="bg-[#F59F59] px-8 py-3 rounded-xl font-bold text-white">Save Course</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#1D1A39]/10">
              {course.imageUrl && <img src={course.imageUrl} className="w-full h-32 object-cover rounded-xl mb-4" />}
              <h3 className="font-bold text-xl mb-4">{course.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(course)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold">Edit</button>
                <button onClick={() => handleDelete(course.id)} className="bg-red-50 text-red-500 p-2 rounded-lg">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
