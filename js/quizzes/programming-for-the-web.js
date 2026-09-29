/* ============================================================
   "Check your understanding" question bank for Programming for the Web (data only).
   One quiz per NESA subheading, keyed "web-<part number>".
   Each question: q, options[4], answer (index), why (explanation).
   Rendered by js/quiz.js into <div class="quiz" data-quiz="…">.
   ============================================================ */
window.HSC_QUIZZES = Object.assign(window.HSC_QUIZZES || {}, {
  'web-1': [
    { q: 'Which protocol and port does HTTPS normally use?',
      options: ['HTTP on 80', 'TLS-secured HTTP on 443', 'FTP on 21', 'SMTP on 25'], answer: 1,
      why: 'HTTPS is HTTP over TLS, usually on port 443.' },
    { q: 'What does DNS do?',
      options: ['Encrypts web traffic', 'Translates domain names into IP addresses', 'Stores cookies', 'Compresses images'], answer: 1,
      why: 'DNS is the internet\'s "phone book", finding the IP address for a name.' },
    { q: 'A photo\'s camera model and GPS location are examples of…',
      options: ['Metadata', 'Cipher text', 'Packets', 'Cookies'], answer: 0,
      why: 'Metadata is data that describes other data.' },
  ],
  'web-2': [
    { q: 'Why must prices be checked on the server, not only in the browser?',
      options: ['Servers are faster', 'Users can change browser code with developer tools', 'Browsers cannot do maths', 'It saves bandwidth'], answer: 1,
      why: 'Client-side code can be bypassed, so the back end must enforce business rules.' },
    { q: 'Which SQL keyword combines rows from two related tables?',
      options: ['WHERE', 'GROUP BY', 'JOIN', 'ORDER BY'], answer: 2,
      why: 'A JOIN links tables using a shared key, such as student_id.' },
    { q: 'Which feature lets a PWA work offline?',
      options: ['A service worker', 'A CSS framework', 'A template engine', 'An SQL constraint'], answer: 0,
      why: 'Service workers cache files so the app still opens without a connection.' },
  ],
});
