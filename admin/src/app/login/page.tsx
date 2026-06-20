"use client";
import React, { useState, useEffect } from 'react';
import { auth, db } from '@/config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';

import { useRouter } from 'next/navigation';
import { Lock, Phone, Key } from 'lucide-react';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default function AdminLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Auto format Indian numbers if +91 is not provided
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Ensure the number format is correct.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    
    setError('');
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      // Audit log: track admin logins
      try {
        await addDoc(collection(db, 'system_logs'), {
          action: 'ADMIN_LOGIN',
          adminEmail: result.user?.phoneNumber || 'unknown',
          collectionName: '',
          docId: '',
          timestamp: new Date().toISOString(),
          details: { method: 'phone_otp' },
        });
      } catch { /* non-critical */ }
      router.push('/');
    } catch (err: any) {
      setError('Invalid OTP code. Please try again.');
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
        <p className="text-[#1D1A39]/60 font-medium mb-8">Secure login via Mobile OTP</p>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6">
            {error}
          </div>
        )}

        {!confirmationResult ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1D1A39] mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-[#1D1A39]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] transition-colors font-medium text-[#1D1A39]"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1D1A39] text-white rounded-xl font-bold hover:bg-[#1D1A39]/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            <div id="recaptcha-container"></div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#1D1A39] mb-2">Enter OTP</label>
              <div className="relative">
                <Key className="w-5 h-5 text-[#1D1A39]/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#fafafa] border border-[#1D1A39]/10 rounded-xl focus:outline-none focus:border-[#F59F59] transition-colors font-medium text-[#1D1A39] tracking-widest text-lg"
                  placeholder="123456"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_20px_rgba(245,159,89,0.2)]"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => { setConfirmationResult(null); setOtp(''); }}
              className="w-full py-2 text-sm text-[#1D1A39]/50 font-bold hover:text-[#1D1A39]"
            >
              Use a different number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
