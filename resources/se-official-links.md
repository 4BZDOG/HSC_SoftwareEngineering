# Software Engineering 11–12 (2022) – official NESA resources

**Date checked: 29 September 2026.** Every URL below was requested with `curl -sS -o /dev/null -w "%{http_code}" -L` and returned **HTTP 200**. Where a resource does not exist on NESA sites, it is listed in section 7 rather than guessed. HTTP 200 after redirects only shows the URL resolves; where a URL redirects somewhere unexpected, the description says so.

Base site: NSW Curriculum website (curriculum.nsw.edu.au), which NESA states holds "the only official and up-to-date versions" of syllabus documents. Files hosted in the NESA library are at `library.curriculum.nsw.edu.au`. Course codes: Year 11 11345, Year 12 15365.

## 1. Syllabus pages (curriculum.nsw.edu.au)

| Title | URL | Format | Description |
|---|---|---|---|
| Software Engineering 11–12 (2022) – Overview | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/overview | Web page | Syllabus home: course description, organisation (Figure 1), Aboriginal and Torres Strait Islander protocols. |
| Overview – Course (structure, hours) | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/overview/course | Web page | Course structure and requirements (Year 11: 40/40/40 hours; Year 12: 30/30/30/30 hours), safety and risk management, Course Specifications statement, course codes, prerequisites and exclusions. |
| Rationale | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/rationale | Web page | Syllabus rationale. |
| Aim | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/aim | Web page | Syllabus aim. |
| Outcomes | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/outcomes | Web page | Year 11 (SE-11-01 to SE-11-09) and Year 12 (SE-12-01 to SE-12-09) outcomes. |
| Content | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/content | Web page | Content landing: focus areas, subheadings and dot points for both years. |
| Content – Year 11 (Programming Fundamentals default) | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/content/year-11/fac3c86ce1 | Web page | Year 11 focus-area content with per-focus-area teaching advice (why it is important; project work advice). |
| Content – Year 12 (Secure Software Architecture default) | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/content/year-12/fa039e749d | Web page | Year 12 focus-area content with per-focus-area teaching advice, including the Software Engineering Project advice. |
| Glossary | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/glossary | Web page | Syllabus glossary (33 terms tagged to Software Engineering; transcribed in `se-syllabus-glossary.md`). |
| Assessment (landing page) | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/assessment | Web page | Opens on Course standards. |
| Assessment – Course standards | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/assessment/course-standards | Web page | Common Grade Scale (Preliminary) and HSC Performance Band Descriptions for Software Engineering (Bands 1–6). |
| Assessment – School-based assessment | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/assessment/school-based-assessment | Web page | Year 11 and Year 12 mandatory components (50/50), the take-home task limit (one task, no more than 15%), task-weighting guidance. Sample assessment schedules/notifications headings exist but have no files. |
| Assessment – HSC examinations | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/assessment/hsc-examinations | Web page | HSC exam specification (80 marks, 2 h 30 min including 10 min reading, online), assumed Python knowledge, online exam tools, sample exam materials, familiarisation questions. |
| Teaching and learning (landing) | https://curriculum.nsw.edu.au/learning-areas/tas/software-engineering-11-12-2022/teaching-and-learning | Web page | Landing page that repeats the course description and links to the site-wide teaching advice, teaching resources, record of changes and glossary. |
| Teaching advice (site-wide, filter by syllabus) | https://curriculum.nsw.edu.au/resources/teaching-advice | Web page | Site-wide teaching-advice page; the Software Engineering text is loaded by the page's syllabus filter and is also published on the focus-area content pages above. |
| Teaching resources (site-wide, filter by syllabus) | https://curriculum.nsw.edu.au/resources/teaching-resources | Web page | Site-wide page listing the resource files in section 3 (loaded by a syllabus filter). |
| Record of changes (site-wide) | https://curriculum.nsw.edu.au/resources/record-of-changes | Web page | Change log for syllabuses and the site, including the 13 March 2026 Software Engineering Course Specifications clarification. |
| Syllabus glossary (site-wide) | https://curriculum.nsw.edu.au/resources/glossary | Web page | Site-wide glossary across syllabuses (filter by Software Engineering 11–12 (2022)). |

