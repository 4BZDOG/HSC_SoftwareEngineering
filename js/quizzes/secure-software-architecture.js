/* ============================================================
   "Check your understanding" question bank for Secure Software Architecture (data only).
   One quiz per NESA subheading, keyed "ssa-<part number>".
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'ssa-1': [
    { q: 'Why build security into the requirements step rather than at the end?',
      options: ['It is required only by Waterfall', 'Vulnerabilities are cheaper to prevent than to fix later', 'Testing is not needed then', 'It removes the need for maintenance'], answer: 1,
      why: 'Security defined early shapes the design; fixing flaws after release costs far more.' },
    { q: 'An app used mostly by elderly people should…',
      options: ['Use complex passwords with no reset', 'Offer clear, simple security steps such as passkeys and plain-language warnings', 'Hide all error messages', 'Skip authentication'], answer: 1,
      why: "Users' capabilities and experience should shape secure design so security is actually usable." },
    { q: 'Which is a benefit of secure software?',
      options: ['Larger attack surface', 'Data protection and fewer successful attacks', 'No need for updates', 'Faster compilation'], answer: 1,
      why: 'Secure software protects data and minimises cyber attacks and vulnerabilities.' },
  ],
  'ssa-2': [
    { q: 'A teacher can edit marks but a student can only view them. Which concept is this?',
      options: ['Authentication', 'Authorisation', 'Accountability', 'Availability'], answer: 1,
      why: 'Authorisation decides what an authenticated user is allowed to do.' },
    { q: 'Running each browser tab in isolation so a malicious page cannot read your files is…',
      options: ['Hashing', 'Sandboxing', 'Session management', 'Penetration testing'], answer: 1,
      why: 'Sandboxing confines code so it cannot harm the rest of the system.' },
    { q: 'What is the best defence against SQL injection?',
      options: ['Hiding the database', 'Parameterised queries', 'Longer passwords', 'HTTPS'], answer: 1,
      why: 'Parameterised queries keep user input as data, so it can never run as SQL.' },
  ],
  'ssa-3': [
    { q: 'Which is a benefit to an enterprise of secure development practices?',
      options: ['More emergency patches', 'Greater customer trust and productivity', 'Less documentation', 'No need for testing'], answer: 1,
      why: 'Fewer incidents mean less disruption, and customers trust services with a strong record.' },
    { q: 'Collaboration helps secure development mainly because…',
      options: ['Code is written faster without review', 'Different points of view catch different risks', 'Only one person needs to understand the code', 'It removes the need for testing'], answer: 1,
      why: 'Diverse perspectives and delegated expertise improve the quality of the solution.' },
    { q: 'Which law sets rules for handling personal information in Australia?',
      options: ['Copyright Act 1968', 'Privacy Act 1988', 'Spam Act 2003', 'Corporations Act 2001'], answer: 1,
      why: 'The Privacy Act 1988 and its Australian Privacy Principles govern personal information.' },
  ],
});
