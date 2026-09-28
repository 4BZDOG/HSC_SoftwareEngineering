#!/usr/bin/env python3
"""Apply the shared site chrome (navigation, footer, topic icons) to every page.

    python3 scripts/site-chrome.py

One icon per page lives in ICONS below. The script rewrites, on index.html,
404.html and every page in topics/:

  * the desktop dropdown items (icon, title and a one-line summary),
  * the mobile menu (rebuilt from one template so every page matches),
  * the icon beside the page's <h1>,
  * the icon on the sidebar "Contents" title,
  * the footer (rebuilt from one template), with icons on its links,
  * type="button" on any button that lacks a type,
  * the previous / next topic cards at the end of each topic page,
  * the topic tags on glossary terms (icon, and a button that filters the
    glossary to that topic). New terms from add-glossary-terms.py come in
    as plain tags; re-run this script afterwards.

It is safe to run again: blocks it has already rewritten are rebuilt, not
duplicated. Add a new page to PAGES (and ICONS) and re-run it.
"""
import glob
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Inner SVG markup for a 24x24 stroked icon. The topic icons match the
# cards on the home page.
ICONS = {
    'home': '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
    'programming-fundamentals': '<path d="M8 8l-4.5 4L8 16M16 8l4.5 4L16 16M13 5l-2 14"/>',
    'object-oriented-paradigm': '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    'programming-mechatronics': '<rect x="7" y="7" width="10" height="10" rx="2"/><rect x="10.5" y="10.5" width="3" height="3"/><path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3"/>',
    'secure-software-architecture': '<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"/><rect x="9" y="10.5" width="6" height="5" rx="1"/><path d="M10.5 10.5V9a1.5 1.5 0 0 1 3 0v1.5"/>',
    'programming-for-the-web': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.4 3.8 5.6 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.6-3.8-9s1.3-6.6 3.8-9z"/>',
    'software-automation': '<path d="M20 8a8.1 8.1 0 0 0-14.9 1M4 16a8.1 8.1 0 0 0 14.9-1"/><path d="M4 4v5h5M20 20v-5h-5"/>',
    'software-engineering-project': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3.5"/>',
    'sdlc': '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17.5l9 5 9-5"/>',
    'course-tools': '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3.6 17.1a1.9 1.9 0 0 0 2.7 2.7l5.7-5.7a4 4 0 0 0 5.1-5.4l-2.5 2.5-2.1-.6-.6-2.1z"/>',
    'glossary': '<path d="M3 5.5c3-1.3 6-1.3 9 .5 3-1.8 6-1.8 9-.5V19c-3-1.3-6-1.3-9 .5-3-1.8-6-1.8-9-.5z"/><path d="M12 6v13.5"/>',
    'resources': '<path d="M6.5 3h11v18l-5.5-3.8L6.5 21z"/><path d="M9.5 9.5l2 2 3.5-3.5"/>',
}

# slug: (group, title, summary)
PAGES = {
    'programming-fundamentals': ('y11', 'Programming Fundamentals', 'Algorithms, data and testing'),
    'object-oriented-paradigm': ('y11', 'Object-Oriented Paradigm', 'Classes, objects and design'),
    'programming-mechatronics': ('y11', 'Programming Mechatronics', 'Sensors, actuators and control'),
    'secure-software-architecture': ('y12', 'Secure Software Architecture', 'Secure design and defensive code'),
    'programming-for-the-web': ('y12', 'Programming for the Web', 'Protocols, front end and back end'),
    'software-automation': ('y12', 'Software Automation', 'Machine learning and AI'),
    'software-engineering-project': ('y12', 'Software Engineering Project', 'Plan, build and evaluate'),
    'course-tools': ('core', 'Course Tools &amp; Specs', 'Symbols, syntax and tools'),
    'sdlc': ('core', 'SDLC Guide', 'The development life cycle'),
    'glossary': ('core', 'Glossary', 'Every syllabus keyword'),
    'resources': ('core', 'Certified Resources', 'Official NESA documents'),
}
# Course order for the previous / next cards
SEQUENCE = ['programming-fundamentals', 'object-oriented-paradigm', 'programming-mechatronics',
            'secure-software-architecture', 'programming-for-the-web', 'software-automation',
            'software-engineering-project']
# Glossary tag text -> page
CHIP_SLUGS = {PAGES[k][1]: k for k in SEQUENCE}
CHIP_SLUGS['SDLC'] = 'sdlc'

GROUPS = [
    ('y11', 'Year 11', '<span class="badge badge-11">Prelim</span>'),
    ('y12', 'Year 12', '<span class="badge badge-12">HSC</span>'),
    ('core', 'Resources', '<span class="badge badge-all">Guides</span>'),
]


def svg(name, cls):
    return (f'<span class="{cls}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">'
            f'{ICONS[name]}</svg></span>')


