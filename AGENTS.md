## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Blog Content Workflow

### When asked to "add a blog post", always follow this process
1. Read this file and `scripts/verify-content.mjs` first — schema and rules can change, don't rely on memory.
2. Read 1-2 existing files in `src/content/blog/` as real examples — copy their exact frontmatter shape rather than assuming.
3. Ask for title, category, target keyword, and images if not already provided.
4. Place post images in `public/images/<post-slug>/` — folder name matches the post's `.md` filename/URL slug exactly (e.g. `public/images/watercolor-painting-for-beginners/hero.webp`). Reference them in frontmatter via absolute path: `/images/<post-slug>/hero.webp`. `pinterestImage`/`ogImage` can point at the same folder (reuse `hero.webp` or add a dedicated file there).
5. Write `src/content/blog/<post-slug>.md` (filename = kebab-case URL slug) matching the frontmatter schema below exactly.
6. Run `npm run verify` (wraps `scripts/verify-content.mjs`) and fix anything it flags before reporting the post as done.
7. Confirm the final slug, category, and file paths back to the user.
8. Never read from or write to `vanilla-backup/` — it's a legacy non-Astro backup, not the live site.
9. Don't touch layouts, components, or config files unless the task specifically requires it.

### Frontmatter schema (`src/content.config.ts`)
```yaml
title: "..."              # string
description: "..."        # string, SEO meta description
excerpt: "..."             # string, short teaser used on cards
category: "..."            # must exactly match a name from the list below
categorySlug: "..."        # must exactly match the slug paired with category below
date: "YYYY-MM-DD"         # quoted ISO date
displayDate: "Month D, YYYY"  # human-readable
readTime: "N min read"
heroImage: "/images/<post-slug>/hero.webp"
heroAlt: "..."             # descriptive, non-empty, keyword-rich
author: "Asra Fatma"
tags: ["...", "..."]
keywords: ["...", "..."]
featured: true|false
draft: false
seasonal: false
pinterestImage: "/images/<post-slug>/hero.webp"   # optional but recommended
ogImage: "/images/<post-slug>/hero.webp"          # optional but recommended
toc: true
```
Optional fields also supported: `updatedDate`, `canonical`.

### Recognized categories (enforced by `scripts/verify-content.mjs` — must match exactly)
| category | categorySlug |
|---|---|
| Fine Art and Painting | painting |
| Sketching and Drawing | drawing |
| Digital Illustration | digital-art |
| Art History Insights | art-history |
| DIY and Crafts | diy-crafts |
| Sculpture and Pottery | sculpture-pottery |
| Aesthetic Pastel Art | pastel-art |
| Charcoal Art | charcoal-art |
