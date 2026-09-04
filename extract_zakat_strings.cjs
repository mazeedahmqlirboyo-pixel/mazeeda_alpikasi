const fs = require('fs');
const s = fs.readFileSync('src/routes/zakat-faraidh/+page.svelte', 'utf8');
const labels = new Set();
const m1 = s.matchAll(/<label[^>]*>\s*([A-Za-z0-9 ,/\(\)-]+?)\s*<\/label>/g);
for(let m of m1) labels.add(m[1].trim());

const placeholders = new Set();
const m2 = s.matchAll(/placeholder="([^"]+)"/g);
for(let m of m2) placeholders.add(m[1].trim());

const headers = new Set();
const m3 = s.matchAll(/<span class="text-slate-500 font-medium">\s*([A-Za-z0-9 ,/\(\)-]+?)\s*<\/span>/g);
for(let m of m3) headers.add(m[1].trim());

// Also catch the section headers like <h3 class="text-xs font-black text-slate-800 ...">
const sectionHeaders = new Set();
const m4 = s.matchAll(/<h3[^>]*>\s*([A-Za-z0-9 ,/\(\)-]+?)\s*<\/h3>/g);
for(let m of m4) sectionHeaders.add(m[1].trim());

console.log('LABELS:', Array.from(labels));
console.log('PLACEHOLDERS:', Array.from(placeholders));
console.log('HEADERS:', Array.from(headers));
console.log('SECTIONS:', Array.from(sectionHeaders));
