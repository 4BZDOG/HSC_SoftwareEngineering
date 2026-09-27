/* Still diagram (NESA flowchart): defensive handling of a request.
   Secure Software Architecture › Safe API. */
HSCAnim.define('fc-defensive-request', {
  still: true,
  title: 'Flowchart: defensive handling of a request',
  alt: 'Flowchart. BEGIN handleRequest, INPUT request. If not sent over HTTPS, OUTPUT reject. If the token is not valid, OUTPUT 401 Unauthorised. If the input is not valid, OUTPUT 400 Bad request. Otherwise call sanitise(input) and runParameterisedQuery(input), then OUTPUT response. END handleRequest.',
  layout: { size: [600, 726] },
  setup(s) {
    const X = 200, R = 432, BUS = 566;
    const n = {
      begin: s.node(s.root, { x: X, y: 34, w: 210, h: 42, shape: 'terminator', text: 'BEGIN handleRequest' }),
      input: s.node(s.root, { x: X, y: 104, w: 190, h: 44, shape: 'io', text: 'INPUT request' }),
      https: s.node(s.root, { x: X, y: 186, w: 200, h: 72, shape: 'decision', text: 'Sent over\nHTTPS?' }),
      token: s.node(s.root, { x: X, y: 286, w: 200, h: 72, shape: 'decision', text: 'Valid\ntoken?' }),
      valid: s.node(s.root, { x: X, y: 386, w: 200, h: 72, shape: 'decision', text: 'Input\nvalid?' }),
      sanitise: s.node(s.root, { x: X, y: 482, w: 220, h: 44, shape: 'subprogram', text: 'sanitise(input)' }),
      query: s.node(s.root, { x: X, y: 550, w: 270, h: 44, shape: 'subprogram', text: 'runParameterisedQuery(input)' }),
      output: s.node(s.root, { x: X, y: 618, w: 210, h: 44, shape: 'io', text: 'OUTPUT response' }),
      end: s.node(s.root, { x: X, y: 688, w: 210, h: 42, shape: 'terminator', text: 'END handleRequest' }),
      r1: s.node(s.root, { x: R, y: 186, w: 190, h: 44, shape: 'io', text: 'OUTPUT reject' }),
      r2: s.node(s.root, { x: R, y: 286, w: 200, h: 54, shape: 'io', text: 'OUTPUT 401\nUnauthorised' }),
      r3: s.node(s.root, { x: R, y: 386, w: 200, h: 54, shape: 'io', text: 'OUTPUT 400\nBad request' })
    };
    const lines = s.g(s.back);
    s.link(lines, n.begin, n.input);
    s.link(lines, n.input, n.https);
    s.link(lines, n.https, n.token, { label: 'Yes', labelNear: 'start', dx: 18 });
    s.link(lines, n.token, n.valid, { label: 'Yes', labelNear: 'start', dx: 18 });
    s.link(lines, n.valid, n.sanitise, { label: 'Yes', labelNear: 'start', dx: 18 });
    s.link(lines, n.sanitise, n.query);
    s.link(lines, n.query, n.output);
    s.link(lines, n.output, n.end);
    [['https', 'r1'], ['token', 'r2'], ['valid', 'r3']].forEach(([d, r]) => {
      s.link(lines, n[d], n[r], { from: 'right', to: 'left', label: 'No', labelNear: 'start', dx: 4, dy: -12, cls: 'is-bad' });
      s.link(lines, n[r], s.port(n.end, 'right'), { from: 'right', via: [[BUS, n[r].box.y], [BUS, 688]], head: n[r] === n.r3 });
    });
  }
});
