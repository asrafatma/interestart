// InterestArt Interaction Script

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Global Themes & Layout Initialization ---
  initTheme();
  initMobileMenu();

  // --- 2. Feed Page Logic (index.html) ---
  if (document.getElementById("posts-masonry")) {
    initFeed();
  }

  // --- 3. Categories Page Logic (categories.html) ---
  if (document.getElementById("categories-grid")) {
    initCategories();
  }

  // --- 4. Single Post Reader Logic (post.html) ---
  if (document.getElementById("post-reader-container")) {
    initPostReader();
  }

  // --- 5. Forms & Modals Logic (contact.html, newsletter) ---
  initForms();
});

// ==========================================
// 1. THEME & NAVIGATION
// ==========================================
function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  if (!themeToggle) return;

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }

  // Handle click toggle
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);
  });
}

function initMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    // Animation for hamburger lines
    const spans = hamburger.querySelectorAll("span");
    spans[0].style.transform = navMenu.classList.contains("active") ? "rotate(45deg) translate(5px, 5px)" : "none";
    spans[1].style.opacity = navMenu.classList.contains("active") ? "0" : "1";
    spans[2].style.transform = navMenu.classList.contains("active") ? "rotate(-45deg) translate(5px, -5px)" : "none";
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove("active");
      const spans = hamburger.querySelectorAll("span");
      spans.forEach(s => s.style.transform = "none");
      spans[1].style.opacity = "1";
    }
  });
}

// ==========================================
// 2. BLOG FEED & FILTERING (index.html)
// ==========================================
let currentCategoryFilter = "All";
let currentSearchQuery = "";

function initFeed() {
  const grid = document.getElementById("posts-masonry");
  const filterContainer = document.getElementById("filter-pills");
  const searchInput = document.getElementById("search-input");

  if (!window.BLOG_POSTS || window.BLOG_POSTS.length === 0) {
    grid.innerHTML = `<div class="no-results">No posts found. Add some to posts-data.js!</div>`;
    return;
  }

  // Generate category filter pills dynamically
  const categories = ["All", ...new Set(window.BLOG_POSTS.map(p => p.category))];
  
  if (filterContainer) {
    filterContainer.innerHTML = categories.map(cat => {
      const count = cat === "All" 
        ? window.BLOG_POSTS.length 
        : window.BLOG_POSTS.filter(p => p.category === cat).length;
      
      const isActive = cat === currentCategoryFilter ? "active" : "";
      return `
        <button class="filter-pill ${isActive}" data-category="${cat}">
          ${cat} <span class="filter-count">(${count})</span>
        </button>
      `;
    }).join("");

    // Filter pill click listener
    filterContainer.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;

      document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      
      currentCategoryFilter = pill.dataset.category;
      renderFilteredFeed();
    });
  }

  // Search input listener
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderFilteredFeed();
    });
  }

  // Initial render
  renderFilteredFeed();
}