Note: the pages `.../software-engineering-11-12-2022/teaching-and-learning/teaching-advice`, `/teaching-resources` and `/record-of-changes` (used by other syllabus sites) return a 308 redirect to the NSW Curriculum home page (final status 200) for Software Engineering; they are not real pages. Use the site-wide URLs above.

## 2. Course Specifications (integral to the syllabus)

| Title | URL | Format | Description |
|---|---|---|---|
| Higher School Certificate Course Specifications – Software Engineering | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/f56c20d7-84b0-4c23-8c82-4c29116010c2/software-engineering-11-12-2022-higher-school-certificate-course-specifications.PDF | PDF, 33 pp, about 1.5 MB ("updated March 2026") | NESA's "integral" specification of notation and depth: DFD, structure charts, data dictionary, class diagrams, storyboard, decision trees, Gantt charts, process diaries, paradigms, pseudocode and flowcharts, control structures, subroutines, SQL and ORM, wiring diagrams, web (front-end frameworks, XSS, CSS), machine learning (automation, regression, neural networks), testing methods, character representation, and Python. The copy already in `resources/` (32 pp, "updated February 2025") is an older version. |

## 3. Sample programming and teaching support (NESA library)

| Title | URL | Format | Description |
|---|---|---|---|
| Sample scope and sequence: Year 11 – 120 hours | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/575bd1ef-24a9-4591-9ee3-2bbda8528fed/software-engineering-11-12-2022-sample-scope-and-sequence-year-11-120-hours.docx | Word (.docx) | Sample sequence of units across the 120-hour Year 11 course (Beginning Programming, Object-Oriented Programming, Mechatronics), with outcomes per term. |
| Sample scope and sequence: Year 12 – 120 hours | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/f1ff34f4-0060-4fac-a831-04d7b9589d71/software-engineering-11-12-2022-sample-scope-and-sequence-year-12-120-hours.docx | Word (.docx) | Sample sequence for Year 12 with the project unit ("Putting it all together") in the later terms of the HSC course; notes that "the final assessment task is embedded in this unit". |
| Sample scope and sequence B: Year 12 – 120 hours | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/eed22c34-4fe8-429d-86d4-71e03a985fe5/software-engineering-11-12-2022-sample-scope-and-sequence-b-year-12-120-hours.DOCX | Word (.docx) | Alternative Year 12 sequence in which the 30-hour project unit runs concurrently with other focus areas over three terms. |
| Sample unit: Year 11 – Programming Fundamentals: practical programming in context | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/caa48afd-469e-4871-b823-a9a28cf53df8/software-engineering-11-12-2022-sample-unit-year-11-programming-fundamentals-practical-programming-in-context.DOCX | Word (.docx) | Worked sample unit with teaching, learning and assessment activities for Programming Fundamentals. |
| Sample unit: Year 12 – Software Engineering Project | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/e265aee2-4be3-4e2b-94cf-c40830a6da90/software-engineering-11-12-2022-sample-unit-year-12-software-engineering-project.docx | Word (.docx) | Worked sample unit ("30 hours over 3 terms") with project checklist, SWOT idea scaffold, pitch storyboard, implementation-methods and code-optimisation scaffolds. |
| Bibliography: Software Engineering 11–12 | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/e6136fa8-766a-4a21-9568-080d09bccda5/software-engineering-11-12-2022-bibliography.DOCX | Word (.docx) | Reference list used in developing the syllabus. |
| Engagement report: Software Engineering 11–12 | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/558c5b3d-5e5b-4090-a841-040694a69a86/software-engineering-11-12-2022-engagement-report.PDF | PDF, about 1.4 MB | Consultation/engagement report for syllabus development. |
| Supporting your child: Parent and carer guide – Software Engineering 11–12 | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/b3983252-7426-4923-bd47-57a160f7d1e4/software-engineering-11-12-2022-parent-and-carer-guide.PDF | PDF, about 0.6 MB | Short overview of what students learn, for parents and carers. |
| Introduction to the Computing Technologies 7–12 Syllabuses: Transcript | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/9263c0d3-0a10-4887-831c-74aca48900b0/introduction-to-the-computing-technologies-7-12-syllabus-transcript.DOCX | Word (.docx) | Transcript of the introductory video across the 7–12 computing syllabuses. |
| Software Engineering 11–12 course overview image (Figure 1) | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/241b5edb-d877-476b-ba7c-bebea5eb5ae5/software-engineering-11-12-course-overview-image.PNG | PNG | NESA's diagram of how the focus areas, project work and skills relate. |

