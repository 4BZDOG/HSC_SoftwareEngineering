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
    { q: 'A page arrives in three packets. Packets 1 and 3 reach the browser but packet 2 does not. What lets TCP notice the gap?',
      options: ['The destination IP address in each header', 'The port number 443', 'The sequence numbers', 'The domain name'], answer: 2,
      why: 'TCP numbers the data it sends. When the next expected number is missing, the receiver keeps what it has and the sender retransmits the lost packet. The IP address and port only say where the packet is going.' },
    { q: 'A logged-in student opens /admin/marks and the server replies 403 Forbidden. Which statement is correct?',
      options: ['Authentication failed because the password was wrong', 'The certificate has expired', 'The server cannot find the page', 'The student is authenticated but is not authorised for that page'], answer: 3,
      why: 'A 401 response means the user has not proved who they are (authentication). A 403 means the server knows who they are but their role does not allow the action (authorisation).' },
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
    { q: 'A paragraph is written <p id="welcome" class="red-text">. The style sheet has #welcome { color: green; } and, later, p.red-text { color: blue; }. What colour is the text?',
      options: ['Blue, because it appears later in the style sheet', 'Blue, because it names both an element and a class', 'Red, because .red-text is a class', 'Green, because an ID selector outranks a class plus an element'], answer: 3,
      why: 'Specificity is compared before order. #welcome is (1, 0, 0) and p.red-text is (0, 1, 1); the ID column is compared first, so green wins.' },
    { q: 'Using the tables Games(ID, Name, Cost, Publisher_ID) and Publishers(Publisher_ID, Name), which query shows how many games each publisher has?',
      options: ['SELECT Publishers.Name, COUNT(Games.ID) FROM Games, Publishers GROUP BY Publishers.Publisher_ID',
                'SELECT Publishers.Name, Games.Name FROM Games, Publishers GROUP BY Games.Name',
                'SELECT Publishers.Name, COUNT(Games.ID) FROM Games, Publishers WHERE Publishers.Publisher_ID = Games.Publisher_ID GROUP BY Publishers.Publisher_ID',
                'SELECT Publishers.Name, COUNT(Games.ID) FROM Games, Publishers WHERE Publishers.Publisher_ID = Games.Publisher_ID ORDER BY Publishers.Name'], answer: 2,
      why: 'The WHERE line matches each foreign key to its primary key, and GROUP BY gives one row per publisher with COUNT. Without the join condition every game is paired with every publisher; without GROUP BY, COUNT gives one total.' },
  ],
});
