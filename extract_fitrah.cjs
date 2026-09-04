const fs = require('fs');
const s = fs.readFileSync('src/routes/zakat-faraidh/+page.svelte', 'utf8');
const lines = s.split('\n');
let inFitrah = false;
const missed = new Set();
for(let line of lines) {
  if (line.includes('activeTab === "fitrah"')) inFitrah = true;
  if (line.includes('activeTab === "tabungan"')) inFitrah = false;
  if (inFitrah) {
    const match = line.match(/>([^<>{}]*[a-zA-Z]{3,}[^<>{}]*)</);
    if (match) {
      let text = match[1].trim();
      if (text.length > 3 && !text.includes('$t(') && !text.includes('formatRupiah') && !text.includes('formatNumberStr')) {
        missed.add(text);
      }
    }
  }
}
console.log(Array.from(missed));
