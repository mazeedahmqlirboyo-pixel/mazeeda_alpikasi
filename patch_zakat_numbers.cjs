const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// 1. Add currentLocale logic if not exists
if (!s.includes('function formatNumberStr(num, loc)')) {
  s = s.replace(
    /function formatRupiah\(num: number\): string \{[^}]+\}/,
    `function formatNumberStr(num, loc) {
    if (typeof num === "undefined" || num === null) return num;
    if (loc === "ar") {
      const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
      return num.toString().replace(/[0-9]/g, w => idArabic[w]);
    }
    return num.toLocaleString(loc === "id" ? "id-ID" : loc);
  }

  function formatRupiah(num: number, loc: string = 'id'): string {
    let valStr = Math.round(num).toLocaleString("id-ID");
    if (loc === "ar") {
      const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
      valStr = valStr.replace(/[0-9]/g, w => idArabic[w]);
    }
    return "Rp " + valStr;
  }`
  );
}

// 2. Replace all formatRupiah(...) calls to pass $locale
// A regex like formatRupiah(something) -> formatRupiah(something, $locale)
// We have to be careful with nested parentheses.
// A simpler way: split by 'formatRupiah(' and find the matching closing parenthesis.
let parts = s.split('formatRupiah(');
let newS = parts[0];
for (let i = 1; i < parts.length; i++) {
  let part = parts[i];
  let openCount = 1;
  let closeIdx = -1;
  for (let j = 0; j < part.length; j++) {
    if (part[j] === '(') openCount++;
    else if (part[j] === ')') openCount--;
    if (openCount === 0) {
      closeIdx = j;
      break;
    }
  }
  
  if (closeIdx !== -1) {
    let inner = part.substring(0, closeIdx);
    // If it doesn't already have $locale, add it
    if (!inner.includes('$locale')) {
      inner = inner + ', $locale';
    }
    newS += 'formatRupiah(' + inner + part.substring(closeIdx);
  } else {
    newS += 'formatRupiah(' + part;
  }
}
s = newS;

// 3. Update hardcoded numbers like 2026, 85g, 2.5%, 0
// We'll replace specific strings known in the UI
const numReps = [
  [`Nisab (85g) LM Antam produksi tahun 2026`, `{$t('zakat.nisab_85g') || 'Nisab (85g) LM Antam produksi tahun '} {formatNumberStr(2026, $locale)}`],
  [`produksi tahun 2026`, `produksi tahun '} {formatNumberStr(2026, $locale)}`], // In case it was partially replaced
  [`(85g)`, `({formatNumberStr(85, $locale)}g)`],
  [`(2.5%)`, `({formatNumberStr(2.5, $locale)}%)`],
  [`2,5%`, `{formatNumberStr(2.5, $locale)}%`],
  [`2.5%`, `{formatNumberStr(2.5, $locale)}%`],
  [`Rp 0`, `Rp {formatNumberStr(0, $locale)}`],
  [`Kalkulator Zakat</PageHeader>`, `{$t('zakat.kalkulator_zakat') || 'Kalkulator Zakat'}</PageHeader>`],
  [`title="Kalkulator Zakat"`, `title={$t('zakat.kalkulator_zakat') || 'Kalkulator Zakat'}`]
];

for (const [from, to] of numReps) {
  if (s.includes(from)) {
    s = s.replace(new RegExp(from.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'), 'g'), to);
  }
}

fs.writeFileSync(file, s);
console.log('Svelte page fully localized with Arabic numeral support!');
