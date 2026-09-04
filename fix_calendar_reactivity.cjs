const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Inject $: if ($locale) generateCalendar();
if (!content.includes('$: if ($locale) generateCalendar();')) {
    // Find where generateCalendar is defined
    const injectPoint = 'function generateCalendar() {';
    if (content.includes(injectPoint)) {
        content = content.replace(injectPoint, `$: if ($locale) generateCalendar();\n\n  function generateCalendar() {`);
        fs.writeFileSync(pagePath, content, 'utf8');
        console.log("Injected locale reactivity for generateCalendar!");
    } else {
        console.log("Could not find generateCalendar function.");
    }
} else {
    console.log("Reactivity already exists.");
}
