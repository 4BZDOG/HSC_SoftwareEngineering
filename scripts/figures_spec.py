"""Figures for each topic page, in page order (one entry per old diagram block).

Used once by scripts/migrate_figures.py to replace the old diagram blocks.
Each entry: kind, title, lead, notice [..], try, and one of
  mermaid: new Mermaid source (NESA symbols for flowcharts; no emoji)
  keep: True  — reuse the existing Mermaid source, cleaned of emoji and decoration
  nesa: key in js/nesa-diagram-data.js
  html: literal HTML for the canvas
  drop: True  — remove the block (replaced elsewhere or redundant)
"""

# NESA flowchart symbols (Course Specifications p. 14), drawn once as a key.
SYMBOL_KEY = '''<ul class="nesa-key" aria-label="NESA flowchart symbols">
            <li><svg viewBox="0 0 110 52" aria-hidden="true"><rect x="6" y="10" width="98" height="32" rx="16" class="nd-box"/></svg>Terminator</li>
            <li><svg viewBox="0 0 110 52" aria-hidden="true"><rect x="6" y="10" width="98" height="32" class="nd-box"/></svg>Process</li>
            <li><svg viewBox="0 0 110 52" aria-hidden="true"><polygon points="55,4 104,26 55,48 6,26" class="nd-box"/></svg>Decision</li>
            <li><svg viewBox="0 0 110 52" aria-hidden="true"><polygon points="18,10 104,10 92,42 6,42" class="nd-box"/></svg>Input or output</li>
            <li><svg viewBox="0 0 110 52" aria-hidden="true"><rect x="6" y="10" width="98" height="32" class="nd-box"/><line x1="16" y1="10" x2="16" y2="42" class="nd-line"/><line x1="94" y1="10" x2="94" y2="42" class="nd-line"/></svg>Subprogram</li>
          </ul>'''

