const fs = require('fs');
const { JSDOM } = require('jsdom');

// Read the HTML file
const htmlContent = fs.readFileSync('./topics/programming-fundamentals.html', 'utf-8');

// Create a virtual DOM
const dom = new JSDOM(htmlContent, {
  url: 'http://localhost/topics/programming-fundamentals.html',
  pretendToBeVisual: true,
  resources: 'usable'
});

const { document, window } = dom.window;

// Add console logging to track execution
const originalLog = console.log;
const logs = [];
console.log = (...args) => {
  logs.push(args.join(' '));
  originalLog(...args);
};

// Create a mock script that runs the main.js code
const mainJsContent = fs.readFileSync('./js/main.js', 'utf-8');

try {
  // Execute the main.js code in the context of the virtual DOM
  window.eval(`
    ${mainJsContent}
  `);

  // Trigger DOMContentLoaded manually
  const event = new window.Event('DOMContentLoaded');
  window.document.dispatchEvent(event);

  // Wait a bit for the code to execute
  setTimeout(() => {
    console.log('\n=== EXECUTION COMPLETE ===');
    console.log('Logs:', logs);

    // Check if part-groups were created
    const partGroups = document.querySelectorAll('.part-group');
    console.log(`Part-groups found: ${partGroups.length}`);

    // Check if chevrons were added
    const chevrons = document.querySelectorAll('.part-chevron');
    console.log(`Chevrons found: ${chevrons.length}`);

    // Check if toc-part-labels were created
    const partLabels = document.querySelectorAll('.toc-part-label');
    console.log(`Part labels found: ${partLabels.length}`);
  }, 100);
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
