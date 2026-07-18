import { getCollection } from 'astro:content';
import { siteConfig } from '../data/siteConfig';

export async function GET(context) {
  // Fetch and filter published posts (exclude drafts and future posts)
  const posts = await getCollection('blog', ({ data }) => {
    if (data.draft) return false;
    const postDate = new Date(data.date);
    const buildDate = new Date();
    return postDate <= buildDate;
  });

  const sortedPosts = posts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
  
  const items = sortedPosts.map(post => `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <description><![CDATA[${post.data.description}]]></description>
      <link>${siteConfig.siteUrl}/blog/${post.id}/</link>
      <guid isPermaLink="true">${siteConfig.siteUrl}/blog/${post.id}/</guid>
      <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>
    </item>
  `).join('');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteConfig.siteName}</title>
    <description>${siteConfig.tagline}</description>
    <link>${siteConfig.siteUrl}</link>
    <atom:link href="${siteConfig.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
