# HSC Software Engineering Notes

> Premium study guide for NSW HSC Software Engineering (Year 11 & 12) aligned to the NESA NSW syllabus

**Live:** https://4bzdog.github.io/HSC_SoftwareEngineering/

---

## Overview

A comprehensive, professionally-styled website providing in-depth notes, guidance, and resources for students undertaking the **NSW Higher School Certificate (HSC) Software Engineering course** (Years 11–12, NESA-aligned).

The site covers:
- **Year 11 (Preliminary):** Programming Fundamentals, Object-Oriented Paradigm, Programming Mechatronics
- **Year 12 (HSC):** Secure Software Architecture, Programming for the Web, Software Automation, Software Engineering Project
- **Cross-Curriculum:** SDLC Guide (all phases, Agile vs WAGILE, tool mapping, real-world case studies), Course Tools & Specifications

---

## Project Structure

```
HSC_SoftwareEngineering/
├── index.html                          # Home page
├── robots.txt                          # Search engine crawl directives
├── sitemap.xml                         # All page URLs for SEO
├── og-image.png                        # Social media preview image (1200×630px)
│
├── css/
│   └── styles.css                      # Premium design system (light/dark theme)
│
├── js/
│   └── main.js                         # Navigation, theme toggle, lightbox
│
├── topics/                             # Topic pages (8 total)
│   ├── sdlc.html                       # NEW: SDLC Guide (Phase 1–4, case studies)
│   ├── course-tools.html               # NESA course tools & specifications
│   ├── software-engineering-project.html
│   ├── secure-software-architecture.html
│   ├── programming-for-the-web.html
│   ├── software-automation.html
│   ├── programming-fundamentals.html
│   ├── object-oriented-paradigm.html
│   └── programming-mechatronics.html
│
├── diagrams/                           # Mermaid diagram implementations
│   ├── README.md
│   ├── INDEX.md
│   └── QUICK_REFERENCE.md
│
├── resources/                          # Supplementary markdown & PDFs
│   ├── SoftwareAutomation.md
│   ├── SoftwareEngineeringProject.md
│   └── software-engineering-11-12-2022-higher-school-certificate-course-specifications.pdf
│
└── Documentation/
    ├── README.md (this file)
    ├── DEBUGGING_GUIDE.md
    ├── DIAGRAMS_SUMMARY.md
    └── DIAGRAM_IMPLEMENTATION_STATUS.md
```

---

## Key Features

### Content
- **10 complete topic pages** covering all NESA outcomes (SE-11-01 through SE-12-09)
- **SDLC Guide** — a cross-curriculum reference covering all four phases with real-world case studies (Spotify, NASA, Boeing, Healthcare.gov) and assessor tips
- **Assessment guidance** — aligned to NESA command verbs and HSC marking criteria
- **Interactive sidebars** with table of contents on every page for easy navigation

### Design & UX
- **Premium dark mode** with smooth theme toggle (saves preference to localStorage)
- **Responsive mobile-first layout** (works on all devices)
- **Accessible** — semantic HTML, ARIA labels, keyboard navigation
- **Fast loading** — optimised CSS, SVG favicon, preconnected Google Fonts

### SEO & Discoverability
- **Canonical URLs** on all pages to prevent duplicate-content penalties
- **Open Graph & Twitter Card tags** for rich social media previews
- **JSON-LD structured data** (BreadcrumbList, WebSite schema) for enhanced SERP results
- **robots.txt** and **sitemap.xml** for search engine crawling
- **Optimised meta descriptions** (141–157 characters, ideal 120–160 range)
- **SVG favicon** (💻 emoji) and theme-color metadata

### Navigation
- **Dropdown menus** for Year 11 and Year 12 topic grouping
- **Resources dropdown** containing:
  - 🛠️ Course Tools & Specifications
  - 🔄 SDLC Guide
- **Mobile-responsive hamburger menu** with same structure
- **Breadcrumb trails** on all topic pages for clear site hierarchy

