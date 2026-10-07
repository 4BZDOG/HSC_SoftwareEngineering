/* Git sandbox: commit, branch, switch and merge on a small history graph, and see when two branches collide.
   Built on the shared lab kit (css/labs.css, js/labs.js). Nothing is stored and nothing runs git: the graph is a teaching model of
   what git does, with one simplification (a merge conflict happens when both branches changed the same file since they diverged).
   Everything shown is written with textContent. Needs js/labs.js, css/labs.css and css/gitlab.css.

     GitLab.build(host, { title, lead, files: ['index.html', 'style.css', 'app.py'] })   fill a lab host with the sandbox */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.append(e); return e; };

  function build(host, cfg) {
    const L = window.Labs, el = L.el;
    const files = cfg.files || ['index.html', 'style.css', 'app.py'];
    L.shell(host, 'git-lab', cfg.title || 'Git sandbox', cfg.lead || 'Make commits, create branches and merge them. The graph shows how the history grows. Edit the same file on two branches and see what a merge conflict is.');

    let n = 0;
    const mk = (parents, branch, file, msg, merge) => ({ id: 'c' + (++n), parents, branch, file, msg, merge: !!merge });
    const state = { commits: [], branches: {}, head: 'main', conflict: null, log: [] };
    function reset() {
      n = 0;
      const first = mk([], 'main', 'index.html', 'Start the project');
      state.commits = [first]; state.branches = { main: first.id }; state.head = 'main'; state.conflict = null; state.log = ['A repository starts with one commit on the main branch.'];
      update();
    }

    const row = el('div', 'lab-row');
    const fF = el('div', 'lab-field'), lF = el('label', null, 'File to change'), sF = el('select'); lF.htmlFor = sF.id = 'git-file';
    files.forEach(f => { const o = el('option', null, f); o.value = f; sF.append(o); }); fF.append(lF, sF);
    const fM = el('div', 'lab-field'), lM = el('label', null, 'Commit message'), iM = el('input'); lM.htmlFor = iM.id = 'git-msg'; iM.type = 'text'; iM.maxLength = 40; iM.placeholder = 'Say what changed'; fM.append(lM, iM);
    const bC = el('button', 'lab-btn lab-btn--primary', 'Commit'); bC.type = 'button';
    row.append(fF, fM, bC); host.append(row);

    const row2 = el('div', 'lab-row');
    const fB = el('div', 'lab-field'), lB = el('label', null, 'New branch name'), iB = el('input'); lB.htmlFor = iB.id = 'git-new'; iB.type = 'text'; iB.maxLength = 20; iB.placeholder = 'for example login-page'; fB.append(lB, iB);
    const bB = el('button', 'lab-btn', 'Create branch and switch to it'); bB.type = 'button';
    const fS = el('div', 'lab-field'), lS = el('label', null, 'Switch to branch'), sS = el('select'); lS.htmlFor = sS.id = 'git-switch'; fS.append(lS, sS);
    const fG = el('div', 'lab-field'), lG = el('label', null, 'Merge this branch into the current one'), sG = el('select'); lG.htmlFor = sG.id = 'git-merge'; fG.append(lG, sG);
    const bG = el('button', 'lab-btn', 'Merge'); bG.type = 'button';
    row2.append(fB, bB, fS, fG, bG); host.append(row2);

    const stage = el('div', 'lab-stage git-stage');
    const svg = sv('svg', { role: 'img' }, stage);
    const status = el('div', 'lab-feedback is-info'); status.setAttribute('role', 'status');
    const actions = el('div', 'lab-actions'); const rs = el('button', 'lab-btn lab-btn--quiet', 'Start again'); rs.type = 'button'; actions.append(rs);
    const resolve = el('button', 'lab-btn lab-btn--primary', 'Resolve the conflict by hand and finish the merge'); resolve.type = 'button'; resolve.hidden = true; actions.prepend(resolve);
    host.append(stage, status, actions);
    host.append(el('p', 'lab-note', 'A simplified model: real git compares the changes inside each file, line by line, and can merge two edits to different parts of one file without trouble. Here a conflict is reported when both branches changed the same file since they split, which is when git cannot decide for itself. The Git workflow and merge conflicts are described in the notes above.'));

    const ancestors = id => { const seen = new Set(); const walk = c => { if (seen.has(c)) return; seen.add(c); get(c).parents.forEach(walk); }; walk(id); return seen; };
    const get = id => state.commits.find(c => c.id === id);
    const branchNames = () => Object.keys(state.branches);

    function commit(file, msg, merge, extraParent) {
      const parents = [state.branches[state.head]].concat(extraParent ? [extraParent] : []);
      const c = mk(parents, state.head, file, msg || 'Change ' + file, merge);
      state.commits.push(c); state.branches[state.head] = c.id; return c;
    }
    bC.addEventListener('click', () => {
      if (state.conflict) { status.className = 'lab-feedback is-warn'; status.textContent = 'Finish resolving the conflict first.'; return; }
      const c = commit(sF.value, iM.value.trim(), false); iM.value = '';
      state.log = ['Committed "' + c.msg + '" (' + c.file + ') on ' + state.head + '. The branch label moves to the new commit.'];
      update();
    });
    bB.addEventListener('click', () => {
      const name = iB.value.trim().replace(/[^A-Za-z0-9_\-\/]/g, '-');
      if (!name) { status.className = 'lab-feedback is-warn'; status.textContent = 'Type a name for the new branch.'; return; }
      if (state.branches[name]) { status.className = 'lab-feedback is-warn'; status.textContent = 'A branch called ' + name + ' already exists. Choose another name.'; return; }
      if (state.conflict) return;
      state.branches[name] = state.branches[state.head]; state.head = name; iB.value = '';
      state.log = ['Created ' + name + ' at the same commit as before and switched to it. Nothing is copied: a branch is just a label that points at a commit.'];
      update();
    });
    sS.addEventListener('change', () => { if (state.conflict) { sS.value = state.head; return; } state.head = sS.value; state.log = ['Switched to ' + state.head + '. New commits will go on this branch.']; update(); });
    bG.addEventListener('click', () => {
      if (state.conflict) return;
      const other = sG.value; if (!other || other === state.head) { status.className = 'lab-feedback is-warn'; status.textContent = 'Choose a different branch to merge into ' + state.head + '.'; return; }
      const a = state.branches[state.head], b = state.branches[other];
      const aAnc = ancestors(a), bAnc = ancestors(b);
      if (aAnc.has(b)) { state.log = [other + ' is already part of ' + state.head + ', so there is nothing to merge.']; update(); return; }
      if (bAnc.has(a)) { state.branches[state.head] = b; state.log = ['Fast-forward: ' + state.head + ' had no new commits of its own, so git simply moves the ' + state.head + ' label forward to ' + other + '. No merge commit is needed.']; update(); return; }
      // diverged: find files changed on each side since the common ancestors
      const common = new Set([...aAnc].filter(x => bAnc.has(x)));
      const side = anc => new Set([...anc].filter(x => !common.has(x)).map(x => get(x)).filter(c => !c.merge).map(c => c.file));
      const fa = side(aAnc), fb = side(bAnc), both = [...fa].filter(f => fb.has(f));
      if (both.length) { state.conflict = { other, files: both }; state.log = ['Merge conflict in ' + both.join(', ') + ': ' + state.head + ' and ' + other + ' both changed it since they split, so git cannot choose between the two versions. A person must read both versions, decide what the file should say, and finish the merge.']; }
      else { const c = commit('(merge)', 'Merge ' + other + ' into ' + state.head, true, b); state.log = ['Merged ' + other + ' into ' + state.head + '. The two branches changed different files, so git combined them automatically and made a merge commit with two parents.']; }
      update();
    });
    resolve.addEventListener('click', () => {
      const c = state.conflict; if (!c) return;
      commit('(merge)', 'Merge ' + c.other + ' into ' + state.head + ' (conflict resolved)', true, state.branches[c.other]);
      state.conflict = null; state.log = ['You chose the final content of ' + c.files.join(', ') + ' and committed the merge. The merge commit has two parents, so the history shows that the branches joined.'];
      update();
    });
    rs.addEventListener('click', reset);

    function update() {
      // selects
      sS.replaceChildren(); sG.replaceChildren();
      branchNames().forEach(b => { const o = el('option', null, b + (b === state.head ? ' (current)' : '')); o.value = b; sS.append(o); if (b !== state.head) { const p = el('option', null, b); p.value = b; sG.append(p); } });
      sS.value = state.head; bG.disabled = !sG.options.length || !!state.conflict; resolve.hidden = !state.conflict;
      bC.disabled = bB.disabled = !!state.conflict;
      // layout: x by creation order, y by lane (branch order of first use)
      const lanes = []; state.commits.forEach(c => { if (!lanes.includes(c.branch)) lanes.push(c.branch); });
      branchNames().forEach(b => { if (!lanes.includes(b)) lanes.push(b); });
      const gx = 46, gy = 50, px = 84, py = 30;
      const W = Math.max(420, px + state.commits.length * gx + 150), H = 36 + (lanes.length - 1) * gy + 40;
      svg.replaceChildren(); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
      svg.setAttribute('aria-label', 'History graph with ' + state.commits.length + ' commits on ' + lanes.length + ' branches. The current branch is ' + state.head + '.');
      const pos = {}; state.commits.forEach((c, i) => { pos[c.id] = { x: px + i * gx, y: py + lanes.indexOf(c.branch) * gy }; });
      state.commits.forEach(c => c.parents.forEach((p, k) => { const a = pos[p], b = pos[c.id]; sv('path', { d: 'M' + a.x + ',' + a.y + ' C' + (a.x + 20) + ',' + a.y + ' ' + (b.x - 20) + ',' + b.y + ' ' + b.x + ',' + b.y, class: 'git-edge' + (k ? ' is-second' : '') }, svg); }));
      state.commits.forEach(c => { const p = pos[c.id]; sv('circle', { cx: p.x, cy: p.y, r: c.merge ? 9 : 8, class: 'git-node lane-' + (lanes.indexOf(c.branch) % 5) + (c.merge ? ' is-merge' : '') }, svg); const t = sv('text', { x: p.x, y: p.y + 22, 'text-anchor': 'middle', class: 'git-id' }, svg); t.textContent = c.id; });
      lanes.forEach((b, i) => { const t = sv('text', { x: 8, y: py + i * gy + 4, class: 'git-lane lane-t-' + (i % 5) }, svg); t.textContent = b.length > 9 ? b.slice(0, 8) + '…' : b; });
      const tipCount = {};
      branchNames().forEach(b => {
        const tip = state.branches[b], p = pos[tip], k = tipCount[tip] = (tipCount[tip] || 0) + 1;
        const g = sv('g', { class: 'git-tag' + (b === state.head ? ' is-head' : '') }, svg);
        const label = (b === state.head ? 'HEAD → ' : '') + b, w = label.length * 7 + 12;
        sv('rect', { x: p.x + 14, y: p.y - 9 - (k - 1) * 20, width: w, height: 18, rx: 3 }, g);
        const t = sv('text', { x: p.x + 14 + w / 2, y: p.y + 3.5 - (k - 1) * 20, 'text-anchor': 'middle' }, g); t.textContent = label;
      });
      status.className = 'lab-feedback ' + (state.conflict ? 'is-bad' : 'is-info');
      status.replaceChildren(L.el('p', null, state.log.join(' ')));
    }
    reset();
  }
  window.GitLab = { build };
})();
