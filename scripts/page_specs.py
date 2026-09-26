"""Maps each NESA dot point to a section on a topic page.

One list per NESA subheading, one entry per dot point, in NESA order.
  id     section id (keep existing ids so links keep working)
  title  short heading for the section
  src    content chunks, in order: 'section-id' (whole section),
         'section-id/intro', 'section-id/<h3 title prefix>', 'section-id/*'
         (all h3 blocks), or literal HTML for new content.
  outcomes  optional; defaults to the first source section's outcomes.
"""

SSA_SECURITY_FEATURES = '''<p>Security features are the parts of a program that protect people and their data. Most secure software combines four kinds, and each one answers a different question.</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th>Feature</th><th>The question it answers</th><th>Example in code</th></tr></thead>
              <tbody>
                <tr><td><strong>Data protection</strong></td><td>Is the data safe if someone gets hold of it?</td><td>Hashing passwords with bcrypt; encrypting a database column that stores Medicare numbers.</td></tr>
                <tr><td><strong>Security</strong></td><td>Can only the right people do the right things?</td><td>Login with multi-factor authentication; role checks before an admin page loads.</td></tr>
                <tr><td><strong>Privacy</strong></td><td>Are we collecting and keeping only what we need?</td><td>Asking for a year of birth instead of a full date; deleting inactive accounts after two years.</td></tr>
                <tr><td><strong>Regulatory compliance</strong></td><td>Does the software meet the law and industry rules?</td><td>A breach-notification process under the Notifiable Data Breaches scheme; PCI DSS rules for card payments.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="callout info">
            <strong>Scenario:</strong> A school canteen app takes orders and payments. It hashes parent passwords (data protection), lets only canteen staff mark orders as paid (security), stores no card numbers because payments go through a provider such as Stripe (privacy and compliance), and records who refunded which order (accountability for compliance audits).
          </div>

          <div class="callout success">
            <strong>HSC writing sample:</strong> <em>"The developer applied data protection by storing passwords as salted bcrypt hashes, so a stolen database does not reveal them. Privacy was improved by collecting only a student's first name and year group, which reduces the harm of any breach and supports compliance with the Australian Privacy Principles."</em>
          </div>'''

