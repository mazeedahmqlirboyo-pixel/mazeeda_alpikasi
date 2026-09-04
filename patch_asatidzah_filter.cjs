const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/asatidzah/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Fix Kategori title
page = page.replace(
  /<p class="text-\[9px\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1\.5">Kategori<\/p>/g,
  `<p class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{$t('asatidzah.category_label') || 'Kategori'}</p>`
);

// Fix Daerah Santri title
page = page.replace(
  /<p class="text-\[9px\] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1\.5">Daerah Santri<\/p>/g,
  `<p class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{$t('asatidzah.region_label') || 'Daerah Santri'}</p>`
);

// Fix Semua in categories
page = page.replace(
  />\{cat\.label\}<\/button>/g,
  `>{cat.value === 'semua' ? ($t('asatidzah.all') || 'Semua') : cat.label}</button>`
);

fs.writeFileSync(pagePath, page, 'utf8');
console.log("Fixed filter labels in Asatidzah!");
