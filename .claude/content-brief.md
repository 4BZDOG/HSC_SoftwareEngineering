# Content brief: iterative update of a Software Engineering topic page

You are improving one existing page of **SoftEng Notes**, the study-notes site for NSW HSC Software Engineering (NESA Software Engineering 11–12 Syllabus, 2022), at `/home/user/HSC_SoftwareEngineering`. Readers are Year 11–12 students and their teachers. Read `CLAUDE.md` first.

The sister site **HSC Enterprise Computing** at `/home/user/HSC_EnterpriseComputing` (read only; never modify it) was built with the same framework and is the quality bar. Before you start, read one of its finished pages end to end (`topics/cybersecurity.html` or `topics/intelligent-systems.html`) and its quiz file (`js/quizzes/cybersecurity.js`) to see the depth, exam callouts, worked examples and quiz style we want here.

## This is an iterative update, not a rewrite
- **Keep** the page's structure, section ids, headings, existing figures and animations, existing correct prose and examples. Improve and extend; don't replace good content or restyle the page.
- **Never change the syllabus scaffolding**: `.part-name`, `<p class="syllabus-concept">`, `<ul class="syllabus-including">` are NESA's verbatim text and `scripts/check-site.py` enforces them (plus outcome codes and the sidebar order).
- Fix anything inaccurate or out of date you find (say what in your report).

## What to add
1. **Depth where it's thin.** Run `python3 scripts/copy_audit.py` and measure each section's words. Bring every section up to the depth its NESA verb implies (the EC pages run roughly 400–900 words a section; *describe/outline/identify* can be shorter, *investigate/evaluate/apply/design/develop* need more). Cover every "Including" item under its own `<h3>` (or a clearly labelled row of a comparison table). Priorities: sections under ~300 words, and practical dot points that lack a worked, reproducible example (code in Python unless the dot point implies otherwise, with expected output; algorithms in NESA pseudocode/flowchart notation per the Course Specifications).
2. **Exam guidance.** At least one `<div class="callout assessor"><strong>Exam tip</strong> …</div>` per part: how a question on this content is likely to be phrased with NESA command verbs, what a full-mark answer includes, common mistakes. Keep existing `exam-tip` callouts.
3. **Quizzes: five questions per part.** Extend `js/quizzes/<slug>.js` from three to five questions per quiz key (keep the existing three unless one is wrong). Format `{ q, options: [4 strings], answer: <index>, why }`; mix recall and scenario questions in the style of HSC objective items; plausible distractors; spread the correct index across all four positions.
4. **One interactive element, only where it genuinely teaches** (optional; skip if the page already has good ones): vanilla JS in `js/pages/<slug>.js` + `css/pages/<slug>.css`, linked only from your page, theme-aware via CSS custom properties (light and dark), keyboard accessible, `prefers-reduced-motion` aware, works at 390 px. Examples: a trace-table stepper, a validation/sanitisation tester, a test-data generator, a Gantt/critical-path checker.
5. **Diagrams**: only if a section clearly needs one. Reuse existing scenes first; otherwise use the diagram kit (`.claude/skills/paper-diagrams.md`, `add-animation.md`) with a new scene named with your page's prefix. NESA notation exactly; no hand-written SVG.
6. **Glossary candidates**: write `reference-glossary/<slug>.json` (create the folder if needed; it is merged later, not published): an array of new keywords from your additions not already in `topics/glossary.html`: `{"id": "term-kebab", "name": "Name", "topics": ["<prefix>"], "definition": "One precise sentence.", "example": "One concrete example."}`.

## Accuracy rules
- UK/Australian English. No invented statistics, dates, quotes or company claims; if unsure, describe the idea without the number. Australian law and bodies first (Privacy Act 1988 and APPs, OAIC, NDB scheme, Cybercrime Act 2001, Copyright Act 1968, ASD/ACSC Essential Eight, eSafety). Describe real incidents only with widely documented facts.
- Assessment or exam facts only from `resources/se-assessment.md`, with its caveats.
- External links only to reputable sources, each checked with `curl -sS -o /dev/null -w "%{http_code}" -L <url>` → 200.

## Files you may touch
Your page `topics/<slug>.html`, `js/quizzes/<slug>.js`, `js/pages/<slug>.js`, `css/pages/<slug>.css`, new `js/anims/<prefix>-*.js` scenes, `reference-glossary/<slug>.json`. Nothing else: not `css/styles.css`, `css/paper.css`, `js/main.js`, `scripts/*`, `index.html`, other pages or existing scenes. Other agents work on other pages at the same time; never `rm -rf` a shared folder. Do not `git commit`. If you think a shared file needs changing, say so in your report.

## Testing (before you report)
1. `python3 scripts/check-site.py` and `bash scripts/validate-alignment.sh` pass (errors on other pages being edited concurrently can be ignored; none may be on yours). `node --check` your JS files; `python3 -m json.tool` your glossary file.
2. Serve on your assigned port and screenshot with Playwright at 1400 px light, 1400 px dark and 390 px: no console errors (Google Fonts certificate errors excepted), `document.documentElement.scrollWidth <= 390` at 390 px, every figure and quiz renders, any widget works. Look at the screenshots and fix what's wrong.
3. Report (under 300 words): words before → after, sections deepened, exam callouts added, quiz count, widget/figures added, glossary candidates, anything corrected, anything you weren't sure of and left out.
