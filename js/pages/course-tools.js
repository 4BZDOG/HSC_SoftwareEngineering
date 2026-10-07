/* Course tools: a practice set that matches a job to the right diagram or chart.
   Built on the shared lab kit (js/labs.js, css/labs.css). Everything shown is written with textContent;
   the static description stays in the page if this file does not run. */
(() => {
  'use strict';
  if (!window.Labs) return;

  function buildWhichTool(host) {
    Labs.sorter(host, {
      cls: 'tools-which', title: 'Which tool or diagram?',
      lead: 'Choose the diagram or chart that does each job best.',
      noun: 'job', groupLabel: 'Tool or diagram',
      choices: [{ key: 'DFD', label: 'Data flow diagram' }, { key: 'SC', label: 'Structure chart' }, { key: 'DD', label: 'Data dictionary' }, { key: 'CD', label: 'Class diagram' }, { key: 'SB', label: 'Storyboard' }, { key: 'DT', label: 'Decision tree' }, { key: 'GC', label: 'Gantt chart' }],
      keepCase: false,
      items: [
        { text: 'Show how data moves between a customer, the system and a stored file.', ans: 'DFD', why: 'A data flow diagram shows external entities, processes, data stores and the data that flows between them.' },
        { text: 'Show how a program is broken into modules and which module calls which.', ans: 'SC', why: 'A structure chart shows the hierarchy of modules and how control passes between them.' },
        { text: 'List every field with its data type, size and validation rule.', ans: 'DD', why: 'A data dictionary records the details of each data item.' },
        { text: 'Show the classes in a program with their attributes, methods and inheritance.', ans: 'CD', why: 'A class diagram models the classes and the relationships between them.' },
        { text: 'Plan what each screen looks like and how the user moves from one screen to the next.', ans: 'SB', why: 'A storyboard shows the screens and the order the user sees them in.' },
        { text: 'Show how a combination of conditions leads to one of several outcomes, such as a grade from a mark.', ans: 'DT', why: 'A decision tree branches on each condition until it reaches an outcome.' },
        { text: 'Show tasks, how long each takes and which must finish before another can start.', ans: 'GC', why: 'A Gantt chart lays tasks out against time and shows their dependencies.' },
        { text: 'Show which outside people or systems send data into a system and receive data out of it.', ans: 'DFD', why: 'The external entities and the data flows to and from them appear in a data flow diagram.' }
      ],
      closing: 'Ask what the diagram must show: data movement (DFD), module structure (structure chart), field details (data dictionary), classes (class diagram), screens (storyboard), conditions and outcomes (decision tree) or time (Gantt chart).'
    });
  }

  function init() {
    document.querySelectorAll('[data-toolslab="which"]').forEach(h => { try { buildWhichTool(h); } catch (e) { /* leave the static description in place */ } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
