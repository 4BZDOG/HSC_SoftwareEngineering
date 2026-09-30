/* Still diagram (sequence): the TLS handshake that starts an HTTPS connection.
   Programming for the Web › Securing the web. */
HSCAnim.define('web-tls-handshake', {
  still: true,
  title: 'Sequence diagram: the TLS handshake',
  alt: 'Sequence diagram between the browser and the web server. After the TCP connection is open, the browser sends a ClientHello listing the TLS versions and cipher suites it supports, with its half of a key exchange. The server replies with a ServerHello choosing a cipher suite and giving its half of the key exchange, then sends its certificate and a signature made with its private key. The browser checks that the certificate is signed by a trusted certificate authority, has not expired and names the right domain, and checks the signature. Both sides then work out the same session key. Each sends a Finished message, and from then on the request and the response are encrypted with the session key. If any check fails, the browser shows a warning instead.',
  layout: { size: [700, 900], minWidth: 560 },
  setup(s) {
    s.sequence(s.root, {
      x: 0, y: 10, w: 700, cardW: 190,
      actors: [
        { id: 'b', label: 'Browser', tone: 'teal', on: true },
        { id: 's', label: 'Web server\n(holds a certificate)', tone: 'sage-t' }
      ],
      steps: [
        { note: 'TCP connection is already open\n(SYN, SYN-ACK, ACK)', over: ['b', 's'] },
        { from: 'b', to: 's', text: 'ClientHello: TLS versions, cipher suites,\nrandom number, key exchange share' },
        { from: 's', to: 'b', text: 'ServerHello: chosen cipher suite,\nrandom number, key exchange share', reply: true },
        { from: 's', to: 'b', text: 'Certificate + signature made\nwith the server’s private key', reply: true },
        { from: 'b', to: 'b', text: 'check the certificate:\ntrusted CA? in date?\nright domain? signature valid?' },
        { from: 'b', to: 'b', text: 'work out the session key' },
        { from: 's', to: 's', text: 'work out the same\nsession key' },
        { from: 's', to: 'b', text: 'Finished (encrypted)', reply: true },
        { from: 'b', to: 's', text: 'Finished (encrypted)' },
        { section: 'Secure channel open' },
        { from: 'b', to: 's', text: 'GET /games (cipher text)' },
        { from: 's', to: 'b', text: '200 OK + page (cipher text)', reply: true },
        { section: 'If a check fails' },
        { from: 'b', to: 'b', text: 'warning: connection\nis not private' }
      ]
    });
  }
});
