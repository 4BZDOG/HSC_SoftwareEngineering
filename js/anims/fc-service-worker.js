/* Still diagram (NESA flowchart): a service worker serving cached files.
   Programming for the Web › Progressive web apps. */
HSCAnim.define('fc-service-worker', {
  still: true,
  title: 'Flowchart: a service worker serving cached files',
  alt: 'Flowchart. BEGIN handleFetch, INPUT request. If the request is in the cache, OUTPUT the cached response. If not, and the device is online, fetch from the network, save a copy in the cache and OUTPUT the network response. If offline, OUTPUT the offline page. END handleFetch.',
  layout: { size: [600, 620] },
  setup(s) {
    const X = 200, R = 440, BUS = 572;
    const n = {
      begin: s.node(s.root, { x: X, y: 34, w: 200, h: 42, shape: 'terminator', text: 'BEGIN handleFetch' }),
      input: s.node(s.root, { x: X, y: 104, w: 190, h: 44, shape: 'io', text: 'INPUT request' }),
      cache: s.node(s.root, { x: X, y: 190, w: 180, h: 72, shape: 'decision', text: 'In cache?' }),
      online: s.node(s.root, { x: X, y: 296, w: 180, h: 72, shape: 'decision', text: 'Online?' }),
      fetch: s.node(s.root, { x: X, y: 398, w: 230, h: 56, shape: 'process', text: 'Fetch from the network\nSave a copy in the cache' }),
      net: s.node(s.root, { x: X, y: 482, w: 250, h: 44, shape: 'io', text: 'OUTPUT network response' }),
      end: s.node(s.root, { x: X, y: 580, w: 200, h: 42, shape: 'terminator', text: 'END handleFetch' }),
      cached: s.node(s.root, { x: R, y: 190, w: 220, h: 44, shape: 'io', text: 'OUTPUT cached response' }),
      offline: s.node(s.root, { x: R, y: 296, w: 200, h: 44, shape: 'io', text: 'OUTPUT offline page' })
    };
    const L = s.g(s.back);
    s.link(L, n.begin, n.input);
    s.link(L, n.input, n.cache);
    s.link(L, n.cache, n.cached, { from: 'right', to: 'left', label: 'Yes', labelNear: 'start', dx: 2, dy: -12 });
    s.link(L, n.cache, n.online, { label: 'No', labelAt: [X + 40, 244] });
    s.link(L, n.online, n.offline, { from: 'right', to: 'left', label: 'No', labelNear: 'start', dx: 2, dy: -12 });
    s.link(L, n.online, n.fetch, { label: 'Yes', labelAt: [X + 40, 350] });
    s.link(L, n.fetch, n.net);
    s.link(L, n.net, n.end);
    s.link(L, n.cached, s.port(n.end, 'right'), { from: 'right', via: [[BUS, 190], [BUS, 580]] });
    s.link(L, n.offline, [BUS, 296], { from: 'right', head: false });
  }
});