FIGURES = {
  'programming-fundamentals.html': [
    { 'kind': 'Process diagram', 'title': 'The software development steps',
      'lead': 'The eight steps NESA lists, in order, with maintenance feeding back into new requirements.',
      'mermaid': '''flowchart LR
  A["Requirements<br/>definition"] --> B["Determining<br/>specifications"] --> C["Design"] --> D["Development"]
  D --> E["Integration"] --> F["Testing and<br/>debugging"] --> G["Installation"] --> H["Maintenance"]
  H -. "new needs" .-> A''',
      'notice': ['Each step produces something the next step needs, such as specifications before design.',
                 'The dashed arrow shows that maintenance often uncovers new requirements, so development is a cycle.'],
      'try': 'Pick an app you use. Which step would a bug fix after launch belong to?' },

    { 'kind': 'Flowchart', 'title': 'Sequence: calculate the area of a rectangle',
      'lead': 'Steps run one after another, in the order they are written. There are no decisions and no loops.',
      'mermaid': '''flowchart TD
  S(["BEGIN"]) --> I[/"INPUT length, width"/] --> P["area = length × width"] --> O[/"OUTPUT area"/] --> E(["END"])''',
      'notice': ['Every flowchart starts and ends with a terminator.',
                 'Input and output use the parallelogram; calculations use the process rectangle.'],
      'try': 'Add steps to also calculate and output the perimeter. Where do they go?' },

    { 'kind': 'Flowchart', 'title': 'Binary selection: check a user\'s age',
      'lead': 'A decision chooses one of two paths. This is IF … THEN … ELSE … ENDIF.',
      'mermaid': '''flowchart TD
  S(["BEGIN"]) --> I[/"INPUT age"/] --> D{"age ≥ 18?"}
  D -- "Yes" --> Y[/"OUTPUT 'Welcome'"/]
  D -- "No" --> N[/"OUTPUT 'Too young'"/]
  Y --> E(["END"])
  N --> E''',
      'notice': ['Both arrows leaving the decision are labelled, as NESA requires.',
                 'The two paths join again before END, so exactly one output happens.'],
      'try': 'Write the matching pseudocode using IF … THEN … ELSE … ENDIF.' },

    { 'kind': 'Flowchart', 'title': 'Pre-test repetition: sum a list',
      'lead': 'A WHILE loop tests its condition before each pass, so the body may run zero times.',
      'mermaid': '''flowchart TD
  S(["BEGIN"]) --> A["total = 0<br/>i = 0"] --> D{"i < LEN(list)?"}
  D -- "True" --> B["total = total + list[i]<br/>i = i + 1"] --> D
  D -- "False" --> O[/"OUTPUT total"/] --> E(["END"])''',
      'notice': ['The arrow from the loop body returns to the decision, not to the start.',
                 'total is an accumulator: it keeps its value between passes.'],
      'try': 'Change the flowchart to find the largest value instead of the total.' },

    { 'kind': 'Flowchart', 'title': 'Storing data: average of numbers until −1',
      'lead': 'Variables remember values across the loop, so the program can calculate an average at the end.',
      'mermaid': '''flowchart TD
  S(["BEGIN"]) --> A["total = 0<br/>count = 0"] --> I[/"INPUT number"/] --> D{"number ≠ −1?"}
  D -- "True" --> B["total = total + number<br/>count = count + 1"] --> I2[/"INPUT number"/] --> D
  D -- "False" --> C{"count > 0?"}
  C -- "Yes" --> O[/"OUTPUT total ÷ count"/] --> E(["END"])
  C -- "No" --> O2[/"OUTPUT 'No data'"/] --> E''',
      'notice': ['−1 is a sentinel value: it ends input but is never added to the total.',
                 'Checking count > 0 prevents a division-by-zero runtime error.'],
      'try': 'Desk check it with the inputs 10, 20, 30, −1. Record total and count after each pass.' },

    { 'kind': 'Flowchart', 'title': 'A mainline that calls a subprogram',
      'lead': 'A clear mainline refers to a subroutine by name; the subroutine\'s own flowchart shows the detail.',
      'mermaid': '''flowchart LR
  subgraph Main["Mainline"]
    direction TB
    S(["BEGIN"]) --> R1[["read(name)"]] --> R2[["read(address)"]] --> E(["END"])
  end
  subgraph Sub["Subroutine"]
    direction TB
    B(["BEGIN read(arrayname)"]) --> P["Set pointer to first position"] --> G[/"Get a character"/] --> D{"More data AND<br/>space in array?"}
    D -- "True" --> St["Store character in arrayname<br/>Increment pointer"] --> G2[/"Get next character"/] --> D
    D -- "False" --> X(["END read(arrayname)"])
  end''',
      'notice': ['The subprogram symbol has double lines at each side.',
                 'The same subroutine is called twice with different parameters.',
                 'The subroutine\'s terminators use its name, so it is easy to match to the call.'],
      'try': 'Add a third call that reads a phone number. Does the subroutine need to change?',
      'before': ('Flowchart symbols', 'The five symbols in the NESA course specifications. Use only these, joined by arrows.', SYMBOL_KEY) },

    { 'kind': 'Structure chart', 'title': 'Structure chart: an ATM system',
      'lead': 'The system broken into modules, with the data and flags passed between them.',
      'nesa': 'atm-structure',
      'notice': ['An open circle on an arrow is data (a parameter); a filled circle is a flag.',
                 'The curved arrow shows the main module repeats until the card is removed.',
                 'The diamond shows only one of Withdraw, Deposit or Check balance runs each time.'],
      'try': 'Add a Print receipt module that runs only if the customer asks. Which symbol shows that?' },

    { 'drop': True },   # paradigms comparison: covered by the section's table and code

    { 'kind': 'Table', 'title': 'Data dictionary: a student management system',
      'lead': 'Every field is described before any code is written.',
      'keephtml': True,
      'notice': ['Each row gives the field\'s name, data type, size, purpose and validation rules.',
                 'Validation rules become the checks your code performs on input.'],
      'try': 'Write a data dictionary for a library book: ISBN, title, author, copies available and last borrowed date.' },
  ],

  'object-oriented-paradigm.html': [
    { 'kind': 'Concept diagram', 'title': 'Encapsulation: what outside code can reach',
      'lead': 'Outside code uses the public methods; the private data can only change through them.',
      'mermaid': '''flowchart LR
  X["Outside code"] -- "calls" --> M["Public methods<br/>deposit()  withdraw()  get_balance()"]
  X -. "cannot access" .-> P["Private data<br/>__balance  __pin"]
  M -- "validates, then updates" --> P''',
      'notice': ['The only route to the private data is through methods that can check the request.',
                 'This is why a bank account can never be given a negative balance by mistake.'],
      'try': 'What would go wrong if __balance were public?' },

    { 'kind': 'Class diagram', 'title': 'Class diagram: a vehicle hierarchy',
      'lead': 'Car, Motorcycle and Truck inherit from Vehicle and add their own attributes and methods.',
      'mermaid': '''classDiagram
  direction TB
  class Vehicle {
    manufacturer: string
    speed: float
    start()
    stop()
  }
  class Car {
    numDoors: int
    openBoot()
  }
  class Motorcycle {
    hasSidecar: boolean
  }
  class Truck {
    cargoCapacity: float
    loadCargo(amount)
  }
  class Engine {
    engineType: string
    calculatePower()
  }
  Vehicle <|-- Car
  Vehicle <|-- Motorcycle
  Vehicle <|-- Truck
  Vehicle "1" --> "1" Engine : has''',
      'notice': ['Each class box has three parts: name, attributes, methods.',
                 'The hollow triangle points to the parent class (inheritance).',
                 'The plain arrow with 1 and 1 is a relationship: each vehicle has exactly one engine.'],
      'try': 'Add an ElectricCar class. Which class should it inherit from, and what attribute would it add?' },

    { 'kind': 'Concept diagram', 'title': 'Procedural and object-oriented code',
      'lead': 'The same goals, organised differently.',
      'keep': True,
      'notice': ['Procedural code keeps data separate from the functions that change it.',
                 'OOP keeps each object\'s data with its own methods.'],
      'try': 'Would you use procedural or OOP for a one-off script that renames files? Why?' },

    { 'kind': 'Structure chart', 'title': 'Structure chart: student management',
      'lead': 'The modules of the system and what they pass to each other.',
      'nesa': 'student-structure',
      'notice': ['The diamond means only one of the three main tasks runs each time.',
                 'Enrol student sends Details down and gets a Valid flag back.'],
      'try': 'Draw the structure chart for Produce report, refining it into smaller modules.',
      'after': ('Data flow diagram', 'Data flow diagram: canteen ordering (Level 1)',
                'How data moves between people, processes and stored data.', 'canteen-dfd',
                ['Processes are circles, data stores are open-ended rectangles, and external entities are rectangles.',
                 'Every arrow is labelled with the data it carries.'],
                'Add a process 3 Take payment. Which entity and data store would it connect to?') },

    { 'kind': 'Sequence diagram', 'title': 'Objects passing messages',
      'lead': 'The client asks the account to withdraw; the account checks with a validator and replies.',
      'keep': True,
      'notice': ['Each arrow is a message: one object calling another object\'s method.',
                 'The client never sees how the balance is checked, only the result.'],
      'try': 'Add a message that records the withdrawal in a TransactionLog object.' },

    { 'kind': 'Class diagram', 'title': 'Class diagram: a library system',
      'lead': 'The classes of a library system and how they relate.',
      'keep': True,
      'notice': ['Multiplicities such as 1 and 0..* show how many objects take part in a relationship.',
                 'Inheritance arrows point from the child class to the parent class.'],
      'try': 'Add a Loan class between Member and Book. What multiplicities would it have?' },
  ],

  'programming-mechatronics.html': [
    { 'kind': 'System diagram', 'title': 'Inside a mechatronic system',
      'lead': 'Sensors feed the microcontroller, the control algorithm decides, and actuators act. Power reaches every part.',
      'keep': True,
      'notice': ['Data flows in one direction: sense, decide, act.',
                 'Different parts need different voltages, so the power system matters as much as the code.'],
      'try': 'Redraw this for a 3D printer. Which sensors and actuators does it need?' },

    { 'kind': 'Block diagram', 'title': 'Open loop and closed loop control',
      'lead': 'A closed loop adds a sensor so the controller can compare what is happening with what it wants.',
      'mermaid': '''flowchart LR
  subgraph Open["Open loop"]
    direction LR
    O1["Setpoint"] --> O2["Controller"] --> O3["Actuator"] --> O4["Output"]
  end
  subgraph Closed["Closed loop"]
    direction LR
    C1["Setpoint"] --> C2["Compare"] --> C3["Controller"] --> C4["Actuator"] --> C5["Output"]
    C5 --> C6["Sensor"] -- "feedback" --> C2
  end''',
      'notice': ['Only the closed loop measures its output.',
                 'Compare works out the error: setpoint minus the measured value.'],
      'try': 'A greenhouse vent opens at 26 °C. Label each block of the closed loop for it.' },

    { 'kind': 'State diagram', 'title': 'A traffic light as a finite state machine',
      'lead': 'The system is always in exactly one state, and events move it to the next.',
      'keep': True,
      'notice': ['Timers trigger the normal cycle; an emergency signal can interrupt any state.',
                 'Autonomous control code often follows a state machine like this.'],
      'try': 'Add a Pedestrian crossing state. Which state should it follow, and what ends it?' },
  ],

  'secure-software-architecture.html': [
    { 'kind': 'Process diagram', 'title': 'Security checks through the development steps',
      'lead': 'A security gate follows each step, and work goes back when a gate fails.',
      'keep': True,
      'notice': ['Security is checked at every step, not only in final testing.',
                 'Fixing a problem at a gate is much cheaper than after release.'],
      'try': 'Which gate would most likely catch an SQL injection flaw, and why?' },

    { 'kind': 'Concept map', 'title': 'Threats and the controls that answer them',
      'lead': 'Each common attack targets one security concept, and each has a matching control.',
      'keep': True,
      'notice': ['Read across: attack → concept at risk → control.',
                 'One control, such as MFA, can protect more than one concept.'],
      'try': 'Where would a phishing attack fit, and what control reduces it?' },

    { 'kind': 'Concept diagram', 'title': 'Symmetric and asymmetric encryption',
      'lead': 'Symmetric encryption uses one shared key; asymmetric uses a public and private key pair. HTTPS uses both.',
      'keep': True,
      'notice': ['Symmetric is fast but the key must be shared safely.',
                 'Asymmetric solves key sharing, so HTTPS uses it to exchange a symmetric session key.'],
      'try': 'Why not use asymmetric encryption for the whole HTTPS session?' },

    { 'kind': 'Comparison', 'title': 'Comparing security testing strategies',
      'lead': 'Each strategy finds different problems at a different cost, so teams layer them.',
      'keep': True,
      'notice': ['SAST and code review work on code before release; DAST and penetration testing attack a running system.',
                 'No single strategy finds everything.'],
      'try': 'A small team has a week before launch. Which two strategies would you choose, and why?' },

    { 'kind': 'Flowchart', 'title': 'Defensive handling of a request',
      'lead': 'Every request is checked in order and rejected at the first check it fails.',
      'mermaid': '''flowchart TD
  S(["BEGIN handleRequest"]) --> I[/"INPUT request"/] --> A{"Sent over HTTPS?"}
  A -- "No" --> R1[/"OUTPUT reject"/] --> E(["END handleRequest"])
  A -- "Yes" --> B{"Valid token?"}
  B -- "No" --> R2[/"OUTPUT 401 Unauthorised"/] --> E
  B -- "Yes" --> C{"Input valid?"}
  C -- "No" --> R3[/"OUTPUT 400 Bad request"/] --> E
  C -- "Yes" --> D[["sanitise(input)"]] --> Q[["runParameterisedQuery(input)"]] --> O[/"OUTPUT response"/] --> E''',
      'notice': ['Checks run from cheapest to most expensive, so bad requests are rejected early.',
                 'Sanitising and parameterised queries are subprograms, detailed in their own algorithms.'],
      'try': 'Add a rate-limit check. Where in the sequence should it go?' },
  ],

  'programming-for-the-web.html': [
    { 'kind': 'Sequence diagram', 'title': 'How DNS finds an IP address',
      'lead': 'The browser asks a resolver, which asks the root, TLD and authoritative servers in turn.',
      'keep': True,
      'notice': ['A cached answer skips every step after the first.',
                 'Each server only knows where to ask next, until the authoritative server gives the address.'],
      'try': 'Why does a changed website address sometimes take hours to work everywhere?' },
    { 'kind': 'Sequence diagram', 'title': 'An HTTP request and response',
      'lead': 'A GET request fetches a page; a POST request sends form data and is redirected.',
      'keep': True,
      'notice': ['The server talks to the database; the browser never does.',
                 'After a POST, a redirect stops the form being resubmitted on refresh.'],
      'try': 'Open your browser\'s Network tab and find a GET and a POST request on a real site.' },
    { 'kind': 'Sequence diagram', 'title': 'Logging in with a JSON Web Token',
      'lead': 'The server checks the password once, then trusts the signed token on later requests.',
      'keep': True,
      'notice': ['The password is compared with a stored hash, never stored as plain text.',
                 'Later requests are verified by the token\'s signature without a database lookup.'],
      'try': 'What should happen when the token expires?' },
    { 'kind': 'Data flow diagram', 'title': 'Data flow diagram: a web application',
      'lead': 'How data moves between the user, the server-side processes and the database.',
      'nesa': 'web-dfd',
      'notice': ['The user is an external entity; the database is a data store.',
                 'Processes are numbered so they can be refined into lower-level DFDs.'],
      'try': 'Add a process for logging in. Which data store would it read?' },
    { 'kind': 'Architecture diagram', 'title': 'Traditional and headless CMS',
      'lead': 'A traditional CMS joins content and presentation; a headless CMS serves content to any front end through an API.',
      'keep': True,
      'notice': ['Headless separates where content is stored from where it is shown.',
                 'One headless back end can serve a website, an app and other devices.'],
      'try': 'A school wants its news on the website and in an app. Which CMS type suits it?' },
    { 'kind': 'Sequence diagram', 'title': 'The back-end process for one web request',
      'lead': 'One request passes through DNS, the web server, the framework, a handler and the database.',
      'keep': True,
      'notice': ['The framework\'s router decides which handler runs.',
                 'Queries are parameterised before they reach the database.'],
      'try': 'Where could caching skip the database for popular pages?' },
    { 'kind': 'Flowchart', 'title': 'A service worker serving cached files',
      'lead': 'A cache-first strategy answers from the cache and only uses the network when it must.',
      'mermaid': '''flowchart TD
  S(["BEGIN handleFetch"]) --> I[/"INPUT request"/] --> A{"In cache?"}
  A -- "Yes" --> C[/"OUTPUT cached response"/] --> E(["END handleFetch"])
  A -- "No" --> B{"Online?"}
  B -- "Yes" --> N["Fetch from network<br/>Save a copy in the cache"] --> O[/"OUTPUT network response"/] --> E
  B -- "No" --> F[/"OUTPUT offline page"/] --> E''',
      'notice': ['Cached files load instantly and work offline.',
                 'The offline page means the app never shows a blank error.'],
      'try': 'News headlines change often. Would cache-first suit them? What would you change?' },
  ],

  'software-automation.html': [
    { 'kind': 'Concept diagram', 'title': 'AI, machine learning and deep learning',
      'lead': 'Each field sits inside the one before it.',
      'keep': True,
      'notice': ['All ML is AI, but not all AI learns from data.',
                 'Deep learning is ML that uses neural networks with many layers.'],
      'try': 'Is a chess program that follows fixed rules AI, ML or both?' },
    { 'kind': 'Decision tree', 'title': 'Choosing a training model',
      'lead': 'The data you have decides the model.',
      'mermaid': '''flowchart TD
  A["Learning from rewards<br/>and penalties?"] -- "Yes" --> R["Reinforcement learning"]
  A -- "No" --> B["Is the data labelled?"]
  B -- "All" --> S["Supervised learning"]
  B -- "Some" --> M["Semi-supervised learning"]
  B -- "None" --> U["Unsupervised learning"]''',
      'notice': ['Each branch is labelled with the answer that leads to it.',
                 'Every path ends in an action, here a training model.'],
      'try': 'A robot learns to walk by trying moves and being scored. Follow the tree.' },
    { 'kind': 'Decision tree', 'title': 'Decision tree: is this email spam?',
      'lead': 'Each question splits the emails until every path reaches a decision.',
      'mermaid': '''flowchart TD
  A["Sender known?"] -- "Yes" --> B["Inbox"]
  A -- "No" --> C["Contains a link?"]
  C -- "No" --> D["Inbox"]
  C -- "Yes" --> E["Link domain trusted?"]
  E -- "Yes" --> F["Inbox"]
  E -- "No" --> G["Spam"]''',
      'notice': ['A trained decision tree learns which questions split the data best.',
                 'Following one path explains exactly why an email was classified.'],
      'try': 'Add a question about ALL-CAPS subject lines. Where would it go?' },
    { 'kind': 'System diagram', 'title': 'A neural network\'s layers',
      'lead': 'Inputs pass through weighted connections in hidden layers to produce an output.',
      'keep': True,
      'notice': ['Every connection has a weight that training adjusts.',
                 'More hidden layers let the network learn more complex patterns.'],
      'try': 'A network predicts house prices from 4 features. How many input and output nodes does it need?' },
    { 'kind': 'Cycle diagram', 'title': 'How bias reinforces itself',
      'lead': 'Biased decisions create biased data, which trains an even more biased model.',
      'keep': True,
      'notice': ['The loop continues until people audit the data and the results.'],
      'try': 'Where in the loop could an engineer break it?' },
  ],

  'software-engineering-project.html': [
    { 'kind': 'Structure chart', 'title': 'Structure chart: a school library system',
      'lead': 'The library system refined into modules, based on the example in the NESA course specifications.',
      'nesa': 'library-structure',
      'notice': ['Two curved arrows: the system repeats until the library closes, and Process books repeats for each book.',
                 'Filled circles are flags, such as Overdue; open circles are data, such as Student ID.'],
      'try': 'Refine Check book into its own structure chart, using the same module name at the top.' },
    { 'kind': 'Process diagram', 'title': 'An Agile sprint cycle',
      'lead': 'How a team turns a backlog into working software, one sprint at a time.',
      'keep': True,
      'notice': ['The client sees working software at every review.',
                 'The retrospective improves the process for the next sprint.'],
      'try': 'At which point in the cycle can the client change priorities?' },
    { 'kind': 'Timeline', 'title': 'WAgile: planned gates around Agile sprints',
      'lead': 'Waterfall-style gates at the start and end, with iterative sprints between them.',
      'keep': True,
      'notice': ['The gates are the planned interventions; the sprints are where the software is built.'],
      'try': 'Which gate would a government client insist on, and why?' },
    { 'kind': 'Gantt chart', 'title': 'Gantt chart: a ten-week project',
      'lead': 'Tasks on a timeline, with dependencies and milestones.',
      'mermaid': '''gantt
  title Library booking app
  dateFormat YYYY-MM-DD
  axisFormat %d %b
  section Identify and define
  Requirements          :req, 2026-02-02, 7d
  Feasibility           :fea, after req, 4d
  Specifications signed off :milestone, m1, after fea, 0d
  section Research and plan
  Design and modelling  :des, after fea, 10d
  section Produce
  Sprint 1 bookings     :s1, after des, 10d
  Sprint 2 accounts     :s2, after s1, 10d
  section Test and evaluate
  Testing               :tst, after s2, 7d
  Client evaluation     :milestone, m2, after tst, 0d''',
      'notice': ['Each task starts after the task it depends on.',
                 'Diamonds mark milestones, such as specifications being signed off.'],
      'try': 'Sprint 1 runs three days late. Which later tasks move?' },
    { 'kind': 'Data flow diagram', 'title': 'Data flow diagram: a library system (Level 0)',
      'lead': 'The whole system as one process, with the external entities that send and receive data.',
      'nesa': 'library-dfd-level0',
      'notice': ['A Level 0 diagram shows no data stores and no internal processes.',
                 'Every arrow is labelled with the data it carries.'],
      'try': 'Refine the Library system process into a Level 1 DFD with three processes and a Loans data store.' },
    { 'kind': 'Flowchart', 'title': 'A systematic debugging process',
      'lead': 'Reproduce, isolate, test a hypothesis, fix, then retest everything.',
      'mermaid': '''flowchart TD
  S(["BEGIN debug"]) --> R["Reproduce the bug with a small test case"] --> A{"Reproduces every time?"}
  A -- "No" --> L["Add debugging output statements"] --> R
  A -- "Yes" --> I["Isolate the module that fails"] --> H["Form a hypothesis about the cause"] --> T["Test it with breakpoints and watches"] --> B{"Hypothesis correct?"}
  B -- "No" --> H
  B -- "Yes" --> F["Fix the code"] --> C{"All tests pass?"}
  C -- "No" --> H
  C -- "Yes" --> E(["END debug"])''',
      'notice': ['Every loop returns to a step that gathers more evidence, not to a random change.',
                 'Rerunning all tests checks the fix didn\'t break something else.'],
      'try': 'Which debugging tools from Year 11 fit the Test it step?' },
  ],

  'course-tools.html': [
    { 'kind': 'System diagram', 'title': 'A neural network',
      'lead': 'Inputs, hidden layers and an output, joined by weighted connections.',
      'keep': True,
      'notice': ['Training adjusts the weight on every connection.'],
      'try': 'Count the connections between the first two layers.' },
  ],
}
