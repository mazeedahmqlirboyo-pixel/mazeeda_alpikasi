const fs = require('fs');
const file = 'src/routes/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(/Bagian dari lembar sejarah dan kenangan manis perjalanan\s*kebersamaan MAZEEDA Squad\./g, 
  `{$t('mading.memori_desc') || 'Bagian dari lembar sejarah dan kenangan manis perjalanan kebersamaan MAZEEDA Squad...'}`);

fs.writeFileSync(file, s);
