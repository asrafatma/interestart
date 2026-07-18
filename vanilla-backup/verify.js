// Codebase Integrity Verification Script for InterestArt

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'index.html',
  'about.html',
  'categories.html',
  'contact.html',
  'post.html',
  'css/style.css',
  'js/main.js',
  'js/posts-data.js',
  'images/hero_artwork.jpg',
  'images/fine_art.jpg',
  'images/digital_art.jpg',
  'images/charcoal_study.jpg',
  'images/pastel_sketch.jpg',
  'images/sculpture.jpg',
  'images/diy_crafts.jpg'
];

let failed = false;

console.log('=== Starting InterestArt Integrity Check ===\n');

// 1. Check file existence
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`[PASS] File exists: ${file} (${stats.size} bytes)`);
  } else {
    console.error(`[FAIL] Missing file: ${file}`);
    failed = true;
  }
});

// 2. Validate posts data structure
console.log('\n--- Checking posts-data.js Syntax ---');
try {
  const dataPath = path.join(__dirname, 'js', 'posts-data.js');
  let dataContent = fs.readFileSync(dataPath, 'utf8');
  
  // Convert global window assignment to module exports for evaluation
  dataContent = dataContent.replace('window.BLOG_POSTS =', 'const posts =');
  dataContent += '\nmodule.exports = posts;';
  
  // Use a temporary file to load module safely
  const tempPath = path.join(__dirname, 'js', 'posts-data.temp.js');
  fs.writeFileSync(tempPath, dataContent, 'utf8');
  
  const posts = require(tempPath);
  fs.unlinkSync(tempPath); // Clean up
  
  if (Array.isArray(posts) && posts.length > 0) {
    console.log(`[PASS] posts-data.js loaded correctly. Found ${posts.length} posts.`);
    
    // Validate each post fields
    posts.forEach((post, i) => {
      const requiredFields = ['id', 'title', 'excerpt', 'category', 'image', 'tags', 'date', 'readTime', 'author', 'content'];
      const missing = requiredFields.filter(field => !post[field]);
      if (missing.length === 0) {
        console.log(`  - Post [${post.id}]: Validated fields.`);
      } else {
        console.error(`  - Post [${i}]: Missing fields: ${missing.join(', ')}`);
        failed = true;
      }
    });
  } else {
    console.error('[FAIL] posts-data.js must export a non-empty array of posts.');
    failed = true;
  }
} catch (err) {
  console.error('[FAIL] Failed parsing posts-data.js:', err.message);
  failed = true;
}

console.log('\n=============================================');
if (failed) {
  console.error('\n*** INTEGRITY CHECK FAILED. Please resolve issues. ***');
  process.exit(1);
} else {
  console.log('\n*** INTEGRITY CHECK PASSED. Codebase is clean! ***');
  process.exit(0);
}