SPECS = {
    'ssa': {
        'file': 'secure-software-architecture.html',
        'focus_area': 'Secure software architecture',
        'outcomes': 'SE-12-01, SE-12-04, SE-12-07',
        'parts': [
            [  # Designing software
                {'id': 'benefits', 'title': 'Benefits of Developing Secure Software', 'src': ['benefits']},
                {'id': 'sdlc', 'title': 'Software Development Steps for Secure Code', 'src': ['sdlc']},
                {'id': 'end-users', 'title': 'How End Users Influence Secure Design', 'src': ['end-users']},
            ],
            [  # Developing secure code
                {'id': 'security-concepts', 'title': 'Security Concepts in Software Design', 'src': ['security-concepts']},
                {'id': 'security-features', 'title': 'Applying Security Features', 'outcomes': 'SE-12-04, SE-12-07',
                 'src': [SSA_SECURITY_FEATURES]},
                {'id': 'by-design', 'title': 'Security by Design: Cryptography and Sandboxing',
                 'src': ['by-design/Cryptography', 'by-design/Sandboxing']},
                {'id': 'privacy-design', 'title': 'Privacy by Design', 'src': ['privacy-design']},
                {'id': 'resilience', 'title': 'Testing Security and Resilience',
                 'src': ['resilience/Determining', 'by-design/Threat Modelling', 'resilience/Hardening',
                         'resilience/Handling', 'resilience/Business']},
                {'id': 'testing-strategies', 'title': 'Strategies to Manage Code Security', 'src': ['testing-strategies']},
                {'id': 'defensive-coding', 'title': 'Defensive Data Input Handling',
                 'src': ['defensive-coding/Input', 'defensive-coding/Sanitisation']},
                {'id': 'safe-api', 'title': 'Designing a Safe API', 'src': ['defensive-coding/Safe API']},
                {'id': 'efficient-execution', 'title': 'Efficient Execution for the User', 'src': ['efficient-execution']},
                {'id': 'user-controls', 'title': 'Secure User Action Controls', 'src': ['user-controls']},
                {'id': 'file-hardware', 'title': 'File and Side Channel Attacks', 'src': ['file-hardware']},
            ],
            [  # Impact of safe and secure software development
                {'id': 'collaboration', 'title': 'Benefits of Collaboration', 'src': ['collaboration']},
                {'id': 'enterprise', 'title': 'Benefits to an Enterprise', 'src': ['enterprise']},
                {'id': 'ramifications', 'title': 'Social, Ethical and Legal Issues', 'src': ['ramifications']},
            ],
        ],
    },
    'web': {
        'file': 'programming-for-the-web.html',
        'focus_area': 'Programming for the web',
        'outcomes': 'SE-12-01, SE-12-02, SE-12-07',
        'parts': [
            [
                {'id': 'web-apps', 'title': 'Applications of Web Programming', 'src': ['web-apps']},
                {'id': 'data-transfer', 'title': 'How Data Is Transferred on the Internet', 'src': ['data-transfer']},
                {'id': 'protocols', 'title': 'Web Protocols and Their Ports', 'src': ['protocols']},
                {'id': 'securing-web', 'title': 'Securing the Web', 'src': ['securing-web']},
                {'id': 'big-data', 'title': 'Big Data and Web Architecture', 'src': ['big-data']},
            ],
            [
                {'id': 'w3c', 'title': 'The Role of the W3C', 'src': ['w3c']},
                {'id': 'system-model', 'title': 'Modelling a Web Development System', 'src': ['system-model']},
                {'id': 'browser-devtools', 'title': 'Web Browsers and Developer Tools', 'src': ['browser-devtools']},
                {'id': 'css', 'title': 'Cascading Style Sheets (CSS)', 'src': ['css']},
                {'id': 'version-control', 'title': 'Version Control', 'src': ['version-control']},
                {'id': 'libraries', 'title': 'Code Libraries for Front-End Development', 'src': ['libraries']},
                {'id': 'open-source', 'title': 'Open-Source Software', 'src': ['open-source']},
                {'id': 'performance', 'title': 'Managing Load Times', 'src': ['performance']},
                {'id': 'cms', 'title': 'Web Content Management Systems', 'src': ['cms']},
                {'id': 'backend-contribution', 'title': 'The Contribution of Back-End Development', 'src': ['backend-contribution']},
                {'id': 'backend-request', 'title': 'The Back-End Web Request Process', 'src': ['backend-request']},
                {'id': 'scripting', 'title': 'Web Applications and Shell Scripts', 'src': ['scripting']},
                {'id': 'sql', 'title': 'Web-Based Databases and SQL', 'src': ['sql']},
                {'id': 'orm', 'title': 'Comparing ORM to SQL', 'src': ['orm']},
                {'id': 'collaboration', 'title': 'Front-End and Back-End Collaboration', 'src': ['collaboration']},
                {'id': 'pwa', 'title': 'Designing a Progressive Web App', 'src': ['pwa']},
            ],
        ],
    },
}

SPECS['automation'] = {
    'file': 'software-automation.html',
    'quiz': 'auto',
    'focus_area': 'Software automation',
    'outcomes': 'SE-12-01, SE-12-03',
    'parts': [
        [  # Algorithms in machine learning
            {'id': 'mlops', 'title': 'How Machine Learning Supports Automation', 'src': ['mlops']},
            {'id': 'ai-vs-ml', 'title': 'Distinguishing AI from ML', 'src': ['ai-vs-ml']},
            {'id': 'training-models', 'title': 'Models of Training ML', 'src': ['training-models']},
            {'id': 'ml-applications', 'title': 'Common Applications of ML Algorithms', 'src': ['ml-applications']},
            {'id': 'ml-design-models', 'title': 'Design Models: Decision Trees and Neural Networks', 'src': ['ml-design-models']},
            {'id': 'algorithm-types', 'title': 'Types of Algorithms Associated with ML', 'src': ['algorithm-types']},
        ],
        [  # Programming for automation
            {'id': 'regression-oop', 'title': 'ML Regression Models Using OOP', 'src': ['regression-oop']},
            {'id': 'neural-networks-oop', 'title': 'Neural Network Models Using OOP', 'src': ['neural-networks-oop']},
        ],
        [  # Significance and impact of ML and AI
            {'id': 'societal-impact', 'title': 'The Impact of Automation', 'src': ['societal-impact']},
            {'id': 'human-behaviour', 'title': 'How Human Behaviour Influences ML and AI', 'src': ['human-behaviour']},
            {'id': 'bias', 'title': 'Human and Dataset Source Bias', 'src': ['bias']},
        ],
    ],
}


# ── Software engineering project ────────────────────────────────────────────
import os as _os
import re as _re

_SEP_FILE = _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))),
                          'topics', 'software-engineering-project.html')


def _grab(pattern):
    """Pull a block of existing markup (a diagram, code sample…) out of the page."""
    src = open(_SEP_FILE, encoding='utf-8').read()
    m = _re.search(pattern, src, _re.S)
    return m.group(0) if m else ''


