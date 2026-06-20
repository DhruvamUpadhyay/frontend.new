"use client";
import React, { useState } from 'react';
import { History, BookOpen, ChevronRight, Zap, Type, Palette, List, Code, Link2, Quote, Minus, CheckCircle, AlertCircle, Info } from 'lucide-react';

type TabType = 'releases' | 'guide';

const BADGE_COLORS: Record<string, string> = {
  'Major Update': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Minor Update': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Architecture': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Foundation': 'bg-green-50 text-green-700 border border-green-200',
};

const versions = [
  {
    version: "v5.0.0 (Current)",
    date: "June 2026",
    badge: "Major Update",
    changes: [
      "VAPT Security Hardening: Replaced namespace imports with modular firebase-admin imports to fix runtime compilation crashes; sanitized user markdown output to block XSS vulnerabilities (javascript: link sanitization); verified and protected Cloudinary signature endpoints with auth guards.",
      "Persistent Rate Limiter: Replaced volatile memory limits in newsletter API with robust, Firestore-backed persistent tracking.",
      "Strict Security Rules: Deployed schema-strict Firestore security rules, removing the wild catch-all rule and restricting field edits.",
      "Live Audit Logs: Integrated real-time tracking for database mutations (CREATE, UPDATE, DELETE) and admin authentication events with live 15s auto-refresh, play/pause controls, and search filtering.",
      "Live Visitor Analytics: Built an active geo-tracking script at /api/track (recording IP, page, referrer, screen dimensions, browser, OS, ISP, and country/city). Created a premium /visitors dashboard with live auto-refresh, device splits, and metric graphs.",
      "Production Essentials: Configured dynamic SEO sitemap.xml, robots.txt crawler guidelines, edge security headers middleware (CSP, HSTS, XSS protection), and PWA manifest.json."
    ]
  },
  {
    version: "v4.2.0",
    date: "June 2026",
    badge: "Major Update",
    changes: [
      "Page Manager CMS: Full CRUD interface for creating and publishing custom marketing pages at /p/[slug].",
      "CustomMarkdown Component: Built a shared markdown-to-React renderer supporting H1-H3, bold, italic, inline code, links, blockquotes, ordered/unordered lists, and fenced code blocks.",
      "Dynamic 404 & Error Pages: Both /not-found and error.tsx now fetch custom content from the 'pages' Firestore collection and render via CustomMarkdown. Falls back gracefully to polished default layouts.",
      "Firestore REST API for Server Components: Replaced Firebase client SDK in server components with direct Firestore REST API calls, fixing 'permission-denied' errors during SSR and build.",
      "Page Manager Table: System pages (Homepage, Blog Feed) and special CMS pages (404, error) shown alongside custom pages with distinct color-coded badges.",
      "Admin Creator Guide: Static, non-editable reference guide added to the System Version page under the 'Page Creator Guide' tab.",
      "Creator Guide content removed from public Firestore pages — only accessible to admins within the dashboard.",
    ]
  },
  {
    version: "v4.1.0",
    date: "June 2026",
    badge: "Major Update",
    changes: [
      "Visual Homepage Replica Editor: Redesigned admin dashboard into a real-time visual mock of the live site for intuitive section editing.",
      "Blog Engine CMS: Full blog CRUD with markdown support, draft/published toggle, cover image via Cloudinary, and slug auto-generation.",
      "Blog Carousel Section on Homepage: Sliding premium carousel with cover images, excerpts, dates, and links to /blogs/[slug].",
      "Dynamic Section Ordering: Admin can reorder homepage sections (Hero, Features, Testimonials, FAQs, Blogs etc.) using Up/Down controllers stored in Firestore.",
      "Testimonial Avatar Rendering: Testimonials show student avatar images if provided, falling back to initials.",
      "App Subdomain Redirects: Courses, Mock Tests, Study Notes, and Free Resources now redirect to app.forensicbypriyanshi.com/login.",
      "Podcast Carousel: Fetches podcast thumbnails and renders an auto-scrolling marquee on the homepage.",
      "Maintenance Mode & Announcements: System Settings page with global maintenance toggle and announcement banner management.",
      "Cloudinary Signature Fix: Dynamic folder parameter support for signatures, fixing 'Invalid Signature' errors in Media Manager and Blog Editor.",
      "Media Collection Sync: Enhanced Sync handler deletes stale Firestore media documents before re-importing live Cloudinary assets.",
    ]
  },
  {
    version: "v4.0.0",
    date: "June 2026",
    badge: "Major Update",
    changes: [
      "Blog Frontend Routes: /blogs listing page with server-fetched Firestore data and /blogs/[slug] dynamic detail page.",
      "Media Manager: Cloudinary API integration for secure image uploads with Firestore metadata sync.",
      "Media Rewrites Proxy: Next.js rewrites mapping /media/:path* to Cloudinary URLs to mask source domain.",
      "Newsletter Manager: Admin page for viewing collected email subscribers from the Firestore 'newsletter' collection.",
      "Navigation CMS: Admin module to manage public Navbar links stored in Firestore 'navigation' collection.",
      "Loading State Removal: Disabled skeleton loaders on marketing routes for instant page transitions.",
    ]
  },
  {
    version: "v3.2.0",
    date: "May 2026",
    badge: "Minor Update",
    changes: [
      "Alternating Features Section: Dynamic content fetched from Firestore 'landing_page' collection, rendered with alternating image/text layouts.",
      "YouTube Shorts Marquee: Server API route parses YouTube channel feed and serves latest Shorts; frontend renders an infinite auto-scrolling marquee.",
      "Events Section: Events fetched from Firestore and integrated into the YouTube marquee section for consolidated social proof.",
      "Testimonials Section: Dynamically fetched testimonials displayed in a premium card grid.",
      "FAQs Section: Accordion-style FAQ section driven by Firestore 'faqs' collection.",
      "Dynamic SEO: Page title and meta description fetched from Firestore on the server for each page, improving Google ranking.",
      "Firestore Long-Poll Fix: Added experimentalAutoDetectLongPolling to firebase.ts to resolve 10-second timeout errors.",
    ]
  },
  {
    version: "v2.0.0",
    date: "April 2026",
    badge: "Architecture",
    changes: [
      "Firebase Auth: Admin login/logout with Firebase Authentication, route protection via onAuthStateChanged.",
      "Firestore Collections Setup: Created and structured pages, blogs, navigation, landing_page, testimonials, faqs, media, newsletter, podcasts, settings, courses, tests, materials, pyq collections.",
      "Server Components Architecture: All public data fetched server-side so Firebase credentials are never exposed to the browser.",
      "Firestore Security Rules: Public read for CMS content collections; authenticated write; validated newsletter writes by email document ID.",
      "Cloudinary Proxy Rewrites: Next.js rewrite rule added to mask Cloudinary asset URLs under /media/.",
      "API Client: Centralized admin API client (apiClient) for all Firestore CRUD, Cloudinary signatures, and settings operations.",
      "Admin Sidebar Layout: Responsive collapsible sidebar with mobile overlay and floating toggle for desktop.",
    ]
  },
  {
    version: "v1.0.0",
    date: "March 2026",
    badge: "Foundation",
    changes: [
      "Project scaffolding: Two Next.js 16 (App Router + Turbopack) apps — frontend (port 3000) and admin (port 3001).",
      "Brand Design System: Navy (#1D1A39), Amber (#F59F59), Peach (#E8BCB9), and Plum (#451952) color palette with Tailwind config.",
      "Custom Fonts: Syne (font-display), Inter (font-sans), and JetBrains Mono (font-mono) loaded via Google Fonts.",
      "Hero Section: Glassmorphism hero with gradient headline text, animated background blobs, and HeroBackground canvas component.",
      "Navbar: Transparent-to-solid scroll-aware navbar with CMS-driven links and Tawk.to live chat integration.",
      "Footer: Full-width branded footer with Firestore-driven navigation columns.",
      "Tawk.to Live Chat: Integrated chat widget with error suppressor to silence console noise.",
      "404 & Error Pages: Custom branded error boundaries with amber gradient styling.",
      "Firebase Project: frontend-cms-104a4 project with Firestore, Auth, and Storage enabled.",
      "Firestore Rules: Initial security rules deployed covering all content collections.",
    ]
  }
];

