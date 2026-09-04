const fs = require('fs');

const filePath = 'src/routes/+page.svelte';
let s = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ['Fitur Islami\n    </h2>', `{$t('islamic_features.title') || 'Fitur Islami'}\n    </h2>`],
  ['🧭 Kompas Arah', `{$t('islamic_features.qibla_badge') || '🧭 Kompas Arah'}`],
  ['\n              Arah Kiblat\n            </h3>', `\n              {$t('islamic_features.qibla_title') || 'Arah Kiblat'}\n            </h3>`],
  ['Cari arah kiblat sholat secara real-time dengan HP atau GPS.', `{$t('islamic_features.qibla_desc') || 'Cari arah kiblat sholat secara real-time dengan HP atau GPS.'}`],

  ['🧮 Hitung Zakat', `{$t('islamic_features.zakat_badge') || '🧮 Hitung Zakat'}`],
  ['\n              Kalkulator Zakat\n            </h3>', `\n              {$t('islamic_features.zakat_title') || 'Kalkulator Zakat'}\n            </h3>`],
  ['Hitung Zakat Penghasilan, Maal, Emas, Peternakan, Saham, dll.', `{$t('islamic_features.zakat_desc') || 'Hitung Zakat Penghasilan, Maal, Emas, Peternakan, Saham, dll.'}`],

  ['⚖️ Pembagian Waris', `{$t('islamic_features.faraidh_badge') || '⚖️ Pembagian Waris'}`],
  ['\n              Kalkulator Faraidh\n            </h3>', `\n              {$t('islamic_features.faraidh_title') || 'Kalkulator Faraidh'}\n            </h3>`],
  ['Hitung pembagian waris secara syariat Islam dengan mudah.', `{$t('islamic_features.faraidh_desc') || 'Hitung pembagian waris secara syariat Islam dengan mudah.'}`],

  ['📅 Kalender', `{$t('islamic_features.calendar_badge') || '📅 Kalender'}`],
  ['\n              Masehi & Hijriah\n            </h3>', `\n              {$t('islamic_features.calendar_title') || 'Masehi & Hijriah'}\n            </h3>`],
  ['Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu\n              layar.', `{$t('islamic_features.calendar_desc') || 'Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu layar.'}`],

  ['📿 Zikir Pintar', `{$t('islamic_features.tasbih_badge') || '📿 Zikir Pintar'}`],
  ['\n              Tasbih Digital\n            </h3>', `\n              {$t('islamic_features.tasbih_title') || 'Tasbih Digital'}\n            </h3>`],
  ['Hitung dan simpan zikir harianmu secara otomatis.', `{$t('islamic_features.tasbih_desc') || 'Hitung dan simpan zikir harianmu secara otomatis.'}`],

  ['💳 Manajemen Uang', `{$t('islamic_features.cashflow_badge') || '💳 Manajemen Uang'}`],
  ['\n              Cash Flow\n            </h3>', `\n              {$t('islamic_features.cashflow_title') || 'Cash Flow'}\n            </h3>`],
  ['Catat Cash Flow harianmu dengan mudah dan aman sebagaimana isyarat QS. Al-Baqarah: 282.', `{$t('islamic_features.cashflow_desc') || 'Catat Cash Flow harianmu dengan mudah dan aman sebagaimana isyarat QS. Al-Baqarah: 282.'}`],

  ['🤝 Donasi / Kas', `{$t('islamic_features.kas_badge') || '🤝 Donasi / Kas'}`],
  ['\n              Kas Angkatan\n            </h3>', `\n              {$t('islamic_features.kas_title') || 'Kas Angkatan'}\n            </h3>`],
  ['Dukung kemaslahatan bersama melalui kontribusi Kas Angkatan.', `{$t('islamic_features.kas_desc') || 'Dukung kemaslahatan bersama melalui kontribusi Kas Angkatan.'}`]
];

for (const [find, replace] of replacements) {
  if (s.includes(find)) {
    s = s.replace(find, replace);
  } else {
    console.log("NOT FOUND: ", find.substring(0, 30));
  }
}

fs.writeFileSync(filePath, s);
console.log("Done patching page.svelte");
