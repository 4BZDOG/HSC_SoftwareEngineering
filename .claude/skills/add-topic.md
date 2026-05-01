---
name: add-topic
description: >
  Scaffold a new HSC topic page following the project's established HTML
  template, then wire it into the navigation, home page, footer, and sitemap.
  Covers correct relative paths, SEO metadata, JSON-LD breadcrumbs, CSS/JS
  cache-busted references, sidebar TOC, and callout usage.
category: content
---

# Skill: add-topic

Use this skill whenever the user asks to add, create, or scaffold a new topic
page for the HSC Software Engineering Notes site.

---

## Required inputs (ask if not supplied)

| Field | Example |
|---|---|
| `slug` | `data-science` |
| `title` | `Data Science & Machine Learning` |
| `emoji` | `🤖` |
| `year` | `11` or `12` |
| `nesa-outcomes` | `SE-12-05, SE-12-06` |
| `description` (≤160 chars) | `Explore supervised learning…` |
| `nav-section` | `Year 12` (or `Year 11` / `Resources`) |

---

## Steps

### 1  Create `topics/<slug>.html`

Copy the structure below verbatim, substituting every `{{PLACEHOLDER}}`.

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{TITLE}} | HSC Software Engineering</title>
  <!-- ── SEO ── -->
  <link rel="canonical" href="https://4bzdog.github.io/HSC_SoftwareEngineering/topics/{{SLUG}}.html" />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{{TITLE}} | HSC Software Engineering" />
  <meta property="og:description" content="{{DESCRIPTION}}" />
  <meta property="og:url" content="https://4bzdog.github.io/HSC_SoftwareEngineering/topics/{{SLUG}}.html" />
  <meta property="og:image" content="https://4bzdog.github.io/HSC_SoftwareEngineering/og-image.png" />
  <meta property="og:image:alt" content="HSC Software Engineering Notes — NESA NSW" />
  <meta property="og:site_name" content="HSC Software Engineering Notes" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{{TITLE}} | HSC Software Engineering" />
  <meta name="twitter:description" content="{{DESCRIPTION}}" />
  <meta name="twitter:image" content="https://4bzdog.github.io/HSC_SoftwareEngineering/og-image.png" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://4bzdog.github.io/HSC_SoftwareEngineering/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Year {{YEAR}}",
      "item": "https://4bzdog.github.io/HSC_SoftwareEngineering/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{{TITLE}}",
      "item": "https://4bzdog.github.io/HSC_SoftwareEngineering/topics/{{SLUG}}.html"
    }
    ]
  }
  </script>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>" />
  <meta name="theme-color" content="#6366F1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <meta name="description" content="{{DESCRIPTION}}" />
  <!-- Theme init: prevents flash of wrong theme -->
  <script>(function(){try{var t=localStorage.getItem('hsc-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})()</script>
  <link rel="stylesheet" href="../css/styles.css?v=9" />
</head>
<body>

  <nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="../index.html" class="nav-brand">
        <div class="nav-logo">💻</div>
        <div>
          <div class="nav-title">SoftEng Notes</div>
          <div class="nav-subtitle">NESA NSW HSC</div>
        </div>
      </a>
      <ul class="nav-links">
        <li><a href="../index.html">🏠 Home</a></li>
        <li class="nav-dropdown">
          <button class="nav-dropdown-btn" aria-haspopup="true" aria-expanded="false">
            🗂️ Resources
            <span class="badge badge-all">Guides</span>
            <svg class="nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor"/></svg>
          </button>
          <div class="nav-dropdown-menu" role="menu">
            <a href="course-tools.html" role="menuitem">🛠️ Course Tools &amp; Specs</a>
            <a href="sdlc.html" role="menuitem">🔄 SDLC Guide</a>
            <a href="glossary.html" role="menuitem">📖 Glossary</a>
          </div>
        </li>
        <li class="nav-dropdown nav-dropdown-y12">
          <button class="nav-dropdown-btn" aria-haspopup="true" aria-expanded="false">
            Year 12
            <span class="badge badge-12">HSC</span>
            <svg class="nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor"/></svg>
          </button>
          <div class="nav-dropdown-menu" role="menu">
            <a href="secure-software-architecture.html" role="menuitem">🔒 Secure Software Architecture</a>
            <a href="programming-for-the-web.html" role="menuitem">🌐 Programming for the Web</a>
            <a href="software-automation.html" role="menuitem">⚙️ Software Automation</a>
            <a href="software-engineering-project.html" role="menuitem">📋 Software Engineering Project</a>
          </div>
        </li>
        <li class="nav-dropdown nav-dropdown-y11">
          <button class="nav-dropdown-btn" aria-haspopup="true" aria-expanded="false">
            Year 11
            <span class="badge badge-11">Prelim</span>
            <svg class="nav-chevron" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="currentColor"/></svg>
          </button>
          <div class="nav-dropdown-menu" role="menu">
            <a href="programming-fundamentals.html" role="menuitem">📐 Programming Fundamentals</a>
            <a href="object-oriented-paradigm.html" role="menuitem">🧩 Object-Oriented Paradigm</a>
            <a href="programming-mechatronics.html" role="menuitem">🤖 Programming Mechatronics</a>
          </div>
        </li>
      </ul>
      <div class="nav-actions">
        <button class="btn-icon" id="theme-toggle" aria-label="Toggle theme">🌙</button>
        <button class="btn-icon hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>

  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="Navigation menu">
    <div class="mobile-menu-section">
      <div class="mobile-menu-label">Resources</div>
      <a href="course-tools.html">🛠️ Course Tools &amp; Specifications</a>
      <a href="sdlc.html">🔄 SDLC Guide</a>
      <a href="glossary.html">📖 Glossary</a>
    </div>
    <div class="mobile-menu-section">
      <div class="mobile-menu-label">Year 12 — HSC</div>
      <a href="secure-software-architecture.html">🔒 Secure Software Architecture</a>
      <a href="programming-for-the-web.html">🌐 Programming for the Web</a>
      <a href="software-automation.html">⚙️ Software Automation</a>
      <a href="software-engineering-project.html">📋 Software Engineering Project</a>
    </div>
    <div class="mobile-menu-section">
      <div class="mobile-menu-label">Year 11 — Preliminary</div>
      <a href="programming-fundamentals.html">📐 Programming Fundamentals</a>
      <a href="object-oriented-paradigm.html">🧩 The Object-Oriented Paradigm</a>
      <a href="programming-mechatronics.html">🤖 Programming Mechatronics</a>
    </div>
    <div class="mobile-menu-section">
      <button id="theme-toggle-mobile" class="btn btn-mobile-theme">🌙 Toggle Theme</button>
    </div>
  </div>

  <header class="topic-header">
    <nav class="topic-breadcrumb" aria-label="Breadcrumb">
      <a href="../index.html">Home</a>
      <span aria-hidden="true">›</span>
      <a href="../index.html#year{{YEAR}}">Year {{YEAR}}</a>
      <span aria-hidden="true">›</span>
      <span>{{TITLE}}</span>
    </nav>
    <h1>{{EMOJI}} {{TITLE}}</h1>
    <p class="text-muted-dark">{{DESCRIPTION}}</p>
    <div class="topic-header-meta">
      <span class="meta-pill year{{YEAR}}">Year {{YEAR}} {{YEAR_LABEL}}</span>
      <span class="meta-pill">{{NESA_OUTCOMES}}</span>
    </div>
  </header>

  <div class="page-layout">
    <aside class="sidebar" aria-label="Table of contents">
      <ul class="toc-list" role="list">
        <li class="toc-part-label">Part 1</li>
        <li><a href="#section-one">Section One Title</a></li>
        <li><a href="#section-two">Section Two Title</a></li>
        <!-- Add one <li><a href="#..."> per section -->
      </ul>
    </aside>

    <main class="page-content">
      <div class="content-body">

        <div class="part-block">
          <span class="part-num">Part 1</span>
          <span class="part-name">First Major Part Name</span>
        </div>

        <section id="section-one">
          <h2 class="syllabus-phase">Section One Title
            <span class="outcome-subtitle">({{NESA_OUTCOMES}})</span>
          </h2>

          <p>Content goes here.</p>

          <div class="key-terms">
            <div class="key-term">
              <dt>Term</dt>
              <dd>Definition.</dd>
            </div>
          </div>

          <div class="callout tip">
            <strong>Tip:</strong> Use callouts for exam tips, warnings, or assessor notes.
          </div>
        </section>

        <section id="section-two">
          <h2 class="syllabus-phase">Section Two Title</h2>
          <p>Content goes here.</p>
        </section>

      </div><!-- /.content-body -->
    </main>
  </div><!-- /.page-layout -->

  <!-- ── Footer ── -->
  <footer>
    <div class="footer-inner">
      <div>
        <div class="footer-brand">
          <div class="footer-logo">💻</div>
          <span class="footer-name">SoftEng Notes</span>
        </div>
        <p class="footer-desc">Comprehensive HSC Software Engineering notes aligned to the NESA NSW syllabus.</p>
      </div>
      <div class="footer-col">
        <h4>🔐 Year 12</h4>
        <a href="secure-software-architecture.html">Secure Architecture</a>
        <a href="programming-for-the-web.html">Web Programming</a>
        <a href="software-automation.html">Software Automation</a>
        <a href="software-engineering-project.html">SE Project</a>
      </div>
      <div class="footer-col">
        <h4>📈 Year 11</h4>
        <a href="programming-fundamentals.html">Programming Fundamentals</a>
        <a href="object-oriented-paradigm.html">OOP</a>
        <a href="programming-mechatronics.html">Mechatronics</a>
      </div>
      <div class="footer-col">
        <h4>📝 Resources</h4>
        <a href="course-tools.html">🛠️ Course Tools</a>
        <a href="sdlc.html">🔄 SDLC Guide</a>
        <a href="glossary.html">📖 Glossary</a>
        <a href="https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022" target="_blank" rel="noopener">NESA Syllabus ↗</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 HSC SoftEng Notes · NESA NSW Aligned</span>
      <span>For educational purposes only</span>
    </div>
  </footer>

  <div class="lightbox-modal" id="diagram-lightbox" role="dialog" aria-labelledby="lightbox-title" aria-hidden="true">
    <div class="lightbox-overlay"></div>
    <div class="lightbox-container">
      <div class="lightbox-header">
        <h2 id="lightbox-title" class="lightbox-title">Diagram View</h2>
        <button class="lightbox-close" aria-label="Close diagram view">✕</button>
      </div>
      <div class="lightbox-canvas">
        <div class="lightbox-content" id="lightbox-content"></div>
      </div>
      <div class="lightbox-controls">
        <button class="lightbox-btn" id="zoom-out" aria-label="Zoom out">−</button>
        <span class="lightbox-zoom-level" id="zoom-level">100%</span>
        <button class="lightbox-btn" id="zoom-in" aria-label="Zoom in">+</button>
        <button class="lightbox-btn" id="reset-view" aria-label="Reset view">⟲</button>
      </div>
      <div class="lightbox-info">
        <p>Scroll to zoom • Drag to pan • <kbd>Esc</kbd> to close</p>
      </div>
    </div>
  </div>

  <script src="../js/main.js?v=9"></script>
</body>
</html>
```

---

### 2  Wire into `index.html`

Add a `.topic-card` to the correct year grid (`#year12` or `#year11`).
Pick 3 representative `<span class="topic-tag">` items. Update the section's
`<span class="topic-count">` count.

```html
<a href="topics/{{SLUG}}.html" class="topic-card year{{YEAR}}">
  <div class="card-icon">{{EMOJI}}</div>
  <div class="card-title">{{TITLE}}</div>
  <p class="card-desc">{{CARD_DESCRIPTION}}</p>
  <div class="card-meta">
    <div class="card-topics">
      <span class="topic-tag">Tag 1</span>
      <span class="topic-tag">Tag 2</span>
      <span class="topic-tag">Tag 3</span>
    </div>
    <span class="card-arrow">→</span>
  </div>
</a>
```

Also add a footer link in `index.html` under the matching year column:

```html
<a href="topics/{{SLUG}}.html">{{TITLE}}</a>
```

---

### 3  Wire into every other topic page

Every existing `topics/*.html` must have the new page added to:

- **Desktop nav dropdown** — add `<a href="{{SLUG}}.html" role="menuitem">{{EMOJI}} {{TITLE}}</a>`
  inside the correct `.nav-dropdown-menu` (Year 12 or Year 11)
- **Mobile menu section** — add `<a href="{{SLUG}}.html">{{EMOJI}} {{TITLE}}</a>`
  inside the matching `.mobile-menu-section`
- **Footer column** — add `<a href="{{SLUG}}.html">{{TITLE}}</a>`
  under the matching `<h4>` in the footer

Run this grep to find every file that needs updating:

```bash
grep -rl "nav-dropdown-y12\|nav-dropdown-y11" topics/ index.html
```

---

### 4  Update `sitemap.xml`

Add a `<url>` block. Use today's date as `<lastmod>` (YYYY-MM-DD).
Choose `<priority>` based on year (0.9 for both Y11 and Y12 topics).

```xml
<url>
  <loc>https://4bzdog.github.io/HSC_SoftwareEngineering/topics/{{SLUG}}.html</loc>
  <lastmod>{{TODAY}}</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
```

---

## Content patterns

### Callout boxes

```html
<div class="callout tip">      <!-- study tip -->
<div class="callout warning">  <!-- common mistake -->
<div class="callout danger">   <!-- critical concept -->
<div class="callout success">  <!-- correct approach / example -->
<div class="callout assessor"> <!-- HSC exam-specific guidance -->
```

### Key-terms grid

```html
<div class="key-terms">
  <div class="key-term">
    <dt>Term</dt>
    <dd>Definition — one sentence, precise.</dd>
  </div>
</div>
```

### Scrollable table

```html
<div class="table-wrap">
  <table>
    <thead><tr><th>Col A</th><th>Col B</th></tr></thead>
    <tbody><tr><td>…</td><td>…</td></tr></tbody>
  </table>
</div>
```

### Mermaid diagram block (with lightbox support)

```html
<div class="diagram-block">
  <h4>Diagram Title</h4>
  <div class="mermaid">
flowchart TD
  A[Start] --> B[Step]
  </div>
  <p class="diagram-caption">Caption text.</p>
</div>
```

### Code block (with copy button)

```html
<div class="code-block">
  <pre><code class="language-python">def example():
    pass
</code></pre>
</div>
```

---

## Gotchas

- **Relative vs root paths**: Pages in `topics/` must use `../css/`, `../js/`,
  and `../index.html`. The home page uses bare `css/`, `js/`, etc. Never use
  absolute `/css/` paths — GitHub Pages serves from a subpath.

- **CSS/JS cache version**: Always use `?v=9` on both `styles.css` and
  `main.js` links. If you bump styles.css, increment both query strings across
  *all* pages simultaneously, or users will see mixed versions.

- **Year label text**: `year11` → "Preliminary"; `year12` → "HSC".
  The `.meta-pill` class uses `year11` / `year12` as both CSS selector and
  aria label text, so keep them consistent.

- **Section IDs for TOC**: Every `<section id="...">` ID must exactly match
  the `href="#..."` in `.toc-list a`. A mismatch silently breaks active
  highlighting and smooth-scroll.

- **`.outcome-subtitle` JS transform**: Write `(SE-12-05, SE-12-06)` literally
  inside `.outcome-subtitle` — `main.js` converts them to `.outcome-badge`
  spans at runtime. Do not pre-render badges in HTML.

- **`.part-block` collapsibility**: JS wraps all siblings between `.part-block`
  elements into a collapsible group. Don't put content *outside* a section
  that should be grouped under a part — it will escape the collapse wrapper.

- **Description length**: Keep `<meta name="description">` and OG/Twitter
  descriptions between 120–160 characters. Run `wc -c` to verify.

- **Glossary auto-linker**: `main.js` auto-links the *first* occurrence of
  ~100 technical terms to `glossary.html`. You don't need manual `<a>` tags
  for glossary terms inside `.content-body` sections.

- **No build step**: This is pure static HTML. There is no `npm run build`.
  Simply open in a browser or run `python3 -m http.server 8000` to preview.

- **GitHub Actions validation**: The deploy workflow runs a DOCTYPE check
  on every HTML file before uploading. Every file must open with `<!DOCTYPE html>`.

---

## Example invocations

```
/add-topic
→ Adds a new topic page for "Data Science & Machine Learning" (Year 12)

/add-topic slug=algorithms-analysis title="Algorithms & Complexity" year=11 emoji=🔬
→ Scaffolds the Year 11 algorithms page with provided metadata

/add-topic
→ (no args) Claude will ask for required fields before proceeding
```

---

## Checklist (verify before committing)

- [ ] `topics/{{SLUG}}.html` created with correct relative paths (`../css/`, `../js/`)
- [ ] `?v=9` on both `styles.css` and `main.js` links
- [ ] Meta description 120–160 chars
- [ ] JSON-LD BreadcrumbList has correct 3-item chain (Home → Year N → Page)
- [ ] Section `id` attributes match `.toc-list a[href]` anchors exactly
- [ ] New card added to `index.html` year grid; topic count updated
- [ ] Footer link added to `index.html`
- [ ] New page linked in desktop nav dropdown of **all** existing topic pages
- [ ] New page linked in mobile menu of **all** existing topic pages
- [ ] New page linked in footer of **all** existing topic pages
- [ ] `sitemap.xml` updated with new `<url>` block
- [ ] `<!DOCTYPE html>` on line 1 (required by deploy workflow)
