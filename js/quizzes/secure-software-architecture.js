/* ============================================================
   "Check your understanding" question bank for Secure Software Architecture (data only).
   One quiz per NESA subheading, keyed "ssa-<part number>", five questions each.
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'ssa-1': [
    { q: 'Why build security into the requirements step rather than at the end?',
      options: ['It is required only by Waterfall', 'It removes the need for maintenance', 'Vulnerabilities are cheaper to prevent than to fix later', 'Testing is not needed then'], answer: 2,
      why: 'Security defined early shapes the design; fixing flaws after release usually costs more.' },
    { q: 'An app used mostly by elderly people should…',
      options: ['Use complex passwords with no reset', 'Skip authentication', 'Hide all error messages', 'Offer clear, simple security steps such as passkeys and plain-language warnings'], answer: 3,
      why: "Users' capabilities and experience should shape secure design so security is actually usable." },
    { q: 'Which is a benefit of secure software?',
      options: ['Data protection and fewer successful attacks', 'Larger attack surface', 'No need for updates', 'Faster compilation'], answer: 0,
      why: 'Secure software protects data and minimises cyber attacks and vulnerabilities.' },
    { q: 'During threat modelling, a team asks: "Could a teacher deny having changed a student\'s mark?" Which STRIDE threat is this?',
      options: ['Tampering', 'Repudiation', 'Spoofing', 'Elevation of privilege'], answer: 1,
      why: 'Repudiation is denying an action. Tamper-evident audit logs (accountability) are the matching control.' },
    { q: 'Which pairing of a development step with a security activity is correct?',
      options: ['Requirements: run a penetration test', 'Testing: write misuse cases', 'Design: threat model with a data flow diagram', 'Installation: choose the password policy'], answer: 2,
      why: 'Threat modelling belongs in design. Misuse cases and password rules are set early, and penetration tests belong to testing.' },
  ],
  'ssa-2': [
    { q: 'A teacher can edit marks but a student can only view them. Which concept is this?',
      options: ['Authentication', 'Accountability', 'Availability', 'Authorisation'], answer: 3,
      why: 'Authorisation decides what an authenticated user is allowed to do.' },
    { q: 'Running each browser tab in isolation so a malicious page cannot read your files is…',
      options: ['Sandboxing', 'Hashing', 'Session management', 'Penetration testing'], answer: 0,
      why: 'Sandboxing confines code so it cannot harm the rest of the system.' },
    { q: 'What is the best defence against SQL injection?',
      options: ['Hiding the database', 'Longer passwords', 'Parameterised queries', 'HTTPS'], answer: 2,
      why: 'Parameterised queries keep user input as data, so it can never run as SQL.' },
    { q: 'Why is a random salt added to each password before it is hashed?',
      options: ['So a forgotten password can be recovered', 'So identical passwords produce different stored hashes', 'So the hash is shorter', 'So HTTPS is not needed'], answer: 1,
      why: 'Different salts stop one pre-computed table cracking many accounts at once. The salt is stored beside the hash and is not secret.' },
    { q: 'A comment box displays a visitor\'s text, and a posted <script> tag runs in other visitors\' browsers. What is the best fix?',
      options: ['Encode the comment for HTML before displaying it', 'Lock accounts after five failed logins', 'Use a longer session ID', 'Add an anti-CSRF token'], answer: 0,
      why: 'This is cross-site scripting. Output encoding makes the browser show the characters as text instead of running them.' },
  ],
  'ssa-3': [
    { q: 'Which is a benefit to an enterprise of secure development practices?',
      options: ['More emergency patches', 'Less documentation', 'No need for testing', 'Greater customer trust and productivity'], answer: 3,
      why: 'Fewer incidents mean less disruption, and customers trust services with a strong record.' },
    { q: 'Collaboration helps secure development mainly because…',
      options: ['Code is written faster without review', 'Different points of view catch different risks', 'Only one person needs to understand the code', 'It removes the need for testing'], answer: 1,
      why: 'Diverse perspectives and delegated expertise improve the quality of the solution.' },
    { q: 'Which law sets rules for handling personal information in Australia?',
      options: ['Copyright Act 1968', 'Spam Act 2003', 'Privacy Act 1988', 'Corporations Act 2001'], answer: 2,
      why: 'The Privacy Act 1988 and its Australian Privacy Principles govern personal information.' },
    { q: 'Under the Notifiable Data Breaches scheme, when must a covered organisation notify the OAIC and affected people?',
      options: ['As soon as practicable once it has reasonable grounds to believe an eligible data breach has occurred', 'Only after the media reports it', 'Only when a regulator asks', 'Never, if the breach seems small'], answer: 0,
      why: 'A suspected breach must be assessed quickly (within 30 days). Once an eligible breach is believed to have occurred, notification follows as soon as practicable.' },
    { q: 'Which Australian law sets security obligations, including cyber incident reporting, for operators of assets such as electricity and water networks?',
      options: ['Copyright Act 1968', 'Security of Critical Infrastructure Act 2018', 'Spam Act 2003', 'Privacy Act 1988'], answer: 1,
      why: 'The Security of Critical Infrastructure Act 2018 covers critical infrastructure assets across sectors such as energy, water, health and communications.' },
  ],
});
