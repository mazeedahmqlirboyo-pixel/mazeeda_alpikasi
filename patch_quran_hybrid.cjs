const fs = require('fs');
const path = require('path');

const tsFiles = ['en.json', 'ar.json', 'ko.json', 'ja.json', 'zh.json', 'id.json'];
const noTafsirTranslations = {
  en: "Tafsir is not available in this language yet.",
  ar: "التفسير غير متوفر بهذه اللغة بعد.",
  ko: "이 언어로는 아직 타프시르가 제공되지 않습니다.",
  ja: "この言語でのタフスィールはまだ利用できません。",
  zh: "此语言暂不提供塔夫西尔 (Tafsir)。",
  id: "Tafsir tidak tersedia."
};

const localesDir = path.join(__dirname, 'src/lib/i18n');
tsFiles.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.quran && !data.quran.no_tafsir) {
        data.quran.no_tafsir = noTafsirTranslations[lang];
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`Error reading ${file}`);
    }
  }
});

const pagePath = path.join(__dirname, 'src/routes/quran/+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Add get store import
if (!page.includes("import { get } from 'svelte/store';")) {
  page = page.replace(
    "import { t, locale } from 'svelte-i18n';",
    "import { t, locale } from 'svelte-i18n';\n  import { get } from 'svelte/store';"
  );
}

// Inject hybrid translation fetch logic
const injectionPoint = `          data.ayat = data.ayat.map((v) => ({
            ...v,
            tafsir: 'Tafsir tidak tersedia untuk ayat ini.'
          }));
        }`;

const hybridCode = `          data.ayat = data.ayat.map((v) => ({
            ...v,
            tafsir: 'Tafsir tidak tersedia untuk ayat ini.'
          }));
        }

        // --- INJECT HYBRID TRANSLATION HERE ---
        const currentLang = get(locale) || 'id';
        if (currentLang !== 'id') {
          const editionMap = { 'en': 'en.sahih', 'ar': 'ar.muyassar', 'ko': 'ko.korean', 'ja': 'ja.japanese', 'zh': 'zh.jian' };
          const edition = editionMap[currentLang];
          if (edition) {
            try {
              const foreignRes = await fetch(\`https://api.alquran.cloud/v1/surah/\${nomor}/\${edition}\`);
              if (foreignRes.ok) {
                const foreignJson = await foreignRes.json();
                if (foreignJson.code === 200 && foreignJson.data && foreignJson.data.ayahs) {
                  const translationMap = new Map();
                  foreignJson.data.ayahs.forEach(a => {
                    translationMap.set(a.numberInSurah, a.text);
                  });
                  
                  data.ayat = data.ayat.map(v => ({
                    ...v,
                    teksIndonesia: translationMap.get(v.nomorAyat) || v.teksIndonesia,
                    tafsir: get(t)('quran.no_tafsir') || 'Tafsir is not available in this language yet.'
                  }));
                }
              }
            } catch (err) {
              console.error('Failed to fetch foreign translation', err);
            }
          }
        }`;

if (!page.includes("// --- INJECT HYBRID TRANSLATION HERE ---")) {
  page = page.replace(injectionPoint, hybridCode);
}

// Add reactive re-fetch on locale change
const endOfScript = "</script>";
const reactiveLocaleCode = `
  let currentLangTracker = '';
  $: if ($locale && $locale !== currentLangTracker) {
    if (currentLangTracker !== '') {
       if (currentSurahDetails) {
         fetchSurahDetails(selectedSurahId);
       }
    }
    currentLangTracker = $locale;
  }
</script>`;

if (!page.includes("currentLangTracker")) {
  page = page.replace(endOfScript, reactiveLocaleCode);
}

// Update the placeholder text logic when copying to clipboard so it doesn't hardcode "Terjemahan: "
page = page.replace(
  /Terjemahan: \$\{verse\.teksIndonesia\}/g,
  "${$t('quran.translation') || 'Terjemahan'}: ${verse.teksIndonesia}"
);


fs.writeFileSync(pagePath, page, 'utf8');
console.log("Patched Quran page with Hybrid Translations!");
