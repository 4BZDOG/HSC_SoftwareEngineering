#!/usr/bin/env python3
"""Site checks run on every pull request (see .github/workflows/checks.yml).

    python3 scripts/check-site.py

Fails (exit 1) when:
  * a topic page's dot points differ from NESA's text or order,
  * an internal link points at a page or #id that doesn't exist,
  * a page repeats an id,
  * <div>/<section>/<main>/<ul>/<ol>/<table> tags are unbalanced,
  * an animated diagram has no scene in js/anims/, or its page doesn't load the engine,
  * js/glossary-data.js is out of date, or rebuilding the glossary changes glossary.html.
"""
import hashlib
import glob
import html
import html.parser
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from restructure import load_syllabus  # noqa: E402

FOCUS_AREAS = {
    'programming-fundamentals.html': 'Programming fundamentals',
    'object-oriented-paradigm.html': 'The object-oriented paradigm',
    'programming-mechatronics.html': 'Programming mechatronics',
    'secure-software-architecture.html': 'Secure software architecture',
    'programming-for-the-web.html': 'Programming for the web',
    'software-automation.html': 'Software automation',
    'software-engineering-project.html': 'Software engineering project',
}
PAGES = [os.path.join(ROOT, 'index.html'), os.path.join(ROOT, '404.html')] + sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html')))
errors = []


def fail(msg):
    errors.append(msg)


def text(fragment):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', fragment))).strip()


# 1. Dot points match NESA
syllabus = load_syllabus()
for page, area in FOCUS_AREAS.items():
    src = open(os.path.join(ROOT, 'topics', page), encoding='utf-8').read()
    on_page = [text(m) for m in re.findall(r'<p class="syllabus-concept">📌 <em>(.*?)</em></p>', src, re.S)]
    expected = [p['text'] for _, pts in syllabus[area] for p in pts]
    if on_page != expected:
        for i, (a, b) in enumerate(zip(on_page, expected)):
            if a != b:
                fail(f'{page}: dot point {i + 1} is "{a[:70]}", NESA says "{b[:70]}"')
                break
        else:
            fail(f'{page}: {len(on_page)} dot points on the page, NESA has {len(expected)}')
    parts = [text(p) for p in re.findall(r'<span class="part-name">(.*?)</span>', src)]
    if parts != [s for s, _ in syllabus[area]]:
        fail(f'{page}: parts {parts} do not match NESA subheadings')

# 1b. Every quiz placeholder has questions
bank = open(os.path.join(ROOT, 'js', 'quizzes.js'), encoding='utf-8').read()
quiz_keys = set(re.findall(r"^\s*'([a-z]+-\d+)':\s*\[", bank, re.M))
for page in FOCUS_AREAS:
    src = open(os.path.join(ROOT, 'topics', page), encoding='utf-8').read()
    for key in re.findall(r'<div class="quiz" data-quiz="([^"]+)">', src):
        if key not in quiz_keys:
            fail(f'{page}: quiz "{key}" has no questions in js/quizzes.js')

