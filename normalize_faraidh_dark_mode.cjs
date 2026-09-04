const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Fix white checkboxes
page = page.replace(/'border-slate-300 bg-white'/g, "'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'");

// 2. Fix unselected borders missing dark classes
page = page.replace(/'border-slate-100'/g, "'border-slate-100 dark:border-slate-700'");
page = page.replace(/'border-slate-100 hover:border-slate-200'/g, "'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'");
// Wait, my previous script might have already replaced 'border-slate-100' with 'border-slate-100 dark:border-slate-700'
// Let's use a robust regex that doesn't double-replace.

// Let's reset the unselected borders first to avoid double dark classes
page = page.replace(/border-slate-100 hover:border-slate-200 dark:hover:border-slate-600/g, "border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600");

// And for those without hover:
// border-slate-100 dark:border-slate-700 (this might be fine already, let's just make sure)

// 3. Counter inner containers
page = page.replace(/border border-slate-100(?![ a-z\-]*dark:border-slate-700)/g, "border border-slate-100 dark:border-slate-700");

// 4. Selected states missing dark classes
page = page.replace(/'bg-emerald-50 border-emerald-400 shadow-md'/g, "'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500 shadow-md'");
page = page.replace(/'bg-amber-50 border-amber-400 shadow-md'/g, "'bg-amber-50 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500 shadow-md'");

// 5. Suami/Istri selected state
page = page.replace(/'bg-slate-50 dark:bg-slate-800 border-slate-400 shadow-md'/g, "'bg-slate-50 dark:bg-slate-800 border-slate-400 dark:border-slate-500 shadow-md'");
page = page.replace(/'bg-blue-50 border-blue-400 shadow-md'/g, "'bg-blue-50 dark:bg-blue-900/40 border-blue-400 dark:border-blue-500 shadow-md'");
page = page.replace(/'bg-rose-50 border-rose-400 shadow-md'/g, "'bg-rose-50 dark:bg-rose-900/40 border-rose-400 dark:border-rose-500 shadow-md'");

// 6. Fix Suami/Istri unselected state which had double dark backgrounds
page = page.replace(/'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 dark:bg-slate-800\/50 dark:bg-slate-900'/g, "'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'");

// 7. Fix unselected borders for dynamic bindings
// E.g. {sonsCount > 0 ? '...' : 'border-slate-100 hover:border-slate-200'}
page = page.replace(/'border-slate-100 hover:border-slate-200'/g, "'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'");

fs.writeFileSync(pagePath, page, 'utf8');
console.log('Normalized Faraidh dark mode styling!');
