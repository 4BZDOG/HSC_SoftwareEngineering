/* ============================================================
   "Check your understanding" question bank for Programming Fundamentals (data only).
   One quiz per NESA subheading, keyed "pf-<part number>".
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'pf-1': [
    { q: 'A team confirms the app runs at 60 fps on a Raspberry Pi 4 before designing anything. Which development step is this?',
      options: ['Requirements definition', 'Determining specifications', 'Integration', 'Maintenance'], answer: 1,
      why: 'Specifications set technical constraints such as hardware, performance and memory limits.' },
    { q: 'What is the main benefit of a pull request on GitHub?',
      options: ['It deletes old branches automatically', 'It lets teammates review code before it is merged', 'It makes code run faster', 'It backs up the database'], answer: 1,
      why: 'Pull requests support peer review, catching errors before code reaches the main branch.' },
    { q: 'Releasing version 1.1 to fix a bug found after launch belongs to which step?',
      options: ['Installation', 'Testing and debugging', 'Maintenance', 'Design'], answer: 2,
      why: 'Maintenance is the ongoing work of fixing bugs and adding features after deployment.' },
  ],
  'pf-2': [
    { q: 'Binary search keeps halving the list it searches. Which strategy is this?',
      options: ['Backtracking', 'Divide and conquer', 'Bottom-up design', 'Iteration only'], answer: 1,
      why: 'Divide and conquer splits a problem into smaller sub-problems of the same kind.' },
    { q: 'In pseudocode, which line calls a function rather than a procedure?',
      options: ['printReceipt(order)', 'total ← total + getPrice(item)', 'saveFile(data)', 'showMenu()'], answer: 1,
      why: 'A function returns a value, so it is used inside an expression. Procedures are called on their own line.' },
    { q: 'You trace an algorithm by hand, recording each variable in a table. What is this called?',
      options: ['Peer checking', 'Desk checking', 'Refinement', 'Profiling'], answer: 1,
      why: 'A desk check (dry run) traces the algorithm step by step with sample data.' },
  ],
  'pf-3': [
    { q: 'What is 1011 in decimal?',
      options: ['9', '11', '13', '1011'], answer: 1,
      why: '8 + 0 + 2 + 1 = 11.' },
    { q: 'Which data type is best for an Australian mobile number such as 0412 345 678?',
      options: ['Integer', 'Real', 'String', 'Boolean'], answer: 2,
      why: 'You never do arithmetic on phone numbers, and an integer would drop the leading zero.' },
    { q: "What is −5 in 8-bit two's complement?",
      options: ['10000101', '11111010', '11111011', '00000101'], answer: 2,
      why: 'Write 5 (00000101), invert the bits (11111010), then add 1: 11111011.' },
  ],
  'pf-4': [
    { q: 'A program accepts marks from 1 to 100. Which set tests the boundaries best?',
      options: ['50, 60, 70', '0, 1, 100, 101', '"fifty", −5', '1, 2, 3'], answer: 1,
      why: 'Boundary testing checks values on and just outside each limit, where off-by-one errors hide.' },
    { q: 'Code runs without crashing but a mark of exactly 50 is shown as a fail. What kind of error is this?',
      options: ['Syntax error', 'Runtime error', 'Logic error', 'Compilation error'], answer: 2,
      why: 'The code is valid and runs, but the logic (probably < instead of <=) is wrong.' },
    { q: 'Which data structure suits an undo feature?',
      options: ['Stack', 'Hash table', 'Sequential file', 'Two-dimensional array'], answer: 0,
      why: 'Undo needs the most recent action first: last in, first out.' },
  ],
});
