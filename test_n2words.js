import n2words from 'n2words';

const langs = ['en', 'id', 'ar', 'ja', 'ko', 'zh'];
const num = 12345;

for (const lang of langs) {
  try {
    const result = n2words(num, { lang });
    console.log(`[${lang}]: ${result}`);
  } catch (e) {
    console.log(`[${lang}]: ERROR - ${e.message}`);
  }
}
