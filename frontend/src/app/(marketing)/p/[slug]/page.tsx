import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { CustomMarkdown } from '@/components/CustomMarkdown';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPublishedPage(slug: string) {
  try {
    // Use Admin SDK (bypasses Firestore rules) instead of REST API
    const snapshot = await adminDb
      .collection('pages')
      .where('slug', '==', slug)
      .where('published', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || '',
      slug: data.slug || '',
      content: data.content || '',
      published: data.published ?? false,
      createdAt: data.createdAt || '',
    };
  } catch (err) {
    console.error('Failed to fetch custom page:', err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<import('next').Metadata> {
  const resolvedParams = await params;
  const customPage = await getPublishedPage(resolvedParams.slug);

  if (!customPage) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: customPage.title,
    description: customPage.content ? customPage.content.substring(0, 160).replace(/[#*_]/g, '') : '',
  };
}

export default async function CustomDynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const customPage = await getPublishedPage(slug);

  if (!customPage) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-40 pb-20 max-w-4xl mx-auto px-6 relative z-10 text-left">
      {/* Return to Landing Page */}
      <Link 
        href="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-amber hover:text-peach transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <article className="space-y-8 bg-[#1D1A39]/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-md">
        {/* Page Header */}
        <div className="space-y-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber uppercase tracking-widest">
            <FileText className="w-4 h-4" />
            Custom Page Route
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-display text-white leading-tight">
            {customPage.title}
          </h1>
        </div>

        {/* Page Content Body */}
        <div className="text-white/80 font-medium leading-relaxed text-base font-sans max-w-none">
          {customPage.content ? (
            <CustomMarkdown content={customPage.content} />
          ) : (
            <p className="text-white/40 italic">This page has no content yet.</p>
          )}
        </div>
      </article>
    </div>
  );
}
