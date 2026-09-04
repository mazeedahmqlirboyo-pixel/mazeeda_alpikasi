const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// 1. Remove transparent={true} from PageHeader
s = s.replace(/<PageHeader title=\{\$t\('kiblat\.arah_kiblat'\) \|\| 'Arah Kiblat'\} backText="Dashboard" transparent=\{true\} \/>/, `<PageHeader title={$t('kiblat.arah_kiblat') || 'Arah Kiblat'} backText="Dashboard" />`);

// 2. Adjust padding/margin on the content wrapper
s = s.replace(/<div class="space-y-6 pt-4 pb-12 max-w-xl mx-auto relative px-2">/, `<div class="space-y-6 pt-0 pb-12 max-w-xl mx-auto relative px-2 -mt-2">`);

fs.writeFileSync(file, s);
console.log("Header and spacing fixed!");
