import { db } from '@/config/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import LandingPageClient from './LandingPageClient';

// This is a Next.js Server Component!
// It runs ONLY on the server, ensuring API keys are never leaked to the browser.
// It fetches data and pre-renders the HTML for perfect SEO.

// Revalidate every hour as fallback — admin changes trigger on-demand revalidation instantly
export const revalidate = 3600;

async function fetchYouTubeLatestVideos() {
  try {
    const res = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UChEEVWdMA0N0XUqBad-OCkA', {
      next: { revalidate: 3600 }
    });
    const xml = await res.text();
    const allVideos = [];
    const entries = xml.split('<entry>').slice(1);
    
    for (const entry of entries.slice(0, 10)) {
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const linkMatch = entry.match(/<link rel="alternate" href="(.*?)"\/>/);
      const idMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      
      if (titleMatch && linkMatch && idMatch) {
        allVideos.push({
          title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
          url: linkMatch[1],
          thumbnail: `https://img.youtube.com/vi/${idMatch[1]}/maxresdefault.jpg`,
          id: idMatch[1]
        });
      }
    }
    
    // Filter out shorts by checking the /shorts/ endpoint (200 = Short, 303 = Long Video redirect)
    const longCheck = await Promise.all(
      allVideos.map(async (vid) => {
        try {
          const res = await fetch(`https://www.youtube.com/shorts/${vid.id}`, { 
            method: 'HEAD', 
            redirect: 'manual' 
          });
          return res.status !== 200;
        } catch {
          return true; // Default to assuming it's a long video if network fails
        }
      })
    );

    return allVideos.filter((_, i) => longCheck[i]).slice(0, 3);
  } catch (error) {
    console.error('Failed to fetch YouTube latest videos:', error);
    return [];
  }
}

export default async function LandingPage() {
  // Fetch initial data for all components
  let courses: any[] = [];
  let podcasts: any[] = [];
  let tests: any[] = [];
  let materials: any[] = [];
  let testimonials: any[] = [];
  let faqs: any[] = [];
  let blogs: any[] = [];
  let landingPageData: any = null;
  let youtubeVideos: any[] = [];

  try {
    // Parallel fetching for performance
    const [coursesSnap, podcastsSnap, testsSnap, materialsSnap, testimonialsSnap, faqsSnap, landingSnap, blogsSnap, ytVideos] = await Promise.all([
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'podcasts')),
      getDocs(collection(db, 'tests')),
      getDocs(collection(db, 'materials')),
      getDocs(collection(db, 'testimonials')),
      getDocs(collection(db, 'faqs')),
      getDoc(doc(db, 'landing_page', 'global')),
      getDocs(query(collection(db, 'blogs'), where('published', '==', true))),
      fetchYouTubeLatestVideos()
    ]);

    courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    podcasts = podcastsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    tests = testsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    materials = materialsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    testimonials = testimonialsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    faqs = faqsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    blogs = blogsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Sort blogs by createdAt descending
    blogs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    if (landingSnap.exists()) {
      landingPageData = { id: landingSnap.id, ...landingSnap.data() };
    }
    
    youtubeVideos = ytVideos;
  } catch (error) {
    console.error("Error fetching data for landing page:", error);
  }

  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  const coursesJsonLd = courses.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": courses.map((course: any, index: number) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://forensicsbypriyanshi.com'}/#courses`,
      "name": course.title
    }))
  } : null;

  return (
    <>
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      {coursesJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesJsonLd) }} />}
      <LandingPageClient 
        initialCourses={courses}
        initialPodcasts={podcasts}
        initialTests={tests}
        initialMaterials={materials}
        initialTestimonials={testimonials}
        initialFaqs={faqs}
        initialBlogs={blogs}
        landingPageData={landingPageData}
        latestYouTubeVideos={youtubeVideos}
      />
    </>
  );
}
