const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// We need to restore line-clamp-1 and remove sm:grid-cols-2
// First, restore line-clamp-1
const nameRegex = /<span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 break-words leading-tight pr-1">\{heir\.name\}<\/span>/;
const nameReplacement = `<span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 pr-1">\{heir.name\}</span>`;

if (nameRegex.test(content)) {
    content = content.replace(nameRegex, nameReplacement);
    console.log("Restored line-clamp-1.");
} else {
    console.log("Could not find the break-words span.");
}

// Next, replace the grid class specifically for the results section.
// The comment <!-- Results Grid --> is right above it.
const gridRegex = /<!-- Results Grid -->\s*<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">/;
const gridReplacement = `<!-- Results Grid -->\n            <div class="flex flex-col gap-3">`;

if (gridRegex.test(content)) {
    content = content.replace(gridRegex, gridReplacement);
    console.log("Changed grid to flex-col.");
} else {
    console.log("Could not find the Results Grid.");
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Done.");
