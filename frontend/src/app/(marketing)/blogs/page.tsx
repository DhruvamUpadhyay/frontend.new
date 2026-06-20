import { db } from '@/config/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { FileText, Calendar, Search } from 'lucide-react';
import BlogsClient from './BlogsClient';

export const revalidate = 3600; // Fallback ISR — admin changes trigger instant on-demand revalidation

export default async function BlogsPage() {
  let blogs: any[] = [];
  
  try {
    const q = query(
      collection(db, 'blogs'),
      where('published', '==', true)
    );
    const snapshot = await getDocs(q);
    blogs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort manually by date in case orderBy index requires creation
    blogs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.error("Failed to fetch blog posts:", error);
  }

  return (
    <div className="min-h-screen pt-40 pb-20 max-w-6xl mx-auto px-6 relative z-10">
      {/* Dynamic Client wrapper for live search */}
      <BlogsClient initialBlogs={blogs} />
    </div>
  );
}
