const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Fix the bindings that were accidentally wrapped in formatNumberStr
// bind:value={formatNumberStr(varname, $locale)} -> bind:value={varname}

s = s.replace(/bind:value=\{formatNumberStr\(([^,]+),\s*\$locale\)\}/g, 'bind:value={$1}');

fs.writeFileSync(file, s);
console.log('Fixed bind:value compilation error.');
