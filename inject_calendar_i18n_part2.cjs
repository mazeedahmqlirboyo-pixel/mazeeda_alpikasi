const fs = require('fs');
const path = require('path');

// 1. Inject JSON Translations
const translations = {
    id: {
        hari_penting: "Hari Penting",
        se_indonesia: "Se-Indonesia",
        libur_nasional: "Libur Nasional",
        tidak_libur: "Tidak Libur",
        lihat_semua: "Lihat Semua",
        sembunyikan: "Sembunyikan",
        astrologi: "Astrologi",
        lahir_weton: "Lahir & Weton",
        ketahui_watak: "Ketahui watak Masehi, Zodiak Tiongkok, hingga weton Jawa Anda secara komprehensif.",
        cek_manual: "Cek Manual",
        berikut_astrologi: "Berikut Adalah Astrologi Mu",
        tanggal_lahir_masehi: "Tanggal Lahir (Masehi)"
    },
    en: {
        hari_penting: "Important Days",
        se_indonesia: "in Indonesia",
        libur_nasional: "National Holiday",
        tidak_libur: "Not a Holiday",
        lihat_semua: "View All",
        sembunyikan: "Hide",
        astrologi: "Astrology",
        lahir_weton: "Birth & Weton",
        ketahui_watak: "Discover your Gregorian characteristics, Chinese Zodiac, and Javanese Weton comprehensively.",
        cek_manual: "Check Manually",
        berikut_astrologi: "Here is Your Astrology",
        tanggal_lahir_masehi: "Birth Date (Gregorian)"
    },
    ar: {
        hari_penting: "أيام هامة",
        se_indonesia: "في إندونيسيا",
        libur_nasional: "عطلة وطنية",
        tidak_libur: "ليس عطلة",
        lihat_semua: "عرض الكل",
        sembunyikan: "إخفاء",
        astrologi: "علم التنجيم",
        lahir_weton: "الولادة وويتون",
        ketahui_watak: "اكتشف خصائصك الميلادية، والبرج الصيني، وويتون الجاوي بشكل شامل.",
        cek_manual: "تحقق يدويًا",
        berikut_astrologi: "إليك علم التنجيم الخاص بك",
        tanggal_lahir_masehi: "تاريخ الميلاد (ميلادي)"
    },
    zh: {
        hari_penting: "重要日子",
        se_indonesia: "在印度尼西亚",
        libur_nasional: "公共假日",
        tidak_libur: "非假日",
        lihat_semua: "查看全部",
        sembunyikan: "隐藏",
        astrologi: "占星术",
        lahir_weton: "出生和Weton",
        ketahui_watak: "全面了解您的公历特征、中国生肖和爪哇Weton。",
        cek_manual: "手动检查",
        berikut_astrologi: "这是你的占星术",
        tanggal_lahir_masehi: "出生日期（公历）"
    },
    ja: {
        hari_penting: "重要な日",
        se_indonesia: "インドネシア",
        libur_nasional: "国民の祝日",
        tidak_libur: "祝日ではない",
        lihat_semua: "すべて見る",
        sembunyikan: "隠す",
        astrologi: "占星術",
        lahir_weton: "誕生とWeton",
        ketahui_watak: "グレゴリオ暦の特性、干支、ジャワのWetonを総合的に発見してください。",
        cek_manual: "手動で確認",
        berikut_astrologi: "あなたの占星術",
        tanggal_lahir_masehi: "生年月日（グレゴリオ暦）"
    },
    ko: {
        hari_penting: "중요한 날",
        se_indonesia: "인도네시아",
        libur_nasional: "공휴일",
        tidak_libur: "휴일 아님",
        lihat_semua: "모두 보기",
        sembunyikan: "숨기기",
        astrologi: "점성술",
        lahir_weton: "탄생 및 Weton",
        ketahui_watak: "그레고리력 특성, 띠, 자바 Weton을 종합적으로 알아보세요.",
        cek_manual: "수동으로 확인",
        berikut_astrologi: "귀하의 점성술입니다",
        tanggal_lahir_masehi: "생년월일 (그레고리력)"
    }
};

