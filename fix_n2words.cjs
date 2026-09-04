const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// Replace the old n2words import and usage
const oldImportRegex = /\/\/\s*@ts-ignore\n\s*import n2words from "n2words";/;
const newImport = `import { toCardinal as idN2Words } from 'n2words/id-ID';
  import { toCardinal as enN2Words } from 'n2words/en-US';
  import { toCardinal as arN2Words } from 'n2words/ar-SA';
  import { toCardinal as zhN2Words } from 'n2words/zh-Hans-CN';
  import { toCardinal as jaN2Words } from 'n2words/ja-JP';
  import { toCardinal as koN2Words } from 'n2words/ko-KR';`;
s = s.replace(oldImportRegex, newImport);

// Replace the terbilang logic
const terbilangBodyRegex = /try \{\s*if \(selectedCurrency === 'IDR'\) return n2words\(n, \{ lang: 'id' \}\) \+ " Rupiah";\s*if \(selectedCurrency === 'USD'\) return n2words\(n, \{ lang: 'en' \}\) \+ " Dollars";\s*if \(selectedCurrency === 'SAR'\) return n2words\(n, \{ lang: 'ar' \}\) \+ " Riyal";\s*if \(selectedCurrency === 'CNY'\) return n2words\(n, \{ lang: 'zh' \}\) \+ " Yuan";\s*if \(selectedCurrency === 'JPY'\) return n2words\(n, \{ lang: 'ja' \}\) \+ " Yen";\s*if \(selectedCurrency === 'KRW'\) return n2words\(n, \{ lang: 'ko' \}\) \+ " Won";\s*\} catch\(e\) \{\}/;

const newTerbilangBody = `try {
      if (selectedCurrency === 'IDR') return idN2Words(n) + " Rupiah";
      if (selectedCurrency === 'USD') return enN2Words(n) + " Dollars";
      if (selectedCurrency === 'SAR') return arN2Words(n) + " Riyal";
      if (selectedCurrency === 'CNY') return zhN2Words(n) + " Yuan";
      if (selectedCurrency === 'JPY') return jaN2Words(n) + " Yen";
      if (selectedCurrency === 'KRW') return koN2Words(n) + " Won";
    } catch(e) {
      console.error("n2words error:", e);
    }`;

s = s.replace(terbilangBodyRegex, newTerbilangBody);

fs.writeFileSync(file, s, 'utf8');
console.log('Updated n2words usage to v5 API.');