def _sep_blocks():
    return {
        'wagile_diagram': _grab(r'<div class="diagram-block mt-15px">.*?</p>\s*</div>'),
        'scrum_diagram': _grab(r'<!-- Scrum / Agile Sprint Cycle Diagram -->.*?</p>\s*</div>'),
        'scrum_video': _grab(r'<div class="video-box">\s*<div class="video-box-label">.*?Introduction to Scrum.*?</div>'),
        'backup_code': _grab(r'<div class="code-block">\s*<div class="code-header"><span class="code-lang">Python — Programmed Data Backup Script.*?</pre>\s*</div>'),
    }


_B = _sep_blocks()

SEP_WATERFALL = '''<p><strong>Waterfall</strong> works through the development steps one at a time, in order. Each stage is finished and signed off before the next begins, so the project flows downwards like water over a series of ledges.</p>

          <ul>
            <li><strong>Logical progression of steps:</strong> requirements → design → development → testing → installation → maintenance. Each stage produces documents that the next stage relies on.</li>
            <li><strong>Stages of 'falling water':</strong> going back up is difficult and expensive. A change found during testing may mean redoing design and development.</li>
          </ul>

          <div class="table-wrap">
            <table>
              <thead><tr><th>Advantages</th><th>Disadvantages</th></tr></thead>
              <tbody>
                <tr><td>Clear milestones and deadlines that are easy to track</td><td>Hard to respond when the client changes their mind</td></tr>
                <tr><td>Thorough documentation at every stage</td><td>The client sees working software only near the end</td></tr>
                <tr><td>Easy to estimate cost and time up front</td><td>Problems are often found late, when they cost the most to fix</td></tr>
              </tbody>
            </table>
          </div>

          <p><strong>Scale and types of developments:</strong> Waterfall suits large projects with stable, well-understood requirements and strict regulation, such as a hospital records system or an aircraft control system.</p>

          <div class="callout info"><strong>Using it in your project:</strong> if your requirements are fixed by an assessment brief and a single due date, a Waterfall plan with dated milestones in a Gantt chart is a sensible choice. Justify it by pointing to those stable requirements.</div>'''

SEP_AGILE = f'''<p><strong>Agile</strong> builds software in short cycles called iterations or sprints. Each cycle delivers a small working piece that the client can try and give feedback on, so the plan keeps adjusting as the project goes.</p>

          <ul>
            <li><strong>Rate of developing a final solution:</strong> a usable version appears early and improves every sprint, so value arrives sooner than in Waterfall.</li>
            <li><strong>Method tailoring:</strong> teams adapt the process to suit the project, for example choosing one-week sprints or skipping formal ceremonies in a small team.</li>
            <li><strong>Iteration workflow:</strong> plan → build → test → review with the client → adjust, then repeat.</li>
            <li><strong>Scale and types of developments:</strong> best for small to medium projects where requirements are likely to change, such as a start-up's mobile app or a school's online booking system.</li>
          </ul>

          {_B['scrum_diagram']}

          {_B['scrum_video']}'''

SEP_WAGILE = f'''<p><strong>WAgile</strong> is a <strong>hybrid model</strong>: it plans and closes a project the Waterfall way but builds the software in Agile sprints.</p>

          <ul>
            <li><strong>When intervention is applied:</strong> at fixed checkpoints, such as signing off requirements, approving a design, and a final security audit before release.</li>
            <li><strong>How intervention is applied:</strong> through formal reviews and sign-offs at those gates. Between them, the team works in sprints and adapts to feedback.</li>
            <li><strong>Scale and types of developments:</strong> medium to large projects that need both flexibility and firm control, such as a bank adding a new feature to an existing regulated system.</li>
          </ul>

          {_B['wagile_diagram']}'''

SEP_SOCIAL = '''<p>Project work raises social and ethical questions about how people are treated, whether you work alone or in a team.</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th>Situation</th><th>Issues to manage</th></tr></thead>
              <tbody>
                <tr><td><strong>Working individually</strong></td><td>Managing your own time, being honest about progress, and acknowledging code or ideas you did not write yourself.</td></tr>
                <tr><td><strong>Working collaboratively</strong></td><td>Sharing work fairly, respecting different skills and views, and crediting each person's contribution.</td></tr>
                <tr><td><strong>Responding to stakeholders</strong></td><td>Being transparent about what the software will and won't do, protecting users' data, and treating feedback respectfully.</td></tr>
              </tbody>
            </table>
          </div>

          <div class="callout info"><strong>Scenario:</strong> A team member copies a login system from a tutorial without acknowledging it. The ethical response is to cite the source in the documentation and check that its licence allows reuse.</div>'''

