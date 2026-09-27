/* Still diagram (block diagram): open loop and closed loop control.
   Programming Mechatronics › Control algorithms. */
HSCAnim.define('mech-loops', {
  still: true,
  title: 'Block diagram: open loop and closed loop control',
  alt: 'Open loop: setpoint, controller, actuator, output, with nothing checking the result. Closed loop: setpoint, compare, controller, actuator, output; a sensor measures the output and feeds it back to the compare step, so the controller corrects the error.',
  layout: { size: [780, 380], minWidth: 640 },
  setup(s) {
    const L = s.g(s.back);
    const card = (x, y, t, tone) => s.node(s.root, { x, y, w: 118, h: 48, shape: 'card', tone: tone || 'paper', text: t, size: 14 });
    s.text(s.root, 'Open loop', { x: 12, y: 30, anchor: 'start', cls: 'pa-title' });
    const o = [card(90, 80, 'Setpoint', 'teal-t'), card(290, 80, 'Controller', 'mustard-t'), card(490, 80, 'Actuator', 'sage-t'), card(690, 80, 'Output', 'teal-t')];
    o.slice(1).forEach((n, i) => s.link(L, o[i], n, { from: 'right', to: 'left' }));
    s.text(s.root, 'no check on the result', { x: 690, y: 128, cls: 'pa-name', size: 12.5 });
    s.el('path', { d: 'M10 158 H770', class: 'pa-section-line' }, s.back);
    s.text(s.root, 'Closed loop', { x: 12, y: 190, anchor: 'start', cls: 'pa-title' });
    const sp = card(70, 240, 'Setpoint', 'teal-t');
    const cmp = s.node(s.root, { x: 205, y: 240, w: 70, h: 70, shape: 'circle', tone: 'plum-t', text: 'Compare', size: 12 });
    const ct = card(340, 240, 'Controller', 'mustard-t'), ac = card(510, 240, 'Actuator', 'sage-t'), out = card(690, 240, 'Output', 'teal-t');
    const sn = card(510, 336, 'Sensor', 'sky-t');
    s.link(L, sp, cmp, { from: 'right', to: 'left' });
    s.link(L, cmp, ct, { from: 'right', to: 'left', label: 'error' });
    s.link(L, ct, ac, { from: 'right', to: 'left' });
    s.link(L, ac, out, { from: 'right', to: 'left' });
    s.link(L, out, sn, { from: 'bottom', to: 'right' });
    s.link(L, sn, cmp, { from: 'left', to: 'bottom', label: 'feedback' });
  }
});
