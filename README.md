# InterestArt Blogging Website

InterestArt is a premium, responsive, SEO-ready art blogging website built using the modern content-first **Astro** framework. The visual direction is **"Soft Elegance Meets Charcoal Drama"**, utilizing custom CSS variables for light/dark theme toggles, Pinterest-friendly masonry feeds, and dynamic route indexing.

## Technology Stack
- **Framework**: Astro (Static Output Mode)
- **Styling**: Vanilla CSS with CSS Custom Properties
- **Data Layer**: Astro Content Collections (Markdown/MDX schema validated)
- **SEO & Sitemap**: `@astrojs/sitemap` integration, dynamic RSS feed (`/rss.xml`), and crawling configurations (`robots.txt`).

---

## Getting Started Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:4321`.*

3. Verify blog database schema and frontmatter fields:
   ```bash
   npm run verify
   ```

4. Compile a static production build:
   ```bash
   npm run build
   ```

5. Preview the compiled production site locally:
   ```bash
   npm run preview
   ```

---

## Configuration & Branding Customization

All primary configurations (branding names, descriptions, author bios, email contact targets, and social profile links) are stored in a single centralized configuration file:

**[src/data/siteConfig.ts](file:///C:/Users/itsas/.gemini/antigravity/scratch/interestart/src/data/siteConfig.ts)**

Open this file and replace the placeholders with your production values:
- `siteUrl`: Change `https://interestart.example` to your purchased domain name (e.g. `https://interestart.com`).
- `contactEmail`: Update `hello@interestart.example` to your direct mail address.
- `social`: Swap the Pinterest, Instagram, and GitHub links.
- `author`: Personalize the name and avatar initials.

---

## How-To Guides

### 1. Adding a New Blog Post

All articles are stored as individual Markdown files inside:
`src/content/blog/`

To add a new article:
1. Create a new file with a `.md` extension, naming it after the desired URL slug (e.g., `src/content/blog/acrylic-painting-basics.md`).
2. Add the strictly typed YAML frontmatter at the top of the file:
   ```yaml
   ---
   title: "Acrylic Painting for Beginners: A Complete Guide"
   description: "Learn basic supplies, blending techniques, and canvas preparation for acrylics."
   excerpt: "An introduction to paint consistency, blending exercises, and canvas layering."
   category: "Fine Art and Painting"
   categorySlug: "painting"
   date: "2026-07-18"
   displayDate: "July 18, 2026"
   readTime: "5 min read"
   heroImage: "/images/fine_art.webp"
   heroAlt: "A beautiful acrylic painting landscape"
   author: "Alex Rivers"
   tags: ["Acrylics", "Fine Art", "Painting", "Tutorial"]
   keywords: ["acrylic painting", "learn to paint acrylics", "acrylics for beginners"]
   featured: false
   draft: false
   seasonal: false
   pinterestImage: "/images/fine_art.webp"
   ogImage: "/images/fine_art.webp"
   toc: true
   ---
   ```
3. Write the article content in Markdown underneath the frontmatter block.
4. Run `npm run verify` to ensure the post satisfies all schema validations.

### 2. Replacing and Optimizing Images

- Place all artwork images, background heroes, and profile pictures inside:
  `public/images/`
- Set appropriate Pinterest dimensions (ideal aspect ratio of `2:3`, e.g. `1000px x 1500px` or `1024px x 1536px`) for optimal pins.
- Reference the image file path relative to the public root in frontmatter parameters (e.g. `/images/my_new_artwork.webp`).
- Always write descriptive, keyword-rich `heroAlt` descriptions to support Google Image Search crawling.

### 3. Deploying to Vercel

1. Push your local repository to a new private or public **GitHub** repository.
2. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. Vercel will automatically detect **Astro** as the framework preset and configure the build command (`npm run build`) and output directory (`dist`).
5. Click **Deploy**. Vercel will build and host the site on a `.vercel.app` subdomain.

### 4. Configuring a Custom Domain

1. In the Vercel project panel, go to **Settings > Domains**.
2. Add your purchased domain name (e.g. `interestart.com`).
3. Update your DNS settings at your domain registrar (e.g., Namecheap, GoDaddy) by adding the Vercel CNAME or A records as instructed by Vercel.
4. Vercel will automatically provision free SSL certificates and redirect traffic to your domain.
