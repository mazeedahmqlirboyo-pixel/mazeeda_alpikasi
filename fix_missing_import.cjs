const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Insert import if not exists
if (!s.includes('import { t, locale } from "svelte-i18n";')) {
  s = s.replace('<script lang="ts">', '<script lang="ts">\n  import { t, locale } from "svelte-i18n";');
}

fs.writeFileSync(file, s);
console.log('Import added!');
