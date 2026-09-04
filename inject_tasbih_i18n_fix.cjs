const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/tasbih/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

page = page.replace(
  /\n(\s*)Batal\n\s*/g,
  "\n$1{$t('tasbih.batal') || 'Batal'}\n$1"
);

page = page.replace(
  /\n(\s*)Ya, Reset\n\s*/g,
  "\n$1{$t('tasbih.ya_reset') || 'Ya, Reset'}\n$1"
);

page = page.replace(
  /\n(\s*)RESET\n\s*/g,
  "\n$1{$t('tasbih.reset') || 'RESET'}\n$1"
);

page = page.replace(
  /\n(\s*)Set Target\n\s*/g,
  "\n$1{$t('tasbih.set_target') || 'Set Target'}\n$1"
);

page = page.replace(
  /\n(\s*)Simpan\n\s*/g,
  "\n$1{$t('tasbih.simpan') || 'Simpan'}\n$1"
);

// Oh wait, did my `{formatNumberDisplay(count)}` replacement work?
// Let's check if the file has {formatNumberDisplay(count)}

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched buttons!");
