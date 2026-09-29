/* ============================================================
   "Check your understanding" question bank for The Object-Oriented Paradigm (data only).
   One quiz per NESA subheading, keyed "oop-<part number>".
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'oop-1': [
    { q: 'Making balance private and changing it only through deposit() and withdraw() is an example of…',
      options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Generalisation'], answer: 1,
      why: 'Encapsulation bundles data with its methods and hides the data from direct access.' },
    { q: 'shape.area() works for both a Circle and a Square. Which feature makes this possible?',
      options: ['Polymorphism', 'Abstraction', 'Message passing', 'Composition'], answer: 0,
      why: 'Polymorphism lets different classes respond to the same method call in their own way.' },
    { q: 'Moving name and email from Student and Teacher into a shared Person class is…',
      options: ['Encapsulation', 'Generalisation', 'Optimisation', 'Refinement'], answer: 1,
      why: 'Generalisation identifies common traits and moves them into a parent class.' },
  ],
  'oop-2': [
    { q: 'What is a stub?',
      options: ['A comment at the top of a file', 'A placeholder subroutine used until the real one is written', 'A failed test', 'A type of loop'], answer: 1,
      why: 'Stubs let you test the rest of the program before every subroutine is finished.' },
    { q: 'Testing a program only through its inputs and outputs, without reading the code, is…',
      options: ['White-box testing', 'Black-box testing', 'Unit testing', 'Desk checking'], answer: 1,
      why: 'Black-box testing checks behaviour against expected results without looking inside.' },
    { q: 'Which practice best supports a clear and uncluttered mainline?',
      options: ['Putting all code in one long function', 'Calling well-named subroutines that each do one task', 'Using global variables everywhere', 'Avoiding comments'], answer: 1,
      why: 'A short mainline that calls one-task subroutines is easier to read, test and maintain.' },
  ],
});
