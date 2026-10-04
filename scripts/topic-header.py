#!/usr/bin/env python3
"""Rebuild the paper-cut header on each focus-area page and tag the page with its colour.

    python3 scripts/topic-header.py

Each of the seven focus areas has its own colour (the tokens are in the
"Focus-area colours" section of css/paper.css) and its own cut-paper
illustration (ART below). The script:

  * sets data-focus="<key>" on <html> of each focus-area page, which switches
    the page's accent colour and tints the header and its paper hills,
  * rewrites <header class="topic-header"> to add the illustration, a row of
    figures (dot points, parts, outcomes, length) and a strip of part cards
    that jump to each part; counts are read from the page, so they follow
    the syllabus content,
  * on index.html adds a strip of the seven focus areas to the hero and the
    matching illustration to each focus-area card.

The breadcrumb, title row, introduction and meta pills already on each page
are kept. Safe to run again. Run site-chrome.py afterwards.
"""
import html
import math
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPPING_URL = 'https://github.com/4BZDOG/HSC_SoftwareEngineering/blob/main/resources/Syllabus-Mapping.md'

FOCUS = {
    'programming-fundamentals': 'pf', 'object-oriented-paradigm': 'oop', 'programming-mechatronics': 'mech',
    'secure-software-architecture': 'ssa', 'programming-for-the-web': 'web', 'software-automation': 'auto',
    'software-engineering-project': 'sep',
}
SHORT = {
    'programming-fundamentals': 'Programming Fundamentals', 'object-oriented-paradigm': 'Object-Oriented Paradigm',
    'programming-mechatronics': 'Programming Mechatronics', 'secure-software-architecture': 'Secure Software Architecture',
    'programming-for-the-web': 'Programming for the Web', 'software-automation': 'Software Automation',
    'software-engineering-project': 'Software Engineering Project',
}


# ── Cut-paper illustrations ──────────────────────────────────────────────────
def svg(body):
    return ('<svg viewBox="0 0 520 340" role="presentation" focusable="false">'
            '<rect class="sv-sheet" x="12" y="14" width="496" height="314" rx="14"/>'
            '<rect class="sv-tape" x="222" y="4" width="76" height="24" rx="3" transform="rotate(-3 260 16)"/>'
            f'{body}</svg>')


def t(x, y, s, cls='sv-text', anchor='start'):
    return f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{html.escape(s)}</text>'


def arrow(x1, y1, x2, y2):
    a = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(a), y2 - 9 * math.sin(a)
    p1 = (hx + 5 * math.sin(a), hy - 5 * math.cos(a))
    p2 = (hx - 5 * math.sin(a), hy + 5 * math.cos(a))
    return (f'<line class="sv-line" x1="{x1}" y1="{y1}" x2="{hx:.1f}" y2="{hy:.1f}"/>'
            f'<polygon class="sv-ink" points="{x2},{y2} {p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"/>')


def art_pf():
    b = '<g class="sv-p">'
    b += '<rect class="sv-t" x="52" y="44" width="116" height="34" rx="17"/>' + t(110, 66, 'START', 'sv-text w', 'middle')
    b += arrow(110, 78, 110, 104)
    b += '<rect class="sv-t2" x="52" y="104" width="116" height="40" rx="3"/>' + t(110, 129, 'READ n', 'sv-text', 'middle')
    b += arrow(110, 144, 110, 168)
    b += '<polygon class="sv-m" points="110,168 168,208 110,248 52,208"/>' + t(110, 213, 'n > 0 ?', 'sv-text', 'middle')
    b += arrow(168, 208, 214, 208) + t(178, 200, 'YES', 'sv-text s')
    b += '<rect class="sv-t3" x="214" y="188" width="104" height="40" rx="3"/>' + t(266, 213, 'total + n', 'sv-text', 'middle')
    b += arrow(110, 248, 110, 276) + t(118, 266, 'NO', 'sv-text s')
    b += '<rect class="sv-t" x="52" y="276" width="116" height="30" rx="15"/>' + t(110, 296, 'END', 'sv-text w', 'middle')
    b += '<rect class="sv-code" x="262" y="44" width="210" height="112" rx="8"/>'
    for i, (ln, ind) in enumerate([('while n > 0:', 0), ('total += n', 1), ('n -= 1', 1), ('print(total)', 0)]):
        b += t(278 + ind * 16, 72 + i * 24, ln, 'sv-text code')
    for i, v in enumerate(['0110', '1011', '0001']):
        x = 352 + i * 40
        b += f'<rect class="sv-t2 a-lit" style="--i:{i}" x="{x}" y="256" width="34" height="24" rx="5"/>' + t(x + 17, 273, v, 'sv-text s', 'middle')
    b += t(352, 246, 'BINARY', 'sv-text s') + '</g>'
    return svg(b)