function renderFilteredFeed() {
  const grid = document.getElementById("posts-masonry");
  if (!grid) return;

  const savedPins = JSON.parse(localStorage.getItem("saved_pins") || "[]");

  const filtered = window.BLOG_POSTS.filter(post => {
    const matchesCategory = currentCategoryFilter === "All" || post.category === currentCategoryFilter;
    const matchesSearch = post.title.toLowerCase().includes(currentSearchQuery) || 
                          post.excerpt.toLowerCase().includes(currentSearchQuery) ||
                          post.tags.some(tag => tag.toLowerCase().includes(currentSearchQuery));
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
        <p style="font-size: 1.2rem; font-family: var(--font-serif); margin-bottom: 0.5rem;">No artwork matching your search</p>
        <p style="font-size: 0.9rem;">Try searching another keyword or selecting a different category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(post => {
    const isSaved = savedPins.includes(post.id);
    const saveClass = isSaved ? "saved" : "";
    const saveText = isSaved ? "Saved" : "Save";

    return `
      <article class="masonry-item">
        <div class="card-img-wrapper">
          <img src="${post.image}" alt="${post.title}" loading="lazy">
          <div class="card-overlay">
            <button class="pin-save-btn ${saveClass}" data-id="${post.id}">${saveText}</button>
            <a href="post.html?id=${post.id}" class="card-action-circle" title="Read Post">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
        <div class="card-content">
          <div class="card-meta">
            <span class="card-category">${post.category}</span>
            <span>&middot;</span>
            <span>${post.readTime}</span>
          </div>
          <h3 class="card-title"><a href="post.html?id=${post.id}">${post.title}</a></h3>
          <p class="card-excerpt">${post.excerpt}</p>
          <div class="card-footer">
            <span class="card-author">
              <span class="card-avatar">${post.author.split(' ').map(n=>n[0]).join('')}</span>
              ${post.author}
            </span>
            <span>${post.date}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // Setup save button listeners
  grid.querySelectorAll(".pin-save-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const postId = btn.dataset.id;
      toggleSavePin(postId, btn);
    });
  });
}

function toggleSavePin(id, buttonEl) {
  let savedPins = JSON.parse(localStorage.getItem("saved_pins") || "[]");
  if (savedPins.includes(id)) {
    savedPins = savedPins.filter(pinId => pinId !== id);
    buttonEl.classList.remove("saved");
    buttonEl.textContent = "Save";
  } else {
    savedPins.push(id);
    buttonEl.classList.add("saved");
    buttonEl.textContent = "Saved";
  }
  localStorage.setItem("saved_pins", JSON.stringify(savedPins));
}

// ==========================================
// 3. CATEGORIES PAGE (categories.html)
// ==========================================
function initCategories() {
  const container = document.getElementById("categories-grid");
  if (!container) return;

  // We have 8 distinct categories. Let's build a mapping of descriptions and cover images.
  const categoriesDetails = {
    "Fine Art & Painting": {
      desc: "Delve into classical brushwork, oils, acrylics, and canvas studies capturing natural light.",
      img: "images/fine_art.jpg"
    },
    "Digital Illustration": {
      desc: "Modern vector design, stylized silhouettes, and combining clean digital lines with textured layers.",
      img: "images/digital_art.jpg"
    },
    "Art History Insights": {
      desc: "Academic analysis, classical eras, and breakdowns of dynamic chiaroscuro from Baroque masters.",
      img: "images/charcoal_study.jpg"
    },
    "Sketching & Doodling": {
      desc: "Fun, low-pressure sketching routines, blind contour practices, and creative journaling doodles.",
      img: "images/pastel_sketch.jpg"
    },
    "DIY & Crafts": {
      desc: "Bullet journaling layouts, pressed botanical arrangements, handmade stationery, and flatlay guides.",
      img: "images/diy_crafts.jpg"
    },
    "Sculpture & Pottery": {
      desc: "Explore organic ceramics, the meditative potter's wheel, and minimalist homeware designs.",
      img: "images/sculpture.jpg"
    },
    "Aesthetic Pastel Sketches": {
      desc: "Soft colored pencil art, quiet interior room drawings, blush tones, and cozy lifestyle designs.",
      img: "images/pastel_sketch.jpg"
    },
    "High-Contrast Dark Charcoal Studies": {
      desc: "Mastering light and shadow (chiaroscuro) using graphite, compressed charcoal, and textured paper.",
      img: "images/charcoal_study.jpg"
    }
  };

  const categories = Object.keys(categoriesDetails);

  container.innerHTML = categories.map(cat => {
    const details = categoriesDetails[cat];
    const count = window.BLOG_POSTS ? window.BLOG_POSTS.filter(p => p.category === cat).length : 0;

    return `
      <div class="category-card">
        <div class="cat-card-img-container">
          <img src="${details.img}" alt="${cat}" loading="lazy">
        </div>
        <div class="cat-card-content">
          <div>
            <h3 class="cat-card-title">${cat}</h3>
            <p class="cat-card-desc">${details.desc}</p>
          </div>
          <a href="index.html" class="cat-card-link" onclick="localStorage.setItem('filter_cat', '${cat}')">
            Explore ${count} posts
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
        </div>
      </div>
    `;
  }).join("");

  // Check if redirect filter is needed on index load
  const indexPills = document.getElementById("filter-pills");
  if (indexPills) {
    const filterCat = localStorage.getItem("filter_cat");
    if (filterCat) {
      currentCategoryFilter = filterCat;
      localStorage.removeItem("filter_cat"); // Clean up
    }
  }
}

// Redirect mechanism helper on home screen
window.addEventListener("load", () => {
  const filterCat = localStorage.getItem("filter_cat");
  if (filterCat && document.getElementById("posts-masonry")) {
    currentCategoryFilter = filterCat;
    localStorage.removeItem("filter_cat");
    const pills = document.querySelectorAll(".filter-pill");
    pills.forEach(pill => {
      if (pill.dataset.category === currentCategoryFilter) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
    renderFilteredFeed();
  }
});

// ==========================================
// 4. BLOG READER PAGE (post.html)
// ==========================================
function initPostReader() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const post = window.BLOG_POSTS.find(p => p.id === postId);

  if (!post) {
    document.getElementById("post-reader-container").innerHTML = `
      <div style="text-align: center; padding: 10rem 2rem;">
        <h1 style="font-family: var(--font-serif); font-size: 2.5rem; margin-bottom: 1rem;">Post Not Found</h1>
        <p style="color: var(--text-secondary); margin-bottom: 2rem;">We couldn't find the article you were looking for.</p>
        <a href="index.html" class="cta-btn">Back to Blog Feed</a>
      </div>
    `;
    return;
  }

  // Populate Single Post Details
  document.title = `${post.title} | InterestArt`;
  document.getElementById("post-header-img").src = post.image;
  document.getElementById("post-breadcrumbs-cat").textContent = post.category;
  document.getElementById("post-breadcrumbs-cat").href = `index.html`;
  document.getElementById("post-breadcrumbs-cat").addEventListener("click", () => {
    localStorage.setItem("filter_cat", post.category);
  });
  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-avatar-initials").textContent = post.author.split(' ').map(n=>n[0]).join('');
  document.getElementById("post-author-name").textContent = post.author;
  document.getElementById("post-date").textContent = post.date;
  document.getElementById("post-readtime").textContent = post.readTime;
  document.getElementById("post-body-content").innerHTML = post.content;

  // Build tags list in sidebar
  const tagsWidget = document.getElementById("sidebar-tags-list");
  if (tagsWidget) {
    tagsWidget.innerHTML = post.tags.map(t => `<span class="tag-badge">#${t}</span>`).join("");
  }

  // Setup reading progress indicator
  const progress = document.getElementById("reading-progress");
  if (progress) {
    window.addEventListener("scroll", () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollTotal) * 100;
      progress.style.width = `${scrollProgress}%`;
    });
  }

  // Related posts
  initRelatedPosts(post);

  // Dynamic comments
  initComments(post.id);
}

function initRelatedPosts(currentPost) {
  const grid = document.getElementById("related-posts-grid");
  if (!grid) return;

  // Filter out current post, pick others from same category or general posts
  let related = window.BLOG_POSTS.filter(p => p.id !== currentPost.id && p.category === currentPost.category);
  if (related.length === 0) {
    related = window.BLOG_POSTS.filter(p => p.id !== currentPost.id);
  }
  
  // Show max 2 related posts
  related = related.slice(0, 2);

  grid.innerHTML = related.map(post => `
    <article class="masonry-item" style="margin-bottom: 0;">
      <div class="card-img-wrapper">
        <img src="${post.image}" alt="${post.title}">
        <div class="card-overlay">
          <a href="post.html?id=${post.id}" class="card-action-circle" title="Read Post" style="margin-left: auto;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      </div>
      <div class="card-content">
        <div class="card-meta">
          <span class="card-category">${post.category}</span>
          <span>&middot;</span>
          <span>${post.readTime}</span>
        </div>
        <h4 class="card-title" style="font-size: 1.15rem;"><a href="post.html?id=${post.id}">${post.title}</a></h4>
      </div>
    </article>
  `).join("");
}

function initComments(postId) {
  const commentCount = document.getElementById("comment-count");
  const commentsList = document.getElementById("comments-list");
  const commentForm = document.getElementById("comment-form");

  if (!commentsList || !commentForm) return;

  const storageKey = `comments_${postId}`;

  // Default initial comments to seed if none exist in LocalStorage
  const defaultComments = [
    {
      user: "Clara Bennett",
      date: "July 18, 2026",
      text: "This is exactly what I needed! Your palette suggestions are so beautiful. I tried the blush pink interior sketching today and it felt so relaxing."
    },
    {
      user: "Liam Stone",
      date: "July 16, 2026",
      text: "Gorgeous photography and layout. Do you have a list of colored pencil brands you recommend for these sketches?"
    }
  ];

  let comments = JSON.parse(localStorage.getItem(storageKey));
  if (!comments) {
    comments = defaultComments;
    localStorage.setItem(storageKey, JSON.stringify(comments));
  }

  const renderComments = () => {
    commentCount.textContent = `${comments.length} Comments`;
    if (comments.length === 0) {
      commentsList.innerHTML = `<p style="color: var(--text-secondary); font-style: italic;">No comments yet. Be the first to share your thoughts!</p>`;
      return;
    }
    commentsList.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-meta">
          <span class="comment-user">
            <span class="card-avatar" style="width:28px; height:28px; font-size:0.75rem;">${c.user.split(' ').map(n=>n[0]).join('')}</span>
            ${c.user}
          </span>
          <span class="comment-date">${c.date}</span>
        </div>
        <p class="comment-text">${c.text}</p>
      </div>
    `).join("");
  };

  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("comment-name");
    const textInput = document.getElementById("comment-text-area");

    if (!nameInput.value.trim() || !textInput.value.trim()) return;

    const newComment = {
      user: nameInput.value.trim(),
      date: new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
      text: textInput.value.trim()
    };

    comments.unshift(newComment);
    localStorage.setItem(storageKey, JSON.stringify(comments));
    
    // Reset Form
    nameInput.value = "";
    textInput.value = "";

    // Show success modal
    showSuccessModal("Comment Posted", "Thank you for sharing your thoughts! Your comment is now live.");
    renderComments();
  });

  renderComments();
}

// ==========================================
// 5. CONTACT / NEWSLETTER FORMS
// ==========================================
function initForms() {
  const contactForm = document.getElementById("contact-form");
  const newsletterForm = document.getElementById("newsletter-form");
  const modalClose = document.getElementById("modal-close-btn");

  // Handle contact form submit
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const message = document.getElementById("contact-message").value.trim();
      const newsletterCheck = document.getElementById("contact-newsletter-check");

      if (!name || !email || !message) {
        alert("Please fill out all fields.");
        return;
      }

      const newsletterAddon = newsletterCheck.checked 
        ? " We've also subscribed you to our creative weekly newsletter!" 
        : "";

      showSuccessModal(
        "Message Sent!", 
        `Thank you for reaching out, ${name}. We have received your message and will get back to you shortly.${newsletterAddon}`
      );
      
      contactForm.reset();
    });
  }

  // Handle newsletter form submit (footer or inline)
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector("input[type='email']");
      if (!emailInput || !emailInput.value.trim()) return;

      showSuccessModal(
        "Welcome to the Studio!",
        "Thank you for signing up! Look out for sketching prompts, art guides, and creative inspiration in your inbox every Sunday."
      );
      
      newsletterForm.reset();
    });
  }

  // Modal Close Actions
  if (modalClose) {
    modalClose.addEventListener("click", hideSuccessModal);
  }
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) hideSuccessModal();
    });
  }
}

function showSuccessModal(title, message) {
  const modal = document.getElementById("modal-overlay");
  if (!modal) return;

  document.getElementById("modal-title-text").textContent = title;
  document.getElementById("modal-message-text").textContent = message;
  
  modal.classList.add("active");
}

function hideSuccessModal() {
  const modal = document.getElementById("modal-overlay");
  if (modal) modal.classList.remove("active");
}
