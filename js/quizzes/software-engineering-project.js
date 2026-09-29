/* ============================================================
   "Check your understanding" question bank for Software Engineering Project (data only).
   One quiz per NESA subheading, keyed "sep-<part number>".
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'sep-1': [
    { q: 'A school trials new software in Year 7 before every year group uses it. Which implementation method is this?',
      options: ['Direct', 'Phased', 'Parallel', 'Pilot'], answer: 3,
      why: 'Pilot implementation tries the system with one group or site first.' },
    { q: 'Which requirement is non-functional?',
      options: ['Users can book a room', 'Pages load in under 2 seconds', 'Admins can delete bookings', 'The system emails a receipt'], answer: 1,
      why: 'Non-functional requirements describe how well the system performs, not what it does.' },
    { q: 'Checking whether a project fits the budget and deadline is assessing…',
      options: ['Scheduling and financial feasibility', 'Boundaries', 'Data types', 'Code generation'], answer: 0,
      why: 'Feasibility asks whether the project can realistically be done with the time and money available.' },
  ],
  'sep-2': [
    { q: 'Which approach suits a project whose requirements are likely to change?',
      options: ['Waterfall', 'Agile', 'Direct', 'Parallel'], answer: 1,
      why: 'Agile plans in short sprints and welcomes change after each review.' },
    { q: 'WAgile is best described as…',
      options: ['A testing tool', 'A hybrid of Waterfall planning with Agile development', 'A type of Gantt chart', 'A programming language'], answer: 1,
      why: 'WAgile keeps Waterfall gates for control but builds in Agile sprints.' },
    { q: 'Which tool shows task durations and dependencies over time?',
      options: ['Data flow diagram', 'Gantt chart', 'Structure chart', 'Class diagram'], answer: 1,
      why: 'Gantt charts schedule and track tasks against a timeline.' },
  ],
  'sep-3': [
    { q: 'Why run a programmed data backup?',
      options: ['To speed up the database', 'So data is copied automatically and can be restored', 'To replace version control', 'To test the UI'], answer: 1,
      why: 'Automated backups protect data without relying on someone remembering.' },
    { q: 'Using a payment provider instead of writing your own payment system is…',
      options: ['Outsourcing', 'Refactoring', 'Polling', 'Pilot testing'], answer: 0,
      why: 'Outsourcing hands a hard, non-core part to a trusted provider.' },
    { q: 'What should a proposed innovative solution include?',
      options: ['Finished production code', 'A prototype and UI design', 'A new programming language', 'Nothing visual'], answer: 1,
      why: 'The dot point asks for a prototype and user interface design, not a finished build.' },
  ],
  'sep-4': [
    { q: 'Comparing actual output with expected output is part of…',
      options: ['Evaluating effectiveness', 'Requirements elicitation', 'Allocating resources', 'Negotiating'], answer: 0,
      why: 'Evaluation checks whether the solution does what it should, using test results.' },
    { q: 'Which is a language-dependent optimisation in Python?',
      options: ['Using a list comprehension or sum() instead of a manual loop', 'Adding more comments', 'Renaming variables', 'Writing a Gantt chart'], answer: 0,
      why: 'Built-ins and comprehensions use Python\'s optimised internals.' },
    { q: 'Five of eight testers can\'t find the booking history. What is the best response?',
      options: ['Ignore it', 'Redesign the navigation and retest', 'Add a new unrelated feature', 'Remove the booking history'], answer: 1,
      why: 'Analyse the pattern, fix the usability issue and check the fix worked.' },
  ],
});
