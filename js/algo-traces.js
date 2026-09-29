/* ============================================================
   Algorithm trace definitions (data only).
   Each definition is rendered by js/algo-trace.js. To add an
   algorithm: lay out nodes/edges/labels, write the NESA
   pseudocode as token arrays, and a generator that yields steps.

   node.line  → pseudocode line index (or array of indices)
   step       → { node, tone: 'on'|'yes'|'no', cells: {i: 'on'|'seen'|'hit'},
                  vars, pointers, array, count: true, result, say }
   ============================================================ */

(() => {
  const T = window.HSCTrace;
  if (!T) return;

  const seen = (upTo, extra) => {
    const c = {};
    for (let k = 0; k < upTo; k++) c[k] = 'seen';
    return Object.assign(c, extra);
  };

  /* ── Linear search ─────────────────────────────────────── */
  T.define('linearSearch', {
    title: 'Linear search',
    size: [380, 350],
    nodes: {
      start: { x: 160, y: 24, w: 200, h: 32, shape: 'stadium', text: 'BEGIN linearSearch', line: 0 },
      init:  { x: 160, y: 80, w: 110, h: 32, shape: 'rect', text: 'i ← 0', line: 1 },
      loop:  { x: 160, y: 150, w: 150, h: 64, shape: 'diamond', text: 'i < LEN(A)?', line: 2 },
      cmp:   { x: 160, y: 240, w: 170, h: 64, shape: 'diamond', text: 'A[i] = target?', line: 3 },
      found: { x: 315, y: 240, w: 100, h: 32, shape: 'stadium', text: 'RETURN i', line: 4 },
      inc:   { x: 160, y: 320, w: 110, h: 32, shape: 'rect', text: 'i ← i + 1', line: 6 },
      none:  { x: 315, y: 150, w: 100, h: 32, shape: 'stadium', text: 'RETURN −1', line: 8 }
    },
    edges: {
      'start-init': 'M160 40 V64',
      'init-loop':  'M160 96 V118',
      'loop-cmp':   'M160 182 V208',
      'loop-none':  'M235 150 H265',
      'cmp-found':  'M245 240 H265',
      'cmp-inc':    'M160 272 V304',
      'inc-loop':   'M105 320 H20 V150 H85'
    },
    labels: [['yes', 168, 200], ['no', 240, 142], ['yes', 246, 232], ['no', 168, 292]],
    code: [
      ['BEGIN', ' linearSearch(A, target)'],
      ['    i ← 0'],
      ['    WHILE', ' i < LEN(A)'],
      ['        IF', ' A[i] = target ', 'THEN'],
      ['            RETURN', ' i'],
      ['        ENDIF'],
      ['        i ← i + 1'],
      ['    ENDWHILE'],
      ['    RETURN', ' −1'],
      ['END']
    ],
    data: { A: [7, 3, 9, 4, 12, 5], target: 4 },
    showInput: true,
    input: {
      key: 'target', label: 'Target', type: 'number',
      examples: [{ value: 4 }, { value: 7 }, { value: 5 }, { value: 8, text: '8 (absent)' }]
    },
    *run({ A, target }) {
      yield { node: 'start', say: `Start linear search for ${target}.` };
      let i = 0;
      yield { node: 'init', vars: { i }, pointers: { i }, say: 'Set i to 0.' };
      for (;;) {
        const base = { vars: { i }, pointers: i < A.length ? { i } : {} };
        if (i >= A.length) {
          yield { ...base, node: 'loop', tone: 'no', cells: seen(A.length),
            say: `Is i = ${i} less than ${A.length}? No. Every item has been checked.` };
          yield { ...base, node: 'none', tone: 'no', cells: seen(A.length), result: 'RETURN −1',
            say: `${target} is not in the list. Return −1.` };
          return;
        }
        yield { ...base, node: 'loop', tone: 'yes', cells: seen(i),
          say: `Is i = ${i} less than ${A.length}? Yes.` };
        const hit = A[i] === target;
        yield { ...base, node: 'cmp', tone: hit ? 'yes' : 'no', count: true,
          cells: seen(i, { [i]: hit ? 'hit' : 'on' }),
          say: `Compare A[${i}] = ${A[i]} with target ${target}: ${hit ? 'yes' : 'no'}.` };
        if (hit) {
          yield { ...base, node: 'found', tone: 'yes', cells: seen(i, { [i]: 'hit' }), result: `RETURN ${i}`,
            say: `Found ${target} at index ${i}. Return ${i}.` };
          return;
        }
        i++;
        yield { vars: { i }, pointers: i < A.length ? { i } : {}, node: 'inc', cells: seen(i),
          say: `Increment i to ${i}.` };
      }
    }
  });

  /* ── Binary search ─────────────────────────────────────── */
  T.define('binarySearch', {
    title: 'Binary search',
    size: [380, 540],
    nodes: {
      start: { x: 160, y: 24, w: 200, h: 32, shape: 'stadium', text: 'BEGIN binarySearch', line: 0 },
      init:  { x: 160, y: 84, w: 170, h: 44, shape: 'rect', text: 'low ← 0\nhigh ← LEN(A) − 1', line: [1, 2] },
      loop:  { x: 160, y: 164, w: 150, h: 64, shape: 'diamond', text: 'low ≤ high?', line: 3 },
      mid:   { x: 160, y: 236, w: 180, h: 32, shape: 'rect', text: 'mid ← (low+high) DIV 2', line: 4 },
      eq:    { x: 160, y: 310, w: 170, h: 64, shape: 'diamond', text: 'A[mid] = target?', line: 5 },
      found: { x: 315, y: 310, w: 100, h: 32, shape: 'stadium', text: 'RETURN mid', line: 6 },
      lt:    { x: 160, y: 400, w: 170, h: 64, shape: 'diamond', text: 'A[mid] < target?', line: 8 },
      up:    { x: 315, y: 400, w: 110, h: 32, shape: 'rect', text: 'low ← mid + 1', line: 9 },
      down:  { x: 160, y: 480, w: 120, h: 32, shape: 'rect', text: 'high ← mid − 1', line: 11 },
      none:  { x: 315, y: 164, w: 100, h: 32, shape: 'stadium', text: 'RETURN −1', line: 15 }
    },
    edges: {
      'start-init': 'M160 40 V62',
      'init-loop':  'M160 106 V132',
      'loop-mid':   'M160 196 V220',
      'loop-none':  'M235 164 H265',
      'mid-eq':     'M160 252 V278',
      'eq-found':   'M245 310 H265',
      'eq-lt':      'M160 342 V368',
      'lt-up':      'M245 400 H260',
      'lt-down':    'M160 432 V464',
      'up-loop':    'M315 416 V520 H20 V164 H85',
      'down-loop':  'M100 480 H20 V164 H85'
    },
    labels: [['yes', 168, 212], ['no', 240, 156], ['yes', 246, 302], ['no', 168, 360],
             ['yes', 246, 392], ['no', 168, 452]],
    code: [
      ['BEGIN', ' binarySearch(A, target)'],
      ['    low ← 0'],
      ['    high ← LEN(A) − 1'],
      ['    WHILE', ' low ≤ high'],
      ['        mid ← (low + high) ', 'DIV', ' 2'],
      ['        IF', ' A[mid] = target ', 'THEN'],
      ['            RETURN', ' mid'],
      ['        ELSE'],
      ['            IF', ' A[mid] < target ', 'THEN'],
      ['                low ← mid + 1'],
      ['            ELSE'],
      ['                high ← mid − 1'],
      ['            ENDIF'],
      ['        ENDIF'],
      ['    ENDWHILE'],
      ['    RETURN', ' −1'],
      ['END']
    ],
    data: { A: [3, 5, 8, 12, 17, 21, 26, 30], target: 21 },
    showInput: true,
    input: {
      key: 'target', label: 'Target', type: 'number',
      examples: [{ value: 21 }, { value: 3 }, { value: 30 }, { value: 10, text: '10 (absent)' }]
    },
    *run({ A, target }) {
      // Cells outside [low, high] have been ruled out.
      const range = (low, high, extra) => {
        const c = {};
        A.forEach((_, k) => { if (k < low || k > high) c[k] = 'seen'; });
        return Object.assign(c, extra);
      };
      yield { node: 'start', say: `Start binary search for ${target}. The list must be sorted.` };
      let low = 0, high = A.length - 1;
      yield { node: 'init', vars: { low, high }, pointers: { low, high },
        say: `Set low to 0 and high to ${high}.` };
      for (;;) {
        const p = { low, high };
        if (low > high) {
          yield { node: 'loop', tone: 'no', vars: p, cells: range(1, 0),
            say: `Is low = ${low} ≤ high = ${high}? No. The search range is empty.` };
          yield { node: 'none', tone: 'no', vars: p, cells: range(1, 0), result: 'RETURN −1',
            say: `${target} is not in the list. Return −1.` };
          return;
        }
        yield { node: 'loop', tone: 'yes', vars: p, pointers: p, cells: range(low, high),
          say: `Is low = ${low} ≤ high = ${high}? Yes.` };
        const mid = Math.floor((low + high) / 2);
        const q = { low, high, mid };
        yield { node: 'mid', vars: q, pointers: q, cells: range(low, high, { [mid]: 'on' }),
          say: `mid = (${low} + ${high}) DIV 2 = ${mid}.` };
        const hit = A[mid] === target;
        yield { node: 'eq', tone: hit ? 'yes' : 'no', count: true, vars: q, pointers: q,
          cells: range(low, high, { [mid]: hit ? 'hit' : 'on' }),
          say: `Compare A[${mid}] = ${A[mid]} with target ${target}: ${hit ? 'equal' : 'not equal'}.` };
        if (hit) {
          yield { node: 'found', tone: 'yes', vars: q, pointers: { mid }, cells: range(mid, mid, { [mid]: 'hit' }),
            result: `RETURN ${mid}`, say: `Found ${target} at index ${mid}. Return ${mid}.` };
          return;
        }
        const less = A[mid] < target;
        yield { node: 'lt', tone: less ? 'yes' : 'no', vars: q, pointers: q,
          cells: range(low, high, { [mid]: 'on' }),
          say: `Is ${A[mid]} less than ${target}? ${less ? 'Yes, so the target is to the right.' : 'No, so the target is to the left.'}` };
        if (less) {
          low = mid + 1;
          yield { node: 'up', vars: { low, high, mid }, pointers: { low, high }, cells: range(low, high),
            say: `Discard the left half. low becomes ${low}.` };
        } else {
          high = mid - 1;
          yield { node: 'down', vars: { low, high, mid }, pointers: { low, high }, cells: range(low, high),
            say: `Discard the right half. high becomes ${high}.` };
        }
      }
    }
  });

  /* ── Bubble sort ───────────────────────────────────────── */
  T.define('bubbleSort', {
    title: 'Bubble sort',
    counter: 'Comparisons',
    size: [390, 570],
    nodes: {
      start: { x: 160, y: 22, w: 190, h: 32, shape: 'stadium', text: 'BEGIN bubbleSort', line: 0 },
      init:  { x: 160, y: 78, w: 150, h: 44, shape: 'rect', text: 'n ← LEN(A)\nswapped ← TRUE', line: [1, 2] },
      outer: { x: 160, y: 156, w: 150, h: 60, shape: 'diamond', text: 'swapped?', line: 3 },
      done:  { x: 320, y: 156, w: 100, h: 32, shape: 'stadium', text: 'RETURN A', line: 13 },
      reset: { x: 160, y: 228, w: 160, h: 44, shape: 'rect', text: 'swapped ← FALSE\ni ← 0', line: [4, 5] },
      inner: { x: 160, y: 308, w: 150, h: 60, shape: 'diamond', text: 'i ≤ n − 2?', line: 5 },
      cmp:   { x: 160, y: 392, w: 150, h: 64, shape: 'diamond', text: 'A[i] > A[i+1]?', line: 6 },
      swap:  { x: 315, y: 392, w: 130, h: 44, shape: 'rect', text: 'swap A[i], A[i+1]\nswapped ← TRUE', line: [7, 8] },
      inc:   { x: 160, y: 476, w: 110, h: 32, shape: 'rect', text: 'i ← i + 1', line: 10 },
      dec:   { x: 160, y: 540, w: 110, h: 32, shape: 'rect', text: 'n ← n − 1', line: 11 }
    },
    edges: {
      'start-init':  'M160 38 V56',
      'init-outer':  'M160 100 V126',
      'outer-done':  'M235 156 H270',
      'outer-reset': 'M160 186 V206',
      'reset-inner': 'M160 250 V278',
      'inner-cmp':   'M160 338 V360',
      'inner-dec':   'M235 308 H385 V540 H215',
      'cmp-swap':    'M235 392 H250',
      'cmp-inc':     'M160 424 V460',
      'swap-inc':    'M315 414 V446 H160 V460',
      'inc-inner':   'M105 476 H40 V308 H85',
      'dec-outer':   'M105 540 H16 V156 H85'
    },
    labels: [['no', 242, 148], ['yes', 168, 200], ['yes', 168, 352], ['no', 242, 300],
             ['yes', 238, 380], ['no', 168, 440]],
    code: [
      ['BEGIN', ' bubbleSort(A)'],
      ['    n ← LEN(A)'],
      ['    swapped ← ', 'TRUE'],
      ['    WHILE', ' swapped'],
      ['        swapped ← ', 'FALSE'],
      ['        FOR', ' i ← 0 ', 'TO', ' n − 2'],
      ['            IF', ' A[i] > A[i + 1] ', 'THEN'],
      ['                swap A[i] and A[i + 1]'],
      ['                swapped ← ', 'TRUE'],
      ['            ENDIF'],
      ['        NEXT', ' i'],
      ['        n ← n − 1'],
      ['    ENDWHILE'],
      ['    RETURN', ' A'],
      ['END']
    ],
    data: { A: [5, 1, 4, 2, 8] },
    input: {
      key: 'A', label: 'List', type: 'list', max: 8,
      examples: [{ value: [5, 1, 4, 2, 8] }, { value: [1, 2, 3, 4, 5], text: 'sorted' }, { value: [9, 7, 5, 3, 1], text: 'reversed' }]
    },
    *run({ A }) {
      const len = A.length;
      const sorted = (n, extra) => {
        const c = {};
        for (let k = n; k < len; k++) c[k] = 'hit';
        return Object.assign(c, extra);
      };
      const snap = () => A.slice();
      yield { node: 'start', array: snap(), say: 'Start bubble sort.' };
      let n = len, swapped = true;
      yield { node: 'init', array: snap(), vars: { n, swapped }, say: `Set n to ${n} and swapped to TRUE.` };
      for (;;) {
        if (!swapped) {
          yield { node: 'outer', tone: 'no', array: snap(), vars: { n, swapped }, cells: sorted(0),
            say: 'Was anything swapped in the last pass? No, so the list is sorted.' };
          yield { node: 'done', tone: 'yes', array: snap(), vars: { n }, cells: sorted(0),
            result: 'RETURN [' + A.join(', ') + ']', say: 'Sorted: ' + A.join(', ') + '.' };
          return;
        }
        yield { node: 'outer', tone: 'yes', array: snap(), vars: { n, swapped }, cells: sorted(n),
          say: 'swapped is TRUE, so make another pass.' };
        swapped = false;
        let i = 0;
        yield { node: 'reset', array: snap(), vars: { n, swapped, i }, pointers: { i }, cells: sorted(n),
          say: 'Set swapped to FALSE and i to 0.' };
        for (;;) {
          const v = { n, swapped, i };
          if (i > n - 2) {
            yield { node: 'inner', tone: 'no', array: snap(), vars: v, cells: sorted(n),
              say: `Is i = ${i} ≤ n − 2 = ${n - 2}? No. End of this pass.` };
            break;
          }
          const pp = { i, 'i+1': i + 1 };
          yield { node: 'inner', tone: 'yes', array: snap(), vars: v, pointers: pp, cells: sorted(n),
            say: `Is i = ${i} ≤ n − 2 = ${n - 2}? Yes.` };
          const gt = A[i] > A[i + 1];
          yield { node: 'cmp', tone: gt ? 'yes' : 'no', count: true, array: snap(), vars: v, pointers: pp,
            cells: sorted(n, { [i]: 'on', [i + 1]: 'on' }),
            say: `Compare A[${i}] = ${A[i]} with A[${i + 1}] = ${A[i + 1]}: ${gt ? 'out of order' : 'in order'}.` };
          if (gt) {
            [A[i], A[i + 1]] = [A[i + 1], A[i]];
            swapped = true;
            yield { node: 'swap', array: snap(), vars: { n, swapped, i }, pointers: pp,
              cells: sorted(n, { [i]: 'on', [i + 1]: 'on' }),
              say: `Swap them. The list is now ${A.join(', ')}.` };
          }
          i++;
          yield { node: 'inc', array: snap(), vars: { n, swapped, i }, pointers: { i }, cells: sorted(n),
            say: `Increment i to ${i}.` };
        }
        n--;
        yield { node: 'dec', array: snap(), vars: { n, swapped }, cells: sorted(n),
          say: `The largest remaining value is in place. n becomes ${n}.` };
      }
    }
  });

  /* ── Counting loop with an accumulator ─────────────────── */
  T.define('sumList', {
    title: 'Accumulator loop',
    counter: 'Loop tests',
    size: [380, 330],
    nodes: {
      start: { x: 160, y: 22, w: 180, h: 32, shape: 'stadium', text: 'BEGIN sumList', line: 0 },
      init:  { x: 160, y: 82, w: 120, h: 44, shape: 'rect', text: 'total ← 0\ni ← 0', line: [1, 2] },
      loop:  { x: 160, y: 160, w: 150, h: 60, shape: 'diamond', text: 'i < LEN(A)?', line: 3 },
      add:   { x: 160, y: 236, w: 170, h: 32, shape: 'rect', text: 'total ← total + A[i]', line: 4 },
      inc:   { x: 160, y: 296, w: 110, h: 32, shape: 'rect', text: 'i ← i + 1', line: 5 },
      done:  { x: 315, y: 160, w: 110, h: 32, shape: 'stadium', text: 'RETURN total', line: 7 }
    },
    edges: {
      'start-init': 'M160 38 V60',
      'init-loop':  'M160 104 V130',
      'loop-add':   'M160 190 V220',
      'loop-done':  'M235 160 H260',
      'add-inc':    'M160 252 V280',
      'inc-loop':   'M105 296 H20 V160 H85'
    },
    labels: [['yes', 168, 208], ['no', 240, 152]],
    code: [
      ['BEGIN', ' sumList(A)'],
      ['    total ← 0'],
      ['    i ← 0'],
      ['    WHILE', ' i < LEN(A)'],
      ['        total ← total + A[i]'],
      ['        i ← i + 1'],
      ['    ENDWHILE'],
      ['    RETURN', ' total'],
      ['END']
    ],
    data: { A: [4, 7, 2, 9, 3] },
    input: {
      key: 'A', label: 'List', type: 'list', max: 10,
      examples: [{ value: [4, 7, 2, 9, 3] }, { value: [10, -4, 6] }, { value: [5] }]
    },
    *run({ A }) {
      yield { node: 'start', say: 'Start summing the list.' };
      let total = 0, i = 0;
      yield { node: 'init', vars: { total, i }, pointers: { i }, say: 'Set total and i to 0.' };
      for (;;) {
        if (i >= A.length) {
          yield { node: 'loop', tone: 'no', count: true, vars: { total, i }, cells: seen(A.length),
            say: `Is i = ${i} less than ${A.length}? No. The loop ends.` };
          yield { node: 'done', tone: 'yes', vars: { total }, cells: seen(A.length), result: `RETURN ${total}`,
            say: `Return the total, ${total}.` };
          return;
        }
        yield { node: 'loop', tone: 'yes', count: true, vars: { total, i }, pointers: { i }, cells: seen(i),
          say: `Is i = ${i} less than ${A.length}? Yes.` };
        const before = total;
        total += A[i];
        yield { node: 'add', vars: { total, i }, pointers: { i }, cells: seen(i, { [i]: 'on' }),
          say: `Add A[${i}] = ${A[i]}: total goes from ${before} to ${total}.` };
        i++;
        yield { node: 'inc', vars: { total, i }, pointers: i < A.length ? { i } : {}, cells: seen(i),
          say: `Increment i to ${i}.` };
      }
    }
  });
})();