## 4. HSC examination and standards materials

| Title | URL | Format | Description |
|---|---|---|---|
| Software Engineering HSC exam papers (index) | https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/software-engineering | Web page | Lists Software Engineering HSC exam packs (only the 2025 pack is listed); links to the Software Design and Development archive. |
| Software Engineering 2025 HSC exam pack | https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/software-engineering/2025 | Web page | Links to the online exam, marking guidelines, question-by-question marker feedback and sample full-mark responses. States "There is no downloadable paper for Software Engineering". |
| 2025 HSC Software Engineering Marking Guidelines | https://www.nsw.gov.au/sites/default/files/noindex/2025-12/2025-hsc-software-engineering-mg.pdf | PDF, 17 pp, about 0.4 MB | Criteria, marks and sample answers for all 27 questions of the 2025 exam, plus a mapping grid of content and outcomes to each question. |
| Software Engineering 2025 HSC sample full-mark responses | https://www.nsw.gov.au/sites/default/files/noindex/2026-08/software-engineering-2025-full-mark-samples.PDF | PDF, about 0.9 MB | Sample full-mark student responses for Questions 16, 18–25 and 27 (published August 2026). |
| 2025 Software Engineering HSC online exam / HSC familiarisation questions | https://fam.hsconline.nesa.nsw.edu.au/ | Web application | NESA's online exam environment: familiarisation questions and the 2025 exam for practice with the code editor, drawing and screen design tools. |
| Marking guidelines for HSC familiarisation questions | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/96889392-eee9-414c-b975-979124e8809f/software-engineering-hsc-marking-guidelines.pdf | PDF, 15 pp | Marking guidelines (12 June 2025) for the 14 familiarisation questions. |
| Marking guidelines for the online HSC sample exam | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/018f0a1b-f6cb-41bb-8f73-45071e4f97b2/software-engineering-sample-exam-marking-guidelines.pdf | PDF, 17 pp | Marking guidelines (21 May 2025) for the online sample exam (the sample exam itself is enrolled via Schools Online and is not publicly downloadable). |
| Code editor video transcript | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/a7a28239-b950-4f4c-b8c5-c16b21a3773a/stage-6-syllabus-code-editor-video-transcript.docx | Word (.docx) | Transcript describing the online exam code editor (used for Python programming questions). |
| Drawing tool video transcript | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/53052c2e-22c5-43ae-80ac-0aeab740692f/stage-6-syllabus-drawing-tool-video-transcript.docx | Word (.docx) | Transcript describing the online exam drawing tool (used for diagrams such as class diagrams). |
| Screen design tool video transcript | https://library.curriculum.nsw.edu.au/341419dc-8ec2-0289-7225-6db7f2d751ef/9cafcc28-127d-4ec0-99e8-c5259dce9688/stage-6-syllabus-screen-design-tool-video-transcript.DOCX | Word (.docx) | Transcript describing the online exam screen design tool. |
| Code editor video (Brightcove) | https://players.brightcove.net/2750693524001/default_default/index.html?videoId=6358387417112 | Video player | Demonstration of the code editor tool in the online exam. |
| Drawing tool video (Brightcove) | https://players.brightcove.net/2750693524001/default_default/index.html?videoId=6361114003112 | Video player | Demonstration of the drawing tool in the online exam. |
| Screen design tool video (Brightcove) | https://players.brightcove.net/2750693524001/default_default/index.html?videoId=6358388775112 | Video player | Demonstration of the screen design tool in the online exam. |
| Software Design and Development HSC exam papers archive | https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-papers/software-design-and-development-archive | Web page | Past HSC papers for the previous course (Software Design and Development), linked from the Software Engineering assessment page. Not Software Engineering papers. |
| HSC exam resources | https://www.nsw.gov.au/education-and-training/nesa/curriculum/hsc-exam-resources | Web page | NESA hub for HSC standards materials and exam packs. |
| NESA syllabus page: Software Engineering 11–12 Syllabus (2022) | https://www.nsw.gov.au/education-and-training/nesa/curriculum/tas/software-engineering-11-12-2022 | Web page | NESA website entry that points to the curriculum.nsw.edu.au syllabus. |
| HSC exam provisions | https://www.nsw.gov.au/education-and-training/nesa/hsc/exam-provisions | Web page | Exam provisions for students with disability. |

