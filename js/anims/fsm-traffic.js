/* Still diagram (state diagram): a traffic light as a finite state machine.
   Programming Mechatronics › Control algorithms. */
HSCAnim.define('fsm-traffic', {
  still: true,
  title: 'State diagram: a traffic light as a finite state machine',
  alt: 'State diagram. The light starts in RED. RED changes to GREEN after 30 seconds, GREEN to YELLOW after 25 seconds, and YELLOW back to RED after 5 seconds. From any of those states an emergency signal moves it to EMERGENCY (flashing red, all traffic stops); when the emergency is cleared it returns to RED.',
  layout: { size: [780, 420], minWidth: 640 },
  setup(s) {
    const L = s.g(s.back);
    const st = (x, y, t, tone) => s.node(s.root, { x, y, w: 150, h: 60, shape: 'card', tone, text: t, size: 14, cls: 'pa-strong' });
    const red = st(170, 90, 'RED\nstop', 'terra-t'), green = st(420, 90, 'GREEN\ngo', 'sage-t'), yellow = st(670, 90, 'YELLOW\ncaution', 'mustard-t');
    const em = st(420, 330, 'EMERGENCY\nflashing red', 'terra');
    s.el('circle', { cx: 40, cy: 90, r: 9, class: 'f-ink' }, s.root);
    s.link(L, [49, 90], red, { from: 'right', to: 'left', label: 'start' });
    s.link(L, red, green, { from: 'right', to: 'left', label: 'after 30 s' });
    s.link(L, green, yellow, { from: 'right', to: 'left', label: 'after 25 s' });
    s.link(L, yellow, red, { from: 'top', to: 'top', via: [[670, 30], [170, 30]], label: 'after 5 s', labelAt: [420, 30] });
    [red, green, yellow].forEach((n, i) => s.link(L, n, em, { from: 'bottom', to: 'top', toOff: (i - 1) * 40, fromOff: i === 0 ? 30 : 0, mid: 200, cls: 'is-bad' }));
    s.chip(s.root, 'emergency signal', 560, 200, { cls: 'is-bad' });
    s.link(L, em, red, { from: 'left', to: 'bottom', toOff: -30, label: 'cleared', cls: 'is-good' });
  }
});