---

## Recent Updates (Latest Release)

### ✨ New SDLC Guide Page
- Comprehensive **11-section guide** to the Software Development Life Cycle
- Covers all 4 phases: Identifying & Defining → Research & Planning → Producing & Implementing → Testing & Evaluating
- **Agile vs WAGILE** methodology comparison with decision matrix
- **Tool mapping reference** — every NESA-specified tool mapped to its SDLC phase with example artefacts
- **Real-world case studies:**
  - ✅ **Success examples:** Spotify (Agile), NASA Perseverance (WAGILE), GitHub Copilot (iterative research)
  - ❌ **Failure examples:** Healthcare.gov, Boeing 737 MAX, Therac-25, Twitter/X
- **HSC assessment guidance** — exam command verbs, project documentation checklist, common mistakes

### 🎨 Site-Wide Quality & Consistency
- **Standardised footers** across all 8 topic pages — rich footer with brand logo, Year 11/12 navigation columns, and contextual Next/Previous links
- **Navigation update** — new Resources dropdown containing Course Tools and SDLC Guide
- **Colour & styling consistency** — all pages now use identical premium indigo/cyan palette, dark mode support, smooth hover states
- **Cache versioning** — aligned all CSS/JS references to `?v=7` for fresh asset delivery

### 🔍 SEO Improvements
- **Canonical URLs** on all 10 pages — prevents duplicate-content penalties from social shares
- **Open Graph tags** (`og:title`, `og:description`, `og:image`, `og:url`) — rich previews on LinkedIn, Facebook, Discord, Twitter/X
- **Twitter Card tags** — `summary_large_image` card type with matching metadata
- **JSON-LD structured data:**
  - WebSite schema on home page
  - BreadcrumbList schema on all topic pages (enables Google breadcrumb SERP results)
- **robots.txt** — instructs search engines to crawl all pages, points to sitemap
- **sitemap.xml** — lists all 10 pages with priorities and change frequencies
- **Meta descriptions** — fixed 5 oversized descriptions; all now 141–157 chars (ideal: 120–160)
- **og-image.png** — branded 1200×630px social preview image (appears when pages are shared on social media)
- **SVG favicon** and **theme-color** meta for complete branding

---

## Development & Contributing

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/4BZDOG/HSC_SoftwareEngineering.git
   cd HSC_SoftwareEngineering
   ```

2. Open `index.html` in a modern browser (no build step required — static HTML/CSS/JS)

3. For previewing locally with proper dark mode and localStorage:
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

### Page Template Structure
All topic pages follow this structure:

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <!-- Meta tags, SEO, canonical URL, OG tags -->
  <link rel="stylesheet" href="../css/styles.css?v=7" />
</head>
<body>
  <!-- Navigation (shared across all pages) -->
  <nav class="navbar">...</nav>
  <div class="mobile-menu">...</div>

  <!-- Page header with breadcrumb & metadata -->
  <header class="topic-header">
    <nav class="topic-breadcrumb">...</nav>
    <h1>📌 Page Title</h1>
    <p class="text-muted-dark">Description</p>
    <div class="topic-header-meta">
      <span class="meta-pill year12">Year 12 HSC</span>
    </div>
  </header>

  <!-- Content layout: sidebar TOC + main content -->
  <div class="page-layout">
    <aside class="sidebar">
      <ul class="toc-list">...</ul>
    </aside>
    <main class="page-content">...</main>
  </div>

  <!-- Rich footer (brand + navigation) -->
  <footer>...</footer>

  <!-- Main JS -->
  <script src="../js/main.js?v=7"></script>
</body>
</html>
```

### CSS Classes & Components

**Layout:**
- `.page-layout` — grid (sidebar + main)
- `.topic-header`, `.topic-header-meta` — page title section
- `.sidebar`, `.toc-list` — table of contents
- `.page-content`, `.content-body` — main text area
- `.footer-inner`, `.footer-col`, `.footer-bottom` — footer structure