def item(slug, prefix, extra=''):
    group, title, summary = PAGES[slug]
    return (f'<a href="{prefix}{slug}.html"{extra} class="nav-item nav-item-{group}">'
            f'{svg(slug, "nav-ico")}<span class="nav-item-text"><span class="nav-item-title">{title}</span>'
            f'<span class="nav-item-desc">{summary}</span></span></a>')


def block_end(text, start):
    """Index just past the </div> that closes the <div> opening at start."""
    depth, i = 0, start
    for m in re.compile(r'<div\b|</div>').finditer(text, start):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0:
            return m.end()
    raise ValueError('unbalanced div')


def mobile_menu(prefix, home):
    parts = ['<div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="Navigation menu">',
             f'    <a href="{home}" class="nav-item mobile-home">{svg("home", "nav-ico")}'
             '<span class="nav-item-text"><span class="nav-item-title">Home</span>'
             '<span class="nav-item-desc">All topics and study tips</span></span></a>']
    for group, label, badge in GROUPS:
        parts.append(f'    <div class="mobile-menu-section mobile-menu-{group}">')
        parts.append(f'      <div class="mobile-menu-label">{label} {badge}</div>')
        for slug, (g, _, _) in PAGES.items():
            if g == group:
                parts.append('      ' + item(slug, prefix))
        parts.append('    </div>')
    parts.append('    <div class="mobile-menu-section mobile-menu-theme">')
    parts.append('      <button id="theme-toggle-mobile" class="btn btn-mobile-theme" type="button">Toggle theme</button>')
    parts.append('    </div>')
    parts.append('  </div>')
    return '\n'.join(parts)


def dropdown_items(text, prefix):
    """Rewrite each dropdown menu's links, keeping the menu's own set of pages."""
    out, pos = [], 0
    for m in re.finditer(r'<div class="nav-dropdown-menu" role="menu">', text):
        end = block_end(text, m.start())
        body = text[m.end():end - len('</div>')]
        slugs = re.findall(r'href="[^"]*?([a-z-]+)\.html"', body)
        role = ' role="menuitem"'
        links = '\n'.join('            ' + item(s, prefix, role) for s in slugs if s in PAGES)
        out.append(text[pos:m.end()] + '\n' + links + '\n          </div>')
        pos = end
    out.append(text[pos:])
    return ''.join(out)


def footer(prefix, home, page_title):
    cols = []
    for group, label, _ in GROUPS:
        links = [f'        <a href="{prefix}{s}.html">{t}</a>' for s, (g, t, _) in PAGES.items() if g == group]
        if group == 'core':
            links.append('        <a href="https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022" '
                         'target="_blank" rel="noopener">NESA Syllabus ↗</a>')
        cols.append(f'      <div class="footer-col footer-col-{group}">\n        <h4>{label}</h4>\n' + '\n'.join(links) + '\n      </div>')
    where = f' · {page_title}' if page_title else ''
    return f'''<footer>
    <div class="footer-inner">
      <div>
        <a href="{home}" class="footer-brand">
          <div class="footer-logo" aria-hidden="true">{{&hairsp;}}</div>
          <span class="footer-name">SoftEng Notes</span>
        </a>
        <p class="footer-desc">Notes for every dot point of the NSW HSC Software Engineering syllabus, from Year 11 foundations to the Year 12 exam.</p>
      </div>
{chr(10).join(cols)}
    </div>
    <div class="footer-bottom">
      <span>© 2026 HSC SoftEng Notes{where}</span>
      <span>Aligned to the NESA syllabus · For educational purposes only</span>
    </div>
  </footer>'''


def footer_icons(text, prefix, home):
    m = re.search(r'<footer\b.*?</footer>', text, re.S)
    if not m:
        return text
    foot = re.sub(r'<span class="f-ico" aria-hidden="true"><svg.*?</svg></span>', '', m.group(0))

    def link(a):
        href, label = a.group(1), a.group(2)
        slug = 'home' if href.endswith('index.html') else href.rsplit('/', 1)[-1][:-5]
        if slug not in ICONS:
            return a.group(0)
        # Drop a leading emoji or arrow; the icon replaces it.
        label = re.sub(r'^(?:[^\w&<]|&[a-z]+;)+\s*', '', label.strip())
        return f'<a href="{href}">{svg(slug, "f-ico")}{label}</a>'
    foot = re.sub(r'<a href="((?:/[\w-]+/)?(?:\.\./)?(?:topics/)?[a-z-]+\.html)">([^<]*)</a>', link, foot)
    return text[:m.start()] + foot + text[m.end():]


