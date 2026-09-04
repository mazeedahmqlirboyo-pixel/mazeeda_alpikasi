const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

// Replace the generic import with specific imports
page = page.replace(
  "import n2words from 'n2words';",
  `import n2wordsEN from 'n2words/en-US.js';
  import n2wordsAR from 'n2words/ar-SA.js';
  import n2wordsZH from 'n2words/zh-Hans-CN.js';
  import n2wordsJA from 'n2words/ja-JP.js';
  import n2wordsKO from 'n2words/ko-KR.js';`
);

// Replace the n2words call
const oldTryCatch = /try \{\s*let langCode = 'en';[\s\S]*?\} catch \(e\) \{\s*\/\/ Fallback to English[\s\S]*?\}\s*\}/;

const newTryCatch = `
    try {
      let suffix = "";
      if (selectedCurrency === 'USD') suffix = " Dollars";
      if (selectedCurrency === 'SAR') suffix = " ريال";
      if (selectedCurrency === 'CNY') suffix = " 元";
      if (selectedCurrency === 'JPY') suffix = " 円";
      if (selectedCurrency === 'KRW') suffix = " 원";
      if (selectedCurrency === 'IDR') suffix = " Rupiah";

      let words = "";
      if ($locale === 'en') words = n2wordsEN(nilai);
      else if ($locale === 'ar') words = n2wordsAR(nilai);
      else if ($locale === 'zh') words = n2wordsZH(nilai);
      else if ($locale === 'ja') words = n2wordsJA(nilai);
      else if ($locale === 'ko') words = n2wordsKO(nilai);
      else words = n2wordsEN(nilai);

      return words + suffix;
    } catch (e) {
      return "";
    }
`;

page = page.replace(oldTryCatch, newTryCatch);

fs.writeFileSync(pagePath, page, 'utf8');
console.log('n2words imports fixed for Vite.');
