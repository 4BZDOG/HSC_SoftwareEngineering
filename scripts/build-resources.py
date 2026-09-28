"""Builds topics/resources.html, the Certified Resources page.

Every link is listed once in RESOURCES below. Only two kinds of source
belong here:
  * official NESA / NSW Curriculum documents for Software Engineering 11-12
  * the standards bodies or official documentation behind a syllabus concept
Check each URL still resolves before adding it, and update CHECKED.

    python3 scripts/build-resources.py
"""
import html
import importlib.util
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CHECKED = '27 September 2026'
CURR = 'https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022'
LIB = 'https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef'

# Topic keys → (label, page, year) for the "Links to" chips.
TOPICS = {
    'all':  ('Whole course', None, 'core'),
    'pf':   ('Programming Fundamentals', 'programming-fundamentals.html', 'y11'),
    'oop':  ('Object-Oriented Paradigm', 'object-oriented-paradigm.html', 'y11'),
    'mech': ('Programming Mechatronics', 'programming-mechatronics.html', 'y11'),
    'ssa':  ('Secure Software Architecture', 'secure-software-architecture.html', 'y12'),
    'web':  ('Programming for the Web', 'programming-for-the-web.html', 'y12'),
    'auto': ('Software Automation', 'software-automation.html', 'y12'),
    'sep':  ('Software Engineering Project', 'software-engineering-project.html', 'y12'),
    'tools': ('Course Tools & Specs', 'course-tools.html', 'core'),
    'sdlc': ('SDLC Guide', 'sdlc.html', 'core'),
}