const guideFeatures = [
  {
    icon: Type,
    color: 'bg-amber-50 text-amber-600',
    title: 'Headings',
    description: 'Use # for H1, ## for H2, ### for H3. H1 is large page titles, H2 for sections, H3 for sub-sections.',
    syntax: `# Big Page Title\n## Section Header\n### Sub-section`,
  },
  {
    icon: Zap,
    color: 'bg-purple-50 text-purple-600',
    title: 'Bold & Italic',
    description: 'Wrap text with ** for bold, * for italic.',
    syntax: `**Bold Text**\n*Italic Text*\n**_Bold Italic_**`,
  },
  {
    icon: Code,
    color: 'bg-blue-50 text-blue-600',
    title: 'Inline Code & Code Blocks',
    description: 'Use backticks for inline code. Use triple backticks for code blocks.',
    syntax: 'Use `code` inline.\n\n```\nconst x = 10;\nconsole.log(x);\n```',
  },
  {
    icon: Link2,
    color: 'bg-green-50 text-green-600',
    title: 'Links',
    description: 'Create clickable links using [text](url) syntax.',
    syntax: `[Visit our website](https://forensicsbypriyanshi.com)\n[Email Us](mailto:hello@example.com)`,
  },
  {
    icon: Quote,
    color: 'bg-rose-50 text-rose-600',
    title: 'Blockquotes',
    description: 'Start a line with > to create an amber-bordered highlight block.',
    syntax: `> This is an important note.\n> Continue the quote on next line.`,
  },
  {
    icon: List,
    color: 'bg-teal-50 text-teal-600',
    title: 'Lists',
    description: 'Use - or * for bullet lists. Use 1. 2. 3. for numbered lists.',
    syntax: `- First item\n- Second item\n\n1. Step one\n2. Step two`,
  },
  {
    icon: Minus,
    color: 'bg-gray-100 text-gray-500',
    title: 'Dividers',
    description: 'Use --- on its own line to add a horizontal rule.',
    syntax: `Section One\n\n---\n\nSection Two`,
  },
];

