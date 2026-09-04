const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

const regex = /<span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 pr-1">\{heir\.name\}<\/span>/;
const replacement = `<span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 break-words leading-tight pr-1">\{heir.name\}</span>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Successfully fixed heir name truncation.");
} else {
    console.log("Regex did not match. It might have been already changed.");
}