SECTIONS = [
    ('nesa-syllabus', 'Official NESA', 'The syllabus and course specifications',
     'The documents the course and the HSC exam are written from. Start here.', [
        ('Software Engineering 11–12 Syllabus (2022)', 'NSW Curriculum · NESA', 'Web', f'{CURR}/overview',
         'Rationale, aim, outcomes and course structure for Years 11 and 12.', ['all']),
        ('Syllabus content: every focus area and dot point', 'NSW Curriculum · NESA', 'Web', f'{CURR}/content',
         'The exact dot points these notes follow, part by part, for all seven focus areas.', ['all']),
        ('HSC Course Specifications', 'NESA', 'PDF',
         f'{LIB}/f56c20d7-84b0-4c23-8c82-4c29116010c2/software-engineering-11-12-2022-higher-school-certificate-course-specifications.PDF',
         'The pseudocode rules, flowchart and DFD symbols, structure charts and code conventions used in HSC questions.',
         ['tools', 'pf', 'oop']),
        ('Syllabus glossary', 'NSW Curriculum · NESA', 'Web', f'{CURR}/glossary',
         'NESA\'s own definitions of the technical terms used in the syllabus.', ['all']),
        ('Record of changes to the syllabus', 'NSW Curriculum · NESA', 'Web',
         'https://curriculum.nsw.edu.au/resources/record-of-changes?syllabus=software_11_12_2022',
         'Every official update, including changes to the course specifications examples.', ['all']),
    ]),
    ('nesa-exam', 'Official NESA', 'Assessment and the HSC exam',
     'What the exam looks like and how answers are marked.', [
        ('Assessment and HSC examination', 'NSW Curriculum · NESA', 'Web', f'{CURR}/assessment/hsc-examinations',
         'The structure of the written exam, the major project requirements and school-based assessment.', ['all', 'sep']),
        ('Sample exam marking guidelines', 'NESA', 'PDF',
         f'{LIB}/018f0a1b-f6cb-41bb-8f73-45071e4f97b2/software-engineering-sample-exam-marking-guidelines.pdf',
         'How marks are awarded for sample questions: use it to check the depth of your own answers.', ['all']),
        ('HSC marking guidelines', 'NESA', 'PDF',
         f'{LIB}/96889392-eee9-414c-b975-979124e8809f/software-engineering-hsc-marking-guidelines.pdf',
         'Marking criteria for the HSC Software Engineering examination.', ['all']),
        ('HSC exam papers and marking feedback', 'NESA', 'Web',
         'https://educationstandards.nsw.edu.au/wps/portal/nesa/11-12/resources/hsc-exam-papers',
         'Past papers, marking guidelines and markers\' feedback for every HSC course.', ['all']),
        ('Glossary of key words', 'NESA', 'Web',
         'https://educationstandards.nsw.edu.au/wps/portal/nesa/11-12/hsc/hsc-student-guide/glossary-keywords',
         'What "explain", "evaluate", "justify" and the other directive verbs ask you to do.', ['all']),
    ]),
    ('nesa-support', 'Official NESA', 'Planning and support materials',
     'Sample programs NESA published alongside the syllabus.', [
        ('Sample unit: Programming Fundamentals', 'NESA', 'DOCX',
         f'{LIB}/caa48afd-469e-4871-b823-a9a28cf53df8/software-engineering-11-12-2022-sample-unit-year-11-programming-fundamentals-practical-programming-in-context.DOCX',
         'A full Year 11 unit: practical programming in context.', ['pf']),
        ('Sample unit: Software Engineering Project', 'NESA', 'DOCX',
         f'{LIB}/e265aee2-4be3-4e2b-94cf-c40830a6da90/software-engineering-11-12-2022-sample-unit-year-12-software-engineering-project.docx',
         'How the Year 12 major project can be planned and run.', ['sep']),
        ('Sample scope and sequence, Year 11', 'NESA', 'DOCX',
         f'{LIB}/575bd1ef-24a9-4591-9ee3-2bbda8528fed/software-engineering-11-12-2022-sample-scope-and-sequence-year-11-120-hours.docx',
         'One way to order the Year 11 focus areas across 120 hours.', ['pf', 'oop', 'mech']),
        ('Sample scope and sequence, Year 12', 'NESA', 'DOCX',
         f'{LIB}/f1ff34f4-0060-4fac-a831-04d7b9589d71/software-engineering-11-12-2022-sample-scope-and-sequence-year-12-120-hours.docx',
         'One way to order the Year 12 focus areas across 120 hours.', ['ssa', 'web', 'auto', 'sep']),
        ('Parent and carer guide', 'NESA', 'PDF',
         f'{LIB}/b3983252-7426-4923-bd47-57a160f7d1e4/software-engineering-11-12-2022-parent-and-carer-guide.PDF',
         'A plain-language overview of the course for families.', ['all']),
    ]),
    ('standards', 'Standards body', 'Standards and official documentation behind the syllabus',
     'Primary sources for concepts the syllabus names. These organisations are not NESA; each is the authority on its topic.', [
        ('Python tutorial', 'Python Software Foundation', 'Web', 'https://docs.python.org/3/tutorial/',
         'The official tutorial for the language used across the course.', ['pf', 'oop', 'auto']),
        ('Learn web development', 'MDN Web Docs (Mozilla)', 'Web', 'https://developer.mozilla.org/en-US/docs/Learn_web_development',
         'HTML, CSS, JavaScript and HTTP from the reference browser makers use.', ['web']),
        ('About the W3C', 'World Wide Web Consortium', 'Web', 'https://www.w3.org/about/',
         'The organisation the syllabus asks you to explain the role of.', ['web']),
        ('Web Content Accessibility Guidelines (WCAG)', 'W3C', 'Web', 'https://www.w3.org/WAI/standards-guidelines/wcag/',
         'The accessibility standard behind designing for people with disability.', ['web', 'ssa', 'mech']),
        ('OWASP Top 10', 'OWASP Foundation', 'Web', 'https://owasp.org/www-project-top-ten/',
         'The most critical web application security risks, and how to prevent them.', ['ssa', 'web']),
        ('Australian Privacy Principles', 'Office of the Australian Information Commissioner', 'Web',
         'https://www.oaic.gov.au/privacy/australian-privacy-principles',
         'The law privacy by design has to satisfy in Australia.', ['ssa']),
        ('Pro Git', 'Git project', 'Web', 'https://git-scm.com/book/en/v2',
         'The official book on Git and version control.', ['web', 'sep', 'tools']),
        ('SQL as understood by SQLite', 'SQLite', 'Web', 'https://www.sqlite.org/lang.html',
         'The SQL reference for the database engine used with Python.', ['web', 'tools']),
        ('Arduino documentation', 'Arduino', 'Web', 'https://docs.arduino.cc/',
         'Official guides for the boards, sensors and actuators used in mechatronics.', ['mech']),
        ('Manifesto for Agile Software Development', 'Agile Alliance authors', 'Web', 'https://agilemanifesto.org/',
         'The four values and twelve principles behind Agile methods.', ['sep', 'sdlc']),
    ]),
]

ICONS = {
    'PDF':  '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 14h5M9.5 17h3"/>',
    'DOCX': '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9.5 12.5l1.2 5 1.3-3.5 1.3 3.5 1.2-5"/>',
    'Web':  '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"/>',
}


def e(s):
    return html.escape(s, quote=True)


def card(title, pub, fmt, url, why, topics):
    chips = []
    for t in topics:
        label, page, year = TOPICS[t]
        chip = f'<span class="chip chip-{year}">{e(label)}</span>'
        if page:
            chip = f'<a class="chip chip-{year}" href="{page}">{e(label)}</a>'
        chips.append(chip)
    return f'''          <article class="res-card">
            <div class="res-top">
              <span class="res-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{ICONS[fmt]}</svg></span>
              <span class="res-fmt">{fmt}</span>
            </div>
            <h3 class="res-title"><a href="{e(url)}" target="_blank" rel="noopener">{e(title)}<span class="sr-only"> (opens in a new tab)</span></a></h3>
            <p class="res-pub">{e(pub)}</p>
            <p class="res-why">{e(why)}</p>
            <div class="res-links"><span class="res-links-label">Links to</span>{"".join(chips)}</div>
          </article>
'''