**Content:**
- `.part-block` — section divider (part number + name)
- `.key-terms` — grid of term definitions
- `.table-wrap` — scrollable tables
- `.callout` (`.tip`, `.warning`, `.danger`, `.success`, `.assessor`) — highlighted boxes
- `.diagram-block` — embedded diagram with caption

**Styling:**
- `--primary: #6366F1` (indigo)
- `--accent: #06B6D4` (cyan)
- `--year12: #3B82F6` (blue)
- `--year11: #10B981` (green)
- Dark mode via `[data-theme="dark"]` selector

### Git Workflow

1. Create a feature branch:
   ```bash
   git checkout -b claude/your-feature-name
   ```

2. Make changes and commit with descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add new content

   Description of what was added and why.
   
   Co-Authored-By: Your Name <your@email.com>"
   ```

3. Push and open a pull request:
   ```bash
   git push -u origin claude/your-feature-name
   ```

---

## Deployment

The site is hosted on **GitHub Pages** at:
```
https://4bzdog.github.io/HSC_SoftwareEngineering/
```

**Automatic deployment:**
- Any merge to `main` branch is automatically deployed by GitHub Actions
- No build step required — static files are served as-is

**DNS/custom domain:**
- Currently using GitHub's default domain
- Can be configured via repository Settings → Pages if a custom domain is purchased

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ⚠️ IE11 — not supported (uses CSS custom properties, modern JavaScript)

---

## Accessibility

- Semantic HTML (`<nav>`, `<header>`, `<main>`, `<footer>`, `<section>`, `<article>`)
- ARIA labels on interactive elements (`aria-label`, `aria-expanded`, `role="menu"`)
- Keyboard navigation for dropdowns and mobile menu
- Sufficient colour contrast (WCAG AA)
- Responsive text sizing (16px base, scales with viewport)
- Theme toggle respects `prefers-color-scheme` media query

---

## Performance

- **No external dependencies** — pure HTML/CSS/JavaScript
- **Minimal CSS** — single stylesheet (~15KB gzipped)
- **Lazy-loaded theme** — theme preference loaded before page renders (prevents FOUC)
- **Preconnected fonts** — Google Fonts preconnect for faster font delivery
- **SVG favicon** — inline data URI, no additional request

---

## Known Limitations & Future Improvements

- **OG image** currently a single static image; could be dynamic/page-specific in future
- **No analytics** — consider adding Google Analytics for user insights
- **No search** — site is small enough that navigation works well; could add search if it grows
- **PDF resources** — currently in `/resources/` but not integrated into pages; could link from relevant topics
- **Diagram interactivity** — Mermaid diagrams are static; could add zoom/pan/animation

---

## Support & Questions

For issues, improvements, or questions:
1. Check the existing `DEBUGGING_GUIDE.md`, `DIAGRAMS_SUMMARY.md`, and `DIAGRAM_IMPLEMENTATION_STATUS.md` docs
2. Open an issue in the GitHub repository
3. Create a pull request with improvements

---

## License

© 2026 HSC SoftEng Notes — All rights reserved  
Educational resource aligned with NESA NSW HSC Software Engineering course specifications.

---

## Changelog

### v2.1.0 (Latest)
- ✨ Add SDLC Guide page with all 4 phases, methodology comparison, case studies, tool mapping
- 🎨 Standardise footers across all topic pages
- 🔍 Add canonical URLs, Open Graph, Twitter Cards, JSON-LD schema, robots.txt, sitemap.xml
- 📸 Add og-image.png (1200×630px) for social previews
- 🔧 Fix meta description lengths, align cache versions, consolidate CSS rules

### v2.0.0
- 🎨 Complete design overhaul with premium indigo/cyan palette
- 🌙 Dark mode with smooth theme toggle
- 📱 Responsive mobile-first layout
- ♿ Improved accessibility (ARIA, semantic HTML)
- 📊 Interactive diagrams with lightbox modal

### v1.0.0
- Initial release with 6 topic pages