const langs = Object.keys(translations);
langs.forEach(lang => {
    const jsonPath = path.join(__dirname, `src/lib/i18n/${lang}.json`);
    if (fs.existsSync(jsonPath)) {
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        if (!data.calendar) data.calendar = {};
        
        for (const [key, value] of Object.entries(translations[lang])) {
            data.calendar[key] = value;
        }
        
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    }
});

// 2. Modify +page.svelte
const pagePath = path.join(__dirname, 'src/routes/kalender/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace Hari Penting section UI texts
content = content.replace(/Hari Penting\s*<span/g, `{$t('calendar.hari_penting') || 'Hari Penting'} <span`);
content = content.replace(/>Se-Indonesia<\/span>/g, `>{$t('calendar.se_indonesia') || 'Se-Indonesia'}</span>`);
content = content.replace(/>Libur Nasional<\/span>/g, `>{$t('calendar.libur_nasional') || 'Libur Nasional'}</span>`);
content = content.replace(/>Tidak Libur<\/span>/g, `>{$t('calendar.tidak_libur') || 'Tidak Libur'}</span>`);
content = content.replace(/\{showAllPeringatan \? 'Sembunyikan' : `Lihat Semua \(\$\{currentMonthPeringatan\.length\}\)`\}/g, `{showAllPeringatan ? ($t('calendar.sembunyikan') || 'Sembunyikan') : \`\${$t('calendar.lihat_semua') || 'Lihat Semua'} (\${formatNumberDisplay(currentMonthPeringatan.length)})\`}`);

// Apply formatNumberDisplay to dates in Hari Penting
content = content.replace(/\{p\.tanggal\}/g, `{formatNumberDisplay(p.tanggal)}`);

// Replace Astrologi section UI texts
content = content.replace(/Astrologi\s*<span/g, `{$t('calendar.astrologi') || 'Astrologi'} <span`);
content = content.replace(/>Lahir & Weton<\/span>/g, `>{$t('calendar.lahir_weton') || 'Lahir & Weton'}</span>`);
content = content.replace(/Ketahui watak Masehi, Zodiak Tiongkok, hingga weton Jawa Anda secara\s*komprehensif\./g, `{$t('calendar.ketahui_watak') || 'Ketahui watak Masehi, Zodiak Tiongkok, hingga weton Jawa Anda secara komprehensif.'}`);
content = content.replace(/>\s*Cek Manual\s*<\/button>/g, `>{$t('calendar.cek_manual') || 'Cek Manual'}</button>`);
content = content.replace(/>\s*Berikut Adalah Astrologi Mu\s*<\/button>/g, `>{$t('calendar.berikut_astrologi') || 'Berikut Adalah Astrologi Mu'}</button>`);
content = content.replace(/>\s*Tanggal Lahir \(Masehi\)\s*<\/p>/g, `>{$t('calendar.tanggal_lahir_masehi') || 'Tanggal Lahir (Masehi)'}</p>`);

// Also format any numbers in birthResult (like {birthResult.masehi} string which contains numbers)
content = content.replace(/\{birthResult\.masehi\}/g, `{formatNumberDisplay(birthResult.masehi)}`);
content = content.replace(/\{birthResult\.hijri\}/g, `{formatNumberDisplay(birthResult.hijri)}`);
content = content.replace(/\{birthResult\.ageStr\}/g, `{formatNumberDisplay(birthResult.ageStr)}`);
content = content.replace(/\{birthResult\.weton\}/g, `{formatNumberDisplay(birthResult.weton)}`);
content = content.replace(/\{birthResult\.neptu\}/g, `{formatNumberDisplay(birthResult.neptu)}`);

fs.writeFileSync(pagePath, content, 'utf8');
console.log("Hari Penting & Astrologi sections localized successfully!");