def art_oop():
    b = '<g class="sv-p">'
    def cls_box(x, y, w, name, attr, meth, tone):
        o = f'<rect class="sv-w" x="{x}" y="{y}" width="{w}" height="102" rx="4"/><rect class="{tone}" x="{x}" y="{y}" width="{w}" height="28" rx="4"/>'
        o += t(x + w / 2, y + 19, name, 'sv-text w', 'middle')
        o += f'<line class="sv-line thin" x1="{x}" y1="{y+28}" x2="{x+w}" y2="{y+28}"/>' + t(x + 10, y + 48, attr, 'sv-text s')
        o += f'<line class="sv-line thin" x1="{x}" y1="{y+60}" x2="{x+w}" y2="{y+60}"/>' + t(x + 10, y + 80, meth, 'sv-text s')
        return o
    b += cls_box(180, 38, 160, 'Animal', '+ name : str', '+ speak()', 'sv-t')
    b += cls_box(36, 206, 170, 'Dog', '+ breed : str', '+ speak()', 'sv-t2')
    b += cls_box(314, 206, 170, 'Cat', '+ indoor : bool', '+ speak()', 'sv-m')
    b += '<path class="sv-line" d="M121 206 V172 H260 V156 M399 206 V172 H260" fill="none"/>'
    b += '<polygon class="sv-w stroke" points="248,156 260,136 272,156"/>'
    b += '<circle class="sv-m" cx="432" cy="76" r="26"/>' + t(432, 80, 'rex', 'sv-text', 'middle') + t(432, 118, 'OBJECT', 'sv-text s', 'middle')
    b += '<path class="sv-line dash" d="M406 76 H345" fill="none"/>'
    return svg(b + '</g>')


def art_mech():
    b = '<g class="sv-p">'
    for i in range(5):
        y = 120 + i * 24
        b += f'<rect class="sv-k" x="168" y="{y}" width="22" height="7" rx="2"/><rect class="sv-k" x="332" y="{y}" width="22" height="7" rx="2"/>'
    b += '<rect class="sv-code" x="186" y="98" width="150" height="150" rx="10"/>' + t(261, 176, 'MCU', 'sv-text c b', 'middle') + t(261, 198, 'loop()', 'sv-text s c', 'middle')
    b += '<circle class="sv-m" cx="261" cy="124" r="6"/>'
    # sensor (left) with waves
    b += '<circle class="sv-t" cx="76" cy="124" r="28"/><circle class="sv-w" cx="76" cy="124" r="10"/>'
    for r in (40, 52):
        b += f'<path class="sv-line thin" d="M{76-r*0.7:.0f} {124-r*0.7:.0f} A{r} {r} 0 0 1 {76+r*0.7:.0f} {124-r*0.7:.0f}" fill="none"/>'
    b += t(76, 176, 'SENSOR', 'sv-text s', 'middle')
    b += '<path class="sv-line" d="M104 124 H168" fill="none"/><path class="sv-line" d="M186 168 H112 V258" fill="none"/>'
    # gear (motor)
    cx, cy = 440, 234
    b += '<g class="a-spin">'
    for k in range(10):
        a = k * 36
        b += f'<rect class="sv-t2" x="{cx-7}" y="{cy-46}" width="14" height="16" rx="2" transform="rotate({a} {cx} {cy})"/>'
    b += f'<circle class="sv-t2" cx="{cx}" cy="{cy}" r="36"/><circle class="sv-w" cx="{cx}" cy="{cy}" r="12"/></g>' + t(cx, cy + 66, 'MOTOR', 'sv-text s', 'middle')
    b += '<path class="sv-line" d="M354 180 H400 V234 H404" fill="none"/>'
    # LED
    b += '<circle class="sv-m a-pulse" cx="440" cy="92" r="20"/><circle class="sv-w" cx="440" cy="92" r="8"/>' + t(440, 138, 'LED', 'sv-text s', 'middle')
    b += '<path class="sv-line" d="M354 132 H420" fill="none"/>'
    b += '<rect class="sv-t3" x="40" y="258" width="170" height="40" rx="6"/>' + t(125, 283, 'if temp > 30: fan.on()', 'sv-text s', 'middle')
    return svg(b + '</g>')


