"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ManageEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Free Webinar');
  const [time, setTime] = useState('6:00 PM IST');

  const fetchEvents = async () => {
    try {
      setEvents(await apiClient.get('events'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const resetForm = () => {
    setTitle(''); setDate(''); setType('Free Webinar'); setTime('6:00 PM IST');
    setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (event: any) => {
    setTitle(event.title); setDate(event.date); setType(event.type); setTime(event.time);
    setEditingId(event.id); setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await apiClient.delete('events', id);
      fetchEvents();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, date, type, time };
    try {
      if (editingId) await apiClient.put('events', editingId, data);
      else await apiClient.post('events', data);
      resetForm(); fetchEvents();
    } catch (err) { alert("Failed to save event"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39]">Manage Events</h1>
          <p className="text-[#1D1A39]/60 font-medium">Add, edit, or remove upcoming live events.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Event
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Event' : 'Create Event'}</h2>
            <button onClick={resetForm}><X className="w-6 h-6"/></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block font-bold mb-2">Event Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Date (e.g. Oct 15)</label><input required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Time (e.g. 6:00 PM IST)</label><input required value={time} onChange={e => setTime(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Type</label><input required value={type} onChange={e => setType(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
            </div>
            <button type="submit" className="bg-[#F59F59] px-8 py-3 rounded-xl font-bold text-white">Save Event</button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#1D1A39]/10 relative">
              <span className="absolute top-4 right-4 bg-[#1D1A39]/5 text-xs font-bold px-3 py-1 rounded-full">{event.type}</span>
              <h3 className="font-bold text-xl mb-2 pr-20">{event.title}</h3>
              <p className="text-gray-500 mb-6">{event.date} • {event.time}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(event)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold">Edit</button>
                <button onClick={() => handleDelete(event.id)} className="bg-red-50 text-red-500 p-2 rounded-lg">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
