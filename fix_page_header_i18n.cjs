const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace the PageHeader title and backText
const regex = /<PageHeader title=\{calculatorType === 'zakat' \? \(\$t\('zakat\.kalkulator_zakat'\) \|\| 'Kalkulator Zakat'\) : 'Waris \(Faraidh\)'\} backText="Kembali" \/>/;
const replacement = `<PageHeader title={calculatorType === 'zakat' ? ($t('zakat.kalkulator_zakat') || 'Kalkulator Zakat') : ($t('faraidh.waris_faraidh') || 'Waris (Faraidh)')} backText={$t('common.kembali') || 'Kembali'} />`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Replaced PageHeader in +page.svelte");
} else {
    console.log("PageHeader not found or already replaced.");
}

// Add to i18n JSONs
const translations = {
    id: {
        faraidh: "Waris (Faraidh)",
        kembali: "Kembali"
    },
    en: {
        faraidh: "Inheritance (Faraidh)",
        kembali: "Back"
    },
    ar: {
        faraidh: "المواريث (الفرائض)",
        kembali: "رجوع"
    },
    zh: {
        faraidh: "继承 (Faraidh)",
        kembali: "返回"
    },
    ja: {
        faraidh: "相続 (Faraidh)",
        kembali: "戻る"
    },
    ko: {
        faraidh: "상속 (Faraidh)",
        kembali: "뒤로"
    }
};

const langs = Object.keys(translations);
langs.forEach(lang => {
    const jsonPath = path.join(__dirname, `src/lib/i18n/${lang}.json`);
    if (fs.existsSync(jsonPath)) {
        let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        if (!data.faraidh) data.faraidh = {};
        data.faraidh.waris_faraidh = translations[lang].faraidh;
        
        if (!data.common) data.common = {};
        data.common.kembali = translations[lang].kembali;
        
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    }
});
console.log("Injected faraidh.waris_faraidh and common.kembali to i18n JSON files.");