def shield(cx, top, w, h):
    return (f'M{cx} {top} L{cx+w/2} {top+h*0.14} V{top+h*0.52} C{cx+w/2} {top+h*0.8} {cx+w*0.22} {top+h*0.93} {cx} {top+h} '
            f'C{cx-w*0.22} {top+h*0.93} {cx-w/2} {top+h*0.8} {cx-w/2} {top+h*0.52} V{top+h*0.14} Z')


def art_ssa():
    b = '<g class="sv-p">'
    b += f'<path class="sv-t3" d="{shield(138, 40, 200, 250)}"/><path class="sv-t2" d="{shield(138, 70, 150, 190)}"/><path class="sv-t" d="{shield(138, 100, 100, 130)}"/>'
    b += '<circle class="sv-m" cx="138" cy="160" r="14"/><rect class="sv-m" x="134" y="168" width="8" height="26" rx="2"/>'
    b += '<circle class="sv-code" cx="138" cy="160" r="5"/>'
    for i, (lab, tone) in enumerate([('AUTHENTICATE', 'sv-t'), ('VALIDATE INPUT', 'sv-t2'), ('ENCRYPT DATA', 'sv-m')]):
        y = 56 + i * 76
        b += f'<rect class="{tone}" x="270" y="{y}" width="204" height="52" rx="6"/>' + t(288, y + 31, lab, 'sv-text' + (' w' if tone == 'sv-t' else ''))
        b += f'<g class="a-pop" style="--i:{i*3+2}"><circle class="sv-w" cx="452" cy="{y+26}" r="11"/><path class="sv-line thin" d="M446 {y+26} l4 4 l8 -9" fill="none"/></g>'
    b += arrow(250, 90, 266, 90) + arrow(250, 166, 266, 166) + arrow(250, 242, 266, 242)
    b += t(270, 300, 'DEFENCE IN DEPTH', 'sv-text s')
    return svg(b + '</g>')


def art_web():
    b = '<g class="sv-p">'
    b += '<rect class="sv-w stroke" x="32" y="44" width="290" height="206" rx="8"/><rect class="sv-t" x="32" y="44" width="290" height="30" rx="8"/><rect class="sv-t" x="32" y="60" width="290" height="14"/>'
    for i, c in enumerate(['sv-m', 'sv-t3', 'sv-t3']):
        b += f'<circle class="{c}" cx="{50+i*16}" cy="59" r="4.5"/>'
    b += '<rect class="sv-t3" x="106" y="50" width="200" height="18" rx="9"/>' + t(124, 63, 'https://notes.example', 'sv-text s')
    b += '<rect class="sv-t2" x="48" y="90" width="258" height="64" rx="4"/>' + t(64, 128, '<h1>Hello</h1>', 'sv-text')
    for i in range(3):
        x = 48 + i * 88
        b += f'<rect class="sv-t3" x="{x}" y="168" width="80" height="62" rx="4"/><rect class="sv-t" x="{x+8}" y="178" width="40" height="6" rx="2"/><rect class="sv-t2" x="{x+8}" y="192" width="60" height="5" rx="2"/><rect class="sv-t2" x="{x+8}" y="204" width="48" height="5" rx="2"/>'
    for i in range(3):
        y = 70 + i * 52
        b += f'<rect class="{"sv-code" if i != 1 else "sv-t"}" x="396" y="{y}" width="102" height="42" rx="6"/><circle class="sv-m" cx="412" cy="{y+21}" r="5"/><rect class="sv-w" x="428" y="{y+17}" width="56" height="8" rx="3"/>'
    b += t(447, 56, 'SERVER', 'sv-text s', 'middle')
    b += arrow(326, 104, 392, 104) + t(334, 96, 'GET', 'sv-text s') + arrow(392, 160, 326, 160) + t(334, 178, '200 OK', 'sv-text s')
    b += '<circle class="sv-m a-req" cx="326" cy="104" r="5"/><circle class="sv-t a-res" cx="392" cy="160" r="5"/>'
    b += '<rect class="sv-t2" x="40" y="268" width="62" height="34" rx="8"/>' + t(71, 290, '</>', 'sv-text', 'middle')
    b += '<rect class="sv-m" x="114" y="268" width="62" height="34" rx="8"/>' + t(145, 290, '{ }', 'sv-text', 'middle')
    b += '<rect class="sv-t" x="188" y="268" width="62" height="34" rx="8"/>' + t(219, 290, 'SQL', 'sv-text w', 'middle')
    b += t(300, 290, 'HTTPS · API · DNS', 'sv-text s')
    return svg(b + '</g>')