def build():
    src = open(os.path.join(ROOT, 'topics', 'sdlc.html'), encoding='utf-8').read()
    head_end = src.index('  <style>')
    nav_start = src.index('  <nav class="navbar"')
    header_start = src.index('  <!-- ── Page Header ── -->')
    footer_start = src.index('  <footer>')
    head = src[:head_end] + src[src.index('</style>', head_end) + len('</style>\n'):nav_start]
    nav = src[nav_start:header_start]
    footer = src[footer_start:]

    # Page metadata
    title = 'Certified Resources | HSC Software Engineering'
    desc = ('Official NESA syllabus documents, HSC course specifications, marking guidelines and the '
            'standards bodies behind every Software Engineering 11–12 concept, in one place.')
    head = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', head)
    head = head.replace('topics/sdlc.html', 'topics/resources.html')
    head = re.sub(r'(og:title" content=")[^"]*', r'\g<1>Certified Resources | HSC Software Engineering', head)
    head = re.sub(r'(twitter:title" content=")[^"]*', r'\g<1>Certified Resources | HSC Software Engineering', head)
    head = re.sub(r'(og:description" content=")[^"]*', lambda m: m.group(1) + e(desc), head)
    head = re.sub(r'(twitter:description" content=")[^"]*', lambda m: m.group(1) + e(desc), head)
    head = re.sub(r'(<meta name="description" content=")[^"]*', lambda m: m.group(1) + e(desc), head)
    head = re.sub(r'"name": "SDLC[^"]*"', '"name": "Certified Resources"', head)

    # Mark this page as current in the Resources menu
    nav = nav.replace(' aria-current="page"', '')
    nav = nav.replace('<a href="resources.html" role="menuitem">', '<a href="resources.html" role="menuitem" aria-current="page">')

    toc = ''.join(f'        <li><a href="#{sid}">{e(h)}</a></li>\n' for sid, _, h, _, _ in SECTIONS)
    total = sum(len(items) for *_, items in SECTIONS)
    nesa = sum(len(items) for sid, kind, *_, items in SECTIONS if kind == 'Official NESA')

    body = []
    for sid, kind, heading, lead, items in SECTIONS:
        stamp = 'res-stamp-nesa' if kind == 'Official NESA' else 'res-stamp-std'
        body.append(f'''        <section id="{sid}" class="res-section">
          <div class="res-head">
            <span class="res-stamp {stamp}">{e(kind)}</span>
            <h2>{e(heading)}</h2>
            <p>{e(lead)}</p>
          </div>
          <div class="res-grid">
{"".join(card(*it) for it in items)}          </div>
        </section>
''')

    page = f'''{head}{nav}  <!-- ── Page Header ── -->
  <header class="topic-header">
    <div class="topic-header-inner">
      <nav class="topic-breadcrumb">
        <a href="../index.html">Home</a> <span>›</span>
        <span>Certified Resources</span>
      </nav>
      <h1>Certified Resources</h1>
      <p class="text-muted-dark max-w-600 mt-2 fs-sm lh-base">
        The <strong>official NESA documents</strong> for Software Engineering 11–12, and the <strong>standards bodies</strong> behind the concepts the syllabus names. Each one says which part of the course it supports.
      </p>
      <div class="topic-header-meta">
        <span class="meta-pill year12">Year 11 &amp; 12</span>
        <span class="meta-pill">{nesa} NESA documents</span>
        <span class="meta-pill">{total - nesa} standards</span>
        <span class="meta-pill">Links checked {CHECKED}</span>
      </div>
    </div>
  </header>

  <!-- ── Page Layout ── -->
  <div class="page-layout">
    <aside class="sidebar">
      <div class="toc-title">Contents</div>
      <ul class="toc-list">
{toc}      </ul>
    </aside>

    <main class="page-content">
      <div class="content-body res-page">
        <!-- Generated by scripts/build-resources.py: edit the data there, not this file. -->
        <div class="callout info res-note"><strong>What "certified" means here</strong>
          The first three sections are published by <strong>NESA</strong> or the NSW Curriculum website and define the course. The last section links to the organisations that set each standard, such as the W3C for the web and OWASP for security; they are the primary source for that topic, not NESA endorsements of this site. Links open in a new tab.
        </div>
{"".join(body)}      </div>
    </main>
  </div>

{footer}'''
    # Resource pages carry no diagrams or reading progress
    page = re.sub(r'  <script src="\.\./js/nesa-diagram[^\n]*\n', '', page)
    page = re.sub(r'\n  <div class="lightbox-modal"[\s\S]*?\n  </div>\n', '\n', page)
    page = page.replace('© 2026 HSC SoftEng Notes · SDLC Guide', '© 2026 HSC SoftEng Notes · Certified Resources')
    out = os.path.join(ROOT, 'topics', 'resources.html')
    open(out, 'w', encoding='utf-8').write(page)
    # Title and contents icons, as on every other page
    spec = importlib.util.spec_from_file_location('site_chrome', os.path.join(ROOT, 'scripts', 'site-chrome.py'))
    icons = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(icons)
    icons.apply(os.path.abspath(out))
    print(f'topics/resources.html: {total} resources in {len(SECTIONS)} sections')


if __name__ == '__main__':
    build()
