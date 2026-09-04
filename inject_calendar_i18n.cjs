const fs = require('fs');
const path = require('path');

// 1. Inject JSON Translations
const translations = {
    id: {
        title: "Kalender",
        hari_ini: "Hari Ini",
        cek_astrologi: "Cek Astrologi Kamu",
        months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
        days: ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"]
    },
    en: {
        title: "Calendar",
        hari_ini: "Today",
        cek_astrologi: "Check Your Astrology",
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    ar: {
        title: "التقويم",
        hari_ini: "اليوم",
        cek_astrologi: "تحقق من برجك",
        months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
        days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    },
    zh: {
        title: "日历",
        hari_ini: "今天",
        cek_astrologi: "查看您的占星",
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    },
    ja: {
        title: "カレンダー",
        hari_ini: "今日",
        cek_astrologi: "占星術をチェック",
        months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        days: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
    },
    ko: {
        title: "달력",
        hari_ini: "오늘",
        cek_astrologi: "당신의 점성술 확인",
        months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
        days: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    }
};

const monthKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const langs = Object.keys(translations);
langs.forEach(lang => {
    const jsonPath = path.join(__dirname, `src/lib/i18n/${lang}.json`);
    if (fs.existsSync(jsonPath)) {
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        if (!data.calendar) data.calendar = {};
        data.calendar.title = translations[lang].title;
        data.calendar.hari_ini = translations[lang].hari_ini;
        data.calendar.cek_astrologi = translations[lang].cek_astrologi;
        
        if (!data.calendar.months) data.calendar.months = {};
        translations[lang].months.forEach((m, i) => {
            data.calendar.months[monthKeys[i]] = m;
        });

        if (!data.calendar.days) data.calendar.days = {};
        translations[lang].days.forEach((d, i) => {
            data.calendar.days[dayKeys[i]] = d;
        });

        if (!data.common) data.common = {};
        if (!data.common.dashboard) {
            const dashboardT = {
                id: "Dashboard", en: "Dashboard", ar: "لوحة القيادة", zh: "仪表板", ja: "ダッシュボード", ko: "대시보드"
            };
            data.common.dashboard = dashboardT[lang];
        }
        
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    }
});

// 2. Modify +page.svelte
const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Inject import { t, locale }
if (!content.includes('import { t, locale }')) {
    content = content.replace(/<script lang="ts">/, '<script lang="ts">\n  import { t, locale } from "svelte-i18n";');
}

// Inject formatNumberDisplay
const formatNumberDisplayCode = `
  $: formatNumberDisplay = (num) => {
    let str = (num ?? "").toString();
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return str.replace(/[0-9]/g, function (w) {
        return arabicNumbers[+w];
      });
    }
    return str;
  };
`;
if (!content.includes('formatNumberDisplay =')) {
    content = content.replace(/<script lang="ts">[\s\S]*?import[^\n]*\n/, (match) => match + formatNumberDisplayCode);
}

// Replace hardcoded UI text
content = content.replace(/<PageHeader title="Kalender" backText="Dashboard" \/>/, `<PageHeader title={$t('calendar.title') || 'Kalender'} backText={$t('common.dashboard') || 'Dashboard'} />`);
content = content.replace(/>\s*Hari Ini\s*</g, `>{$t('calendar.hari_ini') || 'Hari Ini'}<`);
content = content.replace(/>\s*Cek Astrologi Kamu\s*</g, `>{$t('calendar.cek_astrologi') || 'Cek Astrologi Kamu'}<`);

// Convert static arrays to reactive arrays using $t
// `const daysName = [...]`
const daysNameRepl = `$: daysName = [
      $t('calendar.days.sun') || "Ahad",
      $t('calendar.days.mon') || "Senin",
      $t('calendar.days.tue') || "Selasa",
      $t('calendar.days.wed') || "Rabu",
      $t('calendar.days.thu') || "Kamis",
      $t('calendar.days.fri') || "Jumat",
      $t('calendar.days.sat') || "Sabtu",
    ];`;
content = content.replace(/const daysName = \[[^\]]+\];/, daysNameRepl);

// `const monthsName = [...]`
const monthsNameRepl = `$: monthsName = [
      $t('calendar.months.jan') || "Januari",
      $t('calendar.months.feb') || "Februari",
      $t('calendar.months.mar') || "Maret",
      $t('calendar.months.apr') || "April",
      $t('calendar.months.may') || "Mei",
      $t('calendar.months.jun') || "Juni",
      $t('calendar.months.jul') || "Juli",
      $t('calendar.months.aug') || "Agustus",
      $t('calendar.months.sep') || "September",
      $t('calendar.months.oct') || "Oktober",
      $t('calendar.months.nov') || "November",
      $t('calendar.months.dec') || "Desember",
    ];`;
content = content.replace(/const monthsName = \[[^\]]+\];/, monthsNameRepl);

// `const masehiMonths = [...]`
const masehiMonthsRepl = `$: masehiMonths = [
    $t('calendar.months.jan') || "Januari",
    $t('calendar.months.feb') || "Februari",
    $t('calendar.months.mar') || "Maret",
    $t('calendar.months.apr') || "April",
    $t('calendar.months.may') || "Mei",
    $t('calendar.months.jun') || "Juni",
    $t('calendar.months.jul') || "Juli",
    $t('calendar.months.aug') || "Agustus",
    $t('calendar.months.sep') || "September",
    $t('calendar.months.oct') || "Oktober",
    $t('calendar.months.nov') || "November",
    $t('calendar.months.dec') || "Desember",
  ];`;
content = content.replace(/const masehiMonths = \[[^\]]+\];/, masehiMonthsRepl);

// `const weekDays = [...]`
const weekDaysRepl = `$: weekDays = [
    $t('calendar.days.sun') || "Ahad",
    $t('calendar.days.mon') || "Senin",
    $t('calendar.days.tue') || "Selasa",
    $t('calendar.days.wed') || "Rabu",
    $t('calendar.days.thu') || "Kamis",
    $t('calendar.days.fri') || "Jum'at",
    $t('calendar.days.sat') || "Sabtu",
  ];`;
content = content.replace(/const weekDays = \[[^\]]+\];/, weekDaysRepl);

// Replace numeric rendering with formatNumberDisplay
content = content.replace(/\{masehiYear\}/g, "{formatNumberDisplay(masehiYear)}");
content = content.replace(/\{dominantHijriYear\} H/g, "{formatNumberDisplay(dominantHijriYear)} H");
content = content.replace(/\{day\.masehiDay\}/g, "{formatNumberDisplay(day.masehiDay)}");
content = content.replace(/\{day\.hijriDay\}/g, "{formatNumberDisplay(day.hijriDay)}");
content = content.replace(/\{day\.hijriYear\}/g, "{formatNumberDisplay(day.hijriYear)}");
content = content.replace(/\{year\}/g, "{formatNumberDisplay(year)}"); // Inside #each years as year

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Calendar localized successfully!");
