/* Still diagram (sequence): the back-end process for one web request.
   Programming for the Web › The back-end process for a web request. */
HSCAnim.define('seq-backend', {
  still: true,
  title: 'Sequence diagram: the back-end process for one web request',
  alt: 'Sequence diagram. The browser resolves the domain with DNS, then sends HTTPS GET /books to the web server, which forwards it to the framework router. The router calls the matching handler, which runs a parameterised query on the database. The result set comes back, the handler builds a JSON or HTML response, and it passes back through the framework and web server to the browser as HTTP 200, which the browser renders.',
  layout: { size: [800, 640], minWidth: 660 },
  setup(s) {
    s.sequence(s.root, {
      x: 0, y: 10, w: 800, cardW: 122,
      actors: [
        { id: 'u', label: 'Browser', tone: 'teal', on: true },
        { id: 'd', label: 'DNS', tone: 'plum-t' },
        { id: 's', label: 'Web server\n(e.g. Nginx)', tone: 'sage-t' },
        { id: 'f', label: 'Framework\n/ router', tone: 'sage-t' },
        { id: 'h', label: 'Handler\n(controller)', tone: 'sage-t' },
        { id: 'db', label: 'Database', tone: 'mustard-t' }
      ],
      steps: [
        { from: 'u', to: 'd', text: 'resolve the name' },
        { from: 'd', to: 'u', text: 'IP address', reply: true },
        { from: 'u', to: 's', text: 'HTTPS GET /books' },
        { from: 's', to: 'f', text: 'forward request' },
        { from: 'f', to: 'h', text: 'match the route' },
        { from: 'h', to: 'db', text: 'parameterised query' },
        { from: 'db', to: 'h', text: 'result set', reply: true },
        { from: 'h', to: 'f', text: 'response (JSON/HTML)', reply: true },
        { from: 'f', to: 's', text: 'response object', reply: true },
        { from: 's', to: 'u', text: 'HTTP 200 + body', reply: true },
        { note: 'the browser renders the result', over: ['u', 'd'] }
      ]
    });
  }
});
