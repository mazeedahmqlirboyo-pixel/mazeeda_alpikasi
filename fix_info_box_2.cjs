const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// 1. Fix Dark Mode Globally for all Info Boxes
page = page.replace(
  /class="bg-emerald-50\/40 border border-emerald-100\/50 rounded-xl p-3\.5 text-xs text-slate-650/g,
  'class="bg-emerald-50/40 dark:bg-slate-800/50 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl p-3.5 text-xs text-slate-650 dark:text-slate-300'
);

page = page.replace(
  /class="bg-white border border-emerald-100 rounded-xl p-2\.5 text-center font-black text-emerald-700 font-mono text-xs"/g,
  'class="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-700 rounded-xl p-2.5 text-center font-black text-emerald-700 dark:text-emerald-400 font-mono text-xs shadow-inner"'
);

page = page.replace(
  /class="text-\[10px\] text-slate-400 dark:text-slate-500 mt-1 border-t border-emerald-100\/30 pt-1\.5 italic"/g,
  'class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 border-t border-emerald-100/30 dark:border-slate-700/50 pt-1.5 italic"'
);

page = page.replace(
  /class="border-t border-emerald-100\/30 pt-2\.5"/g,
  'class="border-t border-emerald-100/30 dark:border-slate-700/50 pt-2.5"'
);


// 2. Inject Translations for Zakat Penghasilan specifically
// First: Ketentuan Utama label (there are multiple, but let's replace the first one under showPenghasilanInfo)
let penghasilanBlockMatch = page.match(/\{#if showPenghasilanInfo\}[\s\S]*?\{\/if\}/);
if (penghasilanBlockMatch) {
  let block = penghasilanBlockMatch[0];
  
  block = block.replace(
    /Ketentuan Utama/,
    `{$t('zakat.ketentuan_utama') || 'Ketentuan Utama'}`
  );
  
  block = block.replace(
    /Setara dengan nilai 85[\s\S]*?per bulannya\)\./,
    `{$t('zakat.penjelasan_nisab_penghasilan') || 'Setara dengan nilai 85 gram emas per tahun (atau 1/12 dari 85 gram emas per bulannya).'}`
  );

  block = block.replace(
    /2,5% dari total pendapatan bersih\./,
    `{$t('zakat.penjelasan_kadar_penghasilan') || '2,5% dari total pendapatan bersih.'}`
  );

  block = block.replace(
    /Bisa ditunaikan setiap bulan[\s\S]*?tahunan\./,
    `{$t('zakat.penjelasan_waktu_penghasilan') || 'Bisa ditunaikan setiap bulan saat menerima gaji/penghasilan atau secara tahunan.'}`
  );
  
  block = block.replace(
    /Cara Menghitung \(3 Langkah Mudah\)/,
    `{$t('zakat.cara_menghitung') || 'Cara Menghitung (3 Langkah Mudah)'}`
  );

  block = block.replace(
    /Jumlahkan gaji bulanan[\s\S]*?pendapatan lain\./,
    `{$t('zakat.penjelasan_hitung_total') || 'Jumlahkan gaji bulanan dan bonus/pendapatan lain.'}`
  );

  block = block.replace(
    /Sebagian\s*ulama memperbolehkan mengurangkan kebutuhan pokok \(sandang, pangan,\s*papan, hutang jatuh tempo\) terlebih dahulu\./,
    `{$t('zakat.penjelasan_kurangi_pokok') || 'Sebagian ulama memperbolehkan mengurangkan kebutuhan pokok (sandang, pangan, papan, hutang jatuh tempo) terlebih dahulu.'}`
  );

  block = block.replace(
    /Jika sisa pendapatan bulanan[\s\S]*?2,5%\./,
    `{$t('zakat.penjelasan_hitung_zakatnya') || 'Jika sisa pendapatan bulanan mencapai nisab bulanan, kalikan sisa tersebut dengan 2,5%.'}`
  );

  block = block.replace(
    /\(Sumber: Al Qur'an Surah Al Baqarah ayat 267, Peraturan Menteri\s*Agama Nomor 31 Tahun 2019, Fatwa MUI Nomor 3 Tahun 2003, dan\s*pendapat Shaikh Yusuf Qardawi\)\./,
    `{$t('zakat.sumber_penghasilan') || '(Sumber: Al Qur\\'an Surah Al Baqarah ayat 267, Peraturan Menteri Agama Nomor 31 Tahun 2019, Fatwa MUI Nomor 3 Tahun 2003, dan pendapat Shaikh Yusuf Qardawi).'}`
  );

  page = page.replace(penghasilanBlockMatch[0], block);
}

fs.writeFileSync(pagePath, page, 'utf8');
console.log('UI Dark Mode and text replacements applied.');
