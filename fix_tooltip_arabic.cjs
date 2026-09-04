const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace {heir.name} in the tooltip title
const tooltipRegex = /title="\{heir\.name\}:\s*\{heir\.percentage\.toFixed\(1\)\}%"/;
const tooltipReplacement = `title="{formatNumberDisplay(heir.name)}: {formatNumberDisplay(heir.percentage.toFixed(1))}%"`;

if (tooltipRegex.test(content)) {
    content = content.replace(tooltipRegex, tooltipReplacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Replaced tooltip with formatNumberDisplay");
} else {
    console.log("Could not find the target tooltip. It might have been altered or already fixed.");
}