def art_auto():
    b = '<g class="sv-p">'
    b += '<rect class="sv-w stroke" x="32" y="44" width="220" height="150" rx="8"/>' + t(46, 64, 'REGRESSION', 'sv-text s')
    pts = [(62, 168), (82, 156), (98, 160), (116, 138), (134, 142), (152, 122), (170, 126), (190, 104), (208, 108), (228, 88)]
    b += '<line class="sv-line thin" x1="52" y1="172" x2="240" y2="84" stroke-dasharray="6 4"/>'
    b += ''.join(f'<circle class="{"sv-m" if i % 3 == 0 else "sv-t"}" cx="{x}" cy="{y}" r="5"/>' for i, (x, y) in enumerate(pts))
    b += '<rect class="sv-code" x="274" y="44" width="214" height="150" rx="8"/>' + t(290, 64, 'NEURAL NETWORK', 'sv-text s c')
    layers = [(310, 3), (380, 4), (450, 2)]
    pos = [[(x, 84 + (110 / n) * (i + .5)) for i in range(n)] for x, n in layers]
    for a, c in zip(pos, pos[1:]):
        for (x1, y1) in a:
            for (x2, y2) in c:
                b += f'<line class="sv-edge" x1="{x1}" y1="{y1:.0f}" x2="{x2}" y2="{y2:.0f}"/>'
    for li, ly in enumerate(pos):
        for (x, y) in ly:
            b += f'<circle class="{"sv-m" if li == 2 else "sv-t2"}" cx="{x}" cy="{y:.0f}" r="8"/>'
    steps = ['DATA', 'TRAIN', 'TEST', 'DEPLOY']
    for i, s in enumerate(steps):
        x = 40 + i * 118
        b += f'<rect class="{["sv-t3", "sv-t2", "sv-t", "sv-m"][i]} a-lit" style="--i:{i}" x="{x}" y="236" width="92" height="44" rx="22"/>' + t(x + 46, 263, s, 'sv-text' + (' w' if i == 2 else ''), 'middle')
        if i < 3:
            b += arrow(x + 94, 258, x + 116, 258)
    b += '<path class="sv-line dash" d="M486 292 Q260 330 86 292" fill="none"/>'
    return svg(b + '</g>')


