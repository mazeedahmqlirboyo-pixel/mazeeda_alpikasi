const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/routes/zakat-faraidh/+page.svelte');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace zakat.harta_bersih with faraidh.harta_bersih
if (content.includes("zakat.harta_bersih")) {
    content = content.replace(/zakat\.harta_bersih/g, "faraidh.harta_bersih");
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log("Replaced zakat.harta_bersih with faraidh.harta_bersih in +page.svelte");
} else {
    console.log("zakat.harta_bersih not found in +page.svelte");
}

// Add to i18n JSONs
const translations = {
    id: "Harta Bersih",
    en: "Net Estate",
    ar: "التركة الصافية",
    zh: "净遗产",
    ja: "純資産",
    ko: "순 자산"
};

const langs = Object.keys(translations);
langs.forEach(lang => {
    const jsonPath = path.join(__dirname, `src/lib/i18n/${lang}.json`);
    let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    if (!data.faraidh) data.faraidh = {};
    data.faraidh.harta_bersih = translations[lang];
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
});
console.log("Injected faraidh.harta_bersih to i18n JSON files.");
