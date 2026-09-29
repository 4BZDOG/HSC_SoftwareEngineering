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
    { q: 'On a class diagram, the line between Student and Course has 0..* at the Student end and 1..* at the Course end. Which statement is correct?',
      options: ['A student takes exactly one course, and a course has one student', 'A student takes zero or more courses, and a course has one or more students', 'A student takes one or more courses, and a course can have zero or more students', 'Student inherits from Course'], answer: 2,
      why: 'A multiplicity sits next to the class it counts. 1..* at the Course end means each student takes one or more courses; 0..* at the Student end means each course can have zero or more students. Inheritance would be shown with a triangle head at the parent, not a labelled relationship.' },
    { q: 'A program calls item.describe() where item is a DVD object. What does Python do?',
      options: ['It runs the describe() of whichever class was defined first in the file', 'It always runs the describe() in the base class', 'It copies every describe() method into the DVD object first', 'It searches the DVD class, then its parent classes, and runs the first describe() it finds'], answer: 3,
      why: 'Python decides at run time by looking at the class of the receiving object and searching up the inheritance chain. This is how the same message can produce different results for different objects.' },
  ],
  'oop-2': [
    { q: 'What is a stub?',
      options: ['A comment at the top of a file', 'A placeholder subroutine used until the real one is written', 'A failed test', 'A type of loop'], answer: 1,
      why: 'Stubs let you test the rest of the program before every subroutine is finished.' },
    { q: 'Testing a program only through its inputs and outputs, without reading the code, is…',
      options: ['White-box testing', 'Unit testing', 'Desk checking', 'Black-box testing'], answer: 3,
      why: 'Black-box testing checks behaviour against expected results without looking inside.' },
    { q: 'Which practice best supports a clear and uncluttered mainline?',
      options: ['Calling well-named subroutines that each do one task', 'Putting all code in one long function', 'Using global variables everywhere', 'Avoiding comments'], answer: 0,
      why: 'A short mainline that calls one-task subroutines is easier to read, test and maintain.' },
    { q: 'Borrowing is allowed while a member holds fewer than 3 items. Which pair of loan counts gives the best boundary tests?',
      options: ['0 and 100', '1 and 5', '2 and 3', '10 and 20'], answer: 2,
      why: 'Boundary testing checks on both sides of the edge of a rule. A member with 2 items is the last one allowed to borrow and a member with 3 is the first to be refused; that is where off-by-one errors (< versus <=) show up.' },
    { q: 'A developer splits a 60-line method into three smaller methods. All the existing tests still pass and the program behaves exactly as before. This is…',
      options: ['Adding a new feature', 'Fixing a bug', 'Regression failure', 'Refactoring'], answer: 3,
      why: 'Refactoring changes the structure of code without changing its behaviour. Re-running the tests (regression testing) is the evidence that nothing was broken.' },
  ],
});
