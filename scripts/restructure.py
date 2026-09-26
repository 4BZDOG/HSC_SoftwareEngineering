#!/usr/bin/env python3
"""Rebuild a topic page's content to follow the NESA syllabus structure.

    python3 scripts/restructure.py <page-key> [--write]

Each page has a spec in scripts/page_specs.py that maps every NESA dot point
(from resources/nesa-syllabus-content.md) to a section id, a short heading and
the existing content chunks that belong under it. The script:

  * writes one part-block per NESA subheading and one <section> per dot point,
    in NESA's order, with the dot point quoted verbatim (plus its "Including"
    list),
  * moves existing content into place by chunk (a section's intro, or one of
    its <h3> blocks),
  * rebuilds the sidebar contents list, and
  * reports every chunk the spec did not use, so nothing is dropped silently.

Without --write it only prints the report.
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
try:
    from page_specs import SPECS  # noqa: E402
except ImportError:
    SPECS = {}

VERBS = ('Interpret and apply', 'Research and evaluate', 'Research and use', 'Research, experiment with and evaluate',
         'Design, develop and apply', 'Design, develop and implement', 'Design, develop and produce',
         'Design, construct and implement', 'Design and implement', 'Develop, construct and document',
         'Develop, modify and apply', 'Investigate and explain', 'Investigate and practise', 'Investigate and describe',
         'Explore and explain', 'Explore by implementation', 'Implement and modify', 'Identify and describe',
         'Observe and describe', 'Apply and describe', 'Apply and evaluate', 'Use and explain', 'Test and evaluate',
         'Analyse and respond', 'Create and use')


# ── Syllabus ────────────────────────────────────────────────────────────────

def load_syllabus():
    """{focus area title: [(subheading, [ {text, including[]} ])]}"""
    src = open(os.path.join(ROOT, 'resources', 'nesa-syllabus-content.md'), encoding='utf-8').read()
    areas = {}
    for block in re.split(r'^## Year 1[12] — ', src, flags=re.M)[1:]:
        title, body = block.split('\n', 1)
        subs = []
        for sub in re.split(r'^### ', body, flags=re.M)[1:]:
            name, rest = sub.split('\n', 1)
            points = []
            for line in rest.split('\n'):
                if line.startswith('- '):
                    points.append({'text': line[2:].strip(), 'including': []})
                elif line.startswith('    - '):
                    points[-1]['including'].append(line[6:].strip())
            subs.append((name.strip(), points))
        areas[title.strip()] = subs
    return areas


# ── Existing page ───────────────────────────────────────────────────────────

SECTION_RE = re.compile(r'<section id="([^"]+)"[^>]*>(.*?)</section>', re.S)


def split_chunks(inner):
    """Split a section's inner HTML into an intro and <h3> blocks."""
    oc = re.search(r'<p class="outcome-subtitle">.*?\(([^)]*)\)', inner, re.S)
    inner = re.sub(r'^\s*<h2 class="syllabus-phase"[^>]*>.*?</h2>', '', inner, flags=re.S)
    inner = re.sub(r'^\s*<p class="outcome-subtitle">.*?</p>', '', inner, flags=re.S)
    inner = re.sub(r'^\s*<p class="syllabus-concept">.*?</p>', '', inner, flags=re.S)
    inner = re.sub(r'^\s*<ul class="syllabus-including">.*?</ul>', '', inner, flags=re.S)
    parts = re.split(r'(?=<h3[\s>])', inner)
    chunks = {'intro': parts[0].strip(), '_outcomes': oc.group(1).strip() if oc else None}
    order = ['intro']
    for p in parts[1:]:
        title = html.unescape(re.sub(r'<.*?>', '', re.match(r'<h3[^>]*>(.*?)</h3>', p, re.S).group(1))).strip()
        key = title
        n = 2
        while key in chunks:
            key = f'{title} ({n})'
            n += 1
        chunks[key] = p.strip()
        order.append(key)
    return chunks, order


def resolve(ref, sections, used):
    if ref.lstrip().startswith('<'):
        return ref.strip()
    ref, _, cut = ref.partition('|')      # 'sid/chunk|before:TEXT' or '|from:TEXT'
    sid, _, sel = ref.partition('/')
    if sid not in sections:
        raise SystemExit(f'unknown section id: {sid}')
    chunks, order = sections[sid]
    if sel in ('', '*'):
        keys = [k for k in order if sel == '' or k != 'intro']
    elif sel == 'intro':
        keys = ['intro']
    else:
        keys = [k for k in order if k.lower().startswith(sel.lower())]
        if not keys:
            raise SystemExit(f'no chunk "{sel}" in #{sid}; have: {order}')
        keys = keys[:1]
    out = []
    for k in keys:
        used.add((sid, k))
        if chunks[k]:
            out.append(chunks[k])
    text = '\n\n'.join(out)
    if cut:
        mode, _, marker = cut.partition(':')
        i = text.index(marker)
        text = text[:i].rstrip() if mode == 'before' else text[i:]
    return text


