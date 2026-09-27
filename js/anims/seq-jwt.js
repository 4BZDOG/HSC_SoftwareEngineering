/* Still diagram (sequence): logging in with a JSON Web Token.
   Programming for the Web › Securing the web. */
HSCAnim.define('seq-jwt', {
  still: true,
  title: 'Sequence diagram: logging in with a JSON Web Token',
  alt: 'Sequence diagram. The browser POSTs a username and password. The server looks up the stored bcrypt hash and checks the password against it. If correct, it signs a JWT and returns it; the browser stores it in an HttpOnly cookie and sends it with later requests, which the server verifies by signature without a database lookup. If wrong, the server returns 401 Unauthorised.',
  layout: { size: [660, 770], minWidth: 520 },
  setup(s) {
    s.sequence(s.root, {
      x: 0, y: 10, w: 660, cardW: 160,
      actors: [
        { id: 'u', label: 'User (browser)', tone: 'teal', on: true },
        { id: 's', label: 'Web server', tone: 'sage-t' },
        { id: 'd', label: 'User database', tone: 'mustard-t' }
      ],
      steps: [
        { from: 'u', to: 's', text: 'POST /login\n(username + password)' },
        { from: 's', to: 'd', text: 'find user by username' },
        { from: 'd', to: 's', text: 'stored bcrypt hash', reply: true },
        { from: 's', to: 's', text: 'check the password\nagainst the hash' },
        { section: 'Password correct' },
        { from: 's', to: 's', text: 'sign a JWT\n(header.payload.signature)' },
        { from: 's', to: 'u', text: '200 OK + JWT', reply: true },
        { note: 'store the token\n(HttpOnly cookie)', over: ['u'] },
        { from: 'u', to: 's', text: 'GET /dashboard\nAuthorization: Bearer JWT' },
        { from: 's', to: 's', text: 'verify the signature\n(no database lookup)' },
        { from: 's', to: 'u', text: '200 OK + protected data', reply: true },
        { section: 'Password wrong' },
        { from: 's', to: 'u', text: '401 Unauthorised', reply: true }
      ]
    });
  }
});
