import fs from 'fs';
import path from 'path';

const blogDir = path.resolve('src/content/blog');
const publicDir = path.resolve('public');

const recognizedCategories = [
  "Fine Art and Painting",
  "Sketching and Drawing",
  "Digital Illustration",
  "Art History Insights",
  "DIY and Crafts",
  "Sculpture and Pottery",
  "Aesthetic Pastel Art",
  "Charcoal Art"
];

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
  if (!match) return null;
  
  const yamlContent = match[1];
  const obj = {};
  
  yamlContent.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join(':').trim();
      
      // Clean string quotes
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.slice(1, -1);
      }
      
      // Clean arrays (e.g. [a, b, c])
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
      }
      
      // Clean booleans
      if (val === 'true') val = true;
      if (val === 'false') val = false;
      
      obj[key] = val;
    }
  });
  
  return obj;
}

function verify() {
  console.log("Starting InterestArt Content Validation...");
  
  if (!fs.existsSync(blogDir)) {
    console.error(`Error: Blog content directory not found at ${blogDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
  let hasErrors = false;
  const slugs = new Set();

  files.forEach(file => {
    const filePath = path.join(blogDir, file);
    const slug = path.basename(file, '.md');
    
    // Check slug uniqueness
    if (slugs.has(slug)) {
      console.error(`[ERROR] Duplicate slug: ${slug} in file ${file}`);
      hasErrors = true;
    }
    slugs.add(slug);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseFrontmatter(fileContent);

    if (!frontmatter) {
      console.error(`[ERROR] Invalid or missing frontmatter in file ${file}`);
      hasErrors = true;
      return;
    }

    // Required fields check
    const requiredFields = [
      'title', 'description', 'excerpt', 'category', 'categorySlug', 
      'date', 'displayDate', 'readTime', 'heroImage', 'heroAlt', 
      'author', 'tags', 'keywords', 'featured'
    ];

    requiredFields.forEach(field => {
      if (frontmatter[field] === undefined) {
        console.error(`[ERROR] Missing required field [${field}] in file ${file}`);
        hasErrors = true;
      }
    });

    // Check titles and descriptions are not empty
    if (frontmatter.title && frontmatter.title.trim() === "") {
      console.error(`[ERROR] Empty title in file ${file}`);
      hasErrors = true;
    }
    if (frontmatter.description && frontmatter.description.trim() === "") {
      console.error(`[ERROR] Empty description in file ${file}`);
      hasErrors = true;
    }

    // Check valid date format YYYY-MM-DD
    if (frontmatter.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(frontmatter.date)) {
        console.error(`[ERROR] Invalid date format [${frontmatter.date}] in file ${file}. Must be quoted YYYY-MM-DD.`);
        hasErrors = true;
      }
    }

    // Check recognized category
    if (frontmatter.category && !recognizedCategories.includes(frontmatter.category)) {
      console.error(`[ERROR] Unrecognized category [${frontmatter.category}] in file ${file}.`);
      hasErrors = true;
    }

    // Check image existence locally in public folder
    if (frontmatter.heroImage) {
      if (frontmatter.heroImage.startsWith('/')) {
        const imagePath = path.join(publicDir, frontmatter.heroImage);
        if (!fs.existsSync(imagePath)) {
          console.error(`[ERROR] Referenced image not found at public path: ${frontmatter.heroImage} in file ${file}`);
          hasErrors = true;
        }
      }
    }

    // Check heroAlt is not decorative/empty (since it's a key featured post asset, it needs descriptive alt text)
    if (frontmatter.heroAlt && frontmatter.heroAlt.trim() === "") {
      console.error(`[ERROR] Empty heroAlt in file ${file}`);
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.error("Content verification failed with errors.");
    process.exit(1);
  } else {
    console.log(`Content verification passed successfully! Verified ${files.length} posts.`);
  }
}

verify();
