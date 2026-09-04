const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

const lines = page.split('\n');

// Verify we are deleting the right thing
// lines[265] should be "  function handleGoldInput(event: Event) {"
// lines[393] should be empty or closing something before the real handleGoldInput
console.log('Line 266:', lines[265]);
console.log('Line 394:', lines[393]);
console.log('Line 395 (real handle):', lines[394]);

if (lines[265].includes('function handleGoldInput(event: Event) {') && lines[394].includes('function handleGoldInput(event: Event) {')) {
  // Delete lines 265 to 393 inclusive
  lines.splice(265, 394 - 265);
  fs.writeFileSync(pagePath, lines.join('\n'), 'utf8');
  console.log('Duplicated block removed successfully!');
} else {
  console.log('Safety check failed!');
}