def dot_point_html(text):
    for v in sorted(VERBS, key=len, reverse=True):
        if text.startswith(v + ' ') or text.startswith(v + ','):
            return f'<strong>{html.escape(v)}</strong>{html.escape(text[len(v):])}'
    verb, _, rest = text.partition(' ')
    return f'<strong>{html.escape(verb)}</strong> {html.escape(rest)}'


def build(key, write=False):
    spec = SPECS[key]
    path = os.path.join(ROOT, 'topics', spec['file'])
    page = open(path, encoding='utf-8').read()
    syllabus = load_syllabus()[spec['focus_area']]

    body_start = page.index('<div class="content-body">') + len('<div class="content-body">')
    body_end = page.index('</main>')
    body = page[body_start:body_end]
    # content-body closes just before </main>
    close_at = body.rstrip().rfind('</div>')
    body_inner = body[:close_at]

    sections = {sid: split_chunks(inner) for sid, inner in SECTION_RE.findall(body_inner)}
    used = set()

    out = ['']
    toc = []
    if len(spec['parts']) != len(syllabus):
        raise SystemExit(f'{key}: spec has {len(spec["parts"])} parts, syllabus has {len(syllabus)}')
    num = 0
    quiz_key = spec.get('quiz', key)   # key into js/quizzes.js
    for p_i, ((sub_name, points), part) in enumerate(zip(syllabus, spec['parts']), 1):
        if len(part) != len(points):
            raise SystemExit(f'{key} / {sub_name}: spec has {len(part)} entries, syllabus has {len(points)} dot points')
        out.append(f'''
        <!-- ═══════════════════════════════════════════════════════ -->
        <!--  {sub_name.upper():<54}-->
        <!-- ═══════════════════════════════════════════════════════ -->
        <div class="part-block">
          <span class="part-number">Syllabus Part {p_i}</span>
          <span class="part-name">{html.escape(sub_name)}</span>
        </div>
''')
        if p_i > 1:
            out.append(f'        <div class="quiz" data-quiz="{quiz_key}-{p_i - 1}"></div>\n')
        toc.append(f'        <li class="sidebar-label">Part {p_i} — {html.escape(sub_name)}</li>')
        first = True
        for point, entry in zip(points, part):
            num += 1
            if not first:
                out.append('        <hr class="divider" />\n')
            first = False
            including = ''
            if point['including']:
                items = ''.join(f'<li>{html.escape(i)}</li>' for i in point['including'])
                including = f'\n          <ul class="syllabus-including" aria-label="Including">{items}</ul>'
            content = '\n\n'.join(filter(None, (resolve(r, sections, used) for r in entry.get('src', []))))
            srcs = [r.split('/')[0] for r in entry.get('src', []) if not r.lstrip().startswith('<')]
            outcomes = entry.get('outcomes') or next(
                (sections[x][0]['_outcomes'] for x in srcs if sections[x][0].get('_outcomes')), spec['outcomes'])
            out.append(f'''        <section id="{entry['id']}">
          <h2 class="syllabus-phase">{html.escape(entry['title'])}</h2>
          <p class="outcome-subtitle">🎯 <em>({outcomes})</em></p>
          <p class="syllabus-concept">📌 <em>{dot_point_html(point['text'])}</em></p>{including}

          {content}
        </section>
''')
            toc.append(f'        <li><a href="#{entry["id"]}">{num}. {html.escape(entry.get("toc", entry["title"]))}</a></li>')

    out.append(f'        <div class="quiz" data-quiz="{quiz_key}-{len(syllabus)}"></div>\n')

    unused = []
    for sid, (chunks, order) in sections.items():
        for k in order:
            if (sid, k) not in used and chunks[k] and not (k == 'intro' and not re.sub(r'<[^>]+>|\s', '', chunks[k])):
                size = len(re.sub(r'<[^>]+>', '', chunks[k]))
                unused.append(f'  #{sid} / {k}  ({size} chars)')
    print(f'{key}: {num} dot points')
    print('UNUSED:\n' + ('\n'.join(unused) if unused else '  (none)'))

    if write:
        new_body = body[:0] + '\n'.join(out) + '\n      ' + body[close_at:]
        page = page[:body_start] + new_body + page[body_end:]
        page = re.sub(r'(<ul class="toc-list">).*?(</ul>)',
                      lambda m: m.group(1) + '\n' + '\n'.join(toc) + '\n      ' + m.group(2), page, count=1, flags=re.S)
        open(path, 'w', encoding='utf-8').write(page)
        print('written', path)


if __name__ == '__main__':
    build(sys.argv[1], '--write' in sys.argv)
