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
  s = s.replace('    return dateStr;\n  }', '    return dateStr;\n  }\n' + helpers);
}

s = s.replace(/>Jadwal Sholat<\/span/g, '>{$t(\'prayer_times.jadwal_sholat\') || \'Jadwal Sholat\'}</span');
s = s.replace(/>\s*Sholat Berikutnya\s*<\/p>/g, '> {$t(\'prayer_times.next_prayer\') || \'Sholat Berikutnya\'} </p>');
s = s.replace(/{nextPrayer\.name} \({nextPrayer\.time}\)/g, '{translatePrayerName(nextPrayer.name, $t)} ({$locale === \'ar\' ? toArabicNumerals(nextPrayer.time) : nextPrayer.time})');
s = s.replace(/⏳\s*{nextPrayer\.countdown}/g, '⏳ {translateCountdown(nextPrayer.countdown, $t, $locale)}');
s = s.replace(/>\s*Subuh\s*<\/p>/g, '> {$t(\'prayer_times.subuh\') || \'Subuh\'} </p>');
s = s.replace(/{isFridayLocal \? "Jum'at" : "Dzuhur"}/g, '{isFridayLocal ? ($t(\'prayer_times.jumat\') || "Jum\'at") : ($t(\'prayer_times.dzuhur\') || "Dzuhur")}');
s = s.replace(/>\s*Ashar\s*<\/p>/g, '> {$t(\'prayer_times.ashar\') || \'Ashar\'} </p>');
s = s.replace(/>\s*Maghrib\s*<\/p>/g, '> {$t(\'prayer_times.maghrib\') || \'Maghrib\'} </p>');
s = s.replace(/>\s*Isya\s*<\/p>/g, '> {$t(\'prayer_times.isya\') || \'Isya\'} </p>');

s = s.replace(/{prayerTimes\.Subuh}/g, '{$locale === \'ar\' ? toArabicNumerals(prayerTimes.Subuh) : prayerTimes.Subuh}');
s = s.replace(/{prayerTimes\.Dzuhur}/g, '{$locale === \'ar\' ? toArabicNumerals(prayerTimes.Dzuhur) : prayerTimes.Dzuhur}');
s = s.replace(/{prayerTimes\.Ashar}/g, '{$locale === \'ar\' ? toArabicNumerals(prayerTimes.Ashar) : prayerTimes.Ashar}');
s = s.replace(/{prayerTimes\.Maghrib}/g, '{$locale === \'ar\' ? toArabicNumerals(prayerTimes.Maghrib) : prayerTimes.Maghrib}');
s = s.replace(/{prayerTimes\.Isya}/g, '{$locale === \'ar\' ? toArabicNumerals(prayerTimes.Isya) : prayerTimes.Isya}');

fs.writeFileSync('src/routes/+page.svelte', s);
