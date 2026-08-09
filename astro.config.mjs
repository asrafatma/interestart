import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Read blog post dates straight from frontmatter so the sitemap can report
// accurate lastmod per post without duplicating dates in a second place.
const blogDir = path.resolve('./src/content/blog');
const postDates = {};
if (fs.existsSync(blogDir)) {
  for (const file of fs.readdirSync(blogDir)) {
    if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
    const slug = file.replace(/\.mdx?$/, '');
    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const dateMatch = content.match(/^date:\s*["']?([\d-]+)["']?/m);
    const updatedMatch = content.match(/^updatedDate:\s*["']?([\d-]+)["']?/m);
    if (dateMatch) {
      postDates[slug] = updatedMatch ? updatedMatch[1] : dateMatch[1];
    }
  }
}

// Keep in sync with the categorySlug list in CLAUDE.md / AGENTS.md.
const categorySlugs = [
  'painting', 'drawing', 'digital-art', 'art-history',
  'diy-crafts', 'sculpture-pottery', 'pastel-art', 'charcoal-art'
];

const staticPageRules = {
  '/': { changefreq: 'daily', priority: 1.0 },
  '/blog/': { changefreq: 'daily', priority: 0.9 },
  '/categories/': { changefreq: 'weekly', priority: 0.8 },
  '/about/': { changefreq: 'monthly', priority: 0.8 },
  '/contact/': { changefreq: 'monthly', priority: 0.8 },
  '/privacy-policy/': { changefreq: 'monthly', priority: 0.8 },
  '/terms/': { changefreq: 'monthly', priority: 0.8 },
  '/editorial-policy/': { changefreq: 'monthly', priority: 0.8 }
};

const buildDate = new Date().toISOString().split('T')[0];

// https://astro.build/config
export default defineConfig({
  site: 'https://interestart.com',
  integrations: [
    sitemap({
      serialize(item) {
        const segments = new URL(item.url).pathname.split('/').filter(Boolean);

        if (segments[0] === 'blog' && segments[1]) {
          item.changefreq = 'monthly';
          item.priority = 0.7;
          item.lastmod = postDates[segments[1]] || buildDate;
          return item;
        }

        if (segments.length === 1 && categorySlugs.includes(segments[0])) {
          item.changefreq = 'weekly';
          item.priority = 0.8;
          item.lastmod = buildDate;
          return item;
        }

        const rule = staticPageRules[`/${segments.join('/')}${segments.length ? '/' : ''}`];
        item.changefreq = rule ? rule.changefreq : 'weekly';
        item.priority = rule ? rule.priority : 0.6;
        item.lastmod = buildDate;
        return item;
      }
    })
  ],
  output: 'static'
});