def art_sep():
    b = '<g class="sv-p">'
    cols = [('TO DO', 'sv-t3', [('sv-w', 1), ('sv-w', 2), ('sv-w', 1)]), ('DOING', 'sv-t2', [('sv-m', 2), ('sv-w', 1)]), ('DONE', 'sv-t', [('sv-w', 1), ('sv-w', 1), ('sv-w', 2)])]
    for i, (name, tone, cards) in enumerate(cols):
        x = 34 + i * 156
        b += f'<rect class="{tone}" x="{x}" y="44" width="142" height="196" rx="8"/>' + t(x + 12, 64, name, 'sv-text' + (' w' if tone == 'sv-t' else ''))
        y = 76
        for c, h in cards:
            hh = 26 + h * 14
            b += f'<rect class="{c}" x="{x+10}" y="{y}" width="122" height="{hh}" rx="4"/><rect class="sv-t" x="{x+18}" y="{y+9}" width="{50+h*14}" height="6" rx="2"/>'
            if h == 2:
                b += f'<rect class="sv-t3" x="{x+18}" y="{y+22}" width="76" height="5" rx="2"/>'
            y += hh + 8
    b += '<line class="sv-line" x1="44" y1="288" x2="478" y2="288"/>'
    for i in range(5):
        x = 44 + i * 108
        b += f'<circle class="{"sv-m" if i == 3 else "sv-t"}" cx="{x}" cy="288" r="8"/>'
    b += '<circle class="sv-m a-travel" cx="44" cy="288" r="11"/>'
    b += t(44, 316, 'SPRINT 1', 'sv-text s') + t(260, 316, 'REVIEW', 'sv-text s') + t(436, 316, 'RELEASE', 'sv-text s', 'middle')
    return svg(b + '</g>')


ART = {'pf': art_pf, 'oop': art_oop, 'mech': art_mech, 'ssa': art_ssa, 'web': art_web, 'auto': art_auto, 'sep': art_sep}
ALT = {
    'pf': 'A flowchart with a start, a decision and an end beside a short loop in code and three binary numbers, cut from paper.',
    'oop': 'A class diagram in cut paper: an Animal class with Dog and Cat subclasses and an object called rex.',
    'mech': 'A microcontroller chip wired to a sensor, an LED and a motor gear, with one line of control code.',
    'ssa': 'Three nested paper shields with a keyhole beside three security checks: authenticate, validate input and encrypt data.',
    'web': 'A browser window with an address bar and page content, a server, and request and response arrows.',
    'auto': 'A scatter plot with a trend line, a small neural network and a four-step pipeline from data to deployment.',
    'sep': 'A three-column task board with cards in To do, Doing and Done, above a sprint timeline.',
}


# ── Page parsing ─────────────────────────────────────────────────────────────
def outcome_count(text):
    body = re.sub(r'SE-\d\d-', '', text.split(':', 1)[1])
    codes = set()
    for chunk in re.split(r',\s*', body.strip()):
        m = re.match(r'(\d\d)\s+to\s+(\d\d)$', chunk.strip())
        if m:
            codes.update(range(int(m.group(1)), int(m.group(2)) + 1))
        elif chunk.strip():
            codes.add(int(chunk.strip()))
    return len(codes)


def duration(meta):
    pills = re.findall(r'<span class="meta-pill">([^<]*)</span>', meta)
    for p in pills:
        if not p.startswith('Outcomes'):
            m = re.match(r'~(\d+) weeks', p)
            return (f'~{m.group(1)}', 'Weeks') if m else (p.split()[0], ' '.join(p.split()[1:]) or 'Length')
    return ('', '')


