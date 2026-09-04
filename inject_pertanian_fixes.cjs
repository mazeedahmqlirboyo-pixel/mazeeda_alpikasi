const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Fix 1: "kg" in the results table for Zakat Pertanian (line 2954)
// {formatNumberStr(hasilPanen || 0, $locale)} kg</span>
s = s.replace(/\} kg<\/span>/g, `} {$t('zakat.kg_satuan') || 'kg'}</span>`);

// Fix 2: Percentage numbers "10%" and "5%" to use formatNumberStr
// There are two places where this is generated dynamically:
// {jenisPengairan === "alami" ? "10%" : "5%"}
// and {jenisPengairan === 'alami' ? '10%' : '5%'}
s = s.replace(/\{jenisPengairan === "alami" \? "10%" : "5%"\}/g, `{jenisPengairan === "alami" ? formatNumberStr(10, $locale) + "%" : formatNumberStr(5, $locale) + "%"}`);
s = s.replace(/\{jenisPengairan === 'alami' \? '10%' : '5%'\}/g, `{jenisPengairan === 'alami' ? formatNumberStr(10, $locale) + "%" : formatNumberStr(5, $locale) + "%"}`);

// Fix 3: The bullet point sentence
const bulletStr = /• Tidak ada kewajiban zakat hasil pertanian karena total hasil panen di bawah batas minimum \(nisab\)\./g;
s = s.replace(bulletStr, `• {$t('zakat.info_tidak_wajib_panen') || 'Tidak ada kewajiban zakat hasil pertanian karena total hasil panen di bawah batas minimum (nisab).'}`);

// Since there is a kg in the calculation details too:
// {formatNumberStr(hasilPanen || 0, $locale)} kg (Nisab
s = s.replace(/\} kg \(Nisab/g, `} {$t('zakat.kg_satuan') || 'kg'} (Nisab`);
// {formatNumberStr(hasilPanen || 0, $locale)} kg &times;
s = s.replace(/\} kg &times;/g, `} {$t('zakat.kg_satuan') || 'kg'} &times;`);
// {formatNumberStr(jumlahZakatPertanianKg.toFixed(1), $locale)} kg</strong>
s = s.replace(/\} kg<\/strong>/g, `} {$t('zakat.kg_satuan') || 'kg'}</strong>`);

fs.writeFileSync(file, s);
console.log('Template fixed for Zakat Pertanian trailing details.');

// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  kg_satuan: { id: "kg", en: "kg", ar: "كجم", zh: "公斤", ja: "kg", ko: "kg" }
};

for (const f of files) {
  const lang = f.split('.')[0];
  const p = path.join(localesDir, f);
  let data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  data.zakat = data.zakat || {};
  let newMap = {};
  for (const [key, tmap] of Object.entries(translations)) {
    if (tmap[lang]) {
      newMap[key] = tmap[lang];
    } else if (lang === 'en') {
      newMap[key] = tmap.en;
    }
  }

  data.zakat = { ...data.zakat, ...newMap };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

console.log('JSON locales updated for kg_satuan.');
