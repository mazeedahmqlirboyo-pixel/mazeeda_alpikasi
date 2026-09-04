const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace {heir.name} with {formatNumberDisplay(heir.name)} where it renders the name
const regex = /<span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 pr-1">\{heir\.name\}<\/span>/;
const replacement = `<span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 pr-1">{formatNumberDisplay(heir.name)}</span>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Replaced {heir.name} with {formatNumberDisplay(heir.name)}");
} else {
    console.log("Could not find the target heir.name span. It might have been altered.");
}
