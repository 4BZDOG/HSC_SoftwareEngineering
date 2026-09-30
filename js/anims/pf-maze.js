/* Animated diagram: backtracking through a small maze with a recursive find_path.
   Programming Fundamentals › Divide and conquer, and backtracking.
   The search order is right, down, left, up, exactly as in the Python on the page.
   Events are computed once from the maze, so the animation cannot disagree with the code. */
(() => {
  const MAZE = ['...#.',
                '##.#.',
                '.....',
                '.####',
                '.....'];
  const COLS = MAZE[0].length, ROWS = MAZE.length;
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];   // right, down, left, up
  const CELL = 64;

  // Run the real search once and record what happens: visit, back (dead end), exit, path (success unwinding).
  const EVENTS = (() => {
    const ev = [], seen = new Set();
    const go = (x, y) => {
      if (x === COLS - 1 && y === ROWS - 1) { ev.push(['exit', x, y], ['path', x, y]); return true; }
      if (x < 0 || y < 0 || x >= COLS || y >= ROWS || MAZE[y][x] === '#' || seen.has(x + ',' + y)) return false;
      seen.add(x + ',' + y); ev.push(['visit', x, y]);
      for (const [dx, dy] of DIRS) if (go(x + dx, y + dy)) { ev.push(['path', x, y]); return true; }
      ev.push(['back', x, y]);
      return false;
    };
    go(0, 0);
    return ev;
  })();

  // Index of the first event that has not happened yet at each stopping point.
  const idx = (kind, x, y) => EVENTS.findIndex(e => e[0] === kind && e[1] === x && e[2] === y) + 1;
  const STOPS = [0, idx('visit', 2, 2), idx('visit', 4, 2), idx('visit', 4, 0), idx('back', 3, 2),
                 idx('visit', 0, 2), idx('visit', 3, 4), idx('exit', 4, 4), EVENTS.length];

  const TONE = { open: 'f-paper', wall: 'f-ink', visit: 'f-mustard-t', back: 'f-terra', path: 'f-sage' };
  const centre = (s, x, y) => [s.gx + x * CELL + CELL / 2, s.gy + y * CELL + CELL / 2];

  function draw(s) {
    const state = {}, stack = [];
    for (let i = 0; i < s.k; i++) {
      const [kind, x, y] = EVENTS[i], key = x + ',' + y;
      if (kind === 'visit') { state[key] = 'visit'; stack.push([x, y]); }
      else if (kind === 'back') { state[key] = 'back'; stack.pop(); }
      else if (kind === 'exit') { state[key] = 'path'; stack.push([x, y]); }
      else { state[key] = 'path'; stack.pop(); }
    }
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const wall = MAZE[y][x] === '#';
      s.cells[y][x].setAttribute('class', TONE[wall ? 'wall' : (state[x + ',' + y] || 'open')]);
    }
    s.rows.forEach((row, i) => {
      const item = stack[i];
      row.textContent = item ? `find_path(${item[0]}, ${item[1]})` : '';
      row.setAttribute('class', 'pa-mono' + (i === stack.length - 1 ? ' pa-strong' : ' pa-soft'));
    });
    s.depth.textContent = stack.length ? `depth ${stack.length}` : '';
  }

  // Walk the search forward to event `to`, one step at a time.
  async function advance(s, to) {
    while (s.k < to) {
      const [kind, x, y] = EVENTS[s.k];
      s.k++;
      draw(s);
      const [cx, cy] = centre(s, x, y);
      await s.move(s.walker, cx, cy + 20, { dur: 240 });
      if (kind === 'back') await s.wobble(s.walker);
    }
  }

  function setup(s) {
    const wide = !s.compact;
    s.gx = wide ? 24 : (s.W - COLS * CELL) / 2;
    s.gy = 24;
    s.k = 0;
    s.cells = [];
    const grid = s.g(s.root);
    grid.setAttribute('filter', 'url(#pa-cut)');
    for (let y = 0; y < ROWS; y++) {
      s.cells.push([]);
      for (let x = 0; x < COLS; x++) {
        s.cells[y].push(s.el('rect', { x: s.gx + x * CELL + 2, y: s.gy + y * CELL + 2, width: CELL - 4, height: CELL - 4, rx: 5, class: 'f-paper' }, grid));
      }
    }
    const [sx, sy] = centre(s, 0, 0), [ex, ey] = centre(s, COLS - 1, ROWS - 1);
    s.text(s.root, 'S', { x: sx - 18, y: sy - 14, cls: 'pa-t-lg pa-strong', valign: 'middle' });
    s.text(s.root, 'E', { x: ex + 18, y: ey + 14, cls: 'pa-t-lg pa-strong', valign: 'middle' });

    // Legend
    const ly = s.gy + ROWS * CELL + 22;
    const lx = s.gx + (wide ? 0 : 8);
    [['f-mustard-t', 'visited'], ['f-terra', 'dead end'], ['f-sage', 'final path']].forEach(([c, t], i) => {
      const x = lx + i * (wide ? 112 : 118);
      s.el('rect', { x, y: ly - 11, width: 16, height: 16, rx: 3, class: c }, s.root);
      s.text(s.root, t, { x: x + 22, y: ly - 3, anchor: 'start', cls: 'pa-t-sm', valign: 'middle' });
    });

    // Call stack panel
    const px = wide ? 430 : 60, py = wide ? 30 : ly + 40;
    s.text(s.root, 'Call stack', { x: px, y: py, anchor: 'start', cls: 'pa-title' });
    s.depth = s.text(s.root, '', { x: px + (wide ? 250 : 240), y: py, anchor: 'end', cls: 'pa-name' });
    const rowH = wide ? 24 : 20;
    s.el('path', { d: `M${px} ${py + 10} H${px + (wide ? 250 : 240)}`, class: 'pa-section-line' }, s.back);
    s.rows = Array.from({ length: 14 }, (_, i) => s.text(s.root, '', { x: px + 6, y: py + 32 + i * rowH, anchor: 'start', cls: 'pa-mono', size: 13 }));

    // The walker
    const [wx, wy] = centre(s, 0, 0);
    s.walker = s.folk(s.root, { tone: 'teal', mood: 'happy', at: { x: wx, y: wy + 20, s: .52 } });
    draw(s);
  }

  const go = to => ({ async run(s) { await advance(s, to); } });

  const beats = [
    { say: 'The maze: start at *S*, reach *E*. Dark squares are walls. The function tries directions in the order right, down, left, up, and marks every square it enters as *visited*.' },
    { say: 'From *S* it goes right twice, hits a wall, so it tries down and reaches the square with the first junction. Each new square is another call on the *call stack*.', ...go(STOPS[1]) },
    { say: 'At the junction it tries *right* first, so it follows row three to the east wall. The stack is getting deeper, but the choice has not been proved wrong yet.', ...go(STOPS[2]) },
    { say: 'Right is blocked, down is a wall, left is visited, so it tries *up* into a pocket. The top-right square has no unvisited neighbours left: a *dead end*.', ...go(STOPS[3]) },
    { say: '*Backtrack*: each call returns False and comes off the stack, returning control to the earlier call. The wrong turn is undone back to the junction, and the squares are marked as dead ends.', ...go(STOPS[4]) },
    { say: 'Back at the junction, right has failed and down is a wall, so the next direction in the list, *left*, is tried. The search now heads down the west side.', ...go(STOPS[5]) },
    { say: 'It goes down to the bottom row, then right along it. Every square tried here was open, so nothing is undone.', ...go(STOPS[6]) },
    { say: 'The next square is the exit, so that call returns True. The base case has been reached.', ...go(STOPS[7]) },
    { say: 'True is passed back up through every waiting call, each one returning True too. The squares still on the stack when the exit was found are the *solution path*, shown in green.', ...go(STOPS[8]) }
  ];

  HSCAnim.define('pf-maze', {
    title: 'Backtracking through a maze with a recursive function',
    layouts: {
      wide: { size: [740, 400] },
      tall: { size: [400, 720] }
    },
    setup,
    beats
  });
})();
