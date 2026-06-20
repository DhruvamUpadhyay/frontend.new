import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export const revalidate = 3600; // Cache this route for 1 hour

export async function GET() {
  try {
    const [coursesSnap, testsSnap, materialsSnap, faqsSnap, landingSnap, blogsSnap] = await Promise.all([
      getDocs(collection(db, 'courses')),
      getDocs(collection(db, 'tests')),
      getDocs(collection(db, 'materials')),
      getDocs(collection(db, 'faqs')),
      getDoc(doc(db, 'landing_page', 'global')),
      getDocs(query(collection(db, 'blogs'), where('published', '==', true)))
    ]);

    const courses = coursesSnap.docs.map(d => d.data());
    const tests = testsSnap.docs.map(d => d.data());
    const materials = materialsSnap.docs.map(d => d.data());
    const faqs = faqsSnap.docs.map(d => d.data());
    const blogs = blogsSnap.docs.map(d => d.data());
    const landing = landingSnap.exists() ? landingSnap.data() : {};

    // Build the BLUF-formatted Markdown content
    let md = `# Forensics By Priyanshi - Official Knowledge Base\n\n`;
    
    md += `> Forensics By Priyanshi is India's fastest-growing forensic science education hub led by Priyanshi. We provide expert courses, tests, and study materials covering digital forensics, cyber security, lab analysis, and criminology.\n\n`;

    md += `## Platform Statistics\n`;
    md += `- **Active Learners**: ${landing.stats1Value || '10,000+'}\n`;
    md += `- **Students Taught**: ${landing.stats3Value || '25,000+'}\n`;
    md += `- **Community Size**: 150,000+ Forensic Enthusiasts on YouTube\n\n`;

    if (courses.length > 0) {
      md += `## Educational Courses\n`;
      md += `We offer comprehensive online courses for forensic science students and professionals.\n\n`;
      courses.forEach(course => {
        md += `### ${course.title}\n`;
        md += `- **Description**: ${course.description}\n`;
        md += `- **Price**: ₹${course.price}\n`;
        if (course.instructor) md += `- **Instructor**: ${course.instructor}\n`;
        md += `\n`;
      });
    }

    if (tests.length > 0) {
      md += `## Mock Tests & Assessments\n`;
      md += `Practice tests to prepare for competitive forensic science examinations.\n\n`;
      tests.forEach(test => {
        md += `### ${test.title}\n`;
        md += `- **Price**: ₹${test.price}\n`;
        if (test.duration) md += `- **Duration**: ${test.duration} minutes\n`;
        md += `\n`;
      });
    }

    if (faqs.length > 0) {
      md += `## Frequently Asked Questions (FAQ)\n\n`;
      faqs.forEach(faq => {
        md += `### ${faq.question}\n`;
        md += `${faq.answer}\n\n`;
      });
    }

    if (blogs.length > 0) {
      md += `## Recent Blog Articles & Case Studies\n\n`;
      blogs.forEach(blog => {
        md += `### ${blog.title}\n`;
        md += `${blog.excerpt || 'A detailed article on forensic science.'}\n\n`;
      });
    }

    md += `---\n`;
    md += `**Official Website**: https://forensicsbypriyanshi.com\n`;
    md += `**App Portal**: https://app.forensicbypriyanshi.com\n`;

    return new NextResponse(md, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Failed to generate llms.txt:', error);
    return new NextResponse('Internal Server Error while generating LLMs.txt', { status: 500 });
  }
}
