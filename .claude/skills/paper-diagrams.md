---
name: paper-diagrams
description: >
  Draw a static ("still") diagram in the site's paper-cut style with the
  diagram kit in js/anim.js: NESA flowcharts, decision trees, sequence
  diagrams, Gantt charts and timelines, concept and process diagrams. Covers
  the course notation, colour coding, text sizes, layout, and wiring a
  diagram into a page. Use it for any new or redrawn static figure.
category: content
---

# Skill: paper-diagrams

Static figures are drawn at runtime by the same engine as the animated
diagrams, so the two look like one family: paper fills, soft cut shadows,
Fraunces and Inter type, and the site palette in light and dark mode. A
still diagram is a scene with `still: true` and no beats. It has no player,
gets an **Enlarge** button, and scrolls sideways on phones when it is wide.

Use a still diagram for structure and reference; use an animated diagram
(`.claude/skills/add-animation.md`) when the idea is a process that unfolds
over time. Structure charts and data flow diagrams stay in
`js/nesa-diagrams.js` (they have their own data file) and pick up the
paper style from `css/anim.css`.

---

## Course notation (NESA Course Specifications pp. 5–19)

Get the symbols right before anything else. `scripts/check-site.py` checks
flowcharts.

| Diagram | Symbols (kit `shape`) | Rules |
|---|---|---|
| Flowchart | `terminator`, `process`, `decision`, `io`, `subprogram` only | Starts with a `BEGIN …` terminator and ends with `END …`. Every arrow leaving a decision is labelled (Yes/No or True/False). `INPUT`/`OUTPUT` go in `io`. Named modules in `subprogram`. |
| Decision tree | `process` (question), `card` (outcome) | Rectangles, not diamonds. Every branch labelled. |
| Data flow diagram | `js/nesa-diagrams.js` | Circle processes, rectangle external entities, open-ended data stores, curved labelled flows. |
| Structure chart | `js/nesa-diagrams.js` | Modules, data (open) and flag (filled) couples, decision diamond, repetition arc. |
| Sequence diagram | `s.sequence()` | Actors across the top, solid arrows for requests, dashed for replies, numbered steps. |
| Class diagram | `s.classBox()` + `s.link()` | Name, attributes, methods compartments. Inheritance uses `marker: 'pa-inherit'` (filled arrowhead at the parent, as NESA draws it). Label relationships and give multiplicities (`1..1`, `0..*`, `1..*`, `0..1`) as `pa-mult` text near each end; never "many". |
| State diagram | `card` states + `s.link()` | A filled start dot, rounded states, every transition labelled with its trigger. |
| Gantt / timeline | `s.gantt()` | Bars for tasks, diamonds for milestones, dashed dependency arrows, weeks on the axis. |
| Concept, process, architecture, cycle | `card`, `s.link`, cast from the kit | Free form, but keep to the colour code below. |

## Colour code

Every symbol has its own fill by default, so readers learn the notation by
colour too. Only override a tone when the colour carries meaning.

| Default | Used for |
|---|---|
| `teal` (solid) | Terminators; the "you"/client actor |
| `mustard-t` | Decisions and questions |
| `blush-t` | Input/output |
| `paper` | Processes |
| `sheet` | Subprograms, external entities |
| `sage-t` / `sage` | Good outcomes, "pass", working, approved |
| `terra-t` / `terra` | Bad outcomes, "fail", errors, rejected, risk |
| `teal-t`, `plum-t` | Neutral groupings (client side, external systems) |

Tints (`-t`) are soft versions for large shapes; text on them uses the
theme ink. Solid `teal`, `terra`, `sage`, `plum` get light text
automatically; `mustard`, `blush` and `sky` keep dark text in both themes.

## Clear text, always

- Node text 14px (13px minimum in dense diagrams); chips 12.5px. Never smaller.
- A still is never drawn bigger than its natural size (`maxWidth = W`), so
  design at the size you want it read.
- Break labels with `\n` rather than letting them run: 2–3 short lines.
- Keep labels on connectors short (`Yes`, `No`, `Pass`, `JSON API`).
  Place them with `labelAt` or `labelNear: 'start'` so they never sit on a
  shape or in a narrow gap.
- Prefer **vertical** layouts (flowcharts and trees read top to bottom and
  fit a phone). For wide diagrams set `minWidth` (about 0.8 × W) so they
  scroll rather than shrink, or give a `tall` layout.
- Write out every word in the `alt` text: it is the screen-reader version.

---

## Steps

### 1  Write `js/anims/<name>.js`