def build_header(slug, page):
    key = FOCUS[slug]
    inner = re.search(r'<header class="topic-header">(.*?)</header>', page, re.S).group(1)
    crumb = re.search(r'<nav class="topic-breadcrumb".*?</nav>', inner, re.S).group(0)
    title = re.search(r'<div class="topic-title-row">.*?</h1></div>', inner, re.S).group(0)
    intro = re.search(r'<p class="text-muted-dark[^>]*>.*?</p>', inner, re.S).group(0)
    meta = re.search(r'<div class="topic-header-meta">.*?</div>', inner, re.S).group(0)
    outcomes = outcome_count(re.search(r'Outcomes:[^<]*', meta).group(0))
    dnum, dlab = duration(meta)

    names = list(re.finditer(r'<span class="part-name">([^<]*)</span>', page))
    parts = []
    for i, n in enumerate(names):
        end = names[i + 1].start() if i + 1 < len(names) else len(page)
        chunk = page[n.end():end]
        ids = []
        for piece in chunk.split('<section')[1:]:
            m = re.match(r'[^>]*\bid="([^"]+)"', piece)
            if m and '<h2 class="syllabus-phase' in piece:
                ids.append(m.group(1))
        parts.append((n.group(1), len(ids), ids[0] if ids else '', ids))
    dots = sum(p[1] for p in parts)

    stats = ('<div class="topic-stats">'
             f'<div class="topic-stat"><span class="topic-stat-num">{dots}</span><span class="topic-stat-label">Dot points</span></div>'
             f'<div class="topic-stat"><span class="topic-stat-num">{len(parts)}</span><span class="topic-stat-label">Parts</span></div>'
             f'<div class="topic-stat"><span class="topic-stat-num">{outcomes}</span><span class="topic-stat-label">Outcomes</span></div>'
             f'<div class="topic-stat"><span class="topic-stat-num">{html.escape(dnum)}</span><span class="topic-stat-label">{html.escape(dlab)}</span></div>'
             '</div>')
    cards = ''
    for i, (name, n, sid, ids) in enumerate(parts, 1):
        cards += (f'<a class="topic-part" href="#{sid}" data-sections="{",".join(ids)}"><span class="topic-part-num">Part {i}</span>'
                  f'<span class="topic-part-name">{name}</span><span class="topic-part-count">{n} dot point{"s" if n != 1 else ""} →</span></a>')
    first = parts[0][2] if parts else ''
    actions = ('<div class="topic-actions">'
               f'<a class="topic-start" data-start href="#{first}">Start learning <span aria-hidden="true">→</span></a>'
               f'<a class="topic-map-link" href="{MAPPING_URL}" target="_blank" rel="noopener">Syllabus mapping ↗</a>'
               '</div>')
    strip = f'<nav class="topic-parts" aria-label="Parts of this focus area">{cards}</nav>'
    viz = f'<div class="topic-viz" role="img" aria-label="{html.escape(ALT[key])}">{ART[key]()}</div>'
    return (f'<header class="topic-header">\n    <div class="topic-header-inner">\n      {crumb}\n      {title}\n      {intro}\n      {meta}\n'
            f'      {actions}\n      {viz}\n      {stats}\n      {strip}\n    </div>\n  </header>')


def update_home():
    path = os.path.join(ROOT, 'index.html')
    with open(path, encoding='utf-8') as f:
        page = f.read()
    for slug, key in FOCUS.items():
        card = re.search(r'(<a href="topics/%s\.html" class="topic-card[^"]*">)(\s*<div class="card-art[^>]*>.*?</svg></div>)?' % slug, page, re.S)
        art = f'<div class="card-art topic-viz" aria-hidden="true">{ART[key]()}</div>'
        page = page[:card.start()] + card.group(1) + '\n          ' + art + page[card.end():]
    links = ''
    for i, (slug, key) in enumerate(FOCUS.items(), 1):
        icon = re.search(r'<a href="topics/%s\.html" class="topic-card.*?<div class="card-icon" aria-hidden="true">(<svg.*?</svg>)</div>' % slug, page, re.S).group(1)
        year = 11 if i <= 3 else 12
        links += (f'<a class="hero-topic" href="topics/{slug}.html"><span class="ht-ico" aria-hidden="true">{icon}</span>'
                  f'<span class="ht-text"><span class="ht-year">Year {year}</span><span class="ht-name">{SHORT[slug]}</span></span></a>')
    strip = f'<!-- hero-topics -->\n      <nav class="hero-topics" aria-label="The seven focus areas">{links}</nav>\n      <!-- /hero-topics -->\n      '
    page = re.sub(r'<!-- hero-topics -->.*?<!-- /hero-topics -->\s*', '', page, flags=re.S)
    start = page.index('<section class="hero"')
    cta = page.index('<div class="hero-cta">', start)
    end = page.index('</div>', page.index('</a>', page.index('btn-outline', cta)))
    page = page[:end + 6] + '\n      ' + strip.rstrip() + page[end + 6:]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(page)
    print('updated index')


def main():
    for slug, key in FOCUS.items():
        path = os.path.join(ROOT, 'topics', slug + '.html')
        with open(path, encoding='utf-8') as f:
            page = f.read()
        new = build_header(slug, page)
        page = re.sub(r'<header class="topic-header">.*?</header>', lambda _: new, page, count=1, flags=re.S)
        page = re.sub(r'<html lang="en"[^>]*>', f'<html lang="en" data-theme="light" data-focus="{key}">', page, count=1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(page)
        print('updated', slug)
    update_home()


if __name__ == '__main__':
    main()