SEP_COMMS = '''<p>Good communication keeps the client, the team and the software pointed at the same goal.</p>

          <ul>
            <li><strong>Involving and empowering the client:</strong> invite the client to reviews and let them make decisions about priorities, so the solution is theirs as well as yours.</li>
            <li><strong>Enabling feedback:</strong> make it easy to comment, for example with a demo at the end of each sprint and a simple feedback form.</li>
            <li><strong>Negotiating:</strong> agree on what is realistic. If a feature won't fit the deadline, offer options, such as a simpler version now and the full feature later.</li>
          </ul>

          <div class="callout success"><strong>HSC writing sample:</strong> <em>"Fortnightly demonstrations involved the client in each iteration and enabled feedback early, which revealed that teachers needed a printable roll. Negotiating the scope moved the attendance graph to a later release so the printable roll could be delivered on time."</em></div>'''

SEP_PRESENT = '''<p>At the end of the project you present your solution to an audience such as your client, class or teacher. Presentation software such as PowerPoint, Google Slides or Keynote helps you show the problem, the solution and the evidence that it works.</p>

          <ul>
            <li>Open with the need or opportunity you addressed.</li>
            <li>Demonstrate the key features, using a live demo or screen recording.</li>
            <li>Show evidence from testing and client feedback.</li>
            <li>Finish with an honest evaluation and next steps.</li>
          </ul>

          <div class="callout info"><strong>Tip:</strong> keep slides to one idea each, use screenshots rather than code listings, and have a recording ready in case the live demo fails.</div>'''

SEP_ALGORITHMS = '''<p>Before and during coding, write the key parts of your solution as algorithms, then keep them with your documentation so others can follow your logic.</p>

          <ul>
            <li><strong>Develop:</strong> plan the logic in pseudocode or a flowchart before you write code.</li>
            <li><strong>Construct:</strong> turn each algorithm into code, one subroutine at a time.</li>
            <li><strong>Document:</strong> keep the final algorithms, with comments and a short description of inputs, outputs and purpose.</li>
          </ul>

          <div class="code-block">
            <div class="code-header"><span class="code-lang">pseudocode</span></div>
            <pre><code>BEGIN checkBookingClash(room, start, finish)
    FOR EACH booking IN bookings
        IF booking.room = room AND start &lt; booking.finish AND finish &gt; booking.start THEN
            RETURN True
        ENDIF
    NEXT booking
    RETURN False
END checkBookingClash</code></pre>
          </div>'''

SEP_RESOURCES = '''<p>Allocating resources means deciding what time, people, hardware, software and money each part of the project will get.</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th>Resource</th><th>Example allocation in a school project</th></tr></thead>
              <tbody>
                <tr><td><strong>Time</strong></td><td>Three weeks for development, one week for testing, shown on a Gantt chart</td></tr>
                <tr><td><strong>People</strong></td><td>The client is available for a 15-minute review every second Friday</td></tr>
                <tr><td><strong>Hardware</strong></td><td>A laptop for development; a Raspberry Pi as the test server</td></tr>
                <tr><td><strong>Software</strong></td><td>VS Code, Python with Flask, SQLite and GitHub</td></tr>
                <tr><td><strong>Budget</strong></td><td>Free tiers only, such as GitHub and a free hosting plan</td></tr>
              </tbody>
            </table>
          </div>'''

SEP_BACKUP = f'''<p>A <strong>programmed data backup</strong> copies your data automatically on a schedule or before a risky change, so you don't have to remember to do it.</p>

          {_B['backup_code']}

          <div class="callout info"><strong>Tip:</strong> test your backups by restoring one. A backup you can't restore is not a backup.</div>'''

SEP_FEEDBACK = '''<p>Feedback from your client, users and peers shows how well the solution meets its requirements. <strong>Analyse</strong> it to find patterns, then <strong>respond</strong> by deciding what to change, what to schedule for later and what to explain.</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th>Feedback</th><th>Analysis</th><th>Response</th></tr></thead>
              <tbody>
                <tr><td>"I couldn't find the cancel button."</td><td>Usability issue, raised by 3 of 5 testers</td><td>Moved the button and relabelled it; retested</td></tr>
                <tr><td>"Can it send reminders by SMS?"</td><td>New feature, outside the original scope</td><td>Added to the backlog for a future version</td></tr>
                <tr><td>"The page is slow on my phone."</td><td>Performance issue with large images</td><td>Compressed images; load time down from 4 s to 1.2 s</td></tr>
              </tbody>
            </table>
          </div>'''

