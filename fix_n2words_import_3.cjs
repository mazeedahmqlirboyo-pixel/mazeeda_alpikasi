const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let page = fs.readFileSync(pagePath, 'utf8');

page = page.replace("import n2wordsEN from 'n2words/en-US';", "import { toCardinal as n2wordsEN } from 'n2words/en-US';");
page = page.replace("import n2wordsAR from 'n2words/ar-SA';", "import { toCardinal as n2wordsAR } from 'n2words/ar-SA';");
page = page.replace("import n2wordsZH from 'n2words/zh-Hans-CN';", "import { toCardinal as n2wordsZH } from 'n2words/zh-Hans-CN';");
page = page.replace("import n2wordsJA from 'n2words/ja-JP';", "import { toCardinal as n2wordsJA } from 'n2words/ja-JP';");
page = page.replace("import n2wordsKO from 'n2words/ko-KR';", "import { toCardinal as n2wordsKO } from 'n2words/ko-KR';");

fs.writeFileSync(pagePath, page, 'utf8');
console.log('n2words imports fixed for named exports.');
