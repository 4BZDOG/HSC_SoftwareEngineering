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
CHECKED = '30 September 2026'
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
    ('assessment', 'Official NESA', 'Assessment and the HSC exam',
     'The facts students and teachers need, each with its NESA source. Where NESA publishes nothing, this page says so.', None),
    ('nesa-exam', 'Official NESA', 'Assessment documents, exam papers and the online exam',
     'The official pages behind the facts above, and NESA\u2019s own practice material. There is no downloadable Software Engineering paper: the exam is online.', [
        ('Assessment: course standards', 'NSW Curriculum \u00b7 NESA', 'Web', f'{CURR}/assessment/course-standards',
         'The Common Grade Scale (Year 11) and the HSC Performance Band Descriptions for Software Engineering.', ['all']),
        ('School-based assessment', 'NSW Curriculum \u00b7 NESA', 'Web', f'{CURR}/assessment/school-based-assessment',
         'The mandatory components and weightings for Years 11 and 12, and the take-home task limit.', ['all', 'sep']),
        ('HSC examinations', 'NSW Curriculum \u00b7 NESA', 'Web', f'{CURR}/assessment/hsc-examinations',
         'The exam specification (80 marks, 2 hours 30 minutes, online), the exam tools and the sample exam materials.', ['all']),
        ('ACE rules: assessment programs (2.1)', 'NSW Curriculum \u00b7 NESA', 'Web',
         'https://curriculum.nsw.edu.au/ace-rules/ace2/assessment-programs',
         'The rules for Preliminary and HSC school-based assessment programs, including take-home tasks and generative AI.', ['all']),
        ('NESA 29/26: new limit on take-home assessment tasks', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/news/all/new-take-home-assessment-rules',
         'The official notice of the one-task, 15% limit, which courses are exempt, and the start dates.', ['all']),
        ('NESA 34/26: changes to the ACE rules', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/news/all/changes-ace-rules-take-home-tasks-artifical-intelligence',
         'The notice of the ACE rule changes on take-home tasks and artificial intelligence, with effect dates.', ['all']),
        ('Software Engineering HSC exam papers', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/software-engineering',
         'The index of Software Engineering HSC exam packs. Only 2025 is listed.', ['all']),
        ('Software Engineering 2025 HSC exam pack', 'NESA', 'Web',
         'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/software-engineering/2025',
         'Links to the online exam, the marking guidelines, marker feedback by question and sample full-mark responses.', ['all']),
        ('2025 HSC Software Engineering marking guidelines', 'NESA', 'PDF',
         'https://www.nsw.gov.au/sites/default/files/noindex/2025-12/2025-hsc-software-engineering-mg.pdf',
         'Criteria, marks and sample answers for every question of the 2025 exam, with the content and outcomes each question assesses.', ['all']),
        ('2025 HSC sample full-mark responses', 'NESA', 'PDF',
         'https://www.nsw.gov.au/sites/default/files/noindex/2026-08/software-engineering-2025-full-mark-samples.PDF',
         'Full-mark student responses to several 2025 questions: compare their depth with your own answers.', ['all']),
        ('HSC online exam and familiarisation questions', 'NESA', 'Web', 'https://fam.hsconline.nesa.nsw.edu.au/',
         'NESA\u2019s online exam environment: practise with the code editor, drawing and screen design tools.', ['all', 'tools']),
        ('Marking guidelines: familiarisation questions', 'NESA', 'PDF',
         f'{LIB}/96889392-eee9-414c-b975-979124e8809f/software-engineering-hsc-marking-guidelines.pdf',
         'Marking guidelines for the 14 HSC familiarisation questions.', ['all']),
        ('Marking guidelines: online sample exam', 'NESA', 'PDF',
         f'{LIB}/018f0a1b-f6cb-41bb-8f73-45071e4f97b2/software-engineering-sample-exam-marking-guidelines.pdf',
         'Marking guidelines for the online sample exam (schools reach the exam itself through Schools Online).', ['all']),
        ('Online exam code editor: video transcript', 'NESA', 'DOCX',
         f'{LIB}/a7a28239-b950-4f4c-b8c5-c16b21a3773a/stage-6-syllabus-code-editor-video-transcript.docx',
         'What the code editor does in the online exam.', ['pf', 'tools']),
        ('Online exam drawing tool: video transcript', 'NESA', 'DOCX',
         f'{LIB}/53052c2e-22c5-43ae-80ac-0aeab740692f/stage-6-syllabus-drawing-tool-video-transcript.docx',
         'What the drawing tool does in the online exam, used for diagrams such as class diagrams.', ['oop', 'tools']),
        ('Online exam screen design tool: video transcript', 'NESA', 'DOCX',
         f'{LIB}/9cafcc28-127d-4ec0-99e8-c5259dce9688/stage-6-syllabus-screen-design-tool-video-transcript.DOCX',
         'What the screen design tool does in the online exam.', ['web', 'tools']),
        ('HSC exam provisions', 'NESA', 'Web', 'https://www.nsw.gov.au/education-and-training/nesa/hsc/exam-provisions',
         'Exam provisions for students with disability.', ['all']),
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

# ── Assessment and the HSC exam: facts, each with its NESA source ─────────────────────────────
# Every statement comes from resources/se-assessment.md, which records the NESA page it was read from
# (checked 29 September 2026). Add nothing here that the notes file does not source.
_SRC = {
    'sba': ('School-based assessment', f'{CURR}/assessment/school-based-assessment'),
    'exam': ('HSC examinations', f'{CURR}/assessment/hsc-examinations'),
    'standards': ('Course standards', f'{CURR}/assessment/course-standards'),
    'course': ('Course structure', f'{CURR}/overview/course'),
    'ace': ('ACE rules 2.1', 'https://curriculum.nsw.edu.au/ace-rules/ace2/assessment-programs'),
    'malpractice': ('ACE rules 10.1', 'https://curriculum.nsw.edu.au/ace-rules/ace10/malpractice'),
    'n29': ('NESA 29/26', 'https://www.nsw.gov.au/education-and-training/nesa/news/all/new-take-home-assessment-rules'),
    'n34': ('NESA 34/26', 'https://www.nsw.gov.au/education-and-training/nesa/news/all/changes-ace-rules-take-home-tasks-artifical-intelligence'),
    'specs': ('Course Specifications', f'{LIB}/f56c20d7-84b0-4c23-8c82-4c29116010c2/software-engineering-11-12-2022-higher-school-certificate-course-specifications.PDF'),
    'pack': ('2025 exam pack', 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/software-engineering/2025'),
    'papers': ('Exam papers index', 'https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/software-engineering'),
    'mg25': ('2025 marking guidelines', 'https://www.nsw.gov.au/sites/default/files/noindex/2025-12/2025-hsc-software-engineering-mg.pdf'),
    'fam': ('Familiarisation questions', 'https://fam.hsconline.nesa.nsw.edu.au/'),
    'provisions': ('Exam provisions', 'https://www.nsw.gov.au/education-and-training/nesa/hsc/exam-provisions'),
}


def src(*keys):
    links = ' \u00b7 '.join(
        f'<a href="{e(_SRC[k][1])}" target="_blank" rel="noopener">{e(_SRC[k][0])}<span class="sr-only"> (opens in a new tab)</span></a>'
        for k in keys)
    return f'<span class="res-src">Source: {links}</span>'


def fact_table(rows):
    body = ''.join(f'            <tr><th scope="row">{e(k)}</th><td>{e(v)}{src(*s)}</td></tr>\n' for k, v, s in rows)
    return f'''          <div class="table-wrap">
            <table class="res-fact-table">
              <tbody>
{body}              </tbody>
            </table>
          </div>
'''


SCHOOL_BASED = [
    ('Components and weightings', 'In both years two components are mandatory: knowledge and understanding of course content (50%) and knowledge and skills in the practical application of the content (50%).', ['sba']),
    ('Number and type of tasks', 'Schools decide the number, type and weighting of assessment tasks, subject to a limit of one take-home task worth no more than 15%. NESA does not fix a number of tasks.', ['sba']),
    ('NESA guidance (not mandatory)', 'Use a variety of tasks across the year, and give individual tasks a weighting between 10% and 40%.', ['sba']),
    ('Year 11 result', 'Schools submit a grade for each student at the end of the course, allocated by on-balance judgement using the Common Grade Scale for Preliminary courses.', ['sba', 'standards']),
    ('Year 12 result', 'Schools submit a school-based assessment mark for each student, summing up achievement measured at several points through the course. Formal tasks should reflect the syllabus outcomes and content.', ['sba']),
    ('Notice and schedules', 'Students must get sufficient written notice of a task, typically 14 calendar days. The notice states the weighting, the syllabus outcomes assessed, the type of task, the date and time, and the marking criteria where appropriate. The school gives the formal assessment program, with schedules, at the start of the course.', ['ace']),
    ('Generative AI', 'Marks must reflect the student\u2019s own knowledge, skills and understanding, not their use of generative AI. Schools decide whether generative AI is permitted in a task, and must not rely on software that detects generative AI to decide whether malpractice occurred.', ['ace', 'malpractice']),
]

HSC_EXAM = [
    ('Format', 'One written examination, taken by students on a computer. It is worth 80 marks. The time allowed is 2 hours 30 minutes, including 10 minutes reading time.', ['exam']),
    ('Stimulus', 'Questions may contain stimulus material. Headphones are required for questions with video and audio stimulus.', ['exam']),
    ('Objective-response items', 'About 20 marks. There are 14 to 18 items, each worth 1 to 4 marks, and they may share stimulus with other items.', ['exam']),
    ('Short-answer items', 'About 60 marks. There are 16 to 18 items, and at least three are worth 4 to 8 marks. They may share stimulus with other items.', ['exam']),
    ('Sections', 'NESA describes two types of test item. It does not describe the paper as having sections.', ['exam']),
    ('Assumed knowledge', 'Questions may ask you to combine knowledge, understanding and skills from across the course. The Year 11 course is assumed knowledge for Year 12, and an understanding of the Python programming language is also assumed. The Course Specifications say students are expected to be able to code in Python.', ['exam', 'specs']),
    ('Notation and depth', 'The Course Specifications are an integral part of the course content and indicate the depth of study required for some concepts. The syllabus must be applied in conjunction with them.', ['course', 'specs']),
    ('Online exam tools', 'The online exam has a code editor, a drawing tool and a screen design tool. NESA publishes a video and a transcript for each.', ['exam']),
    ('Practice material', 'NESA provides online familiarisation questions, with marking guidelines. An online sample exam is available to schools through Schools Online; only its marking guidelines are public.', ['exam', 'fam']),
    ('Past papers', 'The 2025 exam is the only Software Engineering pack published. It has the online exam, marking guidelines, marker feedback by question and sample full-mark responses. NESA states there is no downloadable paper.', ['pack', 'papers']),
    ('How answers are marked', 'Marking guidelines are based on criteria that relate to the quality of the response. Achievement is reported against the HSC Performance Band Descriptions for Software Engineering (Bands 1 to 6).', ['exam', 'standards']),
    ('Marker advice (2025)', 'Read the question carefully, show you understand the key words and what the question requires, engage with any stimulus material, use course-specific terms, and practise the online tools with the familiarisation questions and past exams.', ['pack']),
    ('Exam provisions', 'Some students with disability may be eligible for HSC exam provisions.', ['provisions']),
]


def assessment_html():
    return f'''          <h3 class="res-sub">School-based assessment</h3>
{fact_table(SCHOOL_BASED)}
          <div class="callout warning"><strong>The take-home task limit</strong>
            A school\u2019s assessment program may have no more than one take-home task, worth at most 15%. NESA defines take-home tasks as those completed outside a classroom, a formal examination setting or teacher-approved monitoring conditions. The limit starts for HSC courses in Term 4, 2026 and for Preliminary courses in Term 1, 2027. Courses with a major project or an HSC practical exam are exempt, and Software Engineering is not on NESA\u2019s list of exempt courses, so the limit applies to it. That last step is our reading of NESA\u2019s published list; the school-based assessment page also states the limit for Software Engineering directly. NESA 34/26 changed the ACE rules that carry the limit.
            {src('sba', 'n29', 'n34', 'ace')}
          </div>
          <h3 class="res-sub">The HSC examination</h3>
{fact_table(HSC_EXAM)}
          <div class="callout info"><strong>One paper, not a rule</strong>
            The 2025 marking guidelines show 27 numbered questions worth 80 marks in total (our sum of the marks in NESA\u2019s mapping grid). Every question is mapped to Year 12 outcomes and none to a Year 11 outcome, although NESA states the Year 11 course is assumed knowledge. Responses included Python code, SQL, pseudocode and a class diagram. This describes one exam. It is not NESA\u2019s specification of future papers.
            {src('mg25', 'pack')}
          </div>
          <div class="callout danger"><strong>What NESA does not publish</strong>
            <ul class="res-gaps">
              <li>No mandatory project task, project weighting, length limit or submission for Software Engineering. There is no HSC practical exam or submitted major work: the HSC is a single online written exam. Whether and how the project is assessed at school is the school\u2019s decision within the rules above.</li>
              <li>No split between the school-based mark and the HSC examination mark appears on the Software Engineering pages, so this page does not state one.</li>
              <li>Sample assessment schedules and task notifications have headings but no files. NESA says they are being updated to align with the new ACE rules.</li>
              <li>No downloadable Software Engineering HSC paper. The Software Design and Development archive is for the earlier course.</li>
              <li>NESA\u2019s cross-course glossary of key words is not linked from the Software Engineering pages. The syllabus glossary defines only <em>evaluate</em> and <em>collaborate</em>, so treat other command verbs as unofficial for this course.</li>
            </ul>
            {src('sba', 'exam', 'papers')}
          </div>
'''


ASSESSMENT_CSS = '''  <style>
    /* Assessment facts on the resources page (generated by scripts/build-resources.py) */
    .res-page .res-sub { margin: 1.6rem 0 .7rem; font-size: 1.05rem; }
    .res-fact-table th[scope="row"] { width: 11.5rem; text-align: left; vertical-align: top; }
    .res-fact-table td { vertical-align: top; }
    .res-src { display: block; margin-top: .4rem; font-size: .78rem; color: var(--pc-muted); }
    .res-src a { font-weight: 600; }
    .res-page .callout .res-src { margin-top: .6rem; }
    .res-gaps { margin: .5rem 0 0; padding-left: 1.2rem; }
    .res-gaps li { margin: .3rem 0; }
    @media (max-width: 640px) {
      .res-fact-table, .res-fact-table tbody, .res-fact-table tr { display: block; width: 100%; }
      .res-fact-table th[scope="row"], .res-fact-table td { display: block; width: auto; }
    }
  </style>
'''


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


def section_body(items):
    if items is None:                     # the assessment section is facts, not link cards
        return assessment_html()
    cards = ''.join(card(*it) for it in items)
    return f'''          <div class="res-grid">
{cards}          </div>
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

    head = head.replace('</head>', ASSESSMENT_CSS + '</head>', 1)

    # Mark this page as current in the Resources menu
    nav = nav.replace(' aria-current="page"', '')
    nav = nav.replace('<a href="resources.html" role="menuitem">', '<a href="resources.html" role="menuitem" aria-current="page">')

    toc = ''.join(f'        <li><a href="#{sid}">{e(h)}</a></li>\n' for sid, _, h, _, _ in SECTIONS)
    total = sum(len(items or []) for *_, items in SECTIONS)
    nesa = sum(len(items or []) for sid, kind, *_, items in SECTIONS if kind == 'Official NESA')

    body = []
    for sid, kind, heading, lead, items in SECTIONS:
        stamp = 'res-stamp-nesa' if kind == 'Official NESA' else 'res-stamp-std'
        body.append(f'''        <section id="{sid}" class="res-section">
          <div class="res-head">
            <span class="res-stamp {stamp}">{e(kind)}</span>
            <h2>{e(heading)}</h2>
            <p>{e(lead)}</p>
          </div>
{section_body(items)}        </section>
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
          The sections marked <strong>Official NESA</strong> are published by NESA or the NSW Curriculum website and define the course and its assessment. The last section links to the organisations that set each standard, such as the W3C for the web and OWASP for security; they are the primary source for that topic, not NESA endorsements of this site. Links open in a new tab.
        </div>
{"".join(body)}      </div>
    </main>
  </div>

{footer}'''
    # Resource pages carry no diagrams or reading progress
    page = re.sub(r'  <script src="\.\./js/nesa-diagram[^\n]*\n', '', page)
    page = re.sub(r'\n  <div class="lightbox-modal"[\s\S]*?\n  </div>\n', '\n', page)
    # ...nor the practice tools that the SDLC page loads
    page = re.sub(r'  <link rel="stylesheet" href="\.\./css/labs\.css[^\n]*\n', '', page)
    page = re.sub(r'  <script src="\.\./js/(labs|pages/sdlc)\.js[^\n]*\n', '', page)
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
