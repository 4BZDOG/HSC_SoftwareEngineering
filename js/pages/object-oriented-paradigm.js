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
