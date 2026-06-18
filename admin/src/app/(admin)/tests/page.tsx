"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function ManageTests() {
  const [tests, setTests] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [questions, setQuestions] = useState('100');
  const [duration, setDuration] = useState('120 Min');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('Free');

  const fetchTests = async () => {
    try { setTests(await apiClient.get('tests')); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchTests(); }, []);

  const resetForm = () => {
    setTitle(''); setDifficulty('Moderate'); setQuestions('100');
    setDuration('120 Min'); setDetails(''); setPrice('Free');
    setEditingId(null); setIsFormOpen(false);
  };

  const handleEdit = (test: any) => {
    setTitle(test.title); setDifficulty(test.difficulty); setQuestions(test.questions.toString());
    setDuration(test.duration); setDetails(test.details); setPrice(test.price);
    setEditingId(test.id); setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      await apiClient.delete('tests', id);
      fetchTests();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, difficulty, questions: parseInt(questions), duration, details, price };
    try {
      if (editingId) await apiClient.put('tests', editingId, data);
      else await apiClient.post('tests', data);
      resetForm(); fetchTests();
    } catch (err) { alert("Failed to save test"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1A39]">Manage Mock Tests</h1>
          <p className="text-[#1D1A39]/60 font-medium">Add or edit mock tests.</p>
        </div>
        <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Test
        </button>
      </div>

      {isFormOpen ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#1D1A39]/10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{editingId ? 'Edit Test' : 'Create Test'}</h2>
            <button onClick={resetForm}><X className="w-6 h-6"/></button>
          </div>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block font-bold mb-2">Title</label><input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Difficulty</label><input required value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Questions count</label><input required type="number" value={questions} onChange={e => setQuestions(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Duration (e.g. 120 Min)</label><input required value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold mb-2">Price</label><input required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3" /></div>
            </div>
            <div>
              <label className="block font-bold mb-2">Details</label>
              <textarea required value={details} onChange={e => setDetails(e.target.value)} className="w-full bg-[#fafafa] border rounded-xl px-4 py-3 h-24" />
            </div>
            <button type="submit" className="bg-[#F59F59] px-8 py-3 rounded-xl font-bold text-white">Save Test</button>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tests.map(test => (
            <div key={test.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#1D1A39]/10 relative">
              <h3 className="font-bold text-xl mb-2">{test.title}</h3>
              <p className="text-gray-500 mb-6">{test.difficulty} • {test.questions} Q • {test.duration}</p>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(test)} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold">Edit</button>
                <button onClick={() => handleDelete(test.id)} className="bg-red-50 text-red-500 p-2 rounded-lg">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