## 5. Assessment rules and notices

| Title | URL | Format | Description |
|---|---|---|---|
| ACE rules – Assessment programs (2.1) | https://curriculum.nsw.edu.au/ace-rules/ace2/assessment-programs | Web page | Rules for Preliminary (2.1.1) and HSC (2.1.2) school-based assessment programs, including the one-take-home-task, 15% cap and generative-AI requirement. |
| ACE rules – Breaches and malpractice (10.1) | https://curriculum.nsw.edu.au/ace-rules/ace10/malpractice | Web page | Includes 10.1.2 Developing a school malpractice policy (schools must not rely on AI-detection software to determine malpractice). |
| ACE rules (index) | https://curriculum.nsw.edu.au/ace-rules | Web page | Assessment Certification Examination rules and requirements. |
| New limit on take-home assessment tasks from Term 4 2026 (NESA 29/26, 31 August 2026) | https://www.nsw.gov.au/education-and-training/nesa/news/all/new-take-home-assessment-rules | Web page | Official notice of the take-home limit, exempt courses (Software Engineering is not listed) and generative AI requirements. |
| Changes to ACE Rules concerning take-home assessment tasks and the use of artificial intelligence (NESA 34/26, 16 September 2026) | https://www.nsw.gov.au/education-and-training/nesa/news/all/changes-ace-rules-take-home-tasks-artifical-intelligence | Web page | Official notice of the rule changes with effect dates. |

## 6. Other

| Title | URL | Format | Description |
|---|---|---|---|
| Software Engineering 11–12 professional learning (NESA Learning catalogue) | https://catalog.learning.nesa.nsw.edu.au/browse/t/cr/courses/software-engineering-1112-professional-learning | Web page | NESA Learning catalogue course linked from the Content tab. The request ends on `https://lms.nesa.nsw.edu.au/` (a login/landing page), so the course listing itself was not viewed. |

## 7. Not found on NESA sites (29 September 2026)

- **Software Engineering syllabus as a static PDF:** none linked. The NSW Curriculum site provides a "Custom download" generator instead. (The old educationstandards.nsw.edu.au Software Design and Development link on the assessment page belongs to the previous course.)
- **Assessment and reporting document (PDF):** none; the information is on the school-based assessment, HSC examinations and course standards pages.
- **Sample assessment schedules and sample assessment task notifications:** headings exist on the school-based assessment page but no files are attached; NESA's notice on that page says they "are being updated to align with new ACE Rules".
- **Specimen or past Software Engineering HSC paper for download:** none. Only the 2025 pack exists, viewed through the online exam site; the online sample exam is accessed through Schools Online (login required).
- **NESA generic "Glossary of key words":** not linked from the Software Engineering pages.
- **A downloadable Software Engineering syllabus content or teaching-advice document:** none; the content is on the web pages (a verbatim copy of the content is in `nesa-syllabus-content.md`).
