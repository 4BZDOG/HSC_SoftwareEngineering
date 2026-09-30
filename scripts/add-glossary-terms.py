#!/usr/bin/env python3
"""Insert any terms from scripts/glossary_new_terms.py that aren't in topics/glossary.html yet.

    python3 scripts/add-glossary-terms.py && python3 scripts/build-glossary.py && python3 scripts/site-chrome.py

The last step adds the topic icons to the new terms' topic tags.

Terms are placed alphabetically in their letter group; a missing letter group is created.
Each term is (id, name, [topic keys], definition, example[, options]); see the header of
scripts/glossary_new_terms.py. The options dict takes 'nesa': True (the definition is NESA's own; the card
carries a "NESA" badge and can be filtered) and 'see': [term ids] (the "See also" links). A term with
'nesa' that is already on the page is updated in place: its definition is replaced and the badge added,
and its tags, example and existing See also links are kept. Running the script again changes nothing.
"""
import os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from glossary_new_terms import TERMS, TOPIC_CHIPS

PATH = os.path.join(ROOT, 'topics', 'glossary.html')
s = open(PATH, encoding='utf-8').read()
existing = set(re.findall(r'id="(term-[^"]+)"', s))


NESA_TITLE = ('Definition from the NESA Software Engineering 11\u201312 Syllabus glossary. '
              '\u00a9 NSW Education Standards Authority (NESA).')
NESA_BADGE = f'<span class="chip chip-nesa term-nesa" title="{NESA_TITLE}">NESA</span>'
IND = ' ' * 14
NAMES = {t[0]: t[1] for t in TERMS if t[1]}
for m in re.finditer(r'<div class="glossary-term" id="(term-[^"]+)">\s*<h3>(.*?)</h3>', s):
    NAMES.setdefault(m.group(1), re.sub('<.*?>', '', m.group(2)))


def def_html(definition):
    """Paragraphs separated by a blank line; a paragraph may end in a <ul> list."""
    out = []
    for i, para in enumerate(definition.split('\n\n')):
        cls = '' if i == 0 else ' class="term-def-note"'
        if '<ul' in para:
            intro, rest = para.split('<ul', 1)
            out.append(f'<p{cls}>{intro.strip()}</p>\n{IND}<ul' + rest)
        else:
            out.append(f'<p{cls}>{para}</p>')
    return f'\n{IND}'.join(out)


def related_html(see, have=()):
    links = ', '.join(f'<a href="#{i}">{NAMES[i]}</a>' for i in see if i not in have)
    return f'<div class="glossary-related"><strong>See also:</strong> {links}</div>' if links else ''


def card(t):
    tid, name, topics, definition, example = t[:5]
    opts = t[5] if len(t) > 5 else {}
    chips = ''
    if opts.get('nesa'):
        chips += f'\n                {NESA_BADGE}'
    chips += ''.join(f'\n                <span class="chip {TOPIC_CHIPS[k][0]}">{TOPIC_CHIPS[k][1]}</span>' for k in topics)
    related = f'\n              {related_html(opts["see"])}' if opts.get('see') else ''
    return f'''            <div class="glossary-term" id="{tid}">
              <h3>{name}</h3>
              <div class="term-chips">{chips}
              </div>
              {def_html(definition)}
              <p class="term-example"><strong>Example:</strong> {example}</p>{related}
            </div>

'''


def update_card(s, t):
    """Replace the definition of a card already on the page with NESA's and mark it; keep everything else."""
    tid, definition = t[0], t[3]
    opts = t[5] if len(t) > 5 else {}
    m = re.search(r'(<div class="glossary-term" id="%s">)(.*?)(\n            </div>\n)' % re.escape(tid), s, re.S)
    body = m.group(2)
    new = body
    if 'term-nesa' not in new:
        new = new.replace('<div class="term-chips">', f'<div class="term-chips">\n                {NESA_BADGE}', 1)
    new = re.sub(r'(<div class="term-chips">.*?</div>\n)(.*?)(?=\n\s*<p class="term-example">)',
                 lambda k: k.group(1) + f'{IND}{def_html(definition)}', new, count=1, flags=re.S)
    if opts.get('see'):
        have = re.findall(r'href="#(term-[^"]+)"', re.search(r'<div class="glossary-related">.*?</div>', new, re.S).group(0)) \
            if 'glossary-related' in new else []
        extra = [i for i in opts['see'] if i not in have]
        if extra and have:
            links = ', '.join(f'<a href="#{i}">{NAMES[i]}</a>' for i in extra)
            new = re.sub(r'(<div class="glossary-related">.*?)(</div>)',
                         lambda k: f'{k.group(1)}, {links}{k.group(2)}', new, count=1, flags=re.S)
        elif extra:
            new = new.rstrip() + f'\n{IND}{related_html(extra)}'
    if new == body:
        return s, False
    return s[:m.start(2)] + new + s[m.end(2):], True


added = updated = 0
for t in sorted(TERMS, key=lambda x: (x[1] or NAMES[x[0]]).lower()):
    if t[0] in existing:
        if len(t) > 5 and t[5].get('nesa'):
            s, changed = update_card(s, t)
            updated += changed
        continue
    letter = t[1][0].upper()
    if f'id="alpha-{letter}"' not in s:
        later = [g for g in re.findall(r'id="alpha-([A-Z])"', s) if g > letter]
        group = f'''        <!-- ════════════ {letter} ════════════ -->
        <div class="glossary-group" id="alpha-{letter}">
          <div class="glossary-divider">
            <div class="glossary-letter-header">{letter}</div>
            <div class="glossary-divider-line"></div>
          </div>
          <div class="glossary-terms-grid">

          </div>
          <a href="#alpha-jump" class="back-to-top-link">↑ Back to Top</a>
        </div>

'''
        if later:
            i = s.index(f'        <!-- ════════════ {min(later)} ════════════ -->')
        else:  # after the last letter group
            end = '<a href="#alpha-jump" class="back-to-top-link">↑ Back to Top</a>\n        </div>\n'
            i = s.rindex(end) + len(end) + 1
        s = s[:i] + group + s[i:]
        s = s.replace(f'<span class="alpha-btn disabled">{letter}</span>', f'<a href="#alpha-{letter}" class="alpha-btn">{letter}</a>')
    g0 = s.index(f'id="alpha-{letter}"')
    gi = s.index('<div class="glossary-terms-grid">', g0) + len('<div class="glossary-terms-grid">')
    grid = s[gi:s.index('<a href="#alpha-jump" class="back-to-top-link">', g0)]
    pos = None
    for m in re.finditer(r'\n\s*<div class="glossary-term" id="[^"]+">\s*<h3>(.*?)</h3>', grid):
        if re.sub('<.*?>', '', m.group(1)).lower() > t[1].lower():
            pos = gi + m.start() + 1
            break
    if pos is None:
        pos = gi + grid.rstrip().rfind('</div>')
    s = s[:pos] + card(t) + s[pos:]
    added += 1

# Keep the static counts in step (the page script rewrites them once a filter is used).
total = len(re.findall(r'<div class="glossary-term" id="', s))
s = re.sub(r'(<strong id="total-terms-count">)\d+(</strong>)', rf'\g<1>{total}\g<2>', s)
s = re.sub(r'(placeholder="Search )\d+( terms")', rf'\g<1>{total}\g<2>', s)
open(PATH, 'w', encoding='utf-8').write(s)
print(f'{added} term(s) added, {updated} NESA definition(s) updated; {total} on the page')
