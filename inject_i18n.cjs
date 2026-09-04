const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

if (!s.includes('import { t } from') && !s.includes('import { t,')) {
    s = s.replace(/<script[^>]*>/, match => `${match}\n  import { t, locale } from "svelte-i18n";`);
    fs.writeFileSync(file, s);
    console.log('Injected svelte-i18n import');
} else {
    console.log('svelte-i18n import already exists');
}
