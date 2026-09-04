const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  // 1. Translations
  [`Panduan Sighting Arah`, `{$t('kiblat.panduan_sighting') || 'Panduan Sighting Arah'}`],
  [`</span> lagi`, `</span> {$t('kiblat.lagi') || 'lagi'}`], // For putar ke kanan/kiri
  
  // 2. Number formatting
  [`{distanceToMecca.toLocaleString('id-ID')}`, `{formatNumberStr(distanceToMecca, $locale)}`],
  [`{latitude.toFixed(4)}°, {longitude.toFixed(4)}°`, `{formatNumberStr(latitude.toFixed(4), $locale)}°, {formatNumberStr(longitude.toFixed(4), $locale)}°`],
  [`{Math.round(diff)}°`, `{formatNumberStr(Math.round(diff), $locale)}°`],
  [`{Math.round(Math.abs(diff))}°`, `{formatNumberStr(Math.round(Math.abs(diff)), $locale)}°`],
  [`{Math.round(heading)}°`, `{formatNumberStr(Math.round(heading), $locale)}°`],
  [`{qiblaBearing}°`, `{formatNumberStr(qiblaBearing, $locale)}°`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.replace(new RegExp(from.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'), 'g'), to);
  } else {
    console.log("NOT FOUND: ", from);
  }
}

fs.writeFileSync(file, s);
console.log("Kiblat numbers and missing texts patched successfully!");
