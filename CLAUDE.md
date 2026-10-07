# CLAUDE.md

Guide for Claude Code sessions working on **HSC Software Engineering Notes ("SoftEng Notes")**. Read this first, then `CONTRIBUTING.md` and (when writing or extending a page) `.claude/content-brief.md`.

## Purpose and audience
A free static study-notes site for NSW HSC Software Engineering (NESA Software Engineering 11–12 Syllabus, 2022), for students aged 16 to 18 and their teachers. One page per focus area, one section per NESA dot point. Live at https://4bzdog.github.io/HSC_SoftwareEngineering/ ; repo https://github.com/4BZDOG/HSC_SoftwareEngineering ; deployed by GitHub Pages (`.github/workflows/deploy.yml`).

- **UK / Australian English** everywhere (organisation, analyse, behaviour; licence as a noun; program for software).
- Accuracy over flourish: no invented statistics, dates, quotes, company claims or legislation. Australian context first (Privacy Act 1988 and the APPs, OAIC, Notifiable Data Breaches scheme, ASD's ACSC and the Essential Eight, eSafety, legislation.gov.au).
- Depth follows the NESA command verb: brief and precise for identify/outline/describe; causes and effects for explain/compare; criteria, perspectives and a judgement for investigate/evaluate; a worked, reproducible example for apply/design/develop/implement.
- The sister site **HSC Enterprise Computing** (https://github.com/4BZDOG/HSC-Enterprise-Computing) uses the same framework and conventions; keep the two consistent.

## Sources of truth
- `resources/nesa-syllabus-content.md`: focus areas, subheadings, dot points and "Including" lists, **verbatim** and in order. Never reword them on a page.
- NESA Software Engineering Course Specifications (`resources/software-engineering-11-12-2022-higher-school-certificate-course-specifications.pdf`): flowchart, structure chart, DFD, decision tree and class diagram notation, pseudocode and other conventions. `topics/course-tools.html` summarises them; use NESA's symbols and terms exactly.
- `resources/se-assessment.md` (assessment and HSC exam facts, each with its source), `resources/se-syllabus-glossary.md` (NESA's glossary meanings), `resources/se-official-links.md` (checked URLs). Use only what these verify; where NESA publishes nothing, say so.
- `scripts/page_specs.py` maps NESA dot points to section ids and headings.

## File layout
```
index.html  404.html  sitemap.xml  robots.txt  og-image.png  package.json
topics/     7 focus-area pages + course-tools, sdlc, example-project, glossary, resources
css/        styles.css (base), paper.css (paper-cut theme), anim.css (diagram kit), labs.css (lab kit), gitlab.css, greenhouse.css, pages/<slug>.css, fonts/ (self-hosted WOFF2)
js/         main.js, progress.js, quiz.js, quizzes/<slug>.js, glossary-data.js (generated), paper.js,
            nesa-diagrams.js, nesa-diagram-data.js, anim.js, anims/<scene>.js, algo-trace(s).js, greenhouse.js,
            labs.js (lab kit), gitlab.js (Git sandbox), pages/<slug>.js (each page's hands-on tools)
scripts/    site-chrome.py, check-site.py, check-layout.mjs, validate-alignment.sh, restructure.py, page_specs.py,
            build-glossary.py, add-glossary-terms.py, glossary_new_terms.py, glossary_examples.py,
            build-mapping.py, build-resources.py, copy_audit.py, render-diagrams.mjs
resources/  syllabus content, research notes, mapping      .claude/skills/  add-topic, paper-diagrams, add-animation
```
Focus-area slugs and quiz prefixes: `programming-fundamentals` (pf), `object-oriented-paradigm` (oop), `programming-mechatronics` (mech) for Year 11; `secure-software-architecture` (ssa), `programming-for-the-web` (web), `software-automation` (auto), `software-engineering-project` (sep) for Year 12.

## Never hand-edit
- **Navigation, mobile menu, footer, previous/next cards, title and sidebar icons, `?v=` cache-busting queries**: `python3 scripts/site-chrome.py` rebuilds them on every page from `PAGES`, `ICONS` and `SEQUENCE` (the `?v=` is a content hash of each css/ and js/ file, so edit the file, run the script, and visitors get the new version).
- `js/glossary-data.js` (`build-glossary.py`), `resources/Syllabus-Mapping.md` (`build-mapping.py`), `topics/resources.html` (`build-resources.py`).
- The syllabus scaffolding on focus-area pages: each `.part-name`, `<p class="syllabus-concept">` and `<ul class="syllabus-including">`. `scripts/check-site.py` fails if they differ from NESA's text, if an outcome code doesn't belong to the focus area, or if the sidebar doesn't list the sections in order.
- Mermaid diagrams are pre-rendered: edit the `<template class="mermaid-source">` and run `npm run diagrams`.

## Commands to run before committing
```bash
python3 scripts/site-chrome.py
python3 scripts/build-glossary.py
python3 scripts/build-mapping.py
python3 scripts/check-site.py
bash scripts/validate-alignment.sh
```
`python3 scripts/copy_audit.py` lists each section's length against the scope its verb implies. `node scripts/check-layout.mjs` (add `--quick` for a shorter run) checks for sideways scrolling at 375 to 1440 px and that the shared page frame holds; it needs Playwright and is not part of CI, so run it before a pull request that touches layout or styling. Serve locally with `python3 -m http.server <port>`; screenshot with Playwright (`require('/opt/node22/lib/node_modules/playwright')`; never run `playwright install`). Check light and dark mode and a 390 px phone width (no horizontal page scroll).

## Content conventions
- **Callouts**: `<div class="callout tip|info|warning|danger|success|assessor">` with a leading `<strong>Label</strong>`; `assessor` is for HSC exam guidance (at least one per part).
- **Key terms**: `<div class="key-terms">` with `<div class="key-term-item"><strong>Term</strong><span>Definition.</span></div>` items.
- **Tables**: always inside `<div class="table-wrap">`. **Code**: `<div class="code-block"><pre><code class="language-python">…</code></pre></div>`.
- **Figures**: `<figure class="figure">` with `figcaption.figure-head` (`.figure-kicker > .figure-kind`, `h4.figure-title`, `p.figure-lead`), a `.figure-canvas` (`--still` or `--anim` for kit scenes), and `.figure-notes` ("What to notice" list and a `p.figure-try` "Try this"). Every diagram uses NESA notation; `check-site.py` enforces the flowchart rules.
- **Diagrams** use the shared kit, never hand-written SVG: scenes in `js/anims/<name>.js` used as `<div class="anim" data-anim="name">` (see `.claude/skills/paper-diagrams.md` and `add-animation.md`); structure charts and DFDs via `js/nesa-diagrams.js` + `js/nesa-diagram-data.js`. New scene files use the page's prefix.
- **Hands-on labs** ("Try it" tools) are built on the shared lab kit: `css/labs.css` and `js/labs.js` (`Labs.shell`, `Labs.table`, `Labs.sorter`, `Labs.fit`; the same two files are in the Enterprise Computing repo, so edit them in both). The page's script (`js/pages/<slug>.js`) fills a host such as `<div data-weblab="perf" class="lab">`; the host holds a static fallback sentence for when JavaScript is off, so write it as a real summary. Hosts go inside a section, never inside a paragraph, list, table or code block. Write everything shown with `textContent`, keep to the theme tokens (so light and dark both work), use `.lab-*` classes rather than new look-and-feel, keep a tool to a few controls, and check it at 390 px (no sideways scroll; tables use `{ stack: true }`). Use NESA notation and only facts the page already supports.
- **Quizzes**: `<div class="quiz" data-quiz="<prefix>-<N>">` at the end of each part; five questions per part (`{ q, options[4], answer, why }`) in that page's `js/quizzes/<slug>.js`, mixing recall and scenario questions in the style of HSC objective items, with the correct option position varied.
- **Glossary**: add terms via `scripts/glossary_new_terms.py`, then `add-glossary-terms.py` → `build-glossary.py` → `site-chrome.py`. NESA's own glossary terms keep NESA's definition and are acknowledged.
- Only touch the files for your task. Shared files (`css/`, `js/main.js`, `scripts/`, `index.html`) change only when the task says so.

## Shared chrome contract (identical on both sites)
Enterprise Computing and Software Engineering are one family: a student moving between them should find the same bar, menus, footer and landing-page order. Skins differ (Enterprise Computing: navy "Data Studio", mono labels; Software Engineering: cream paper-cut, serif, torn edges); structure, geometry and behaviour do not. A change to any item below goes into **both** repos in the same step.
- **Frame.** `--frame` (1280px; 1520px from 1680px wide), `--frame-pad` (1.5rem; 2rem from 1400px) and `--bar-h` (64px; 56px once scrolled) are defined in the "Shared page frame" block at the end of `css/paper.css`. The bar, hero, home sections, topic header, page layout and footer all take their width and gutters from it, so they share one left edge and one right edge. Do not give a container its own `max-width` or inline padding.
- **Bar.** Brand tile (36px, an SVG mark owned by `scripts/site-chrome.py`) and name on the left; a recessed rail (Home, Year 11, Year 12, Resources) centred in the viewport from 920px; theme toggle on the right; hamburger below 920px. Dropdowns open on hover and on click; a click on a menu that hover has already opened keeps it open.
- **Footer.** Brand and blurb, then Year 11, Year 12 and Resources columns (one column from 480px down); copyright line and note; then the "More from 4BZDOG" row (from `MORE_LINKS` in `scripts/site-chrome.py`). Micro-labels are at least 0.72rem, other footer text at least 0.78rem. The phone Contents button steps aside while the footer is on screen.
- **Home page.** Same order on both: hero (pill, headline, lede, the two buttons, four figures, the seven topic chips), How to use these notes, search, Year 11, Year 12, Resources, Course at a glance, footer. Year headings read "Year 11: Preliminary Course" with "N focus areas · H hrs"; each focus-area card has a kicker (focus area number, hours), an outcome range and a dot-point count. The hero's composition is the skin's own (a dashboard on the left, or a paper diorama), but its content and order are shared. `scripts/check-site.py` checks the home figures against the pages.

## Storage, dependencies, links
- Storage keys: `hsc-theme`, `hsc-parts`, `hsc-collapsed`, plus progress keys in `js/progress.js`. The Enterprise Computing site on the same origin uses `ec-` keys, so they don't collide; keep new SE keys `hsc-`/`se-` prefixed and wrap storage access in try/catch.
- **Fonts are served from `css/fonts/`** (licences in its `README.md`); no page or stylesheet may call a font host, and `check-site.py` fails if one does.
- **No external JS or CSS libraries and no CDNs** in pages. Vanilla HTML/CSS/JS; use the theme's custom properties so light and dark mode work; respect `prefers-reduced-motion`.
- External links only to reputable, stable sources; check each returns HTTP 200.

## Copyright
Syllabus text and Course Specifications are © NESA, used under NESA's licence for NSW teachers' non-commercial educational use; acknowledge NESA as the source. Write examples, quizzes and prose originally.
