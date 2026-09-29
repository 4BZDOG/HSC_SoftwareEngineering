# Contributing to HSC Software Engineering Notes

Thank you for your interest in improving this project! This guide will help you get started.

## Getting Started

### Prerequisites
- Git
- A modern web browser
- Text editor (VS Code, Sublime, etc.)
- Basic HTML/CSS knowledge (for content or styling changes)

### Local Setup
1. **Fork the repository** on GitHub
2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HSC_SoftwareEngineering.git
   cd HSC_SoftwareEngineering
   ```
3. **Add upstream remote** (to stay in sync with main repo):
   ```bash
   git remote add upstream https://github.com/4BZDOG/HSC_SoftwareEngineering.git
   ```
4. **Open in browser:**
   ```bash
   # Option A: Simple (theme might not work properly)
   open index.html

   # Option B: Proper local server (recommended)
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

## Making Changes

### Create a Feature Branch
```bash
git checkout -b claude/your-feature-name
# Branch naming convention: claude/descriptive-kebab-case-name
```

### Follow the Code Style
- **HTML:** Use semantic tags (`<section>`, `<article>`, `<nav>`, etc.)
- **CSS:** Follow the custom properties system in `styles.css` (--primary, --accent, etc.)
- **JS:** Keep it vanilla JS — no dependencies
- **Comments:** Use `<!-- ── Section name ── -->` dividers for clarity

### Common Changes

#### Adding Content to a Topic Page
1. Locate the relevant file in `/topics/`
2. Follow the existing section structure:
   ```html
   <section id="section-id">
     <h2>📌 Section Title</h2>
     <p class="outcome-subtitle">🎯 <em>(SE-XX-XX)</em></p>
     <p class="syllabus-concept">📌 <em>Concept description...</em></p>
     <!-- Content -->
   </section>
   <hr class="divider" />
   ```
3. Update the sidebar TOC (inside `<aside class="sidebar">`)
4. Use existing CSS classes for styling (`.callout`, `.key-terms`, `.table-wrap`, etc.)

#### Adding a New Page
1. Copy an existing topic page as a template
2. Update `<title>` and meta tags
3. Update the breadcrumb in the header
4. Create full page content with sidebar TOC
5. Add the page to `PAGES` and `ICONS` (and `SEQUENCE` for a syllabus topic) in
   `scripts/site-chrome.py`, then run `python3 scripts/site-chrome.py`. It rebuilds the
   nav dropdowns, mobile menu, footer and previous / next cards on every page, so don't
   edit those by hand.
6. Add the page to:
   - `index.html` (topic card)
   - `sitemap.xml` (SEO)
   - `README.md` (documentation)

#### Updating Styles
- Modify `css/styles.css` — do NOT add inline `style` attributes
- Use CSS custom properties (e.g., `color: var(--primary)`)
- Test in both light and dark mode:
  ```html
  [data-theme="dark"] .my-class { /* dark mode styles */ }
  ```

#### Fixing a Bug
- Reference the issue number in your commit message: `fix: #123 — description`
- Include before/after screenshots if visual
- Test on mobile and desktop if the bug is layout-related

### Commit Messages
Use conventional commit format:
```
type: short description (50 chars max)

Longer explanation if needed.
- Bullet points for clarity
- Reference issue numbers: fixes #123

Co-Authored-By: Your Name <your@email.com>
```

**Types:**
- `feat:` — new feature or content
- `fix:` — bug fix
- `docs:` — documentation updates
- `style:` — CSS/styling changes
- `refactor:` — code reorganization (no feature change)
- `perf:` — performance improvements
- `test:` — test updates (if applicable)

### Testing Your Changes

#### Desktop
- [ ] Page loads without errors (check browser console)
- [ ] All links work
- [ ] Responsive design (resize to mobile width)
- [ ] Dark mode toggle works
- [ ] Tables are readable

#### Mobile
- [ ] Hamburger menu opens/closes
- [ ] Links are tappable (not too small)
- [ ] No horizontal scroll
- [ ] Footer is accessible

#### Cross-browser (if possible)
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

