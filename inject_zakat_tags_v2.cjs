const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  // Kalkulator Zakat Header
  [`title={calculatorType === 'zakat' ? 'Kalkulator Zakat' : 'Waris (Faraidh)'}`, `title={calculatorType === 'zakat' ? ($t('zakat.kalkulator_zakat') || 'Kalkulator Zakat') : 'Waris (Faraidh)'}`],

  // Ketuk tombol
  [`*Ketuk tombol di atas untuk memilih atau mengubah jenis zakat yang ingin dihitung`, `*{$t('zakat.ketuk_tombol') || 'Ketuk tombol di atas untuk memilih atau mengubah jenis zakat yang ingin dihitung'}`],

  // Realtime Aktif (wait, the text is REALTIME AKTIF or Realtime Aktif?)
  [`>Realtime Aktif<`, `>{$t('zakat.realtime_aktif') || 'REALTIME AKTIF'}<`],

  // Nisab 85g emas. Acuan:
  [`Nisab 85g emas. Acuan:`, `{$t('zakat.nisab_85g_emas') || 'Nisab 85g emas. Acuan:'}`],

  // Diperbarui
  [`(Diperbarui:`, `({$t('zakat.diperbarui') || 'Diperbarui'}:`],
  
  // via
  [` via {goldDataSource}`, ` {$t('zakat.via') || 'via'} {goldDataSource}`],
  [` via {silverDataSource}`, ` {$t('zakat.via') || 'via'} {silverDataSource}`],

  // klik disini
  [`>klik disini<`, `>{$t('zakat.klik_disini') || 'klik disini'}<`],

  // untuk mengakses halaman tersebut
  [`untuk mengakses halaman tersebut`, `{$t('zakat.untuk_mengakses_halaman') || 'untuk mengakses halaman tersebut'}`],

  // Isi Pendapatan
  [`>Isi Pendapatan<`, `>{$t('zakat.isi_pendapatan') || 'Isi Pendapatan'}<`],

  // Gaji Pokok
  [`>Gaji Pokok / Penghasilan Bulanan<`, `>{$t('zakat.gaji_pokok') || 'Gaji Pokok / Penghasilan Bulanan'}<`],

  // Pendapatan Lain
  [`>Pendapatan Lain / Bonus Bulanan<`, `>{$t('zakat.pendapatan_lain') || 'Pendapatan Lain / Bonus Bulanan'}<`],

  // Kurangi Kebutuhan
  [`>Kurangi Kebutuhan Pokok Bulanan<`, `>{$t('zakat.kurangi_kebutuhan') || 'Kurangi Kebutuhan Pokok Bulanan'}<`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.split(from).join(to);
  } else {
    console.log("NOT FOUND: ", from);
  }
}

// 2. Also inject these new translation keys into the JSON files
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const missingTranslations = {
  en: {
    nisab_85g_emas: "Nisab 85g gold. Reference:",
    untuk_mengakses_halaman: "to access that page"
  },
  id: {
    nisab_85g_emas: "Nisab 85g emas. Acuan:",
    untuk_mengakses_halaman: "untuk mengakses halaman tersebut"
  },
  ar: {
    nisab_85g_emas: "نصاب 85 جم ذهب. المرجع:",
    untuk_mengakses_halaman: "للوصول إلى تلك الصفحة"
  },
  zh: {
    nisab_85g_emas: "起征点85克黄金。参考：",
    untuk_mengakses_halaman: "访问该页面"
  },
  ja: {
    nisab_85g_emas: "ニサーブ85g金。参考：",
    untuk_mengakses_halaman: "そのページにアクセスする"
  },
  ko: {
    nisab_85g_emas: "니삽 85g 금. 참조:",
    untuk_mengakses_halaman: "해당 페이지에 액세스하려면"
  }
};

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  if (missingTranslations[lang]) {
    data.zakat = { ...(data.zakat || {}), ...missingTranslations[lang] };
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  }
}

fs.writeFileSync(file, s);
console.log('Second pass injection complete!');
