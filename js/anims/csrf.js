/* Animated diagram: cross-site request forgery (CSRF).
   Secure Software Architecture › Secure user action controls. */
(() => {
  const VARIANTS = { none: 'No defence', token: 'CSRF token', samesite: 'SameSite cookie' };

  /* Scene-only cut-outs */

  function jar(s, x, y) {
    const g = s.g(s.back, 'pa-jar', { x, y });
    s.el('ellipse', { cx: 0, cy: 1, rx: 30, ry: 4, class: 'pa-floor' }, g);
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('path', { d: 'M-25 -60 Q-29 -57 -29 -50 V-8 Q-29 0 -21 0 H21 Q29 0 29 -8 V-50 Q29 -57 25 -60 Z', class: 'pa-glass' }, art);
    s.el('rect', { x: -24, y: -72, width: 48, height: 12, rx: 3, class: 'f-terra' }, art);
    s.el('path', { d: 'M-20 -48 V-14', class: 'pa-shine' }, g);
    s.text(g, 'cookie jar', { y: 17, cls: 'pa-name' });
    return g;
  }

  function kitten(s, parent, at) {
    const g = s.g(parent, 'pa-kitten', at);
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: -72, y: -48, width: 144, height: 96, rx: 4, class: 'f-sheet' }, art);
    s.el('rect', { x: -65, y: -41, width: 130, height: 82, rx: 2, class: 'f-blush' }, art);
    const face = s.g(g, 'pa-idle-bob');
    s.el('path', { d: 'M-30 -8 L-26 -38 L-8 -24 Z M30 -8 L26 -38 L8 -24 Z', class: 'f-mustard' }, face);
    s.el('path', { d: 'M-25 -13 L-24 -30 L-14 -22 Z M25 -13 L24 -30 L14 -22 Z', class: 'f-terra' }, face);
    s.el('ellipse', { cx: 0, cy: 6, rx: 34, ry: 27, class: 'f-mustard' }, face);
    const eyes = s.g(face, 'pa-eyes');
    s.el('ellipse', { cx: -12, cy: 2, rx: 5, ry: 6.5, class: 'f-ink-fixed' }, eyes);
    s.el('ellipse', { cx: 12, cy: 2, rx: 5, ry: 6.5, class: 'f-ink-fixed' }, eyes);
    s.el('circle', { cx: -10.5, cy: -.5, r: 1.8, class: 'f-paper-fixed' }, eyes);
    s.el('circle', { cx: 13.5, cy: -.5, r: 1.8, class: 'f-paper-fixed' }, eyes);
    s.el('path', { d: 'M-3 11 H3 L0 14.5 Z', class: 'f-terra' }, face);
    s.el('path', { d: 'M-6 17 Q-3 20 0 16.5 Q3 20 6 17', class: 'pa-line-ink pa-thin' }, face);
    s.el('path', { d: 'M-16 12 H-36 M-16 16 L-35 21 M16 12 H36 M16 16 L35 21', class: 'pa-whisker' }, face);
    return g;
  }

  function heart(s, parent, at) {
    const g = s.g(parent, 'pa-heart', at);
    s.el('path', { d: 'M0 6 C-10 -2 -8 -11 0 -6 C8 -11 10 -2 0 6 Z', class: 'f-terra' }, g);
    s.set(g, { o: 0 });
    return g;
  }

  // A paper checklist the bank fills in: rows of label + tick/cross.
  function checklist(s, x, y, rows) {
    const w = 176, hh = 20 + rows.length * 26;
    const g = s.g(s.front, 'pa-checklist', { x, y });
    const art = s.g(g);
    art.setAttribute('filter', 'url(#pa-cut)');
    s.el('rect', { x: -w / 2, y: 0, width: w, height: hh, rx: 6, class: 'f-paper' }, art);
    s.el('path', { d: `M${-w / 2 + 10} 0 V${hh}`, class: 'pa-margin' }, art);
    g.rows = rows.map((label, i) => {
      const ry = 22 + i * 26;
      s.text(g, label, { x: -w / 2 + 20, y: ry, anchor: 'start', valign: 'middle', cls: 'pa-t' });
      const yes = s.mark(g, true, { at: { x: w / 2 - 20, y: ry }, r: 9 });
      const no = s.mark(g, false, { at: { x: w / 2 - 20, y: ry }, r: 9 });
      s.set(yes, { o: 0 });
      s.set(no, { o: 0 });
      return { yes, no };
    });
    s.set(g, { o: 0 });
    return g;
  }

  function tick(s, card, i, ok) {
    const row = card.rows[i];
    s.set(ok ? row.no : row.yes, { o: 0 });
    return s.pop(ok ? row.yes : row.no);
  }

  function field(s, parent, x, y, w, label, value) {
    if (label) s.text(parent, label, { x, y: y - 6, anchor: 'start', cls: 'pa-t-xs pa-muted' });
    s.el('rect', { x, y, width: w, height: 22, rx: 4, class: 'f-sheet pa-field' }, parent);
    return s.text(parent, value, { x: x + 8, y: y + 11, anchor: 'start', valign: 'middle', cls: 'pa-mono' });
  }

  function button(s, parent, x, y, label, tone) {
    const g = s.g(parent, null, { x, y });
    const w = s.measure(label, 12) + 22;
    s.el('rect', { x: -w / 2, y: -12, width: w, height: 24, rx: 6, class: 'f-' + (tone || 'teal') }, g);
    s.text(g, label, { y: 0, valign: 'middle', cls: 'pa-t-sm pa-on pa-strong' });
    return g;
  }

  /* Setup: the cast in its opening positions */

  function setup(s) {
    const L = s.L;
    const [bx, by, bw, bh] = L.browser;
    const pw = bw, ph = bh - 72;

    // Your browser, with the bank tab and (later) the kitten tab
    const win = s.win = s.browser(s.root, { at: { x: bx, y: by }, w: bw, h: bh, tabs: ['MyBank', 'Free Kittens!'], url: 'mybank.com' });
    s.text(s.root, 'your browser', s.compact
      ? { x: bx + 110, y: by + bh + 18, anchor: 'start', cls: 'pa-name' }
      : { x: bx + bw - 8, y: by + bh + 16, anchor: 'end', cls: 'pa-name' });

    const bank = win.pages[0];
    s.loginView = s.g(bank);
    s.text(s.loginView, 'MyBank', { x: 18, y: 26, anchor: 'start', cls: 'pa-title' });
    field(s, s.loginView, 18, 52, 170, 'username', 'sam');
    field(s, s.loginView, 18, 96, 170, 'password', '••••••••');
    s.loginBtn = button(s, s.loginView, 52, 146, 'Log in');

    s.acctView = s.g(bank, null, { o: 0 });
    s.text(s.acctView, 'Hi Sam!', { x: 18, y: 26, anchor: 'start', cls: 'pa-title' });
    s.text(s.acctView, 'Transfer money', { x: 18, y: 46, anchor: 'start', cls: 'pa-t-sm pa-muted' });
    s.toField = field(s, s.acctView, 18, 70, 130, 'to', '');
    s.amtField = field(s, s.acctView, 160, 70, 80, 'amount', '');
    s.sendBtn = button(s, s.acctView, 46, 118, 'Send');
    if (s.is('token')) {
      s.tokenTag = s.tag(s.acctView, { text: 'hidden: csrf_token=7f3a9c', mono: true, size: 10, x: Math.min(pw - 100, 190), y: 154, tone: 'mustard' });
      s.set(s.tokenTag, { o: 0 });
    }

    const kit = win.pages[1];
    s.text(kit, 'Free Kittens!', { x: pw / 2, y: 22, cls: 'pa-title' });
    const strip = s.strip = s.g(kit, 'pa-code-strip', { x: pw / 2, y: ph - 24, o: 0 });
    s.el('rect', { x: -128, y: -19, width: 256, height: 38, rx: 5, class: 'f-ink-fixed' }, strip);
    s.text(strip, '<img src="https://mybank.com/transfer\n?to=mallory&amt=500" width="0">', { y: 0, valign: 'middle', cls: 'pa-mono pa-code', size: 10.5, lh: 1.3 });
    s.kitten = kitten(s, kit, { x: pw / 2, y: 84 });
    s.set(s.kitten, { o: 0 });

    // The jar, you and (hiding for now) Mallory
    s.jar = jar(s, L.jar[0], L.jar[1]);
    s.you = s.folk(s.root, { at: { x: L.you[0], y: L.you[1] }, tone: 'teal', name: 'you' });
    s.heart = heart(s, s.front, { x: L.you[0] + 18, y: L.you[1] - 72 });
    s.mallory = s.folk(s.root, { at: { x: L.mallory[0], y: L.mallory[1], o: 0 }, tone: 'plum', hat: 'mask', name: 'Mallory', mood: 'smirk' });
    const say = (text, dx) => s.bubble(s.front, { text, at: { x: L.mallory[0] + 6, y: L.mallory[1] - 66 }, dx: dx || 0 });
    s.hehe = say('hehehe…', s.compact ? -18 : 0);
    s.kaching = say('Ka-ching!', s.compact ? -24 : 0);
    s.drat = say('Drat!', s.compact ? -10 : 0);

    // MyBank and its balance
    const [kx, ky, kw, kh] = L.bank;
    s.bank = s.building(s.root, { at: { x: kx, y: ky }, w: kw, h: kh, roof: 'bank', tone: 'sage', sign: 'MyBank', face: true });
    s.balance = s.tag(s.root, { text: 'Balance $1,200', x: L.balance[0], y: L.balance[1], w: 150, size: 13 });
    s.card = checklist(s, L.card[0], L.card[1], s.is('token') ? ['Session cookie', 'CSRF token'] : ['Session cookie']);
    s.verdict = s.stampMark(s.front, { text: 'APPROVED', tone: 'sage', at: { x: kx, y: ky - kh * .42 } });
    s.denied = s.stampMark(s.front, { text: 'REJECTED', tone: 'terra', at: { x: kx, y: ky - kh * .42 } });

    // The session cookie: the one in the jar, a copy that travels, and one that rides on envelopes
    s.jarCookie = s.cookie(s.root, { at: { x: L.jar[0], y: L.jar[1] - 30, o: 0 } });
    if (s.is('samesite')) {
      s.ssTag = s.tag(s.front, { text: 'SameSite=Strict', mono: true, size: 10, x: L.jar[0] + (s.compact ? 30 : 16), y: L.jar[1] - 88, tone: 'mustard' });
      s.set(s.ssTag, { o: 0 });
    }
    s.flyCookie = s.cookie(s.front, { at: { x: L.jar[0], y: L.jar[1] - 30, o: 0 } });

    const [ox, oy] = L.out;
    s.env = makeEnvelope(s, 'POST /login', ox, oy);
    s.req = makeEnvelope(s, 'to=mallory&amt=500', ox, oy);
    s.good = makeEnvelope(s, s.is('token') ? 'to=gran&amt=50 + token' : 'to=gran&amt=50', ox, oy);
  }

  function makeEnvelope(s, label, x, y) {
    const e = s.envelope(s.front, { label, at: { x, y, o: 0 } });
    e.cookie = s.cookie(e, { at: { x: 24, y: -18, s: .8, o: 0 } });
    e.key = s.key(e, { at: { x: -22, y: -20, s: .8, r: -20, o: 0 }, tone: 'mustard' });
    return e;
  }

  /* Beats */

  // A copy of the jar's cookie hops onto an envelope. The browser keeps the original.
  async function attachCookie(s, env) {
    const e = s.at(env);
    s.set(s.flyCookie, Object.assign(s.at(s.jarCookie), { o: 1 }));
    await s.move(s.flyCookie, e.x + 24, e.y - 18, { arc: 60, dur: 700 });
    s.set(s.flyCookie, { o: 0 });
    s.set(env.cookie, { o: 1 });
    await s.hop(env, { h: 5, dur: 260 });
  }

  async function sendTo(s, env) {
    await s.move(env, s.L.arrive[0], s.L.arrive[1], { arc: s.compact ? 20 : 70 });
    s.gaze(s.bank, 'squint');
  }

  // Coins fly from the bank and land in a little pile at Mallory's feet.
  async function payOut(s, n) {
    const [kx, ky] = s.L.bank, [mx, my] = s.L.mallory;
    const jobs = [];
    for (let i = 0; i < n; i++) {
      const c = s.coin(s.front, { at: { x: kx - 30, y: ky - 50 } });
      jobs.push(s.move(c, mx + 30 + (i % 2) * 7, my - 8 - i * 5, { arc: 80, dur: 640, delay: i * 120 }));
    }
    await s.all(jobs);
  }

  function beats(v) {
    return [
      {
        say: "You're about to log in to MyBank. Keep an eye on your browser's *cookie jar*: it's where websites leave small notes so they remember you."
      },
      {
        say: {
          none: 'You log in. MyBank checks your password and hands your browser a *session cookie*. From now on the browser attaches it to every request it sends to mybank.com.',
          token: "You log in and get a *session cookie*. MyBank's pages now also hide a secret, random *CSRF token* inside every form.",
          samesite: 'You log in and get a *session cookie* marked `SameSite=Strict`: the browser may only send it with requests that start on mybank.com.'
        }[v],
        async run(s) {
          await s.to(s.loginBtn, { s: .9 }, { dur: 90 });
          await s.to(s.loginBtn, { s: 1 }, { dur: 140 });
          await s.pop(s.env);
          await sendTo(s, s.env);
          s.gaze(s.bank, 'wide');
          await s.hide(s.env, { dur: 200 });
          const [kx, ky, , kh] = s.L.bank;
          s.set(s.jarCookie, { x: kx - 40, y: ky - kh * .7 });
          await s.pop(s.jarCookie);
          await s.move(s.jarCookie, s.L.jar[0], s.L.jar[1] - 30, { arc: 90 });
          s.gaze(s.bank, 'open');
          if (s.ssTag) s.pop(s.ssTag);
          await s.all([s.hide(s.loginView), s.show(s.acctView)]);
          if (s.tokenTag) await s.pop(s.tokenTag);
        }
      },
      {
        say: 'Still logged in, you open a new tab: *Free Kittens!* Nothing looks wrong.',
        async run(s) {
          s.win.url.textContent = 'free-kittens.example';
          await s.showTab(s.win, 1);
          await s.pop(s.kitten, { from: .7 });
          s.pop(s.heart);
          await s.hop(s.you, { h: 10 });
          await s.to(s.heart, { y: s.at(s.heart).y - 14, o: 0 }, { dur: 700 });
        }
      },
      {
        say: v === 'token'
          ? "Under the kittens is an invisible image whose address is a MyBank transfer to Mallory. It can't include your CSRF token: other sites can't read MyBank's pages."
          : "Under the kittens is an invisible image. Its address isn't a picture at all: it's a MyBank transfer to Mallory.",
        async run(s) {
          await s.to(s.kitten, { y: s.at(s.kitten).y - 8, r: -6 }, { dur: 380 });
          await s.pop(s.strip, { from: .85 });
          const [bx, by, bw, bh] = s.L.browser;
          s.ring(bx + bw / 2, by + bh - 24, { r: 22 });
          await s.pop(s.mallory);
          s.mood(s.mallory, 'grin');
          s.pop(s.hehe);
          await s.hop(s.mallory, { h: 8, n: 2, dur: 300 });
        }
      },
      {
        say: {
          none: "To load the 'image', your browser sends a request to mybank.com and, as always, attaches the mybank.com cookie. You never clicked a thing.",
          token: "To load the 'image', your browser sends a request to mybank.com and attaches your session cookie, just as before.",
          samesite: 'Your browser starts the request to mybank.com, but it began on another site, so the `SameSite` cookie stays in the jar.'
        }[v],
        async run(s) {
          await s.pop(s.req);
          if (s.is('samesite')) {
            s.set(s.flyCookie, Object.assign(s.at(s.jarCookie), { o: 1 }));
            await s.hop(s.flyCookie, { h: 26, dur: 520 });
            s.ring(s.at(s.ssTag).x, s.at(s.ssTag).y, { r: 30 });
            await s.shake(s.flyCookie, { amp: 4 });
            s.set(s.flyCookie, { o: 0 });
          } else {
            await attachCookie(s, s.req);
          }
          await sendTo(s, s.req);
        }
      },
      {
        say: {
          none: 'MyBank sees a valid session cookie, so it assumes the request came from you. $500 goes to Mallory.',
          token: 'MyBank checks the cookie (valid), then looks for the CSRF token (missing). No token, no transfer: the request is rejected.',
          samesite: "No cookie arrives, so MyBank can't tell who is asking. The transfer is rejected."
        }[v],
        async run(s) {
          await s.pop(s.card);
          await tick(s, s.card, 0, !s.is('samesite'));
          if (s.is('token')) { await s.wait(250); await tick(s, s.card, 1, false); }
          await s.wait(250);
          s.gaze(s.bank, 'open');
          if (s.is('none')) {
            await s.stamp(s.verdict);
            s.mood(s.you, 'shock');
            await s.all([
              s.count(s.balance.label, 1200, 700, { fmt: n => 'Balance $' + Math.round(n).toLocaleString('en-AU'), dur: 900 }),
              payOut(s, 5)
            ]);
            s.set(s.hehe, { o: 0 });
            s.pop(s.kaching);
            await s.hop(s.mallory, { h: 14, n: 2 });
          } else {
            await s.stamp(s.denied);
            s.shake(s.req, { amp: 6 });
            s.mood(s.mallory, 'sad');
            s.set(s.hehe, { o: 0 });
            s.pop(s.drat);
            await s.wobble(s.mallory, { amp: 6 });
          }
        }
      },
      {
        say: {
          none: 'The bank checked *who* sent the request, but not whether you *meant* to. That gap is CSRF. Defences: a CSRF token in every form, `SameSite` cookies, and never changing data with a GET request.',
          token: "Your real transfers still work. MyBank's own form includes the token, so the cookie and the token both check out.",
          samesite: 'Requests that start on mybank.com still carry the cookie, so your real transfers work as normal.'
        }[v],
        async run(s) {
          if (s.is('none')) {
            const e = s.at(s.req);
            await s.ring(e.x + 24, e.y - 18, { r: 16, cls: 'is-bad' });
            s.ring(e.x + 24, e.y - 18, { r: 16, cls: 'is-bad' });
            s.mood(s.you, 'sad');
            return;
          }
          await s.all([s.hide(s.req), s.hide(s.denied), s.hide(s.card), s.hide(s.strip)]);
          s.card.rows.forEach(r => { s.set(r.yes, { o: 0 }); s.set(r.no, { o: 0 }); });
          s.mood(s.mallory, 'flat');
          s.hide(s.drat);
          s.win.url.textContent = 'mybank.com';
          await s.showTab(s.win, 0);
          await s.all([s.type(s.toField, 'gran'), s.type(s.amtField, '50')]);
          await s.to(s.sendBtn, { s: .9 }, { dur: 90 });
          await s.to(s.sendBtn, { s: 1 }, { dur: 140 });
          await s.pop(s.good);
          if (s.is('token')) {
            s.set(s.good.key, { o: 1 });
            await s.hop(s.good, { h: 4, dur: 240 });
          }
          await attachCookie(s, s.good);
          await sendTo(s, s.good);
          await s.pop(s.card);
          await tick(s, s.card, 0, true);
          if (s.is('token')) await tick(s, s.card, 1, true);
          s.gaze(s.bank, 'open');
          await s.stamp(s.verdict);
          await s.count(s.balance.label, 1200, 1150, { fmt: n => 'Balance $' + Math.round(n).toLocaleString('en-AU'), dur: 600 });
          s.mood(s.you, 'happy');
          await s.hop(s.you, { h: 8 });
        }
      }
    ];
  }

  HSCAnim.define('csrf', {
    title: 'Cross-site request forgery: how a kitten page can spend your money',
    variantsLabel: 'Defence',
    layouts: {
      wide: {
        size: [760, 452],
        browser: [22, 28, 322, 262], jar: [70, 412], you: [172, 412], mallory: [420, 412],
        bank: [630, 322, 178, 150], balance: [630, 360], card: [630, 48], out: [380, 176], arrive: [468, 258]
      },
      tall: {
        size: [400, 744],
        browser: [14, 14, 372, 262], jar: [62, 376], you: [170, 376], mallory: [322, 376],
        bank: [258, 668, 170, 140], balance: [258, 706], card: [258, 404], out: [200, 300], arrive: [86, 560]
      }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: beats(id) }))
  });
})();
