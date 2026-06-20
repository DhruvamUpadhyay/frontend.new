import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';
import { CustomMarkdown } from '@/components/CustomMarkdown';

export const dynamic = 'force-dynamic';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

async function getPageBySlug(slug: string) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'pages' }],
          where: {
            compositeFilter: {
              op: 'AND',
              filters: [
                { fieldFilter: { field: { fieldPath: 'slug' }, op: 'EQUAL', value: { stringValue: slug } } },
                { fieldFilter: { field: { fieldPath: 'published' }, op: 'EQUAL', value: { booleanValue: true } } }
              ]
            }
          },
          limit: 1
        }
      }),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data?.[0]?.document;
    if (!doc) return null;
    const fields = doc.fields || {};
    return {
      title: fields.title?.stringValue || '',
      content: fields.content?.stringValue || ''
    };
  } catch {
    return null;
  }
}

export default async function NotFound() {
  const customPage = await getPageBySlug('404');

  if (customPage) {
    return (
      <div className="min-h-screen pt-40 pb-20 max-w-4xl mx-auto px-6 relative z-10 text-left">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-amber hover:text-peach transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <article className="space-y-8 bg-[#1D1A39]/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-md">
          <div className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs font-extrabold text-amber uppercase tracking-widest">
              <SearchX className="w-4 h-4" />
              404 — Page Not Found
            </div>
            <h1 className="text-3xl md:text-5xl font-bold font-display text-white leading-tight">{customPage.title}</h1>
          </div>
          <div className="text-white/80 font-medium leading-relaxed text-base font-sans max-w-none">
            <CustomMarkdown content={customPage.content} />
          </div>
        </article>
      </div>
    );
  }

  // Default 404
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F59F59] rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E8BCB9] rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
      <div className="relative z-10 glass-card p-12 rounded-3xl max-w-2xl w-full flex flex-col items-center border border-white/10 shadow-2xl">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-inner border border-white/10">
          <SearchX className="w-12 h-12 text-[#F59F59]" />
        </div>
        <h1 className="font-display text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#F59F59] to-[#E8BCB9]">404</h1>
        <h2 className="text-3xl font-bold text-white mb-6">Page Not Found</h2>
        <p className="text-white/70 text-lg mb-10 max-w-md leading-relaxed font-medium">
          The page you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <Link href="/" className="group relative px-8 py-4 rounded-full bg-gradient-to-r from-[#F59F59] to-[#E8BCB9] text-[#1D1A39] font-bold overflow-hidden shadow-[0_0_20px_rgba(245,159,89,0.2)] hover:shadow-[0_0_30px_rgba(245,159,89,0.4)] transition-all flex items-center justify-center gap-2 w-full sm:w-auto">
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Return to Homepage
          </span>
        </Link>
      </div>
    </div>
  );
}
