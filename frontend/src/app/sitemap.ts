import { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase-admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://forensicsbypriyanshi.com';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // ── Static Pages ──
  entries.push(
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/blogs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  );

  // ── Dynamic Blog Posts ──
  try {
    const blogsSnap = await adminDb.collection('blogs').orderBy('createdAt', 'desc').limit(200).get();
    blogsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.published !== false) {
        entries.push({
          url: `${SITE_URL}/blogs/${data.slug || doc.id}`,
          lastModified: data.updatedAt ? new Date(data.updatedAt) : new Date(data.createdAt || Date.now()),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    });
  } catch (err) {
    console.error('Sitemap: failed to fetch blogs', err);
  }

  // ── Dynamic Custom Pages ──
  try {
    const pagesSnap = await adminDb.collection('pages').where('published', '==', true).limit(100).get();
    pagesSnap.docs.forEach((doc) => {
      const data = doc.data();
      entries.push({
        url: `${SITE_URL}/p/${data.slug}`,
        lastModified: data.updatedAt ? new Date(data.updatedAt) : new Date(data.createdAt || Date.now()),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    });
  } catch (err) {
    console.error('Sitemap: failed to fetch pages', err);
  }

  return entries;
}
