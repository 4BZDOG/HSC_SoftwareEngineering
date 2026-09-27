/* Animated diagram: a race condition on a bank balance, with and without a lock.
   Secure Software Architecture › Secure user action controls. */
(() => {
  const VARIANTS = { race: 'No lock', lock: 'With a lock' };
  const money = n => '$' + Math.round(n).toLocaleString('en-AU');

  function setup(s) {
    const L = s.L;
    const [kx, ky] = L.bank;
    s.bank = s.building(s.root, { at: { x: kx, y: ky }, w: 170, h: 130, roof: 'bank', tone: 'sage', sign: 'Bank DB', face: true });
    s.balance = s.tag(s.root, { text: 'balance ' + money(600), x: L.balance[0], y: L.balance[1], w: 150, size: 13 });
    s.total = s.tag(s.root, { text: 'paid out ' + money(0), x: L.total[0], y: L.total[1], w: 150, size: 13 });
    s.dbLock = s.padlock(s.front, { at: { x: kx, y: ky - 190, s: 1.4, o: 0 }, open: true, tone: 'mustard' });

    s.req = ['A', 'B'].map((id, i) => {
      const [x, y] = L.req[i];
      const f = s.folk(s.root, { at: { x, y }, tone: i ? 'mustard' : 'teal', name: 'Request ' + id });
      const want = s.tag(s.root, { text: 'withdraw $500', x, y: y - 82, size: 11, tone: i ? 'mustard' : 'blush' });
      const saw = s.tag(s.front, { text: 'read $600', x, y: y - 112, mono: true, size: 11, w: 96 });
      s.set(saw, { o: 0 });
      const paid = s.tag(s.root, { text: 'paid $0', x, y: y + 40, size: 11, w: 84 });
      const wait = s.bubble(s.front, { text: 'waiting…', at: { x: x + 10, y: y - 128 }, dx: i ? -30 : 30 });
      const no = s.stampMark(s.front, { text: 'DECLINED', tone: 'terra', at: { x, y: y - 30 } });
      return { f, want, saw, paid, wait, no, x, y };
    });
    s.paidTotal = 0;
    s.bal = 600;
  }

  // A copy of the balance flies to the request: what it "saw".
  async function read(s, i, value) {
    const r = s.req[i];
    const b = s.at(s.balance);
    s.req[i].saw.label.textContent = 'read ' + money(value);
    const home = { x: r.x, y: r.y - 112 };
    s.set(r.saw, { x: b.x, y: b.y, o: 1, s: .6 });
    await s.all([s.move(r.saw, home.x, home.y, { arc: 60 }), s.to(r.saw, { s: 1 }, { dur: 700 })]);
    await s.hop(r.f, { h: 6 });
  }

  async function pay(s, i) {
    const r = s.req[i];
    const [kx, ky] = s.L.bank;
    const jobs = [];
    for (let n = 0; n < 3; n++) {
      const c = s.coin(s.front, { at: { x: kx, y: ky - 40 } });
      jobs.push(s.move(c, r.x + 30 + n * 6, r.y - 6 - n * 5, { arc: 70, dur: 600, delay: n * 120 }));
    }
    await s.all(jobs);
    s.paidTotal += 500;
    r.paid.label.textContent = 'paid $500';
    await s.count(s.total.label, s.paidTotal - 500, s.paidTotal, { fmt: v => 'paid out ' + money(v), dur: 500 });
  }

  async function write(s, from, to) {
    s.gaze(s.bank, 'wide');
    await s.count(s.balance.label, from, to, { fmt: v => 'balance ' + money(v), dur: 600 });
    s.ring(s.at(s.balance).x, s.at(s.balance).y, { r: 26 });
    s.gaze(s.bank, 'open');
  }

  async function lock(s, closed) {
    if (closed) {
      await s.pop(s.dbLock, { s: 1.4 });
      await s.lock(s.dbLock, true);
    } else {
      await s.lock(s.dbLock, false);
      await s.hide(s.dbLock);
    }
  }

  const intro = { say: 'Your account holds $600. Two requests to withdraw $500 arrive at almost the same moment: perhaps a double-click, or two apps at once.' };

  const BEATS = {
    race: [
      intro,
      { say: 'Request A *reads* the balance: $600.', run: s => read(s, 0, 600) },
      { say: "Before A has finished, Request B reads the balance too. A hasn't written anything yet, so B also sees $600.", run: s => read(s, 1, 600) },
      {
        say: 'A checks 600 ≥ 500, pays out $500 and *writes* the new balance: 600 − 500 = $100.',
        async run(s) { await pay(s, 0); await write(s, 600, 100); }
      },
      {
        say: "B checks its old copy, 600 ≥ 500, pays out $500 and writes 600 − 500 = $100 over A's result.",
        async run(s) { await pay(s, 1); await write(s, 100, 100); }
      },
      {
        say: "$1,000 has left a $600 account, yet the balance says $100. The two requests' reads and writes interleaved: that is a *race condition*.",
        async run(s) {
          s.total.label.classList.add('is-bad');
          const t = s.at(s.total);
          await s.ring(t.x, t.y, { r: 40, cls: 'is-bad' });
          s.ring(t.x, t.y, { r: 40, cls: 'is-bad' });
          s.mood(s.req[0].f, 'grin');
          s.mood(s.req[1].f, 'grin');
          await s.wobble(s.bank, { amp: 3 });
        }
      }
    ],
    lock: [
      intro,
      {
        say: 'Request A *locks* the account first, then reads the balance: $600.',
        async run(s) { await lock(s, true); await read(s, 0, 600); }
      },
      {
        say: 'Request B tries to read, but the account is locked, so B has to wait its turn.',
        async run(s) {
          const r = s.req[1];
          await s.shake(r.f, { amp: 4 });
          s.mood(r.f, 'flat');
          await s.pop(r.wait);
        }
      },
      {
        say: 'A pays out $500, writes the new balance of $100, and then *unlocks* the account.',
        async run(s) { await pay(s, 0); await write(s, 600, 100); await lock(s, false); }
      },
      {
        say: 'Now B locks and reads the *fresh* balance: $100. The check 100 ≥ 500 fails, so the withdrawal is declined.',
        async run(s) {
          const r = s.req[1];
          await s.hide(r.wait, { dur: 150 });
          await lock(s, true);
          await read(s, 1, 100);
          s.mood(r.f, 'sad');
          await s.stamp(r.no);
          await lock(s, false);
        }
      },
      {
        say: 'Only $500 has been paid and the balance is right. The lock turns read, check and write into one *atomic* step; in SQL, a transaction using `SELECT … FOR UPDATE`.',
        async run(s) {
          const t = s.at(s.total);
          s.ring(t.x, t.y, { r: 40, cls: 'is-good' });
          await s.hop(s.bank, { h: 4 });
        }
      }
    ]
  };

  HSCAnim.define('race-condition', {
    title: 'A race condition: two withdrawals and one balance',
    variantsLabel: 'Database',
    layouts: {
      wide: { size: [760, 390], bank: [380, 282], balance: [380, 320], total: [380, 366], req: [[120, 294], [640, 294]] },
      tall: { size: [400, 660], bank: [200, 520], balance: [200, 558], total: [200, 610], req: [[92, 250], [308, 250]] }
    },
    setup,
    variants: Object.keys(VARIANTS).map(id => ({ id, label: VARIANTS[id], beats: BEATS[id] }))
  });
})();
