const fs = require('fs');
let s = fs.readFileSync('src/routes/+page.svelte', 'utf8');

const helpers = `

  function translatePrayerName(name: string, tFunc: any) {
    if (!name) return '';
    const isBesok = name.includes('(Besok)');
    const baseName = name.replace(' (Besok)', '').toLowerCase();
    const translatedName = tFunc('prayer_times.' + baseName) || baseName;
    if (isBesok) {
      return \`\${translatedName} (\${tFunc('prayer_times.tomorrow') || 'Besok'})\`;
    }
    return translatedName;
  }

  function translateCountdown(countdown: string, tFunc: any, loc: string | null | undefined) {
    if (!countdown) return '';
    const matchH = countdown.match(/(\\d+)j/);
    const matchM = countdown.match(/(\\d+)m/);
    const h = matchH ? matchH[1] : null;
    const m = matchM ? matchM[1] : null;
    let out = '';
    if (h) out += \`\${loc === 'ar' ? toArabicNumerals(h) : h}\${tFunc('prayer_times.hour_short') || 'j'} \`;
    if (m) out += \`\${loc === 'ar' ? toArabicNumerals(m) : m}\${tFunc('prayer_times.minute_short') || 'm'} \`;
    out += tFunc('prayer_times.remaining') || 'lagi';
    return out.trim();
  }
`;

if (!s.includes('translatePrayerName')) {
  s = s.replace(/return dateStr;\r?\n\s*}\r?\n/, match => match + helpers);
  fs.writeFileSync('src/routes/+page.svelte', s);
}