SPECS['sep'] = {
    'file': 'software-engineering-project.html',
    'focus_area': 'Software engineering project',
    'outcomes': 'SE-12-01, SE-12-06, SE-12-09',
    'parts': [
        [  # Identifying and defining
            {'id': 'identifying-defining', 'title': 'Defining and Analysing Requirements',
             'src': ['identifying-defining/Problem', 'identifying-defining/Requirements Analysis', 'identifying-defining/User Stories']},
            {'id': 'idea-tools', 'title': 'Tools to Develop Ideas and Generate Solutions',
             'src': ['identifying-defining/Tools', 'project-management/Storyboards', 'hsc-assessment-guidance/Data Dictionary',
                     'identifying-defining/Project Structure']},
            {'id': 'implementation-methods', 'title': 'Software Implementation Methods', 'src': ['implementation-methods']},
        ],
        [  # Research and planning
            {'id': 'development-approaches', 'title': 'The Waterfall Approach', 'outcomes': 'SE-12-01, SE-12-09', 'src': [SEP_WATERFALL]},
            {'id': 'agile', 'title': 'The Agile Approach', 'outcomes': 'SE-12-01, SE-12-09', 'src': [SEP_AGILE]},
            {'id': 'wagile', 'title': 'The WAgile Approach', 'outcomes': 'SE-12-01, SE-12-09', 'src': [SEP_WAGILE]},
            {'id': 'project-management', 'title': 'Applying Project Management',
             'src': ['project-management/Project Management', 'project-management/Gantt', 'hsc-assessment-guidance/Process Diary']},
            {'id': 'social-ethical', 'title': 'Social and Ethical Issues in Project Work', 'outcomes': 'SE-12-05, SE-12-09', 'src': [SEP_SOCIAL]},
            {'id': 'communication', 'title': 'Communication Issues in Project Work', 'outcomes': 'SE-12-09', 'src': [SEP_COMMS]},
            {'id': 'quality-backend', 'title': 'Quality Assurance', 'src': ['quality-backend/Quality']},
            {'id': 'modelling-tools', 'title': 'Using Modelling Tools', 'outcomes': 'SE-12-06',
             'src': ['quality-backend/Modelling', 'project-management/Data Flow']},
            {'id': 'backend-engineering', 'title': 'The Contribution of Back-End Engineering', 'outcomes': 'SE-12-02, SE-12-03',
             'src': ['quality-backend/Back-End']},
        ],
        [  # Producing and implementing
            {'id': 'producing', 'title': 'Designing, Constructing and Implementing a Solution',
             'src': ['producing/Modular Design']},
            {'id': 'presenting', 'title': 'Presenting Your Solution', 'outcomes': 'SE-12-09', 'src': [SEP_PRESENT]},
            {'id': 'documenting-algorithms', 'title': 'Developing and Documenting Algorithms', 'outcomes': 'SE-12-02, SE-12-09', 'src': [SEP_ALGORITHMS]},
            {'id': 'allocating-resources', 'title': 'Allocating Resources', 'outcomes': 'SE-12-06, SE-12-09', 'src': [SEP_RESOURCES]},
            {'id': 'data-backup', 'title': 'Programmed Data Backup', 'outcomes': 'SE-12-04, SE-12-09', 'src': [SEP_BACKUP]},
            {'id': 'version-control', 'title': 'Implementing Version Control', 'outcomes': 'SE-12-06, SE-12-09',
             'src': ['producing/Version Control Workflow']},
            {'id': 'difficulties', 'title': 'Responding to Difficulties', 'src': ['producing/Strategies']},
            {'id': 'innovative-solution', 'title': 'Proposing an Innovative Solution', 'src': ['producing/Innovative']},
        ],
        [  # Testing and evaluating
            {'id': 'testing-evaluating', 'title': 'Methodologies to Test and Evaluate Code',
             'src': ['testing-evaluating/Test Data Table', 'testing-evaluating/Defect Log', 'producing/Code Review',
                     'producing/Debugging']},
            {'id': 'code-optimisation', 'title': 'Language-Dependent Code Optimisation', 'src': ['testing-evaluating/Language']},
            {'id': 'feedback', 'title': 'Analysing and Responding to Feedback', 'outcomes': 'SE-12-08, SE-12-09', 'src': [SEP_FEEDBACK]},
            {'id': 'post-project', 'title': 'Evaluating the Effectiveness of Your Solution',
             'src': ['testing-evaluating/Effectiveness', 'testing-evaluating/Test Plan', 'post-project/Evaluating',
                     'post-project/Developing an Evaluation', 'testing-evaluating/Evaluation Criteria']},
        ],
    ],
}


