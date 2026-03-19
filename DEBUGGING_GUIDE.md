# Debugging Guide: Collapsible Part Blocks & TOC Sidebar Features

## Issue
The collapsible major topic headings and sidebar feedback features are not working as expected.

## Debugging Steps

### 1. Open Test Page
Open `/test-exact-structure.html` in a browser. This is a minimal test page that uses the actual CSS and JavaScript from the project.

### 2. Open Browser Console
- **Windows/Linux**: Press `F12` or `Ctrl+Shift+I`
- **Mac**: Press `Cmd+Option+I`
- Look for the **Console** tab

### 3. Check Console Logs
You should see logs like:

```
[Part-Blocks] Found 2 part-block elements
[Part-Blocks] Processing block 0: Syllabus Part 1
[Part-Blocks] Moved 5 siblings into part-group-inner
[Part-Blocks] Processing block 1: Syllabus Part 2
[Part-Blocks] Moved 3 siblings into part-group-inner
[TOC] Found 4 TOC links
[TOC] Found 2 part labels
[TOC] Found 3 sections to observe
```

If you don't see these logs:
- **Problem**: JavaScript isn't running
- **Solution**: Check if there are any JavaScript errors in the console (red text)

### 4. Test Collapsible Headings
1. Click on a part-block heading (e.g., "Syllabus Part 1")
2. The heading should:
   - Toggle a `part-collapsed` class (visible in Inspector)
   - Content below should smoothly collapse/expand
   - Chevron icon (▼) should rotate to ▶ when collapsed

If nothing happens:
- Check if the click is being detected (add a click log to console)
- Verify the `part-group` was created (open Inspector and look for `<div class="part-group">`)

### 5. Inspect DOM Structure
Open the **Inspector** (right-click → "Inspect"):

#### Expected Structure Before Feature Loads:
```html
<div class="content-body">
  <div class="part-block">...</div>
  <section id="sdlc">...</section>
  <hr />
  <section id="collaboration">...</section>
  ...
</div>
```

#### Expected Structure After Feature Loads:
```html
<div class="content-body">
  <div class="part-block">...</div>
  <div class="part-group">
    <div class="part-group-inner">
      <section id="sdlc">...</section>
      <hr />
      <section id="collaboration">...</section>
      ...
    </div>
  </div>
  <div class="part-block">...</div>
  <div class="part-group">...</div>
  ...
</div>
```

### 6. Check CSS Animations
1. Open Inspector on a part-block
2. Look for:
   - `class="part-block"` ✓
   - A `<span class="part-chevron">` with SVG inside ✓
   - A `<div class="part-group">` as next sibling ✓

3. Click the part-block
4. Verify the `part-collapsed` class is toggled:
   - Look for `class="part-block part-collapsed"` when collapsed
   - Look for `class="part-group part-collapsed"` when collapsed

### 7. Test TOC Sidebar Feedback
On the actual site pages:
1. Scroll through content
2. Watch the TOC sidebar on the left
3. The current section link should highlight with:
   - Blue background color
   - Left blue border
   - "Part X" label above should also highlight

If not working:
- Check if `.toc-part-label` elements exist in the HTML
- Verify IntersectionObserver is firing (check console for logs)

## Common Issues & Solutions

### Issue: Part-blocks don't collapse
**Check**:
- Is JavaScript running? (See console logs above)
- Click event listeners attached? (Check in Inspector → Event Listeners)
- CSS classes being added? (Check Inspector → Toggle `part-collapsed` class manually)

**If classes toggle but content doesn't animate**:
- Check if `grid-template-rows` CSS is applied to `.part-group`
- Verify `min-height: 0` is on `.part-group-inner`

### Issue: Console shows no logs
**Check**:
- Is the page loading `/js/main.js`? (Check Network tab)
- Is there a JavaScript syntax error? (Look for red text in console)
- Did DOMContentLoaded fire? Add this to console:
  ```javascript
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired');
  });
  ```

### Issue: Parts are empty (no content in part-group)
**Check**:
- Are there any siblings between part-blocks?
- Open Inspector and look at raw HTML structure
- The while loop should collect all siblings until the next part-block

## Test Files Created
- `/test-exact-structure.html` - Minimal test with actual CSS/JS
- `/test-collapse.html` - Simplified version with inline code
- `/test-debug.js` - Node.js debugging script (requires jsdom module)

## Next Steps
1. Run the debugging steps above
2. Check console for the logs
3. Report what you see:
   - Are the logs appearing?
   - Are the part-groups being created?
   - Are event listeners firing?
   - Are CSS classes being toggled?

This information will help identify the root cause!