```js
/* Still diagram (NESA flowchart): <what it shows>.
   <Topic> › <section>. */
HSCAnim.define('fc-example', {
  still: true,
  title: 'Flowchart: check a user’s age',
  alt: 'Flowchart. BEGIN checkAge, INPUT age. If age is 18 or more, OUTPUT Welcome; otherwise OUTPUT Too young. END checkAge.',
  layout: { size: [560, 460] },            // or layouts: { wide, tall }; minWidth for wide diagrams
  setup(s) {
    const X = 200, L = s.g(s.back);        // connectors go behind the shapes
    const begin = s.node(s.root, { x: X, y: 34, w: 180, h: 42, shape: 'terminator', text: 'BEGIN checkAge' });
    const input = s.node(s.root, { x: X, y: 104, w: 170, h: 44, shape: 'io', text: 'INPUT age' });
    const old = s.node(s.root, { x: X, y: 190, w: 170, h: 72, shape: 'decision', text: 'age ≥ 18?' });
    const yes = s.node(s.root, { x: X, y: 290, w: 190, h: 44, shape: 'io', text: "OUTPUT 'Welcome'" });
    const no = s.node(s.root, { x: 420, y: 190, w: 200, h: 44, shape: 'io', text: "OUTPUT 'Too young'" });
    const end = s.node(s.root, { x: X, y: 380, w: 180, h: 42, shape: 'terminator', text: 'END checkAge' });
    s.link(L, begin, input);
    s.link(L, input, old);
    s.link(L, old, yes, { label: 'Yes', labelAt: [X + 40, 245] });
    s.link(L, old, no, { from: 'right', to: 'left', label: 'No', labelNear: 'start', dy: -12 });
    s.link(L, yes, end);
    s.link(L, no, s.port(end, 'right'), { from: 'bottom', via: [[420, 380]] });
  }
});
```

One scene per file: the engine loads `js/anims/<name>.js` for `data-anim="<name>"`, so
a file must define exactly the scene it is named after. Small shared helpers (for
example `T()`, `IO()`, `D()` for flowchart symbols) are copied into each file.

### 2  Put it in the page

```html
<figure class="figure">
<figcaption class="figure-head">
  <p class="figure-kicker"><span class="figure-kind">Flowchart</span></p>
  <h4 class="figure-title">Check a user's age</h4>
  <p class="figure-lead">One sentence on what the diagram shows.</p>
</figcaption>
<div class="figure-canvas figure-canvas--still">
  <div class="anim" data-anim="fc-example"></div>
</div>
<div class="figure-notes">
  <div><h5>What to notice</h5><ul><li>…</li></ul></div>
  <p class="figure-try"><strong>Try this</strong>…</p>
</div>
</figure>
```

The page must load `../css/anim.css` and `../js/anim.js` (see
`add-animation.md`); bump the `?v=` on both when a scene or the kit changes.

### 3  Check it

```bash
python3 -m http.server 8000     # open the page; check light, dark and a 390 px wide window
python3 scripts/check-site.py
```

---

## Kit reference

| Call | What it draws |
|---|---|
| `s.node(parent, { x, y, w, h, shape, text, tone, size, id })` | A symbol centred on (x, y). `shape`: `process`, `terminator`, `decision`, `io`, `subprogram`, `card`, `circle`, `entity`, `store` (`id` adds the store's ID box). |
| `s.port(node, side, offset)` | The point on a node's edge (`top`, `bottom`, `left`, `right`). |
| `s.link(parent, a, b, { from, to, via, mid, curve, label, labelAt, labelNear, dashed, head, cls })` | A connector with an arrowhead. Right-angled by default; `via` points route around shapes; `curve` bends it (DFD style). `cls: 'is-good'` / `'is-bad'` colour it. |
| `s.classBox(parent, { x, y, w, name, attrs, methods, tone })` | A UML class; works with `port()` and `link()`. |
| `s.chip(parent, text, x, y)` | A small paper label. |
| `s.sequence(parent, { x, y, w, actors, steps })` | Sequence diagram. Steps: `{ from, to, text, reply }`, `{ section }`, `{ note, over: [a, b] }`. Returns the bottom y. |
| `s.gantt(parent, { x, y, w, days, labelW, tick, tickLabel, sections })` | Gantt chart. Rows: `{ id, label, start, dur, tone, milestone, after, tag }`. |
| `s.plot(...)`, `s.folk(...)`, `s.building(...)`, `s.padlock(...)`, `s.key(...)` … | Anything from the animation kit, drawn still. |

Groups (a dashed box around related shapes) are a `rect` with class
`pa-group` in `s.back`, titled with class `pa-group-t`.

## Checklist

- [ ] Symbols match the table above; flowcharts start with BEGIN and end with END
- [ ] Every decision branch is labelled; no label sits on a shape
- [ ] No text under 13px; nothing clipped at the edges (check a 390 px window)
- [ ] Light and dark mode both read clearly
- [ ] `alt` describes the whole diagram in words
- [ ] Figure has a title, lead, What to notice and Try this
- [ ] `python3 scripts/check-site.py` passes