# ── Programming fundamentals ────────────────────────────────────────────────
PF_PROCEDURES = '''<p>A <strong>subprogram</strong> is a named block of steps that can be called from elsewhere in an algorithm. There are two kinds, and spotting which is which tells you how the algorithm fits together.</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>Procedure</th><th>Function</th></tr></thead>
              <tbody>
                <tr><td><strong>What it does</strong></td><td>Carries out an action</td><td>Calculates and <strong>returns</strong> a value</td></tr>
                <tr><td><strong>How to spot it</strong></td><td>Called as a statement on its own line</td><td>Used inside an expression, e.g. <code>total ← total + getPrice(item)</code></td></tr>
                <tr><td><strong>Example</strong></td><td><code>printReceipt(order)</code></td><td><code>calculateGST(price)</code></td></tr>
              </tbody>
            </table>
          </div>'''

PF_STORAGE = '''<p>Once you know which data your program needs, choose a structure that stores it well. Each structure below is built into Python or easy to make from a list or dictionary.</p>

          <div class="table-wrap">
            <table>
              <thead><tr><th>Structure</th><th>What it stores</th><th>Python example</th></tr></thead>
              <tbody>
                <tr><td><strong>Single-dimensional array</strong></td><td>A fixed row of values of one type, found by index</td><td><code>marks = [72, 85, 64]</code></td></tr>
                <tr><td><strong>Multidimensional array</strong></td><td>A grid of values, found by row and column</td><td><code>seats[2][5]</code> is row 2, seat 5</td></tr>
                <tr><td><strong>List</strong></td><td>An ordered collection that can grow and shrink</td><td><code>queue.append("Priya")</code></td></tr>
                <tr><td><strong>Tree</strong></td><td>Nodes in a hierarchy, each with one parent</td><td>A folder structure, or a binary search tree of names</td></tr>
                <tr><td><strong>Stack</strong></td><td>Last in, first out (LIFO)</td><td><code>undo.append(action)</code> then <code>undo.pop()</code></td></tr>
                <tr><td><strong>Hash table</strong></td><td>Key–value pairs with very fast lookup</td><td><code>phone = {"Ava": "0412 345 678"}</code></td></tr>
              </tbody>
            </table>
          </div>

          <div class="code-block">
            <div class="code-header"><span class="code-lang">Python — a stack for undo</span></div>
            <pre><code>history = []                 <span class="cm"># the stack</span>

<span class="kw">def</span> <span class="fn">do</span>(action):
    history.append(action)   <span class="cm"># push</span>

<span class="kw">def</span> <span class="fn">undo</span>():
    <span class="kw">if</span> history:
        <span class="kw">return</span> history.pop()  <span class="cm"># pop: last action comes off first</span>

do(<span class="str">"type A"</span>); do(<span class="str">"type B"</span>)
print(undo())                <span class="cm"># type B</span></code></pre>
          </div>

          <div class="callout info"><strong>Choosing a structure:</strong> use a hash table when you look items up by a key (a student ID), a stack when the most recent item matters most (undo), and a 2D array when the data is naturally a grid (a seating plan).</div>'''

SPECS['pf'] = {
    'file': 'programming-fundamentals.html',
    'focus_area': 'Programming fundamentals',
    'outcomes': 'SE-11-01, SE-11-02',
    'parts': [
        [  # Software development
            {'id': 'sdlc', 'title': 'Software Development Steps', 'src': ['sdlc']},
            {'id': 'collaboration', 'title': 'Online Code Collaboration Tools', 'src': ['collaboration']},
        ],
        [  # Designing algorithms
            {'id': 'algorithmic-design', 'title': 'Key Features of Standard Algorithms', 'src': ['algorithmic-design']},
            {'id': 'divide-conquer', 'title': 'Divide and Conquer, and Backtracking',
             'src': ['divide-conquer', 'functions-procedures/Recursive']},
            {'id': 'pseudocode', 'title': 'Pseudocode and Flowcharts',
             'src': ['pseudocode/Pseudocode', 'pseudocode/Flowcharts', 'pseudocode/Tracing', 'pseudocode/Subprograms']},
            {'id': 'modelling', 'title': 'Modelling Tools for Top-Down and Bottom-Up Design', 'src': ['modelling']},
            {'id': 'analysis', 'title': 'Analysing the Logic of Written Algorithms', 'src': ['analysis']},
            {'id': 'functions-procedures', 'title': 'Identifying Procedures and Functions', 'outcomes': 'SE-11-02',
             'src': [PF_PROCEDURES, 'functions-procedures/Functions vs', 'functions-procedures/Return']},
            {'id': 'paradigms', 'title': 'Programming Paradigms', 'src': ['paradigms']},
        ],
        [  # Data for software engineering
            {'id': 'number-systems', 'title': 'Number Systems', 'src': ['number-systems/intro']},
            {'id': 'twos-complement', 'title': "Two's Complement", 'src': ["number-systems/Two"]},
            {'id': 'data-types', 'title': 'Standard Data Types',
             'src': ['data-types/intro|before:<div class="diagram-block">']},
            {'id': 'data-dictionaries', 'title': 'Data Dictionaries',
             'src': ['data-types/intro|from:<div class="diagram-block">']},
            {'id': 'data-structures', 'title': 'Arrays, Records, Trees and Sequential Files', 'src': ['data-structures']},
        ],
        [  # Developing solutions with code
            {'id': 'applying-skills', 'title': 'Developing a Software Solution',
             'src': ['applying-skills/Converting', 'applying-skills/Using Control', 'applying-skills/Using Data',
                     'applying-skills/Using Standard', 'applying-skills/Creating', 'functions-procedures/Parameter',
                     'functions-procedures/Variable Scope']},
            {'id': 'implementing-structures', 'title': 'Implementing Data Structures for Storage', 'outcomes': 'SE-11-02, SE-11-04',
             'src': [PF_STORAGE]},
            {'id': 'management', 'title': 'Waterfall and Agile', 'src': ['management']},
            {'id': 'testing', 'title': 'Testing and Evaluating Solutions',
             'src': ['testing/Evaluation', 'variable-naming']},
            {'id': 'debugging', 'title': 'Debugging Tools', 'src': ['testing/Debugging']},
            {'id': 'test-data', 'title': 'Choosing Test Data', 'src': ['testing/Test Data']},
            {'id': 'typical-errors', 'title': 'Typical Errors and Their Causes', 'src': ['testing/Typical']},
        ],
    ],
}


