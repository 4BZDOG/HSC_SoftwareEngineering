/* The Object-Oriented Paradigm: method lookup explorer.
   Shows how Python finds the method that runs when a message is sent to an object:
   it searches the object's own class first, then each parent in turn.
   Vanilla JS; the widget host contains a text fallback if this file does not run. */
(() => {
  'use strict';

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  /* The Riverbend Library classes, with what each method does. */
  const CLASSES = {
    LibraryItem: {
      parent: null,
      methods: {
        check_out: { code: 'if self._on_loan: return False; self._on_loan = True; return True', run: () => 'True' },
        loan_days: { abstract: true },
        describe: { code: 'status = "available" or "on loan"; return f"{title} [{status}]"', run: o => `${o.title} [available]` }
      }
    },
    Book: {
      parent: 'LibraryItem',
      methods: {
        loan_days: { code: 'return 14', run: () => '14' },
        describe: { code: 'return f"{super().describe()} by {author}"', usesSuper: true, run: (o, sup) => `${sup()} by ${o.author}` }
      }
    },
    ReferenceBook: {
      parent: 'Book',
      methods: {
        check_out: { code: 'return False', run: () => 'False' }
      }
    },
    DVD: {
      parent: 'LibraryItem',
      methods: {
        loan_days: { code: 'return 7', run: () => '7' },
        describe: { code: 'return f"{super().describe()}, {minutes} min"', usesSuper: true, run: (o, sup) => `${sup()}, ${o.minutes} min` }
      }
    }
  };
  const TREE = { name: 'LibraryItem', kids: [{ name: 'Book', kids: [{ name: 'ReferenceBook', kids: [] }] }, { name: 'DVD', kids: [] }] };
  const OBJECTS = [
    { id: 'book', cls: 'Book', varName: 'book', title: 'River Road', author: 'A. Nguyen', label: 'Book' },
    { id: 'ref', cls: 'ReferenceBook', varName: 'atlas', title: 'Atlas of Australia', author: 'P. Smith', label: 'ReferenceBook' },
    { id: 'dvd', cls: 'DVD', varName: 'dvd', title: 'Star Coast', minutes: 95, label: 'DVD' }
  ];
  const MESSAGES = ['describe', 'loan_days', 'check_out'];
  const chainOf = name => { const c = []; for (let n = name; n; n = CLASSES[n].parent) c.push(n); return c; };

  function build(host) {
    const state = { obj: OBJECTS[1], msg: 'describe', off: new Set() };
    host.replaceChildren();
    host.append(el('h4', null, 'Method lookup explorer'));
    host.append(el('p', 'oop-lead', 'Pick an object and a message. The tree shows the search Python makes: dashed classes were checked and had no matching method, and green classes are the ones whose code runs (two, when a method calls super()). Then switch an override off and send the message again.'));

    const grid = el('div', 'oop-grid');
    const left = el('div');
    const right = el('div');

    /* controls */
    const radio = (name, legend, items, get, set) => {
      const fs = el('fieldset');
      fs.append(el('legend', null, legend));
      const row = el('div', 'oop-choices');
      items.forEach(it => {
        const lab = el('label', 'oop-choice');
        const inp = el('input'); inp.type = 'radio'; inp.name = name + '-' + uid; inp.value = it.value;
        inp.checked = get() === it.value;
        inp.addEventListener('change', () => { set(it.value); render(); });
        lab.append(inp, el('span', null, it.text));
        row.append(lab);
      });
      fs.append(row);
      return fs;
    };
    const uid = Math.random().toString(36).slice(2, 7);
    left.append(radio('obj', 'The object receiving the message', OBJECTS.map(o => ({ value: o.id, text: `${o.varName} = ${o.cls}(…)` })), () => state.obj.id, v => { state.obj = OBJECTS.find(o => o.id === v); }));
    left.append(radio('msg', 'The message sent', MESSAGES.map(m => ({ value: m, text: `.${m}()` })), () => state.msg, v => { state.msg = v; }));

    const fsOff = el('fieldset');
    fsOff.append(el('legend', null, 'Overrides that exist (untick to remove one)'));
    const checks = el('div', 'oop-checks');
    const boxes = {};
    Object.keys(CLASSES).forEach(cn => {
      Object.keys(CLASSES[cn].methods).forEach(mn => {
        if (CLASSES[cn].parent === null) return;              // the base class always keeps its methods
        const key = cn + '.' + mn;
        const lab = el('label', 'oop-check');
        const inp = el('input'); inp.type = 'checkbox'; inp.checked = true;
        inp.addEventListener('change', () => { inp.checked ? state.off.delete(key) : state.off.add(key); render(); });
        boxes[key] = inp;
        lab.append(inp, document.createTextNode(key + '()'));
        checks.append(lab);
      });
    });
    fsOff.append(checks);
    left.append(fsOff);

    /* class tree */
    const treeBox = el('div', 'oop-tree');
    const cards = {};
    const draw = (node, parent) => {
      const c = el('div', 'oop-class');
      const head = el('div', 'oop-cname');
      head.append(el('span', null, node.name));
      const badge = el('span', 'oop-badge');
      head.append(badge);
      const meth = el('div', 'oop-meth');
      c.append(head, meth);
      cards[node.name] = { c, badge, meth };
      parent.append(c);
      if (node.kids.length) {
        const kids = el('div', 'oop-kids');
        node.kids.forEach(k => draw(k, kids));
        parent.append(kids);
      }
    };
    draw(TREE, treeBox);
    left.append(treeBox);

    /* output */
    const out = el('div');
    out.setAttribute('aria-live', 'polite');
    const call = el('div', 'oop-call');
    const stepsHead = el('p'); stepsHead.append(el('strong', null, 'What Python does'));
    const steps = el('ol', 'oop-steps');
    const result = el('div', 'oop-result');
    const note = el('p', 'oop-note');
    out.append(call, stepsHead, steps, result, note);
    right.append(out);

    grid.append(left, right);
    host.append(grid);

    const isOff = (cn, mn) => state.off.has(cn + '.' + mn);
    const hasImpl = (cn, mn) => CLASSES[cn].methods[mn] && !isOff(cn, mn);

    function findImpl(start, mn) {
      for (let n = start; n; n = CLASSES[n].parent) if (hasImpl(n, mn)) return n;
      return null;
    }

    function render() {
      const o = state.obj, mn = state.msg;
      const visited = {};   // class name -> { state, order }
      const stepList = [];
      let order = 0;

      // Abstract check: an object cannot exist unless loan_days is implemented in its chain.
      const ld = findImpl(o.cls, 'loan_days');
      const abstractFail = ld && CLASSES[ld].methods.loan_days.abstract;

      call.textContent = `${o.varName}.${mn}()`;
      steps.replaceChildren();
      Object.values(cards).forEach(k => { k.c.dataset.state = ''; k.badge.textContent = ''; });
      result.classList.remove('is-error');

      if (abstractFail) {
        const li = el('li');
        li.append(document.createTextNode('Before any message can be sent, Python must create the object. '));
        li.append(el('code', null, `${o.cls}`), document.createTextNode(` does not implement the abstract method loan_days(), so it is still abstract.`));
        steps.append(li);
        chainOf(o.cls).forEach(n => { cards[n].c.dataset.state = n === ld ? 'err' : 'miss'; });
        result.classList.add('is-error');
        result.replaceChildren(el('code', null, `TypeError: Can't instantiate abstract class ${o.cls} without an implementation for abstract method 'loan_days'`));
        note.textContent = 'Abstraction at work: an abstract method is a promise that every real subclass must keep.';
        refreshMethodLists();
        return;
      }

      // Walk the chain and record the trace.
      function send(start, superCall) {
        let n = start;
        while (n) {
          if (hasImpl(n, mn)) {
            const impl = CLASSES[n].methods[mn];
            order += 1;
            visited[n] = { st: 'hit', order };
            const li = el('li');
            li.append(document.createTextNode(`Found `), el('code', null, `${n}.${mn}()`), document.createTextNode(superCall ? ' (reached through super()). ' : '. '), el('code', null, impl.code));
            stepList.push(li);
            const val = impl.run(o, () => {
              const li2 = el('li');
              li2.append(document.createTextNode('That method calls '), el('code', null, `super().${mn}()`), document.createTextNode(` , so the same message is sent again, starting at ${CLASSES[n].parent}.`));
              stepList.push(li2);
              return send(CLASSES[n].parent, true);
            });
            return val;
          }
          order += 1;
          if (!visited[n]) visited[n] = { st: 'miss', order };
          const li = el('li');
          li.append(document.createTextNode('Look in '), el('code', null, n), document.createTextNode(`: no ${mn}() here${isOff(n, mn) ? ' (override removed)' : ''}, so go up to the parent.`));
          stepList.push(li);
          n = CLASSES[n].parent;
        }
        return null;
      }
      const val = send(o.cls, false);
      stepList.forEach(li => steps.append(li));
      Object.keys(visited).forEach(n => { cards[n].c.dataset.state = visited[n].st; cards[n].badge.textContent = String(visited[n].order); });

      const shown = mn === 'describe' ? `"${val}"` : val;
      result.replaceChildren(document.createTextNode('Returned: '), el('code', null, String(shown)));
      const hitCls = Object.keys(visited).find(n => visited[n].st === 'hit');
      note.textContent = state.off.size === 0
        ? 'Every override is switched on: the object answers in the way its own class defines. That is polymorphism.'
        : 'With an override removed, the message falls through to the parent, so the object answers as its parent would.';
      if (hitCls && hitCls !== o.cls && state.off.size === 0) note.textContent = `${o.cls} has no ${mn}() of its own, so it inherits the one from ${hitCls}.`;
      refreshMethodLists();
    }

    function refreshMethodLists() {
      Object.keys(cards).forEach(cn => {
        const ms = Object.keys(CLASSES[cn].methods);
        cards[cn].meth.replaceChildren();
        ms.forEach((m, i) => {
          const off = isOff(cn, m);
          const span = off ? el('s', null, m + '()') : el('span', null, m + '()' + (CLASSES[cn].methods[m].abstract ? ' abstract' : ''));
          cards[cn].meth.append(span);
          if (i < ms.length - 1) cards[cn].meth.append(document.createTextNode('  '));
        });
      });
    }

    render();
  }

  document.querySelectorAll('.oop-widget[data-oop="resolve"]').forEach(host => {
    try { build(host); } catch (e) { /* leave the static fallback in place */ }
  });
})();

