const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

const localizeDateStringFn = `
  $: localizeDateString = (dateStr) => {
    if (!dateStr) return "";
    let str = formatNumberDisplay(dateStr); // apply number format first

    // Replace Masehi months
    const masehiMap = {
      "januari": $t('calendar.months.jan') || "Januari",
      "februari": $t('calendar.months.feb') || "Februari",
      "maret": $t('calendar.months.mar') || "Maret",
      "april": $t('calendar.months.apr') || "April",
      "mei": $t('calendar.months.may') || "Mei",
      "juni": $t('calendar.months.jun') || "Juni",
      "juli": $t('calendar.months.jul') || "Juli",
      "agustus": $t('calendar.months.aug') || "Agustus",
      "september": $t('calendar.months.sep') || "September",
      "oktober": $t('calendar.months.oct') || "Oktober",
      "november": $t('calendar.months.nov') || "November",
      "desember": $t('calendar.months.dec') || "Desember"
    };

    // Replace Hijri months
    const hijriMap = {
      "muharram": $t('calendar.hijri_months.m1') || "Muharram",
      "safar": $t('calendar.hijri_months.m2') || "Safar",
      "rabi'ul awal": $t('calendar.hijri_months.m3') || "Rabi'ul Awal",
      "rabi'ul akhir": $t('calendar.hijri_months.m4') || "Rabi'ul Akhir",
      "jumadil awal": $t('calendar.hijri_months.m5') || "Jumadil Awal",
      "jumadil akhir": $t('calendar.hijri_months.m6') || "Jumadil Akhir",
      "rajab": $t('calendar.hijri_months.m7') || "Rajab",
      "sya'ban": $t('calendar.hijri_months.m8') || "Sya'ban",
      "ramadhan": $t('calendar.hijri_months.m9') || "Ramadhan",
      "syawal": $t('calendar.hijri_months.m10') || "Syawal",
      "dzulqa'dah": $t('calendar.hijri_months.m11') || "Dzulqa'dah",
      "dzulhijjah": $t('calendar.hijri_months.m12') || "Dzulhijjah",
      
      // Additional edge cases for text in Hari Penting
      "rabiul awal": $t('calendar.hijri_months.m3') || "Rabi'ul Awal",
      "rabiul akhir": $t('calendar.hijri_months.m4') || "Rabi'ul Akhir",
      "zulhijah": $t('calendar.hijri_months.m12') || "Dzulhijjah",
      "muharam": $t('calendar.hijri_months.m1') || "Muharram"
    };

    const combinedMap = { ...masehiMap, ...hijriMap };
    
    // Replace whole words (case insensitive matching)
    for (const [key, value] of Object.entries(combinedMap)) {
      const regex = new RegExp("\\\\b" + key + "\\\\b", "gi");
      str = str.replace(regex, value);
    }
    
    return str;
  };
`;

if (!content.includes('localizeDateString =')) {
    content = content.replace(/<script lang="ts">[\s\S]*?import[^\n]*\n/, (match) => match + localizeDateStringFn);
}

// Replace formatNumberDisplay(p.tanggal) with localizeDateString(p.tanggal)
content = content.replace(/\{formatNumberDisplay\(p\.tanggal\)\}/g, '{localizeDateString(p.tanggal)}');

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Date string localization injected successfully!");
