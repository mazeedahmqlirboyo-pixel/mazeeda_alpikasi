const n2words = require('n2words').default;

console.log('ID:', n2words(3000000, { lang: 'id' }));
console.log('EN:', n2words(3000000, { lang: 'en' }));
console.log('AR:', n2words(3000000, { lang: 'ar' }));
console.log('ZH:', n2words(3000000, { lang: 'zh' }));
console.log('JA:', n2words(3000000, { lang: 'ja' }));
console.log('KO:', n2words(3000000, { lang: 'ko' }));
