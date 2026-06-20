import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour, auto-revalidates

export async function GET() {
  try {
    const handle = '@forensicbypriyanshi';
    
    // Hardcoded Channel ID to avoid fragile HTML extraction
    const channelId = 'UChEEVWdMA0N0XUqBad-OCkA';
    
    // Subscriber count is hardcoded as requested by the user, avoiding heavy HTML fetching.

    // 2. Fetch RSS Feed
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const rssRes = await fetch(rssUrl, { next: { revalidate: 3600 } });
    if (!rssRes.ok) throw new Error('Failed to fetch RSS feed');
    const rssText = await rssRes.text();

    // 3. Parse RSS XML manually (basic Regex parsing)
    const allVideos = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let entryMatch;

    while ((entryMatch = entryRegex.exec(rssText)) !== null) {
      const entryHtml = entryMatch[1];
      const titleMatch = entryHtml.match(/<title>(.*?)<\/title>/);
      const linkMatch = entryHtml.match(/<link rel="alternate" href="(.*?)"/);
      const pubDateMatch = entryHtml.match(/<published>(.*?)<\/published>/);
      const videoIdMatch = entryHtml.match(/<yt:videoId>(.*?)<\/yt:videoId>/);

      if (titleMatch && linkMatch && pubDateMatch && videoIdMatch) {
        allVideos.push({
          title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
          publishedAt: pubDateMatch[1],
          thumbnail: `https://i.ytimg.com/vi/${videoIdMatch[1]}/hqdefault.jpg`, // hqdefault has black bars, perfect for 9:16 crop
          videoId: videoIdMatch[1]
        });
      }
      if (allVideos.length >= 15) break; // Check up to 15 recent videos
    }

    // 4. Detect which ones are Shorts by checking the /shorts/ endpoint
    const shortChecks = await Promise.all(
      allVideos.map(async (vid) => {
        try {
          const res = await fetch(`https://www.youtube.com/shorts/${vid.videoId}`, { 
            method: 'HEAD', 
            redirect: 'manual' 
          });
          return res.status === 200; // 200 = Short, 303 = Regular Video redirect
        } catch {
          return false;
        }
      })
    );

    const shorts = allVideos
      .filter((_, i) => shortChecks[i])
      .map(vid => ({
        ...vid,
        url: `https://www.youtube.com/shorts/${vid.videoId}`
      }))
      .slice(0, 6); // Return top 6 latest shorts

    // Hardcoding subscriber count to 111,000 as requested by the user
    // Since the @forensicbypriyanshi handle only has 3.9k, we will use the 111k value directly.
    let subscriberCount = 111000;

    return NextResponse.json({ videos: shorts, subscriberCount });
  } catch (error: any) {
    console.error('YouTube API error:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube data' }, { status: 500 });
  }
}
