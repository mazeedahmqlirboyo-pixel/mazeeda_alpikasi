const fs = require('fs');

const filePath = 'src/routes/+page.svelte';
let s = fs.readFileSync(filePath, 'utf8');

const regexReplacements = [
  // Title
  [/Fitur Islami\s*<\/h2>/, `{$t('islamic_features.title') || 'Fitur Islami'}\n    </h2>`],
  // Qibla
  [/>\s*Arah Kiblat\s*<\/h3>/, `>\n              {$t('islamic_features.qibla_title') || 'Arah Kiblat'}\n            </h3>`],
  // Zakat
  [/>\s*Kalkulator Zakat\s*<\/h3>/, `>\n              {$t('islamic_features.zakat_title') || 'Kalkulator Zakat'}\n            </h3>`],
  // Faraidh
  [/>\s*Kalkulator Faraidh\s*<\/h3>/, `>\n              {$t('islamic_features.faraidh_title') || 'Kalkulator Faraidh'}\n            </h3>`],
  // Calendar
  [/>\s*Masehi & Hijriah\s*<\/h3>/, `>\n              {$t('islamic_features.calendar_title') || 'Masehi & Hijriah'}\n            </h3>`],
  [/Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu\s*layar\./, `{$t('islamic_features.calendar_desc') || 'Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu layar.'}`],
  // Tasbih
  [/>\s*Tasbih Digital\s*<\/h3>/, `>\n              {$t('islamic_features.tasbih_title') || 'Tasbih Digital'}\n            </h3>`],
  // Cash Flow
  [/>\s*Cash Flow\s*<\/h3>/, `>\n              {$t('islamic_features.cashflow_title') || 'Cash Flow'}\n            </h3>`],
  // Kas Angkatan
  [/>\s*Kas Angkatan\s*<\/h3>/, `>\n              {$t('islamic_features.kas_title') || 'Kas Angkatan'}\n            </h3>`]
];

for (const [regex, replace] of regexReplacements) {
  if (regex.test(s)) {
    s = s.replace(regex, replace);
  } else {
    console.log("NOT FOUND REGEX: ", regex);
  }
}

fs.writeFileSync(filePath, s);
console.log("Done patching page.svelte with Regex");
