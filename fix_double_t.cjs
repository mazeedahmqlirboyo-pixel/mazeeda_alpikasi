const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace the buggy nested template strings with just the faraidh translation
const replacements = [
  [/\{\$t\('zakat.orangtua_kandung'\) \|\| '\{\$t\('faraidh.orang_tua_kandung'\) \|\| 'Orang Tua Kandung'\}'\}/g, "{$t('faraidh.orang_tua_kandung') || 'Orang Tua Kandung'}"],
  [/\{\$t\('zakat.ayah_kandung'\) \|\| '\{\$t\('faraidh.ayah_kandung'\) \|\| 'Ayah Kandung'\}'\}/g, "{$t('faraidh.ayah_kandung') || 'Ayah Kandung'}"],
  [/\{\$t\('zakat.ibu_kandung'\) \|\| '\{\$t\('faraidh.ibu_kandung'\) \|\| 'Ibu Kandung'\}'\}/g, "{$t('faraidh.ibu_kandung') || 'Ibu Kandung'}"],
  [/\{\$t\('zakat.anak_laki'\) \|\| '\{\$t\('faraidh.anak_laki_laki'\) \|\| 'Anak Laki-laki'\}'\}/g, "{$t('faraidh.anak_laki_laki') || 'Anak Laki-laki'}"],
  [/\{\$t\('zakat.anak_perempuan'\) \|\| '\{\$t\('faraidh.anak_perempuan'\) \|\| 'Anak Perempuan'\}'\}/g, "{$t('faraidh.anak_perempuan') || 'Anak Perempuan'}"],
  [/\{\$t\('zakat.kakek_nenek'\) \|\| '\{\$t\('faraidh.kakek_nenek'\) \|\| 'Kakek & Nenek'\}'\}/g, "{$t('faraidh.kakek_nenek') || 'Kakek & Nenek'}"],
  [/\{\$t\('zakat.cucu_laki'\) \|\| '\{\$t\('faraidh.cucu_laki_laki'\) \|\| 'Cucu Laki-laki'\}'\}/g, "{$t('faraidh.cucu_laki_laki') || 'Cucu Laki-laki'}"],
  [/\{\$t\('zakat.cucu_perempuan'\) \|\| '\{\$t\('faraidh.cucu_perempuan'\) \|\| 'Cucu Perempuan'\}'\}/g, "{$t('faraidh.cucu_perempuan') || 'Cucu Perempuan'}"],
  // One more check in case there are others
  [/\{\$t\('zakat\.[a-zA-Z0-9_]+'\) \|\| '\{\$t\('faraidh\.([a-zA-Z0-9_]+)'\) \|\| '([^']+)'\}'\}/g, "{$t('faraidh.$1') || '$2'}"]
];

for (const [regex, replacement] of replacements) {
  page = page.replace(regex, replacement);
}

fs.writeFileSync(pagePath, page, 'utf8');
console.log('Fixed double translations');
