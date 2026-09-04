const fs = require('fs');
const path = require('path');

// 1. Fix zakat-faraidh/+page.svelte (Argument of type 'string | null | undefined')
const zakatFile = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let zakatContent = fs.readFileSync(zakatFile, 'utf8');
zakatContent = zakatContent.replace(
  /function formatNumberStr\(val: string \| number, loc\?: string\): string \{/g,
  'function formatNumberStr(val: string | number, loc?: string | null): string {'
);
fs.writeFileSync(zakatFile, zakatContent, 'utf8');
console.log('Fixed zakat-faraidh/+page.svelte');


// 2. Fix tentang/+page.svelte (Property 'icon' does not exist)
const tentangFile = path.join(__dirname, 'src', 'routes', 'tentang', '+page.svelte');
if (fs.existsSync(tentangFile)) {
  let tentangContent = fs.readFileSync(tentangFile, 'utf8');
  // Cast feature to any: (feature as any).icon
  tentangContent = tentangContent.replace(/<svelte:component this=\{feature\.icon\}/g, '<svelte:component this={(feature as any).icon}');
  fs.writeFileSync(tentangFile, tentangContent, 'utf8');
  console.log('Fixed tentang/+page.svelte');
}

// 3. Fix timeline/+page.svelte (Directive value must be a JavaScript expression enclosed in curly braces)
const timelineFile = path.join(__dirname, 'src', 'routes', 'timeline', '+page.svelte');
if (fs.existsSync(timelineFile)) {
  let timelineContent = fs.readFileSync(timelineFile, 'utf8');
  // There's a typo in the on:error handler: `display:none'); }}} />`
  timelineContent = timelineContent.replace(/display:none'\);\s*\}\}\}/g, "display:none'); }}");
  fs.writeFileSync(timelineFile, timelineContent, 'utf8');
  console.log('Fixed timeline/+page.svelte');
}

console.log('Done.');
