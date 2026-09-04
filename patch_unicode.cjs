const fs = require('fs'); 
const file = 'src/routes/+page.svelte'; 
let s = fs.readFileSync(file, 'utf8'); 
s = s.replace(/>\s*2023 \u2014 2032 \u00B7 Eksplorasi Kenangan\s*<\/p>/, `>
                {$t('ikhtisar.jejak_desc') || '2023 - 2032 \u00B7 Eksplorasi Kenangan'}
              </p>`); 
fs.writeFileSync(file, s);
