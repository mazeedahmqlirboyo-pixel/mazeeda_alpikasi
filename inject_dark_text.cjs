const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

function injectDark(str, lightCls, darkCls) {
  let replaced = str.split(lightCls).join(`${lightCls} ${darkCls}`);
  replaced = replaced.split(`${lightCls} ${darkCls} ${darkCls}`).join(`${lightCls} ${darkCls}`);
  return replaced;
}

// Ensure grey texts become lighter in dark mode
s = injectDark(s, 'text-slate-600', 'dark:text-slate-200');
s = injectDark(s, 'text-slate-500', 'dark:text-slate-300');
s = injectDark(s, 'text-slate-400', 'dark:text-slate-300'); // make 400 slightly whiter too for readability

// Clean up any potential duplicates caused by multiple runs
s = s.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
s = s.replace(/dark:text-slate-300 dark:text-slate-300/g, 'dark:text-slate-300');

fs.writeFileSync(file, s);
console.log('Text colors patched!');
