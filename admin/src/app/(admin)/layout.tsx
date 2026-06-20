"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  BookOpen, 
  TestTube2, 
  FileText, 
  Calendar,
  LogOut,
  Image as ImageIcon,
  Mic,
  Paintbrush,
  Mail,
  Menu,
  X,
  History,
  ScrollText,
  Globe
} from 'lucide-react';

import { doc, getDoc } from 'firebase/firestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close on mobile screens on mount
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        const phone = user.phoneNumber;
        const adminPhone = process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER || '+919274173384';
        
        // 1. Primary admin check bypass
        if (phone === adminPhone) {
          return;
        }

        // 2. Admins collection check
        if (phone) {
          try {
            const adminDoc = await getDoc(doc(db, 'admins', phone));
            if (adminDoc.exists()) {
              return; // Authorized admin
            }
          } catch (err) {
            console.error('Failed to check admin authorization collection:', err);
          }
        }

        // Not authorized, sign out
        alert('Unauthorized access: You do not have administrator permissions.');
        await signOut(auth);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    // Audit log: track admin logouts
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'system_logs'), {
        action: 'ADMIN_LOGOUT',
        adminEmail: user?.email || user?.phoneNumber || 'unknown',
        collectionName: '',
        docId: '',
        timestamp: new Date().toISOString(),
        details: {},
      });
    } catch { /* non-critical */ }
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { name: 'Homepage Editor', path: '/', icon: LayoutDashboard },
    { name: 'Blog Manager', path: '/blogs', icon: BookOpen },
    { name: 'Page Manager', path: '/pages', icon: FileText },
    { name: 'Newsletter Emails', path: '/newsletter', icon: Mail },
    { name: 'Media Manager', path: '/media', icon: ImageIcon },
    { name: 'System Settings', path: '/settings', icon: Paintbrush },
    { name: 'Visitor Analytics', path: '/visitors', icon: Globe },
    { name: 'Audit Logs', path: '/logs', icon: ScrollText },
    { name: 'System Version', path: '/version', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row relative">
      {/* Mobile Header Top-Bar */}
      <header className="lg:hidden bg-[#1D1A39] text-white p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-30 shadow-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F59F59] rounded-lg flex items-center justify-center">
            <span className="font-bold text-[#1D1A39] text-lg leading-none">P</span>
          </div>
          <span className="font-bold text-lg tracking-wider">Admin</span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white/80 hover:text-white focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Overlay Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`w-64 bg-[#1D1A39] text-white flex flex-col fixed h-full z-50 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2" onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}>
            <div className="w-8 h-8 bg-[#F59F59] rounded-lg flex items-center justify-center">
              <span className="font-bold text-[#1D1A39] text-lg leading-none">P</span>
            </div>
            <span className="font-bold text-xl tracking-wider text-white">Admin</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="text-white/60 hover:text-white transition-colors" title="Collapse Sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#F59F59] text-[#1D1A39] font-bold' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Floating Toggle Button for Desktop (visible when sidebar is closed) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="hidden lg:flex fixed top-6 left-6 z-40 bg-[#1D1A39] text-white p-3 rounded-xl border border-white/10 shadow-lg hover:bg-[#F59F59] hover:text-[#1D1A39] transition-all duration-300 animate-hover-scale"
          title="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Content Area */}
      <main className={`flex-grow p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
      }`}>
        {children}
      </main>
    </div>
  );
}
