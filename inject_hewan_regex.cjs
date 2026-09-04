const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Use regex to replace hitungZakatKambingDomba body
const regexKambing = /function hitungZakatKambingDomba\s*\([\s\S]*?return\s*{\s*count:\s*total,\s*desc:\s*`\$\{total\} Ekor \$\{namaHewan\} \(setiap kelipatan 100 ekor bertambah 1 ekor\)`,\s*};\s*}/m;
const replKambing = `function hitungZakatKambingDomba(jumlah: number, jenis: string, $t: any): { count: number; desc: string } {
    const namaHewan = jenis === "kambing" ? ($t('zakat.kambing') || "Kambing") : ($t('zakat.domba') || "Domba");
    const syaratUmur = jenis === "kambing" 
      ? ($t('zakat.kambing_umur') || "(Umur minimal 1 Tahun)") 
      : ($t('zakat.domba_umur') || "(Umur minimal 1 Tahun / telah tanggal gigi)");
    
    if (jumlah < 40) return { count: 0, desc: $t('zakat.belum_wajib_zakat') || "Belum wajib zakat" };
    if (jumlah <= 120) return { count: 1, desc: \`1 \${$t('zakat.ekor') || 'Ekor'} \${namaHewan} \${syaratUmur}\` };
    if (jumlah <= 200) return { count: 2, desc: \`2 \${$t('zakat.ekor') || 'Ekor'} \${namaHewan}\` };
    if (jumlah <= 300) return { count: 3, desc: \`3 \${$t('zakat.ekor') || 'Ekor'} \${namaHewan}\` };
    if (jumlah <= 400) return { count: 4, desc: \`4 \${$t('zakat.ekor') || 'Ekor'} \${namaHewan}\` };
    const tambahan = Math.floor((jumlah - 400) / 100);
    const total = 4 + tambahan;
    return {
      count: total,
      desc: \`\${total} \${$t('zakat.ekor') || 'Ekor'} \${namaHewan} \${$t('zakat.kelipatan_100_ekor') || '(setiap kelipatan 100 ekor bertambah 1 ekor)'}\`,
    };
  }`;

if (regexKambing.test(s)) {
    s = s.replace(regexKambing, replKambing);
    console.log("Kambing logic replaced successfully!");
} else {
    console.log("Kambing logic regex failed to match!");
}

// Use regex to replace hitungZakatSapiKerbau body
const regexSapi = /function hitungZakatSapiKerbau\s*\([\s\S]*?return\s*{\s*count:\s*tabiCount \+ musinnahCount,\s*desc:\s*parts\.join\(" dan "\),\s*tabiCount,\s*musinnahCount,\s*};\s*}/m;
const replSapi = `function hitungZakatSapiKerbau(jumlah: number, jenis: string, $t: any): {
    count: number;
    desc: string;
    tabiCount: number;
    musinnahCount: number;
  } {
    const namaHewan = jenis === "sapi" ? ($t('zakat.sapi') || "Sapi") : ($t('zakat.kerbau') || "Kerbau");
    const labelTabi = \`\${$t('zakat.tabi_label') || "Tabi'"} (\${namaHewan} \${$t('zakat.tabi_umur') || "jantan/betina umur 1 tahun"})\`;
    const labelMusinnah = \`\${$t('zakat.musinnah_label') || "Musinnah"} (\${namaHewan} \${$t('zakat.musinnah_umur') || "betina umur 2 tahun"})\`;
    const ekor = $t('zakat.ekor_kapital') || 'Ekor';
    const dan = $t('zakat.dan') || 'dan';

    if (jumlah < 30)
      return {
        count: 0,
        desc: $t('zakat.belum_wajib_zakat') || "Belum wajib zakat",
        tabiCount: 0,
        musinnahCount: 0,
      };
    if (jumlah <= 39)
      return {
        count: 1,
        desc: \`1 \${ekor} \${labelTabi}\`,
        tabiCount: 1,
        musinnahCount: 0,
      };
    if (jumlah <= 59)
      return {
        count: 1,
        desc: \`1 \${ekor} \${labelMusinnah}\`,
        tabiCount: 0,
        musinnahCount: 1,
      };
    if (jumlah <= 69)
      return { count: 2, desc: \`2 \${ekor} \${labelTabi}\`, tabiCount: 2, musinnahCount: 0 };
    if (jumlah <= 79)
      return {
        count: 2,
        desc: \`1 \${ekor} \${labelTabi} \${dan} 1 \${ekor} \${labelMusinnah}\`,
        tabiCount: 1,
        musinnahCount: 1,
      };
    if (jumlah <= 89)
      return {
        count: 2,
        desc: \`2 \${ekor} \${labelMusinnah}\`,
        tabiCount: 0,
        musinnahCount: 2,
      };
    if (jumlah <= 99)
      return { count: 3, desc: \`3 \${ekor} \${labelTabi}\`, tabiCount: 3, musinnahCount: 0 };
    if (jumlah <= 109)
      return {
        count: 3,
        desc: \`2 \${ekor} \${labelTabi} \${dan} 1 \${ekor} \${labelMusinnah}\`,
        tabiCount: 2,
        musinnahCount: 1,
      };
    if (jumlah <= 119)
      return {
        count: 3,
        desc: \`1 \${ekor} \${labelTabi} \${dan} 2 \${ekor} \${labelMusinnah}\`,
        tabiCount: 1,
        musinnahCount: 2,
      };

    let bestT = 0;
    let bestM = 0;
    let minSisa = jumlah;
    for (let t = 0; t <= Math.floor(jumlah / 30); t++) {
      const sisaSetelahT = jumlah - t * 30;
      const m = Math.floor(sisaSetelahT / 40);
      const sisa = sisaSetelahT - m * 40;
      if (sisa < minSisa) {
        minSisa = sisa;
        bestT = t;
        bestM = m;
      } else if (sisa === minSisa) {
        if (m > bestM) {
          bestT = t;
          bestM = m;
        }
      }
    }
    const tabiCount = bestT;
    const musinnahCount = bestM;
    let parts = [];
    if (tabiCount > 0) parts.push(\`\${tabiCount} \${ekor} \${labelTabi}\`);
    if (musinnahCount > 0) parts.push(\`\${musinnahCount} \${ekor} \${labelMusinnah}\`);
    return {
      count: tabiCount + musinnahCount,
      desc: parts.join(\` \${dan} \`),
      tabiCount,
      musinnahCount,
    };
  }`;

if (regexSapi.test(s)) {
    s = s.replace(regexSapi, replSapi);
    console.log("Sapi logic replaced successfully!");
} else {
    console.log("Sapi logic regex failed to match!");
}

s = s.replace(
  /\(Nisab:/g,
  "({$t('zakat.nisab') || 'Nisab'}:"
);
console.log("Nisab replaced!");

fs.writeFileSync(file, s);

// Add missing translation tags
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  ekor_kapital: {
    id: "Ekor",
    en: "Heads",
    ar: "رأس",
    zh: "头",
    ja: "頭",
    ko: "마리"
  },
  nisab: {
    id: "Nisab",
    en: "Nisab",
    ar: "النصاب",
    zh: "起征点 (Nisab)",
    ja: "ニサーブ (Nisab)",
    ko: "니삽 (Nisab)"
  }
};

const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function convertNumbersToArabic(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/[0-9]/g, w => idArabic[w]);
    } else if (typeof obj[key] === 'object') {
      convertNumbersToArabic(obj[key]);
    }
  }
}

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
  
  if (lang === 'ar') {
    convertNumbersToArabic(newMap);
  }

  data.zakat = { ...data.zakat, ...newMap };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

console.log('JSON locales updated.');
