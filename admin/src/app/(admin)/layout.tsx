"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
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
  Mail
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Tests', path: '/tests', icon: TestTube2 },
    { name: 'Materials', path: '/materials', icon: FileText },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Podcasts', path: '/podcasts', icon: Mic },
    { name: 'Newsletter', path: '/newsletter', icon: Mail },
    { name: 'Media Manager', path: '/media', icon: ImageIcon },
    { name: 'Landing Page', path: '/landing', icon: LayoutDashboard },
    { name: 'Theme Settings', path: '/settings', icon: Paintbrush },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1D1A39] text-white flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#F59F59] rounded-lg flex items-center justify-center">
              <span className="font-bold text-[#1D1A39] text-lg leading-none">P</span>
            </div>
            <span className="font-bold text-xl tracking-wider">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/' && pathname?.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                href={item.path}
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

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