const colorSwatches = [
  { name: 'Deep Navy', hex: '#1D1A39', usage: 'Background, primary text' },
  { name: 'Amber', hex: '#F59F59', usage: 'Highlights, calls-to-action, badges' },
  { name: 'Peach Rose', hex: '#E8BCB9', usage: 'Soft headings, hover states' },
  { name: 'Deep Plum', hex: '#451952', usage: 'Blockquote backgrounds, accents' },
  { name: 'Soft White', hex: '#F5F5F5', usage: 'Body text, light backgrounds' },
];

const fontRef = [
  { cls: 'font-display', usage: 'Page titles, section headers', example: 'Forensic Science' },
  { cls: 'font-sans', usage: 'Body text, paragraphs', example: 'Detailed body content' },
  { cls: 'font-mono', usage: 'Code snippets, technical text', example: 'const x = 10;' },
];

export default function SystemVersion() {
  const [activeTab, setActiveTab] = useState<TabType>('releases');

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-[#1D1A39] mb-2 font-display">System Info</h1>
        <p className="text-[#1D1A39]/60 font-medium">Release history and page creator reference guide for the FBP CMS platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('releases')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'releases' ? 'bg-white text-[#1D1A39] shadow-sm' : 'text-gray-500 hover:text-[#1D1A39]'
          }`}
        >
          <History className="w-4 h-4" />
          Release History
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'guide' ? 'bg-white text-[#1D1A39] shadow-sm' : 'text-gray-500 hover:text-[#1D1A39]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Page Creator Guide
        </button>
      </div>

      {/* RELEASES TAB */}
      {activeTab === 'releases' && (
        <div className="bg-white p-8 rounded-2xl border border-[#1D1A39]/10 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-[#1D1A39] font-display">Release Timeline</h2>
          </div>

          <div className="border-l-2 border-gray-100 pl-6 ml-4 space-y-8">
            {versions.map((ver, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-[#F59F59]" />
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-[#1D1A39] font-display">{ver.version}</span>
                  <span className="text-xs font-semibold text-gray-400">{ver.date}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${BADGE_COLORS[ver.badge] || 'bg-gray-100 text-gray-500'}`}>
                    {ver.badge}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1.5 text-gray-500 text-sm font-medium">
                  {ver.changes.map((change, j) => (
                    <li key={j} className="leading-relaxed">{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATOR GUIDE TAB */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Intro Banner */}
          <div className="bg-gradient-to-r from-[#1D1A39] to-[#451952] rounded-2xl p-6 text-white flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F59F59]/20 border border-[#F59F59]/30 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-[#F59F59]" />
            </div>
            <div>
              <h2 className="font-bold text-xl font-display mb-1">Page Creator Reference Guide</h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Use this guide when writing content in the <strong className="text-white">Page Manager</strong>.
                Content is written in <strong className="text-white">Markdown</strong> and rendered live on the public site.
                This page is for admins only — it is not published publicly.
              </p>
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 text-sm font-medium">
              Every page you create in <strong>Page Manager → New Page</strong> supports the following markdown syntax.
              Write your content in the Content box using any of these features.
            </p>
          </div>

          {/* Markdown Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guideFeatures.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#1D1A39]/10 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${feat.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-[#1D1A39] font-display">{feat.title}</h3>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{feat.description}</p>
                  </div>
                  <div className="bg-gray-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Syntax</p>
                    <pre className="font-mono text-xs text-[#1D1A39] whitespace-pre-wrap leading-relaxed">{feat.syntax}</pre>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Reference */}
          <div className="bg-white rounded-2xl border border-[#1D1A39]/10 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                <Palette className="w-4 h-4 text-pink-600" />
              </div>
              <h3 className="font-bold text-[#1D1A39] font-display">Brand Color Reference</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {colorSwatches.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-black/5 shadow-sm" style={{ backgroundColor: c.hex }} />
                  <div>
                    <p className="font-bold text-sm text-[#1D1A39]">{c.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{c.hex}</p>
                    <p className="text-xs text-gray-500 leading-tight mt-0.5">{c.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font Reference */}
          <div className="bg-white rounded-2xl border border-[#1D1A39]/10 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Type className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-[#1D1A39] font-display">Typography Reference</h3>
            </div>
            <div className="space-y-3">
              {fontRef.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                  <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-[#1D1A39] w-28 text-center flex-shrink-0">
                    {f.cls}
                  </code>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{f.usage}</p>
                    <p className={`text-sm text-[#1D1A39] truncate ${f.cls}`}>{f.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white rounded-2xl border border-[#1D1A39]/10 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-[#1D1A39] font-display">Quick Tips & Best Practices</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, color: 'text-green-500', tip: "Always start pages with a # H1 heading — it becomes the page's main title on screen and for SEO." },
                { icon: CheckCircle, color: 'text-green-500', tip: 'Use blank lines between sections. A blank line tells the renderer to start a new paragraph.' },
                { icon: CheckCircle, color: 'text-green-500', tip: 'Use > blockquotes for important notes, disclaimers, or call-to-action highlights.' },
                { icon: AlertCircle, color: 'text-amber-500', tip: 'A page must have "Published" toggled ON to be visible at its public URL (/p/your-slug).' },
                { icon: AlertCircle, color: 'text-amber-500', tip: 'Slugs are URL-safe lowercase strings with hyphens only. Example: "about-us", "privacy-policy".' },
                { icon: AlertCircle, color: 'text-amber-500', tip: 'Special slugs like "404" and "error" control the system error pages. Edit them carefully.' },
              ].map((tip, i) => {
                const Icon = tip.icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tip.color}`} />
                    <p className="text-sm text-gray-600 leading-relaxed">{tip.tip}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Pages Reference */}
          <div className="bg-white rounded-2xl border border-[#1D1A39]/10 shadow-sm p-6">
            <h3 className="font-bold text-[#1D1A39] font-display mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-[#F59F59]" />
              Reserved / Special Slugs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-gray-100">
                    <th className="pb-3 font-bold text-[#1D1A39] pr-6">Slug</th>
                    <th className="pb-3 font-bold text-[#1D1A39] pr-6">Public URL</th>
                    <th className="pb-3 font-bold text-[#1D1A39]">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { slug: '404', url: '/404 (auto)', purpose: 'Custom "Page Not Found" content. Falls back to default if not published.' },
                    { slug: 'error', url: '/error (auto)', purpose: 'Custom server error page. Falls back to default if not published.' },
                    { slug: 'terms', url: '/p/terms', purpose: 'Terms of Service / Privacy Policy page.' },
                    { slug: 'any-slug', url: '/p/any-slug', purpose: 'Any other published page you create.' },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-6">
                        <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-[#1D1A39]">{row.slug}</code>
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-gray-500">{row.url}</td>
                      <td className="py-3 text-gray-500 text-xs leading-relaxed">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
