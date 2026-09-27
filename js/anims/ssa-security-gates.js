/* Still diagram (process diagram): security gates between the development steps.
   Secure Software Architecture › Software development steps for secure code. */
HSCAnim.define('ssa-security-gates', {
  still: true,
  title: 'Security checks through the development steps',
  alt: 'Process diagram. Requirements, then a security review gate; Design, then a threat model gate; Development, then a code review gate; Testing, then a penetration test gate; then Installation. A failed gate sends the work back: security review to Requirements, threat model to Design, code review and penetration test to Development.',
  layout: { size: [620, 760] },
  setup(s) {
    const X = 230, steps = ['Requirements', 'Design', 'Development', 'Testing', 'Installation'];
    const gates = ['Security\nreview', 'Threat\nmodel', 'Code\nreview', 'Penetration\ntest'];
    const back = [0, 1, 2, 2];                       // where a failed gate sends the work
    const lines = s.g(s.back);
    const S = steps.map((t, i) => s.node(s.root, { x: X, y: 40 + i * 168, w: 200, h: 46, shape: 'card', tone: i === 4 ? 'sage-t' : 'teal-t', text: t, cls: 'pa-strong', size: 15 }));
    const G = gates.map((t, i) => {
      const n = s.node(s.root, { x: X, y: 124 + i * 168, w: 190, h: 76, shape: 'decision', text: t });
      s.padlock(s.root, { at: { x: X - 118, y: 124 + i * 168, s: 1 }, tone: 'mustard' });
      return n;
    });
    G.forEach((g, i) => {
      s.link(lines, S[i], g);
      s.link(lines, g, S[i + 1], { label: 'Pass', labelAt: [X + 44, g.box.y + 30], cls: 'is-good' });
      const t = S[back[i]], lane = 440 + i * 36;
      s.link(lines, g, t, { from: 'right', to: 'right', via: [[lane, g.box.y], [lane, t.box.y]], label: 'Fail', labelAt: [X + 125, g.box.y - 13], cls: 'is-bad' });
    });
    s.text(s.root, 'A problem caught at a gate\ncosts far less than one\nfound after release.', { x: 480, y: 700, cls: 'pa-name', size: 13, lh: 1.3 });
  }
});