def pager(slug):
    i = SEQUENCE.index(slug)
    cells = []
    for j, rel in ((i - 1, 'prev'), (i + 1, 'next')):
        if 0 <= j < len(SEQUENCE):
            t = SEQUENCE[j]
            group, title, summary = PAGES[t]
            label = 'Previous topic' if rel == 'prev' else 'Next topic'
            cells.append(f'<a class="pager-card pager-{rel} nav-item-{group}" href="{t}.html" rel="{rel}">'
                         f'{svg(t, "pager-ico")}<span class="pager-text"><span class="pager-dir">{label}</span>'
                         f'<span class="pager-title">{title}</span><span class="pager-desc">{summary}</span></span></a>')
        else:
            cells.append(f'<span class="pager-card pager-{rel} pager-empty" aria-hidden="true"></span>')
    return ('<nav class="topic-pager" aria-label="Previous and next topic">\n          '
            + '\n          '.join(cells) + '\n        </nav>')


def glossary_chips(text):
    def chip(m):
        cls, label = m.group(1), m.group(2).strip()
        slug = CHIP_SLUGS.get(label)
        if not slug:
            return m.group(0)
        return (f'<button type="button" class="{cls} chip-topic" data-topic="{label}" '
                f'title="Show every {label} keyword">{svg(slug, "c-ico")}{label}</button>')
    return re.sub(r'<(?:span|button type="button") class="(chip chip-[a-z0-9]+)(?: chip-topic)?"[^>]*>'
                  r'(?:<span class="c-ico" aria-hidden="true"><svg.*?</svg></span>)?([^<]+)</(?:span|button)>',
                  chip, text)


def page_slug(path):
    return os.path.basename(path)[:-5]


def apply(path):
    text = open(path, encoding='utf-8').read()
    orig = text
    name = os.path.relpath(path, ROOT)
    if name == 'index.html':
        prefix, home = 'topics/', 'index.html'
    elif name == '404.html':  # served from any path, so links are site-absolute
        prefix, home = '/HSC_SoftwareEngineering/topics/', '/HSC_SoftwareEngineering/index.html'
    else:
        prefix, home = '', '../index.html'
    slug = page_slug(path)

    text = dropdown_items(text, prefix)

    # Home link in the desktop bar
    text = re.sub(r'<li><a href="([^"]*index\.html)"[^>]*>(?:<span class="nav-ico" aria-hidden="true"><svg.*?</svg></span>)?Home</a></li>',
                  lambda m: f'<li><a href="{m.group(1)}" class="nav-home">{svg("home", "nav-ico")}Home</a></li>', text)

    m = re.search(r'<div class="mobile-menu" id="mobile-menu"', text)
    if m:
        text = text[:m.start()] + mobile_menu(prefix, home) + text[block_end(text, m.start()):]

    if slug in PAGES:
        group = PAGES[slug][0]
        # Icon beside the page title
        text = re.sub(r'<div class="topic-title-row">\s*<span class="topic-hero-icon[^"]*".*?</svg></span>\s*(<h1>.*?</h1>)\s*</div>',
                      r'\1', text, flags=re.S)
        text = re.sub(r'(\n\s*)(<h1>.*?</h1>)',
                      lambda h: (f'{h.group(1)}<div class="topic-title-row">{svg(slug, "topic-hero-icon ti-" + group)}'
                                 f'{h.group(2)}</div>'), text, count=1, flags=re.S)
        # Icon on the sidebar contents title
        text = re.sub(r'<div class="toc-title">(?:<span class="toc-ico[^"]*" aria-hidden="true"><svg.*?</svg></span>)*',
                      f'<div class="toc-title">{svg(slug, "toc-ico ti-" + group)}', text)

    # One footer on every page
    title = PAGES[slug][1].replace('&amp;', '&') if slug in PAGES else ''
    title = {'Course Tools & Specs': 'Course Tools & Specifications'}.get(title, title)
    text = re.sub(r'<footer>.*?</footer>', lambda m: footer(prefix, home, title.replace('&', '&amp;')), text, count=1, flags=re.S)
    text = footer_icons(text, prefix, home)

    # Every button gets an explicit type
    text = re.sub(r'<button(?![^>]*\btype=)', '<button type="button"', text)

    # Previous / next topic cards, just after the content column
    if slug in SEQUENCE:
        text = re.sub(r'\n\s*<nav class="topic-pager".*?</nav>', '', text, flags=re.S)
        m = re.search(r'<div class="content-body">', text)
        end = block_end(text, m.start())
        text = text[:end] + '\n\n        ' + pager(slug) + text[end:]

    if slug == 'glossary':
        text = glossary_chips(text)

    # Topic chips on the 404 page
    def chip(c):
        slug = c.group(2).rsplit('/', 1)[-1][:-5]
        return f'{c.group(1)}{svg(slug, "f-ico")}' if slug in ICONS else c.group(0)
    text = re.sub(r'(<a class="lost-link[^"]*" href="([^"]+\.html)">)(?:<span class="f-ico" aria-hidden="true"><svg.*?</svg></span>)?',
                  chip, text)
    if text != orig:
        open(path, 'w', encoding='utf-8').write(text)
        print('updated', os.path.relpath(path, ROOT))


if __name__ == '__main__':
    for p in [os.path.join(ROOT, 'index.html'), os.path.join(ROOT, '404.html')] + sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))):
        apply(p)