#### SEO (if adding pages)
- [ ] Inspect `<head>` — canonical URL, OG tags, description
- [ ] Run through https://www.seobility.net/en/seocheck/ for quick check

## Submitting Changes

### Push to Your Fork
```bash
git push -u origin claude/your-feature-name
```

### Create a Pull Request
1. Go to the original repo on GitHub
2. Click **New Pull Request**
3. Select your branch
4. Fill in the PR template:
   ```
   ## Summary
   What did you add/fix/change?

   ## Motivation
   Why is this change needed?

   ## Changes Made
   - Bullet list of changes
   - Reference relevant issues: fixes #123

   ## Testing
   - [ ] Desktop view
   - [ ] Mobile view
   - [ ] Dark mode
   - [ ] Links verified

   ## Screenshots (if visual change)
   Before/After or description
   ```

### During Review
- Respond to feedback promptly
- Push new commits to the same branch (don't create a new PR)
- Commits are automatically added to the PR
- If requested, rebase/squash commits before merging

## Guidelines & Standards

### Content
- **Align with NESA NSW HSC syllabus** — reference outcomes (SE-11-01, SE-12-XX)
- **Australian English** — use -our, -ise spellings (favour, organise)
- **Inclusive language** — avoid gendered pronouns, use clear examples
- **Command verbs** — align with NESA's required verbs (identify, describe, explain, justify, evaluate)
- **Accuracy** — cite sources; include assessment guidance from official specs

### Design
- **Mobile-first** — all features must work on mobile
- **Accessible** — semantic HTML, sufficient contrast, keyboard navigation
- **Consistent** — follow existing patterns; don't introduce new component styles
- **Dark mode** — always test both light and dark themes

### Code
- **Keep it simple** — prefer vanilla HTML/CSS/JS; no build tools
- **No external dependencies** — fonts are preconnected but local; no npm packages
- **Comments** — use sparingly; code should be self-documenting
- **Performance** — avoid unnecessary assets; optimize images

### Commits
- **Atomic** — one logical change per commit
- **Descriptive** — message explains *why*, not just *what*
- **Signed** — ideally GPG-signed (optional but encouraged)

## Project Structure

```
topics/              # Topic pages (add/edit here)
css/                 # Styling (modify styles.css)
js/                  # JavaScript (main.js handles nav/theme)
diagrams/            # Mermaid diagrams
resources/           # Markdown & PDF files
.github/workflows/   # CI/CD (deployment automation)
robots.txt           # SEO
sitemap.xml          # SEO
README.md            # Documentation
.gitignore           # Git configuration
```

## Common Questions

**Q: How do I add a new course topic?**  
A: Create a new `.html` file in `/topics/` following the template structure, add it to `scripts/site-chrome.py` and run it (this updates the nav and footer on every page), add it to sitemap.xml, and document it in README.md.

**Q: Can I add JavaScript frameworks or libraries?**  
A: Preferably not — this site is intentionally dependency-free. If absolutely necessary, discuss in an issue first.

**Q: How are diagrams handled?**  
A: Diagrams are written in Mermaid and pre-rendered to inline SVG by `npm run diagrams` (see Diagrams below). Pages do not load Mermaid.

**Q: What if my change breaks dark mode?**  
A: Test with `[data-theme="dark"]` selector. All colors should be defined via CSS custom properties. Check the existing callout styles or section backgrounds for patterns.

**Q: How do I preview my changes before pushing?**  
A: Run `python3 -m http.server 8000` and open `http://localhost:8000`. Changes auto-refresh in the browser.

## Getting Help

- **Questions?** Open a discussion issue on GitHub
- **Found a bug?** Create an issue with reproduction steps
- **Want a feature?** Suggest it in an issue; discuss before implementing
- **Stuck?** Reference `README.md`, `DEBUGGING_GUIDE.md`, or ask in an issue

## Code of Conduct

- Be respectful and inclusive
- No harassment or discrimination
- Constructive feedback only
- Assume good intent

---

Thank you for contributing! Your help makes this resource better for students. 🙌

## Syllabus structure and glossary tooling

- `resources/nesa-syllabus-content.md` is the source of truth: NESA's focus areas, subheadings and dot points, verbatim and in order.
- Each topic page has one part per NESA subheading and one `<section>` per dot point. `scripts/page_specs.py` maps dot points to sections; `python3 scripts/restructure.py <page-key>` reports any content that isn't mapped (add `--write` to rebuild the page).
- `python3 scripts/copy_audit.py` lists each section's length against the scope its NESA verb implies (brief for *describe*/*outline*, broader for *investigate*/*evaluate*).
- Glossary terms live in `topics/glossary.html`. After editing it, run `python3 scripts/build-glossary.py` to regenerate `js/glossary-data.js`, which powers the inline definition popovers.
- `python3 scripts/build-mapping.py` regenerates `resources/Syllabus-Mapping.md`.
- To add glossary terms, append them to `scripts/glossary_new_terms.py`, then run `python3 scripts/add-glossary-terms.py && python3 scripts/build-glossary.py`.
- Each topic page's quiz questions live in `js/quizzes/<slug>.js` (five per part, one quiz per NESA subheading). `scripts/check-site.py` also checks that each section's "Including" list is NESA's, that outcome codes belong to the focus area, and that the sidebar lists the sections in order.
- `CLAUDE.md` and `.claude/content-brief.md` describe the conventions for AI-assisted edits, shared with the sister Enterprise Computing site.
- Before opening a pull request, run `python3 scripts/check-site.py` and `bash scripts/validate-alignment.sh`. Both run automatically on every pull request (`.github/workflows/checks.yml`).

## Diagrams

Every diagram is a numbered `.figure` with a title, a one-sentence lead, "What to notice" points and a "Try this" prompt (see `.claude/skills/add-topic.md`). Flowcharts, structure charts, DFDs, decision trees and class diagrams must follow the symbols in the NESA Software Engineering Course Specifications; `scripts/check-site.py` rejects flowcharts that use other symbols, miss BEGIN/END terminators, leave decision arrows unlabelled or contain emoji. Structure charts and DFDs are drawn by `js/nesa-diagrams.js` from data in `js/nesa-diagram-data.js`.

Mermaid diagrams are pre-rendered, so pages load no diagram library and work on networks that block CDNs. Write the source in `<div class="mermaid">…</div>`, then run:

```bash
npm install        # once: Mermaid, Playwright and the Inter font
npm run diagrams   # draws new or edited diagrams as light and dark SVGs
```

The source stays in the page inside `<template class="mermaid-source">`; edit it there and run `npm run diagrams` again. Use `npm run diagrams:all` to redraw everything (for example after changing the palette in `scripts/diagram-theme.js`). If Playwright cannot find a browser, run `npx playwright install chromium` or set `CHROMIUM_PATH`.

## Animated diagrams

Some concepts are processes: a forged request travelling to a bank, keys being exchanged, a model training, a rollout over several weeks. These are drawn as **animated diagrams** in the same paper-cut style as the rest of the site, with captions, play/pause, step controls, scenario tabs and a text transcript. They respect "reduce motion" and work at phone width and in dark mode.

- `js/anim.js` is the engine and the shared kit of paper cut-outs (characters, buildings, browser windows, envelopes, keys, stamps, plots); `css/anim.css` styles it.
- Each animation is one file, `js/anims/<name>.js`, loaded on demand from `<div class="anim" data-anim="<name>"></div>` inside a `.figure`.
- A page with animations links `../css/anim.css` and `../js/anim.js` once. `scripts/check-site.py` checks the link and the scene file.

The style guide, the scene API and a copy-paste template are in `.claude/skills/add-animation.md`.

## Static diagrams in the paper style

Year 12 static figures (flowcharts, decision trees, sequence diagrams, Gantt charts, concept diagrams) are drawn by the same engine as the animations, in "still" mode: `<div class="anim" data-anim="<name>"></div>` inside a `.figure-canvas--still`, with the drawing in `js/anims/<name>.js`. They use the NESA symbols, a fixed colour per symbol, and text no smaller than 13px. The spec, including the notation rules and a template, is in `.claude/skills/paper-diagrams.md`.
