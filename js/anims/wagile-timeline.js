/* Still diagram (timeline): WAgile, planned Waterfall gates around Agile sprints.
   Software Engineering Project › The WAgile approach. */
HSCAnim.define('wagile-timeline', {
  still: true,
  title: 'Timeline: WAgile, planned gates around Agile sprints',
  alt: 'Timeline over seven weeks. Waterfall planning: a requirements document and design sign-off, both planned interventions. Agile sprints: sprint 1 front-end UI, sprint 2 back-end API and sprint 3 integration, each two weeks with a review at the end. Waterfall deployment: a final security audit, another intervention, then live deployment.',
  layout: { size: [780, 400], minWidth: 640 },
  setup(s) {
    s.gantt(s.root, {
      x: 0, y: 4, w: 780, days: 49, labelW: 210, tick: 7, tickLabel: d => `wk ${d / 7}`,
      sections: [
        { name: 'Waterfall: plan', rows: [
          { id: 'req', label: 'Requirements document', start: 0, dur: 7, tone: 'terra', tag: 'gate' },
          { id: 'des', label: 'Design sign-off', start: 7, dur: 5, tone: 'terra', tag: 'gate', after: 'req' }] },
        { name: 'Agile: sprints', rows: [
          { id: 's1', label: 'Sprint 1: front-end UI', start: 12, dur: 10, tone: 'teal', after: 'des' },
          { id: 's2', label: 'Sprint 2: back-end API', start: 22, dur: 10, tone: 'teal', after: 's1' },
          { id: 's3', label: 'Sprint 3: integration', start: 32, dur: 10, tone: 'teal', after: 's2' },
          { id: 'rv', label: 'Sprint reviews', start: 22, milestone: true, tone: 'mustard' }] },
        { name: 'Waterfall: deploy', rows: [
          { id: 'aud', label: 'Final security audit', start: 42, dur: 5, tone: 'terra', tag: 'gate', after: 's3' },
          { id: 'live', label: 'Live deployment', start: 47, milestone: true, tone: 'sage', after: 'aud' }] }
      ]
    });
    const g = s.root.querySelector('.pa-gantt:last-child');
    // extra review diamonds at the end of sprints 2 and 3
    [32, 42].forEach(d => {
      const x = 210 + d / 49 * 570;
      const m = s.g(s.root, null, { x, y: 4 + 30 + 26 + 60 + 26 + 105 });
      m.setAttribute('filter', 'url(#pa-cut)');
      s.el('path', { d: 'M0 -9 L9 0 L0 9 L-9 0 Z', class: 'f-mustard pa-outline' }, m);
    });
    s.text(s.root, 'gate = a planned Waterfall intervention', { x: 780, y: 392, anchor: 'end', cls: 'pa-name', size: 12.5 });
  }
});
