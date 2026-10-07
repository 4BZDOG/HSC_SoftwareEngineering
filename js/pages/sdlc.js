/* SDLC overview: a practice set that places course activities in the four phases.
   Built on the shared lab kit (js/labs.js, css/labs.css). Everything shown is written with textContent;
   the static description stays in the page if this file does not run. */
(() => {
  'use strict';
  if (!window.Labs) return;

  function buildPhases(host) {
    Labs.sorter(host, {
      cls: 'sdlc-phases', title: 'Which phase of the SDLC?',
      lead: 'Each activity belongs mainly to one of the four phases. Choose the phase, then read why.',
      noun: 'activity', groupLabel: 'SDLC phase',
      choices: [{ key: '1', label: 'Phase 1: Identifying and defining' }, { key: '2', label: 'Phase 2: Research and planning' }, { key: '3', label: 'Phase 3: Producing and implementing' }, { key: '4', label: 'Phase 4: Testing and evaluating' }],
      items: [
        { text: 'Interviewing the librarian and writing user stories for what staff need.', ans: '1', why: 'Gathering requirements from the client is how the problem is identified and defined.' },
        { text: 'Deciding that the project is in scope for seven weeks and that online payments are out of scope.', ans: '1', why: 'Setting the scope and checking feasibility are part of defining the problem.' },
        { text: 'Drawing a structure chart that splits the system into modules.', ans: '2', why: 'Designing the architecture happens before any production code is written.' },
        { text: 'Creating a Gantt chart with tasks, durations and dependencies.', ans: '2', why: 'Planning the project is part of research and planning.' },
        { text: 'Writing the loan-checking function and committing it to Git with a clear message.', ans: '3', why: 'Building the software to its design, with version control, is construction.' },
        { text: 'Validating every user input and hashing passwords before they are stored.', ans: '3', why: 'Implementing the security and validation controls that were designed in Phase 2 is part of producing and implementing.' },
        { text: 'Running boundary test cases and recording the actual result against the expected result.', ans: '4', why: 'Systematic testing against the requirements is Phase 4.' },
        { text: 'Asking the client to review the finished system and writing an evaluation against the original requirements.', ans: '4', why: 'Evaluating the solution against the requirements closes the cycle.', extra: 'Unit tests are written during Phase 3, alongside the code. The phase that checks the whole system against the requirements and evaluates the process is Phase 4.' }
      ],
      extraLabel: 'Note',
      closing: 'The phases are a cycle, not a one-way street: evaluation often sends you back to define the next set of requirements.'
    });
  }

  function init() {
    document.querySelectorAll('[data-sdlclab="phases"]').forEach(h => { try { buildPhases(h); } catch (e) { /* leave the static description in place */ } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
