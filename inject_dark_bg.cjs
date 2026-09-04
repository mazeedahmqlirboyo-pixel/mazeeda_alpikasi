const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

function injectDark(str, lightCls, darkCls) {
  let replaced = str.split(lightCls).join(`${lightCls} ${darkCls}`);
  replaced = replaced.split(`${lightCls} ${darkCls} ${darkCls}`).join(`${lightCls} ${darkCls}`);
  return replaced;
}

// Fix bg-slate-200 which remained light in dark mode (used in Belum Wajib Zakat badges)
s = injectDark(s, 'bg-slate-200', 'dark:bg-slate-700/60');
s = injectDark(s, 'border-slate-300', 'dark:border-slate-600');

fs.writeFileSync(file, s);
console.log('Fixed bg-slate-200!');
