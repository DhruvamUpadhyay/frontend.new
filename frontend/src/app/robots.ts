import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://forensicsbypriyanshi.com';

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = ['/api/', '/admin/', '/_next/'];
  return {
    rules: [
      // Standard search engine crawlers
      { userAgent: 'Googlebot', allow: '/', disallow: disallowedPaths },
      { userAgent: 'Bingbot', allow: '/', disallow: disallowedPaths },
      // AI Search & LLM training crawlers (explicitly allowed)
      { userAgent: 'Google-Extended', allow: '/', disallow: disallowedPaths },
      { userAgent: 'GPTBot', allow: '/', disallow: disallowedPaths },
      { userAgent: 'ChatGPT-User', allow: '/', disallow: disallowedPaths },
      { userAgent: 'ClaudeBot', allow: '/', disallow: disallowedPaths },
      { userAgent: 'PerplexityBot', allow: '/', disallow: disallowedPaths },
      // Fallback rule for all other bots
      { userAgent: '*', allow: '/', disallow: disallowedPaths },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
