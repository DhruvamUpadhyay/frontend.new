import { db } from '@/config/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import type { Metadata } from 'next';
import { CustomMarkdown } from '@/components/CustomMarkdown';
import { TableOfContents } from '@/components/TableOfContents';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic Metadata Generation for SEO ranking
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  let blogPost: any = null;

  try {
    const q = query(
      collection(db, 'blogs'),
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      blogPost = snapshot.docs[0].data();
    }
  } catch (error) {
    console.error("Error generating metadata for blog:", error);
  }

  if (!blogPost) {
    return {
      title: 'Case Study Not Found — Forensics By Priyanshi',
    };
  }

  const title = blogPost.title;
  const description = blogPost.excerpt || `${blogPost.title}. Access expert forensic science studies, preparation guides, and academic insights from Priyanshi Jain.`;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://forensicsbypriyanshi.com';
  const canonicalUrl = `${SITE_URL}/blogs/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      images: blogPost.coverImage ? [{ url: blogPost.coverImage }] : [],
      publishedTime: blogPost.createdAt || new Date().toISOString(),
      authors: ['Priyanshi Jain'],
      section: 'Forensic Science',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: blogPost.coverImage ? [blogPost.coverImage] : [],
    },
  };
}

export const revalidate = 3600; // Fallback ISR — admin changes trigger instant on-demand revalidation

export default async function BlogDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  let blogPost: any = null;

  try {
    const q = query(
      collection(db, 'blogs'),
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      blogPost = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
    }
  } catch (error) {
    console.error("Failed to fetch blog post details:", error);
  }

  if (!blogPost) {
    notFound(); // Redirects to custom 404 page automatically!
  }

  // Schema.org BlogPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blogPost.title,
    "image": blogPost.coverImage ? [blogPost.coverImage] : [],
    "datePublished": blogPost.createdAt || new Date().toISOString(),
    "dateModified": blogPost.updatedAt || blogPost.createdAt || new Date().toISOString(),
    "author": [{
      "@type": "Person",
      "name": "Priyanshi Jain",
      "jobTitle": "Forensic Science Expert & Educator",
      "url": "https://forensicsbypriyanshi.com"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Forensics By Priyanshi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://forensicsbypriyanshi.com/favicon.svg"
      }
    },
    "description": blogPost.excerpt || `${blogPost.title}. Learn forensic science case studies and preparation tips.`
  };

  // Extract headings for Table of Contents
  const extractHeadings = (markdown: string) => {
    if (!markdown) return [];
    const headings: { level: number, text: string, id: string }[] = [];
    const lines = markdown.split('\n');
    for (const line of lines) {
      const match = line.match(/^(##|###)\s+(.*)/);
      if (match) {
        headings.push({
          level: match[1] === '##' ? 2 : 3,
          text: match[2],
          id: match[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        });
      }
    }
    return headings;
  };

  const toc = extractHeadings(blogPost.content || '');

  return (
    <div className="min-h-screen pt-40 pb-20 max-w-7xl mx-auto px-6 relative z-10 text-left">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back to Headquarters Button */}
      <Link 
        href="/blogs"
        className="inline-flex items-center gap-2 text-sm font-bold text-amber hover:text-peach transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Case Studies
      </Link>

      <div className="flex flex-col xl:flex-row gap-12 items-start">
        <article className="space-y-8 flex-1 w-full max-w-4xl">
          {/* Cover Image */}
          {blogPost.coverImage && (
            <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-white/5 border border-white/10">
              <img 
                src={blogPost.coverImage} 
                alt={blogPost.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Meta Header */}
          <div className="space-y-4">
            <span className="text-xs font-extrabold text-amber uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {blogPost.createdAt ? new Date(blogPost.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Recent Case'}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white leading-tight">
              {blogPost.title}
            </h1>
            {blogPost.excerpt && (
              <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-amber pl-6 py-1">
                "{blogPost.excerpt}"
              </p>
            )}
          </div>

          {/* Content Body */}
          <div className="border-t border-white/10 pt-8">
            {blogPost.content ? (
              <CustomMarkdown content={blogPost.content} />
            ) : (
              <p className="text-white/40 italic">This case study has no content.</p>
            )}
          </div>
        </article>

        {/* Sticky Table of Contents Sidebar */}
        <TableOfContents toc={toc} />
      </div>
    </div>
  );
}
