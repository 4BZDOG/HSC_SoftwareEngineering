#!/usr/bin/env python3
"""Replace old .diagram-block containers with .figure containers (one-off migration).

    python3 scripts/migrate_figures.py            # dry run: old title → new title
    python3 scripts/migrate_figures.py --write
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from figures_spec import FIGURES  # noqa: E402

BLOCK = re.compile(r'<div class="diagram-block[^"]*">')
EMOJI = re.compile('[\U0001F000-\U0001FAFF☀-➿⬀-⯿️‍⃣]\\s?')


def block_end(src, start):
    """Index just past the </div> that closes the <div> opening at start."""
    depth, i = 0, start
    for m in re.finditer(r'<div\b|</div>', src[start:]):
        depth += 1 if m.group(0) == '<div' else -1
        if depth == 0:
            return start + m.end()
    raise ValueError('unclosed block')


def clean_mermaid(code):
    code = EMOJI.sub('', code)
    code = re.sub(r'</?(b|i|strong|em)>', '', code)
    code = re.sub(r'[━─]{3,}(<br/>)?', '', code)
    code = re.sub(r'<br/>\s*<br/>', '<br/>', code)
    return code


def esc(t):
    return html.escape(t, quote=False).replace('&#x27;', "'")


def figure(e, canvas):
    notice = ''.join(f'<li>{esc(n)}</li>' for n in e.get('notice', []))
    notes = ''
    if notice or e.get('try'):
        notes = '\n          <div class="figure-notes">'
        if notice:
            notes += f'\n            <div><h5>What to notice</h5><ul>{notice}</ul></div>'
        if e.get('try'):
            notes += f'\n            <p class="figure-try"><strong>Try this</strong>{esc(e["try"])}</p>'
        notes += '\n          </div>'
    return f'''<figure class="figure">
          <figcaption class="figure-head">
            <p class="figure-kicker"><span class="figure-kind">{esc(e["kind"])}</span></p>
            <h4 class="figure-title">{esc(e["title"])}</h4>
            <p class="figure-lead">{esc(e["lead"])}</p>
          </figcaption>
          <div class="figure-canvas">
            {canvas}
          </div>{notes}
        </figure>'''


def canvas_for(e, old):
    if 'nesa' in e:
        return f'<div class="nesa-diagram" data-diagram="{e["nesa"]}"></div>'
    if 'html' in e:
        return e['html']
    if e.get('keephtml'):
        body = re.sub(r'^<div[^>]*>|</div>$', '', old.strip(), flags=re.S)
        body = re.sub(r'<h4[^>]*>.*?</h4>|<p class="diagram-(subtitle|description|caption)">.*?</p>', '', body, flags=re.S)
        return body.strip()
    if 'mermaid' in e:
        code = e['mermaid']
    else:
        code = clean_mermaid(re.search(r'<div class="mermaid">(.*?)</div>', old, re.S).group(1)).strip('\n')
        code = '\n'.join(l[min(len(l) - len(l.lstrip()) for l in code.split('\n') if l.strip()):] if l.strip() else '' for l in code.split('\n'))
    code = code.replace('<', '&lt;').replace('>', '&gt;').replace('&lt;br/&gt;', '<br/>') if 'mermaid' in e else code
    return f'<div class="mermaid">\n{code}\n            </div>'


def migrate(page, write):
    path = os.path.join(ROOT, 'topics', page)
    src = open(path, encoding='utf-8').read()
    spans = []
    pos = 0
    while True:
        m = BLOCK.search(src, pos)
        if not m:
            break
        end = block_end(src, m.start())
        spans.append((m.start(), end))
        pos = end
    entries = FIGURES[page]
    print(f'{page}: {len(spans)} blocks, {len(entries)} entries')
    if len(spans) != len(entries):
        raise SystemExit('count mismatch')
    out = src
    for (s, e_), entry in reversed(list(zip(spans, entries))):
        old = src[s:e_]
        t = re.search(r'<h4[^>]*>(.*?)</h4>', old, re.S)
        print(f'   {html.unescape(re.sub("<.*?>", "", t.group(1))) if t else "?":60.60} → {"(dropped)" if entry.get("drop") else entry["title"]}')
        if entry.get('drop'):
            new = ''
        else:
            parts = []
            if 'before' in entry:
                k, lead, canvas = entry['before']
                parts.append(figure({'kind': 'Reference', 'title': k, 'lead': lead}, canvas))
            parts.append(figure(entry, canvas_for(entry, old)))
            if 'after' in entry:
                kind, title, lead, key, notice, tr = entry['after']
                parts.append(figure({'kind': kind, 'title': title, 'lead': lead, 'notice': notice, 'try': tr},
                                    f'<div class="nesa-diagram" data-diagram="{key}"></div>'))
            new = '\n\n        '.join(parts)
        out = out[:s] + new + out[e_:]
    if write:
        open(path, 'w', encoding='utf-8').write(out)


if __name__ == '__main__':
    for page in FIGURES:
        migrate(page, '--write' in sys.argv)
