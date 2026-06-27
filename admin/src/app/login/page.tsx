"use client";
import React, { useState } from 'react';
import { auth, db } from '@/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

import { useRouter } from 'next/navigation';
import { Lock, Mail, Key } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Audit log: track admin logins
      try {
        await addDoc(collection(db, 'system_logs'), {
          action: 'ADMIN_LOGIN',
          adminEmail: result.user?.email || 'unknown',
          collectionName: '',
          docId: '',
          timestamp: new Date().toISOString(),
          details: { method: 'email_password' },
        });
      } catch { /* non-critical */ }
      router.push('/');
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-xl border border-[#1D1A39]/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F59F59] to-[#E8BCB9]"></div>
        
        <div className="w-16 h-16 rounded-2xl bg-[#1D1A39]/5 flex items-center justify-center mb-8">
          <Lock className="w-8 h-8 text-[#1D1A39]" />
        </div>
        
        <h2 className="font-display text-3xl font-bold text-[#1D1A39] mb-2">Admin Portal</h2>
        <p className="text-[#1D1A39]/60 font-medium mb-8">Secure login via Email & Password</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#1D1A39] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-[#1D1A39]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] transition-colors font-medium text-[#1D1A39]"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1D1A39] mb-2">Password</label>
            <div className="relative">
              <Key className="w-5 h-5 text-[#1D1A39]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] transition-colors font-medium text-[#1D1A39]"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_20px_rgba(245,159,89,0.2)]"
          >
            {loading ? 'Authenticating...' : 'Login securely'}
          </button>
        </form>
        
      </div>
    </div>
  );
};