# 1c. Figures follow the NESA conventions
EMOJI = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF]')
for path in sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))):
    rel = os.path.relpath(path, ROOT)
    src = open(path, encoding='utf-8').read()
    if 'diagram-block' in src:
        fail(f'{rel}: old .diagram-block container; use a .figure')
    for fig in re.findall(r'<figure class="figure">.*?</figure>', src, re.S):
        title = re.search(r'<h4 class="figure-title">(.*?)</h4>', fig)
        name = text(title.group(1)) if title else '(untitled figure)'
        if not title or '<p class="figure-lead">' not in fig:
            fail(f'{rel}: figure "{name}" needs a title and a lead sentence')
        if '<div class="mermaid">' in fig:
            fail(f'{rel}: figure "{name}" has a diagram that has not been drawn; run npm run diagrams')
            continue
        block = re.search(r'<div class="mermaid" data-diagram="([0-9a-f]+)">(.*?)<template class="mermaid-source">(.*?)</template>', fig, re.S)
        if not block:
            continue
        code = html.unescape(block.group(3)).strip()
        if hashlib.sha1(code.encode('utf-8')).hexdigest()[:10] != block.group(1):
            fail(f'{rel}: figure "{name}" was edited since it was drawn; run npm run diagrams')
        if 'dg-light' not in block.group(2) or 'dg-dark' not in block.group(2):
            fail(f'{rel}: figure "{name}" needs both its light and dark SVG; run npm run diagrams')
        if EMOJI.search(code):
            fail(f'{rel}: figure "{name}" has emoji inside the diagram')
        kind = re.search(r'<span class="figure-kind">(.*?)</span>', fig)
        if kind and kind.group(1) == 'Flowchart':
            # NESA flowchart symbols only: terminator ([ ]), process [ ], decision { }, I/O [/ /], subprogram [[ ]]
            for bad, label in (('((', 'circle'), ('[(', 'cylinder'), ('{{', 'hexagon'), ('>"', 'flag shape')):
                if bad in code:
                    fail(f'{rel}: flowchart "{name}" uses a {label}, which is not a NESA flowchart symbol')
            if not re.search(r'\(\["BEGIN', code) or not re.search(r'\(\["END', code):
                fail(f'{rel}: flowchart "{name}" must start with a BEGIN terminator and finish with END')
            decisions = re.findall(r'(\w+)\{"', code)
            for d in decisions:
                exits = re.findall(rf'^\s*{d}\s*(--[^>]*?-->|-->)', code, re.M)
                if any(e == '-->' for e in exits):
                    fail(f'{rel}: flowchart "{name}" has an unlabelled arrow leaving decision {d}')

# 1e. Animated diagrams: each data-anim has a scene in js/anims/, and its page loads the engine
for path in sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))):
    rel = os.path.relpath(path, ROOT)
    src = open(path, encoding='utf-8').read()
    names = re.findall(r'data-anim="([^"]+)"', src)
    if not names:
        continue
    if '../css/anim.css' not in src or '../js/anim.js' not in src:
        fail(f'{rel}: has animated diagrams but does not load css/anim.css and js/anim.js')
    for name in names:
        scene = os.path.join(ROOT, 'js', 'anims', name + '.js')
        if not os.path.exists(scene):
            fail(f'{rel}: animated diagram "{name}" has no scene file js/anims/{name}.js')
        elif f"HSCAnim.define('{name}'" not in open(scene, encoding='utf-8').read():
            fail(f'js/anims/{name}.js does not call HSCAnim.define(\'{name}\', …)')
    for fig in re.findall(r'<figure class="figure">.*?</figure>', src, re.S):
        if 'data-anim=' in fig and ('<span class="figure-kind">Animated diagram</span>' not in fig or 'figure-canvas--anim' not in fig):
            fail(f'{rel}: an animated figure needs the "Animated diagram" kind and a .figure-canvas--anim canvas')

# 1d. A term is bolded once per paragraph or list item: repeats, or a second
#     spelling of it ("algorithm" then "algorithms"), add noise, not emphasis.
def bold_key(fragment):
    w = text(fragment).lower().replace('’', "'")
    w = re.sub(r"'s$", '', w)
    w = re.sub(r'[\s-]+', '', w).replace('isation', 'ization')
    return re.sub(r'(ies|es|s)$', '', w)


for page in sorted(glob.glob(os.path.join(ROOT, 'topics', '*.html'))):
    name = os.path.basename(page)
    if name in ('glossary.html', 'resources.html'):
        continue
    src = open(page, encoding='utf-8').read()
    for block in re.findall(r'<(?:p|li)(?: [^>]*)?>.*?</(?:p|li)>', src, re.S):
        seen = set()
        for frag in re.findall(r'<strong>((?:(?!</?strong>).)*?)</strong>', block, re.S):
            key = bold_key(frag)
            if len(key) > 2 and not text(frag).endswith(':') and key in seen:
                fail(f'{name}: "{text(frag)}" is bolded more than once in one paragraph')
                break
            seen.add(key)