SPECS['oop'] = {
    'file': 'object-oriented-paradigm.html',
    'focus_area': 'The object-oriented paradigm',
    'outcomes': 'SE-11-02, SE-11-08',
    'parts': [
        [  # Understanding OOP
            {'id': 'key-features', 'title': 'Key Features of an OOP Language',
             'src': ['key-features/Objects', 'pillars/Encapsulation', 'pillars/Abstraction', 'pillars/Inheritance',
                     'pillars/Polymorphism', 'key-features/Polymorphism|from:<div class="code-block">']},
            {'id': 'intro', 'title': 'Comparing Procedural Programming with OOP', 'src': ['intro']},
            {'id': 'modelling', 'title': 'Representing a System: DFDs, Structure Charts and Class Diagrams', 'src': ['modelling']},
            {'id': 'design-process', 'title': 'The Design Process in OOP', 'src': ['design-process']},
            {'id': 'effectiveness', 'title': 'Assessing the Effectiveness of Code', 'src': ['effectiveness']},
            {'id': 'message-passing', 'title': 'Message-Passing Between Objects', 'src': ['message-passing']},
            {'id': 'optimisation', 'title': 'Code Optimisation', 'src': ['optimisation']},
            {'id': 'collaboration', 'title': 'OOP Features That Support Collaboration', 'src': ['collaboration']},
        ],
        [  # Programming in OOP
            {'id': 'design-implement', 'title': 'Designing and Implementing OOP Programs',
             'src': ['design-implement', 'hsc-project-oop']},
            {'id': 'code-practices', 'title': 'Implementing and Modifying OOP Code', 'src': ['code-practices']},
            {'id': 'testing', 'title': 'Testing and Evaluating Code', 'src': ['testing']},
        ],
    ],
}


# ── Programming mechatronics ────────────────────────────────────────────────
_MECH_FILE = _os.path.join(_os.path.dirname(_SEP_FILE), 'programming-mechatronics.html')
_mech = open(_MECH_FILE, encoding='utf-8').read()
_m = _re.search(r'<section id="engineering">.*?(<div class="table-wrap">.*?</table>\s*</div>)(.*?)</section>', _mech, _re.S)
MECH_POWER_TABLE = _re.sub(r'<tr>(?:(?!<tr>).)*?Wiring Diagrams.*?</tr>', '', _m.group(1), flags=_re.S) if _m else ''
MECH_TOOL_TIP = _m.group(2).strip() if _m else ''

