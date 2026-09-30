/* Still diagram (Gantt chart): the Library Loans project with its critical path.
   Software Engineering Project › Applying project management. */
HSCAnim.define('sep-critical-path', {
  still: true,
  title: 'Gantt chart: the critical path of the Library Loans project',
  alt: 'Gantt chart over 32 school days for the Library Loans project. Critical tasks, shown in red, run one after another: A Requirements days 0 to 5, B Feasibility and budget days 5 to 8, C Data dictionary and structure chart days 8 to 12, F Search module days 12 to 18, G Interface build days 18 to 25, H Integration testing days 25 to 29 and J Client acceptance testing days 29 to 32. Tasks with float, shown in green: D Wireframes and client review days 8 to 13 with 5 days of float, E Loan module days 12 to 20 with 5 days of float, and I Documentation days 12 to 18 with 11 days of float. A milestone marks project complete on day 32.',
  layout: { size: [780, 500], minWidth: 640 },
  setup(s) {
    s.gantt(s.root, {
      x: 0, y: 4, w: 780, days: 33, labelW: 250, tick: 4, tickLabel: d => (d === 0 ? 'day 0' : String(d)),
      sections: [
        { name: 'Identify and define', rows: [
          { id: 'A', label: 'A  Requirements', start: 0, dur: 5, tone: 'terra', tag: '5', strong: true },
          { id: 'B', label: 'B  Feasibility and budget', start: 5, dur: 3, tone: 'terra', tag: '3', after: 'A', strong: true }] },
        { name: 'Research and plan', rows: [
          { id: 'C', label: 'C  Data dictionary, structure chart', start: 8, dur: 4, tone: 'terra', tag: '4', after: 'B', strong: true },
          { id: 'D', label: 'D  Wireframes, client review', start: 8, dur: 5, tone: 'sage', tag: 'float 5', after: 'B' }] },
        { name: 'Produce', rows: [
          { id: 'E', label: 'E  Loan module', start: 12, dur: 8, tone: 'sage', tag: 'float 5', after: 'C' },
          { id: 'F', label: 'F  Search module', start: 12, dur: 6, tone: 'terra', tag: '6', after: 'C', strong: true },
          { id: 'G', label: 'G  Interface build', start: 18, dur: 7, tone: 'terra', tag: '7', after: 'F', strong: true },
          { id: 'I', label: 'I  Documentation, process diary', start: 12, dur: 6, tone: 'sage', tag: 'float 11', after: 'C' }] },
        { name: 'Test and evaluate', rows: [
          { id: 'H', label: 'H  Integration testing', start: 25, dur: 4, tone: 'terra', tag: '4', after: 'G', strong: true },
          { id: 'J', label: 'J  Client acceptance testing', start: 29, dur: 3, tone: 'terra', tag: '3', after: 'H', strong: true },
          { id: 'M', label: 'Project complete', start: 32, milestone: true, tone: 'terra', after: 'J', strong: true }] }
      ]
    });
  }
});