# 2–4. Links, ids, balance
ids = {}
for path in PAGES:
    src = open(path, encoding='utf-8').read()
    found = re.findall(r'\sid="([^"]+)"', src)
    dupes = {i for i in found if found.count(i) > 1}
    if dupes:
        fail(f'{os.path.relpath(path, ROOT)}: repeated ids {sorted(dupes)[:5]}')
    ids[os.path.normpath(path)] = set(found)


class Balance(html.parser.HTMLParser):
    TAGS = {'div', 'section', 'main', 'ul', 'ol', 'table'}

    def __init__(self):
        super().__init__()
        self.stack, self.bad = [], []

    def handle_starttag(self, tag, attrs):
        if tag in self.TAGS:
            self.stack.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag in self.TAGS:
            if self.stack and self.stack[-1][0] == tag:
                self.stack.pop()
            else:
                self.bad.append((tag, self.getpos()[0]))


for path in PAGES:
    rel = os.path.relpath(path, ROOT)
    src = open(path, encoding='utf-8').read()
    b = Balance()
    b.feed(src)
    if b.bad or b.stack:
        where = b.bad[0] if b.bad else b.stack[-1]
        fail(f'{rel}: unbalanced <{where[0]}> near line {where[1]}')
    if path.endswith('404.html'):
        continue  # served from the site root with absolute paths
    markup = re.sub(r'<(code|pre)[^>]*>.*?</\1>', '', src, flags=re.S)  # ignore example code shown as text
    for href in re.findall(r'href="([^"]+)"', markup):
        if re.match(r'^(https?:|mailto:|tel:|javascript:|data:|//)', href) or href == '#':
            continue
        target, _, anchor = href.partition('#')
        target_path = os.path.normpath(os.path.join(os.path.dirname(path), target)) if target else os.path.normpath(path)
        target_path = target_path.split('?')[0]
        if target and not os.path.exists(target_path):
            fail(f'{rel}: link to missing file {href}')
        elif anchor and target_path.endswith('.html') and anchor not in ids.get(target_path, set()):
            fail(f'{rel}: link to missing #{anchor} in {os.path.basename(target_path)}')

# 5. Glossary data and the resources page are current, and both builds are idempotent
with tempfile.TemporaryDirectory() as tmp:
    for d in ('scripts', 'topics', 'js'):
        shutil.copytree(os.path.join(ROOT, d), os.path.join(tmp, d))
    subprocess.run([sys.executable, os.path.join(tmp, 'scripts', 'build-glossary.py')], check=True, capture_output=True)
    for rel in ('topics/glossary.html', 'js/glossary-data.js'):
        if open(os.path.join(tmp, rel), encoding='utf-8').read() != open(os.path.join(ROOT, rel), encoding='utf-8').read():
            fail(f'{rel} changes when scripts/build-glossary.py runs; run it and commit the result')
    # The resources page is built from sdlc.html's shell and the data in build-resources.py
    subprocess.run([sys.executable, os.path.join(tmp, 'scripts', 'build-resources.py')], check=True, capture_output=True)
    if open(os.path.join(tmp, 'topics', 'resources.html'), encoding='utf-8').read() != open(os.path.join(ROOT, 'topics', 'resources.html'), encoding='utf-8').read():
        fail('topics/resources.html changes when scripts/build-resources.py runs; run it and commit the result')

if errors:
    print(f'{len(errors)} problem(s):')
    for e in errors:
        print('  ✗', e)
    sys.exit(1)
print(f'✓ All checks passed ({len(PAGES)} pages, {len(FOCUS_AREAS)} focus areas)')