MECH_WIRING = f'''<p>A <strong>wiring diagram</strong> shows every connection in a mechatronic system: which pin connects to which component, and how power reaches each part. Draw it before you build, and update it whenever the circuit changes.</p>

          <ul>
            <li><strong>Data connections:</strong> label each microcontroller pin and what it does, such as <em>D9 → servo signal</em> or <em>A0 ← light sensor</em>.</li>
            <li><strong>Power supply:</strong> show voltage and ground for every component. Give motors their own supply so they don't cause the microcontroller to brown out.</li>
            <li><strong>Standard symbols and colours:</strong> red for positive, black for ground, and other colours for signals.</li>
          </ul>

          <div class="table-wrap">
            <table>
              <thead><tr><th>Component</th><th>Signal pin</th><th>Power</th><th>Ground</th></tr></thead>
              <tbody>
                <tr><td>Servo motor</td><td>D9 (PWM)</td><td>External 5 V</td><td>Common GND</td></tr>
                <tr><td>Ultrasonic sensor</td><td>D7 trigger, D8 echo</td><td>5 V from board</td><td>GND</td></tr>
                <tr><td>Light sensor (LDR)</td><td>A0</td><td>5 V through 10 kΩ resistor</td><td>GND</td></tr>
              </tbody>
            </table>
          </div>

          {MECH_TOOL_TIP}'''

MECH_CONTROL_ALGORITHMS = '''<p>A control algorithm reads sensors, decides what to do, and drives actuators, over and over. You <strong>develop</strong> one from the task, <strong>modify</strong> it when testing shows a problem, and <strong>apply</strong> it to the real hardware.</p>

          <div class="code-block">
            <div class="code-header"><span class="code-lang">pseudocode — line-following robot</span></div>
            <pre><code>BEGIN followLine
    WHILE running
        left ← READ leftSensor
        right ← READ rightSensor
        IF left = dark AND right = light THEN
            turnLeft()
        ELSEIF right = dark AND left = light THEN
            turnRight()
        ELSE
            driveForward()
        ENDIF
    ENDWHILE
END followLine</code></pre>
          </div>

          <div class="callout info"><strong>Modifying the algorithm:</strong> testing shows the robot zig-zags on straight lines. Changing <code>turnLeft()</code> and <code>turnRight()</code> to slow one wheel rather than stop it gives smoother steering. Record each change and why you made it.</div>'''

SPECS['mech'] = {
    'file': 'programming-mechatronics.html',
    'focus_area': 'Programming mechatronics',
    'outcomes': 'SE-11-03, SE-11-06',
    'parts': [
        [  # Understanding mechatronic hardware and software
            {'id': 'applications', 'title': 'Applications of Mechatronic Systems', 'src': ['applications']},
            {'id': 'hardware', 'title': 'Hardware Requirements and Code Development', 'src': ['hardware']},
            {'id': 'sensors-actuators', 'title': 'Sensors, Actuators and End Effectors', 'src': ['sensors-actuators']},
            {'id': 'data-processing', 'title': 'Data in Mechatronic Systems', 'src': ['data-processing']},
            {'id': 'software-control', 'title': 'Software to Control Interactions and Dependencies', 'src': ['software-control']},
            {'id': 'engineering', 'title': 'Power, Battery and Material Requirements', 'src': [MECH_POWER_TABLE]},
            {'id': 'wiring', 'title': 'Wiring Diagrams', 'outcomes': 'SE-11-06', 'src': [MECH_WIRING]},
            {'id': 'accessibility', 'title': 'Designing for People with Disability', 'src': ['accessibility']},
        ],
        [  # Designing control algorithms
            {'id': 'control-algorithms', 'title': 'Developing Control Algorithms', 'outcomes': 'SE-11-02, SE-11-08',
             'src': [MECH_CONTROL_ALGORITHMS]},
            {'id': 'control-design', 'title': 'Open and Closed Control Systems', 'src': ['control-design']},
            {'id': 'autonomous-features', 'title': 'Features of Autonomous Control', 'src': ['autonomous-features']},
        ],
        [  # Programming and building
            {'id': 'design-develop', 'title': 'Producing a Mechatronic System', 'src': ['design-develop']},
            {'id': 'implementation', 'title': 'Driving Mechatronic Devices', 'src': ['implementation/Driving']},
            {'id': 'simulation', 'title': 'Simulations and Prototypes', 'outcomes': 'SE-11-06, SE-11-08', 'src': ['prototyping/Simulation']},
            {'id': 'closed-loop', 'title': 'Programming a Closed Loop Control System', 'outcomes': 'SE-11-02, SE-11-07',
             'src': ['prototyping/Closed Loop']},
            {'id': 'integration', 'title': 'Integrating Sensors, Actuators and End Effectors', 'outcomes': 'SE-11-07',
             'src': ['implementation/Integrating']},
            {'id': 'performance', 'title': 'Control Algorithms That Enhance Performance', 'outcomes': 'SE-11-08',
             'src': ['implementation/Control Algorithm']},
            {'id': 'user-interface', 'title': 'A User Interface to Control the System', 'outcomes': 'SE-11-07',
             'src': ['prototyping/User Interface']},
            {'id': 'prototyping', 'title': 'Unit Testing Control Algorithms', 'src': ['prototyping/Unit']},
        ],
    ],
}
