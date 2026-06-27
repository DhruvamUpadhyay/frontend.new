"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/client';
import { Users, Plus, Trash2, Loader2, ShieldAlert, Mail, Key, User as UserIcon, Edit3 } from 'lucide-react';
import { auth } from '@/config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function TeamManager() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  // New admin fields
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Editor');

  // Edit admin fields
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('Editor');
  const [editError, setEditError] = useState('');
  const [resetStatus, setResetStatus] = useState('');

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/team');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch team members');
      setAdmins(data);
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail || !newPassword || newPassword.length < 6) {
      setError('Please provide a valid email and a password of at least 6 characters.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');

      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: newEmail.toLowerCase().trim(),
          password: newPassword,
          name: newName,
          role: newRole,
          adminEmail: currentUser.email
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add team member');
      }

      setIsModalOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      setNewRole('Editor');
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to add team member.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (emailId: string) => {
    if (confirm(`Are you sure you want to revoke access for ${emailId}? They will instantly lose access to the admin panel.`)) {
      try {
        const currentUser = auth.currentUser;
        const response = await fetch(`/api/team?email=${encodeURIComponent(emailId)}&adminEmail=${encodeURIComponent(currentUser?.email || '')}`, {
          method: 'DELETE'
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        
        fetchAdmins();
      } catch (err: any) {
        alert(err.message || 'Failed to revoke access.');
      }
    }
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmail || !editName || !editRole) {
      setEditError('Please fill in all fields.');
      return;
    }
    setSaving(true);
    setEditError('');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');

      const response = await fetch('/api/team', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldEmail: editingAdmin.email || editingAdmin.id,
          newEmail: editEmail.toLowerCase().trim(),
          name: editName,
          role: editRole,
          adminEmail: currentUser.email
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update team member');
      }

      setIsEditModalOpen(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update team member.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendResetEmail = async (email: string) => {
    setResetStatus('sending');
    try {
      await sendPasswordResetEmail(auth, email);
      setResetStatus('sent');
      setTimeout(() => setResetStatus(''), 4000);
    } catch (err: any) {
      console.error(err);
      setResetStatus('error');
      setEditError(err.message || 'Failed to send password reset email.');
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59F59]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1A39] font-display flex items-center gap-3">
            <Users className="w-8 h-8 text-[#F59F59]" />
            Team Management
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage authorized staff who can log into this Admin Panel.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1D1A39] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1D1A39]/90 transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" /> Add Team Member
        </button>
      </div>

      {/* ADMIN LIST */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#1D1A39]">Authorized Administrators</h2>
          <span className="bg-[#F59F59]/20 text-[#D97706] px-3 py-1 rounded-full text-xs font-bold">
            {admins.length} Active
          </span>
        </div>
        
        <div className="divide-y divide-gray-50">
          {/* Dynamic Admins */}
          {admins.map((admin) => (
            <div key={admin.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1D1A39] text-lg flex items-center gap-2">
                    {admin.name || 'Unnamed User'}
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider">{admin.role || 'Admin'}</span>
                  </h3>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-gray-500 font-mono flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {admin.id}
                    </p>
                    {admin.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Added on {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingAdmin(admin);
                    setEditEmail(admin.email || admin.id);
                    setEditName(admin.name || '');
                    setEditRole(admin.role || 'Editor');
                    setEditError('');
                    setResetStatus('');
                    setIsEditModalOpen(true);
                  }}
                  className="text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 border border-gray-200"
                >
                  <Edit3 className="w-4 h-4 text-[#F59F59]" /> Edit
                </button>
                <button
                  onClick={() => handleRevoke(admin.id)}
                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Revoke Access
                </button>
              </div>
            </div>
          ))}

          {admins.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400 font-medium">No additional team members have been added yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ADD ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1D1A39] mb-2 font-display">Add Team Member</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">They will log in securely using their Email and Password.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1D1A39] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#1D1A39]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#F59F59] font-mono text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#1D1A39] mb-1">Temporary Password</label>
                <div className="relative">
                  <Key className="w-5 h-5 text-[#1D1A39]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#F59F59] font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1D1A39] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#F59F59] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1D1A39] mb-1">Role Designation</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#F59F59] text-sm cursor-pointer"
                >
                  <option value="Editor">Editor (Blogs & Content)</option>
                  <option value="Manager">Manager (Courses & Tests)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-[#F59F59] hover:bg-[#e68d48] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {isEditModalOpen && editingAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-[#1D1A39] mb-2 font-display">Edit Team Member</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Update their profile details or trigger a secure password reset email.</p>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {editError}
              </div>
            )}

            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1D1A39] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#1D1A39]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="member@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#F59F59] font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1D1A39] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#F59F59] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1D1A39] mb-1">Role Designation</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:outline-none focus:border-[#F59F59] text-sm cursor-pointer"
                >
                  <option value="Editor">Editor (Blogs & Content)</option>
                  <option value="Manager">Manager (Courses & Tests)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSendResetEmail(editingAdmin.email || editingAdmin.id)}
                  disabled={resetStatus === 'sending'}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-[#1D1A39] font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 border border-gray-200"
                >
                  <Key className="w-4 h-4 text-[#F59F59]" />
                  {resetStatus === 'sending' ? 'Sending Reset Email...' : 
                   resetStatus === 'sent' ? '✓ Password Reset Email Sent!' :
                   resetStatus === 'error' ? '⚠ Failed to send email' :
                   'Send Password Reset Email'}
                </button>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingAdmin(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-[#F59F59] hover:bg-[#e68d48] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