/* The Object-Oriented Paradigm: labs built on the shared kit (css/labs.css, js/labs.js).
   1. Objects and encapsulation: members of the library, a rule enforced inside the class, and what happens when outside code ignores it.
   2. Practice sets: which feature of OOP, and which kind of testing.
   The classes mirror the Member example in the notes. */
(() => {
  'use strict';
  const el = Labs.el;
  const code = text => () => el('pre', 'lab-code oop-snip', text);

  /* ---------- 1. Objects and encapsulation ---------- */
  const TITLES = ['Atlas of Australia', 'Dune', 'Emma', 'Holes', 'Maus', 'The Hobbit'];
  function buildObjects(host) {
    Labs.shell(host, 'oop-objects', 'Objects and encapsulation: the Member class', 'A class is a blueprint; each object made from it has its own data. The Member class keeps its list of loans private and lets only borrow() and give_back() change it, because borrow() checks the three-book limit. Try the allowed way, then reach in and break the rule.');
    const state = { max: 3, members: [{ n: 'ava', name: 'Ava', loans: [] }, { n: 'ben', name: 'Ben', loans: [] }], sel: 0, log: [] };
    const classBox = el('div', 'lab-panel oop-class'); classBox.append(el('h5', null, 'class Member'));
    const classBody = el('div'); classBox.append(classBody);
    const split = el('div', 'lab-split'); const left = el('div', 'lab-stack'); const right = el('div', 'lab-stack'); split.append(left, right);
    left.append(classBox);
    const cards = el('div', 'oop-cards'); left.append(cards);
    const row = el('div', 'lab-row');
    const f1 = el('div', 'lab-field'), l1 = el('label', null, 'Send a message to'), s1 = el('select'); l1.htmlFor = s1.id = 'oop-ob-who'; f1.append(l1, s1);
    const f2 = el('div', 'lab-field'), l2 = el('label', null, 'Book'), s2 = el('select'); l2.htmlFor = s2.id = 'oop-ob-book'; TITLES.forEach(t => { const o = el('option', null, t); o.value = t; s2.append(o); }); f2.append(l2, s2);
    row.append(f1, f2); right.append(row);
    const acts = el('div', 'lab-actions oop-acts');
    const mk = (txt, cls) => { const b = el('button', 'lab-btn' + (cls ? ' ' + cls : ''), txt); b.type = 'button'; acts.append(b); return b; };
    const bBorrow = mk('borrow(title)', 'lab-btn--primary'), bBack = mk('give_back(title)'), bCount = mk('loan_count'), bBypass = mk('Reach inside: _Member__loans.append(…)'), bMax = mk('Change Member.MAX_LOANS to 2'), bNew = mk('Make another Member'), bRst = mk('Start again', 'lab-btn--quiet');
    right.append(acts);
    const logBox = el('div', 'lab-readout oop-log'); logBox.setAttribute('role', 'status'); right.append(logBox);
    host.append(split);
    host.append(el('p', 'lab-note', 'Python has no true private keyword. A double underscore (__loans) makes Python rename the attribute to _Member__loans, which discourages access but does not prevent it. Good design relies on the class\'s interface: outside code that bypasses the methods can break the rules the class was written to protect.'));

    const who = () => state.members[state.sel];
    function say(lines, kind) { logBox.className = 'lab-readout ' + (kind || ''); logBox.replaceChildren(); lines.forEach((t, i) => logBox.append(el(i === 0 ? 'pre' : 'p', i === 0 ? 'lab-code oop-call' : null, t))); }
    function draw() {
      classBody.replaceChildren();
      classBody.append(el('p', 'lab-mono oop-attr', 'MAX_LOANS = ' + state.max + '    # class attribute, shared by every Member'));
      classBody.append(el('p', 'lab-mono oop-attr', 'name, email, __loans    # instance attributes: each object has its own'));
      classBody.append(el('p', 'lab-mono oop-attr', 'borrow(title)  give_back(title)  loan_count'));
      cards.replaceChildren(); s1.replaceChildren();
      state.members.forEach((m, i) => {
        const c = el('button', 'oop-card' + (i === state.sel ? ' is-sel' : '')); c.type = 'button'; c.addEventListener('click', () => { state.sel = i; draw(); });
        c.append(el('b', null, m.n + ' = Member("' + m.name + '")'));
        const ul = el('ul'); m.loans.forEach(t => ul.append(el('li', null, t))); if (!m.loans.length) ul.append(el('li', 'oop-none', 'no loans'));
        c.append(el('span', 'oop-count' + (m.loans.length > state.max ? ' is-bad' : ''), m.loans.length + ' / ' + state.max + ' loans'), ul); cards.append(c);
        const o = el('option', null, m.n); o.value = i; s1.append(o);
      });
      s1.value = state.sel;
    }
    s1.addEventListener('change', () => { state.sel = +s1.value; draw(); });
    bBorrow.addEventListener('click', () => {
      const m = who(), t = s2.value, call = m.n + '.borrow("' + t + '")';
      if (m.loans.includes(t)) return say([call, 'Refused: ' + m.name + ' already has "' + t + '".'], 'is-warn');
      if (m.loans.length >= state.max) return say([call, 'Refused. borrow() checks len(__loans) >= MAX_LOANS (' + state.max + ') before changing anything, so the object stays valid.'], 'is-warn');
      m.loans.push(t); draw(); say([call, 'Accepted. ' + m.name + ' now has ' + m.loans.length + ' loan' + (m.loans.length > 1 ? 's' : '') + '.'], 'is-good');
    });
    bBack.addEventListener('click', () => { const m = who(), t = s2.value, call = m.n + '.give_back("' + t + '")'; const i = m.loans.indexOf(t); if (i < 0) return say([call, m.name + ' does not have "' + t + '", so there is nothing to return.'], 'is-warn'); m.loans.splice(i, 1); draw(); say([call, 'Returned.'], 'is-good'); });
    bCount.addEventListener('click', () => { const m = who(); say([m.n + '.loan_count', String(m.loans.length) + '  # a read-only property: it has a getter but no setter, so m.loan_count = 5 would raise AttributeError'], ''); });
    bBypass.addEventListener('click', () => { const m = who(), t = s2.value, call = m.n + '._Member__loans.append("' + t + '")'; m.loans.push(t); draw(); say([call, m.loans.length > state.max ? 'It worked: ' + m.name + ' now has ' + m.loans.length + ' loans, more than the limit of ' + state.max + '. The rule inside borrow() was skipped, so the object is in an invalid state. This is why outside code should only use the public methods.' : 'It worked, but only because ' + m.name + ' was under the limit. The limit was not checked.'], m.loans.length > state.max ? 'is-bad' : 'is-warn'); });
    bMax.addEventListener('click', () => { state.max = state.max === 3 ? 2 : 3; bMax.textContent = 'Change Member.MAX_LOANS to ' + (state.max === 3 ? '2' : '3'); draw(); say(['Member.MAX_LOANS = ' + state.max, 'One assignment on the class changes the limit for every Member, because MAX_LOANS is a class attribute shared by all the objects. An instance attribute such as __loans belongs to a single object.'], ''); });
    bNew.addEventListener('click', () => { if (state.members.length >= 4) return say(['Member("…")', 'This playground holds up to four members.'], 'is-warn'); const names = ['Cara', 'Dev']; const nm = names[state.members.length - 2]; state.members.push({ n: nm.toLowerCase(), name: nm, loans: [] }); state.sel = state.members.length - 1; draw(); say([nm.toLowerCase() + ' = Member("' + nm + '", "' + nm.toLowerCase() + '@example.com")', 'A new object is created from the same blueprint. It starts with its own empty list of loans, separate from every other member.'], 'is-good'); });
    bRst.addEventListener('click', () => { state.max = 3; state.members = [{ n: 'ava', name: 'Ava', loans: [] }, { n: 'ben', name: 'Ben', loans: [] }]; state.sel = 0; bMax.textContent = 'Change Member.MAX_LOANS to 2'; draw(); say(['', 'Two members, no loans.'], ''); logBox.firstChild && (logBox.firstChild.hidden = true); });
    draw(); say(['', 'Choose a member and a book, then press borrow() four times. Then try Reach inside.'], ''); logBox.firstChild.hidden = true;
  }

  /* ---------- 2. Practice sets ---------- */
  function buildFeatures(host) {
    Labs.sorter(host, {
      cls: 'oop-featsort', keepCase: true, title: 'Which feature of OOP?',
      lead: 'Each snippet or description shows one feature of object-oriented programming. Choose the best match.',
      noun: 'example', groupLabel: 'Feature',
      choices: [{ key: 'Encapsulation', label: 'Encapsulation' }, { key: 'Abstraction', label: 'Abstraction' }, { key: 'Inheritance', label: 'Inheritance' }, { key: 'Polymorphism', label: 'Polymorphism' }, { key: 'Generalisation', label: 'Generalisation' }],
      items: [
        { text: 'Why can this class not be left with a negative balance?', visual: code('class Account:\n    def __init__(self):\n        self.__balance = 0\n    def withdraw(self, amount):\n        if amount <= self.__balance:\n            self.__balance -= amount'), ans: 'Encapsulation', why: 'The data is hidden and can change only through a method that checks it first.' },
        { text: 'The calling code only needs the method names.', visual: code('player.play()\nplayer.pause()\n# how the audio is decoded stays inside the class'), ans: 'Abstraction', why: 'Abstraction shows only what a user needs (the interface) and hides how it is done.' },
        { text: 'What does Dog get without writing it again?', visual: code('class Animal:\n    def eat(self): ...\nclass Dog(Animal):\n    def bark(self): ...'), ans: 'Inheritance', why: 'Dog is a kind of Animal and inherits eat(), so the code is written once and reused.' },
        { text: 'The same call does different things.', visual: code('for shape in [Circle(2), Square(3)]:\n    print(shape.area())'), ans: 'Polymorphism', why: 'One message, area(), is answered differently by each type of object.' },
        { text: 'Two classes, Car and Bus, both have wheels, a speed and brake().', visual: code('class Vehicle:\n    def brake(self): ...'), ans: 'Generalisation', why: 'Generalisation pulls the features shared by several classes up into a more general parent class, here Vehicle.' },
        { text: 'A class bundles data with the methods that use it, and the data is marked "do not touch".', ans: 'Encapsulation', why: 'Encapsulation joins data and behaviour in one unit and controls access to the data.' }
      ],
      closing: 'In an exam, name the feature, point to where it appears in the code, and say what benefit it gives there.'
    });
  }
  function buildTestKinds(host) {
    Labs.sorter(host, {
      cls: 'oop-testsort', keepCase: true, title: 'Which kind of testing?',
      lead: 'Choose the kind of testing described. Levels (unit, subsystem, system) say what is tested; approaches (black, white and grey box) say how much of the code the tester can see.',
      noun: 'description', groupLabel: 'Kind of testing',
      choices: [{ key: 'Unit testing', label: 'Unit' }, { key: 'Subsystem testing', label: 'Subsystem' }, { key: 'System testing', label: 'System' }, { key: 'Black box', label: 'Black box' }, { key: 'White box', label: 'White box' }, { key: 'Grey box', label: 'Grey box' }],
      items: [
        { text: 'A developer checks that Member.borrow() refuses a fourth book, with nothing else running.', ans: 'Unit testing', why: 'A single method or class is tested on its own.' },
        { text: 'The Loan, Book and Member classes are tested together to check that a loan updates both the member and the book.', ans: 'Subsystem testing', why: 'Several units that work together are tested as a group.' },
        { text: 'Staff run the whole library program from sign-in to returning a book, using the real screens.', ans: 'System testing', why: 'The complete system is tested against the requirements.' },
        { text: 'A tester enters inputs and checks the outputs without ever seeing the code.', ans: 'Black box', why: 'Only inputs and outputs are visible, so tests are based on the requirements.' },
        { text: 'A developer writes tests so that every branch of an if statement in the code is run at least once.', ans: 'White box', why: 'The tester sees the internal structure and designs tests to cover it.' },
        { text: 'A tester knows the database tables but not the code, and uses that knowledge to design the inputs.', ans: 'Grey box', why: 'Partial knowledge of the internals guides the tests, which are still run through the interface.' }
      ],
      closing: 'A real project uses several kinds together: unit tests as code is written, then subsystem and system tests, with black, white and grey box approaches where each helps.'
    });
  }

  function init() {
    document.querySelectorAll('[data-ooplab="objects"]').forEach(buildObjects);
    document.querySelectorAll('[data-ooplab="features"]').forEach(buildFeatures);
    document.querySelectorAll('[data-ooplab="tests"]').forEach(buildTestKinds);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
