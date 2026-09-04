const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace the h-6 w-6 white buttons with dark mode compliant classes
page = page.replace(/class="h-6 w-6 bg-white hover:bg-slate-100 border border-slate-200/g, 'class="h-6 w-6 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600');

fs.writeFileSync(pagePath, page, 'utf8');
console.log('Fixed h-6 w-6 buttons');
