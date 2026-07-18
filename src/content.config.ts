import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string(),
    category: z.string(),
    categorySlug: z.string(),
    date: z.string(), // ISO date string (quoted in frontmatter)
    updatedDate: z.string().optional(),
    displayDate: z.string(),
    readTime: z.string(),
    heroImage: z.string(),
    heroAlt: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    keywords: z.array(z.string()),
    featured: z.boolean(),
    draft: z.boolean().default(false),
    seasonal: z.boolean().default(false),
    canonical: z.string().optional(),
    pinterestImage: z.string().optional(),
    ogImage: z.string().optional(),
    toc: z.boolean().default(true),
  }),
});

export const collections = { blog };
