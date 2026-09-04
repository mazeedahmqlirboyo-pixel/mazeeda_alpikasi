const fs = require('fs');
const path = require('path');

const translations = {
    id: ["Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah"],
    en: ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"],
    ar: ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"],
    zh: ["穆哈兰姆月", "色法尔月", "赖比月", "赖比阿色尔月", "主马达月", "主马达阿色尔月", "赖哲卜月", "舍尔邦月", "赖买丹月", "闪瓦鲁月", "祖尔喀尔达月", "祖尔希哲月"],
    ja: ["ムハッラム", "サファル", "ラビー・ウル・アウワル", "ラビー・ウッ・サーニー", "ジュマーダー・アル・ウーラー", "ジュマーダー・アッ・サーニー", "ラジャブ", "シャアバーン", "ラマダーン", "シャウワール", "ズー・アル＝カアダ", "ズー・アル＝ヒッジャ"],
    ko: ["무하람", "사파르", "라비 알 아왈", "라비 알 타니", "주마다 알 아왈", "주마다 알 타니", "라잡", "샤반", "라마단", "샤왈", "두 알 키다", "두 알 히자"]
};

const keys = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12"];
const indoKeysMap = {
    "muharram": "m1", "safar": "m2", "rabi'ul awal": "m3", "rabi'ul akhir": "m4", "jumadil awal": "m5", 
    "jumadil akhir": "m6", "rajab": "m7", "sya'ban": "m8", "ramadhan": "m9", "syawal": "m10", 
    "dzulqa'dah": "m11", "dzulhijjah": "m12"
};

// 1. Inject JSON
const langs = Object.keys(translations);
langs.forEach(lang => {
    const jsonPath = path.join(__dirname, `src/lib/i18n/${lang}.json`);
    if (fs.existsSync(jsonPath)) {
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (!data.calendar) data.calendar = {};
        if (!data.calendar.hijri_months) data.calendar.hijri_months = {};
        
        translations[lang].forEach((m, i) => {
            data.calendar.hijri_months[keys[i]] = m;
        });
        
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    }
});

// 2. Modify +page.svelte
const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Inject localizeHijriMonth function in script
const localizeFn = `
  $: localizeHijriMonth = (hijriStr) => {
    if (!hijriStr) return "";
    const map = {
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
      "dzulhijjah": $t('calendar.hijri_months.m12') || "Dzulhijjah"
    };
    
    // Hijri string could be "Safar" or "Safar - Rabi'ul Awal"
    const parts = hijriStr.split(" - ");
    const localized = parts.map(p => map[p.toLowerCase()] || p);
    return localized.join(" - ");
  };
`;

if (!content.includes('localizeHijriMonth =')) {
    content = content.replace(/<script lang="ts">[\s\S]*?import[^\n]*\n/, (match) => match + localizeFn);
}

// Replace in UI
// 1. {dominantHijriMonth} -> {localizeHijriMonth(dominantHijriMonth)}
content = content.replace(/\{dominantHijriMonth\}/g, '{localizeHijriMonth(dominantHijriMonth)}');

// 2. {day.hijriMonth} -> {localizeHijriMonth(day.hijriMonth)}
content = content.replace(/\{day\.hijriMonth\}/g, '{localizeHijriMonth(day.hijriMonth)}');

// 3. Update birthResult assignment to use localized month but wait, birthResult is a static object built once.
// If language changes, it stays static. But we can just format it at string building time.
// Since we want birthResult to be fully reactive to language changes, it's better to update it in UI.
// But wait, {birthResult.hijri} contains the whole string "day month year H".
// Let's modify processBirthDate to only store raw day/month/year instead of formatted strings?
// No, simpler: in birthResult building: 
// \`\${hInfo.day} \${hInfo.month} \${hInfo.year} H\`
// We can replace the building to use the helper. But wait, if they change language AFTER getting result?
// The user already told me it didn't change for the header. They didn't mention Astrologi. I will just fix it in string building:
content = content.replace(/hijri: \`\$\{hInfo\.day\} \$\{hInfo\.month\} \$\{hInfo\.year\} H\`,/, 'hijri: `${hInfo.day} ${localizeHijriMonth(hInfo.month)} ${hInfo.year} H`,');

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Hijri months localized!");
