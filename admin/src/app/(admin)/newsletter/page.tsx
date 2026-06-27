"use client";
import { useState, useEffect } from 'react';
import { Mail, Loader2, Download } from 'lucide-react';
import { db } from '@/config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscribers = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'newsletter'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubscribers(data);
    } catch (err: any) {
      setError('Failed to fetch subscribers: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const downloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Subscribed At\n"
      + subscribers.map(s => `${s.email},${s.timestamp?.toDate ? s.timestamp.toDate().toLocaleString() : s.timestamp || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "newsletter_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#F59F59]" /></div>;
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#1D1A39]/10 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#1D1A39] mb-2 font-display flex items-center gap-2">
            <Mail className="w-8 h-8 text-[#F59F59]" />
            Newsletter Subscribers
          </h1>
          <p className="text-gray-500 font-medium">View and export your newsletter subscribers.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 p-4 rounded-xl text-sm font-bold">
          {error}
        </div>
      )}

      {/* SUBSCRIBERS LIST */}
      <div className="bg-white rounded-2xl border border-[#1D1A39]/10 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#1D1A39]/10 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1D1A39] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#F59F59]" />
            Active Subscribers ({subscribers.length})
          </h2>
          {subscribers.length > 0 && (
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#1D1A39]/10 rounded-xl font-bold text-xs text-[#1D1A39] hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-[#F59F59]" />
              Export CSV
            </button>
          )}
        </div>
        <div className="divide-y divide-[#1D1A39]/5">
          {subscribers.length === 0 ? (
            <div className="p-12 text-center text-[#1D1A39]/50">No subscribers yet.</div>
          ) : (
            subscribers.map((sub) => (
              <div key={sub.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#451952]/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#451952]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1D1A39]">{sub.email}</h3>
                    <p className="text-sm text-[#1D1A39]/60">
                      {sub.timestamp?.toDate ? sub.timestamp.toDate().toLocaleString() : sub.timestamp || 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
