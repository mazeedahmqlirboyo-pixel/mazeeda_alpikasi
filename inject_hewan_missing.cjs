const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

// Replace the functions with versions that accept $t
s = s.replace(
  /function hitungZakatKambingDomba\(jumlah: number, jenis: string\)/g,
  "function hitungZakatKambingDomba(jumlah: number, jenis: string, $t: any)"
);
s = s.replace(
  /function hitungZakatSapiKerbau\(jumlah: number, jenis: string\)/g,
  "function hitungZakatSapiKerbau(jumlah: number, jenis: string, $t: any)"
);

// Update reactive statement to pass $t
s = s.replace(
  /hitungZakatKambingDomba\(jumlahTernak \|\| 0, jenisTernak\)/g,
  "hitungZakatKambingDomba(jumlahTernak || 0, jenisTernak, $t)"
);
s = s.replace(
  /hitungZakatSapiKerbau\(jumlahTernak \|\| 0, jenisTernak\)/g,
  "hitungZakatSapiKerbau(jumlahTernak || 0, jenisTernak, $t)"
);

// Update HTML "ekor"
s = s.replace(
  />\{formatNumberStr\(jumlahTernak \|\| 0, \$locale\)\} ekor<\/span>/g,
  ">{formatNumberStr(jumlahTernak || 0, $locale)} {$t('zakat.ekor') || 'ekor'}</span>"
);
s = s.replace(
  />\{formatNumberStr\(\(jenisTernak === "kambing" \|\| jenisTernak === "domba"\) \? 40 : 30, \$locale\)\} ekor<\/span>/g,
  ">{formatNumberStr((jenisTernak === \"kambing\" || jenisTernak === \"domba\") ? 40 : 30, $locale)} {$t('zakat.ekor') || 'ekor'}</span>"
);

// Update Strings in hitungZakatKambingDomba
const strKambing = `    const namaHewan = jenis === "kambing" ? "Kambing" : "Domba";
    const syaratUmur = jenis === "kambing" 
      ? "(Umur minimal 1 Tahun)" 
      : "(Umur minimal 1 Tahun / telah tanggal gigi)";
    
    if (jumlah < 40) return { count: 0, desc: "Belum wajib zakat" };
    if (jumlah <= 120) return { count: 1, desc: \`1 Ekor \${namaHewan} \${syaratUmur}\` };
    if (jumlah <= 200) return { count: 2, desc: \`2 Ekor \${namaHewan}\` };
    if (jumlah <= 300) return { count: 3, desc: \`3 Ekor \${namaHewan}\` };
    if (jumlah <= 400) return { count: 4, desc: \`4 Ekor \${namaHewan}\` };
    const tambahan = Math.floor((jumlah - 400) / 100);
    const total = 4 + tambahan;
    return {
      count: total,
      desc: \`\${total} Ekor \${namaHewan} (setiap kelipatan 100 ekor bertambah 1 ekor)\`,
    };`;

const replKambing = `    const namaHewan = jenis === "kambing" ? ($t('zakat.kambing') || "Kambing") : ($t('zakat.domba') || "Domba");
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
    };`;

s = s.replace(strKambing, replKambing);


// Update Strings in hitungZakatSapiKerbau
const strSapi = `    const namaHewan = jenis === "sapi" ? "Sapi" : "Kerbau";
    const labelTabi = \`Tabi' (\${namaHewan} jantan/betina umur 1 tahun)\`;
    const labelMusinnah = \`Musinnah (\${namaHewan} betina umur 2 tahun)\`;

    if (jumlah < 30)
      return {
        count: 0,
        desc: "Belum wajib zakat",
        tabiCount: 0,
        musinnahCount: 0,
      };
    if (jumlah <= 39)
      return {
        count: 1,
        desc: \`1 Ekor \${labelTabi}\`,
        tabiCount: 1,
        musinnahCount: 0,
      };
    if (jumlah <= 59)
      return {
        count: 1,
        desc: \`1 Ekor \${labelMusinnah}\`,
        tabiCount: 0,
        musinnahCount: 1,
      };
    if (jumlah <= 69)
      return { count: 2, desc: \`2 Ekor \${labelTabi}\`, tabiCount: 2, musinnahCount: 0 };
    if (jumlah <= 79)
      return {
        count: 2,
        desc: \`1 Ekor \${labelTabi} dan 1 Ekor \${labelMusinnah}\`,
        tabiCount: 1,
        musinnahCount: 1,
      };
    if (jumlah <= 89)
      return {
        count: 2,
        desc: \`2 Ekor \${labelMusinnah}\`,
        tabiCount: 0,
        musinnahCount: 2,
      };
    if (jumlah <= 99)
      return { count: 3, desc: \`3 Ekor \${labelTabi}\`, tabiCount: 3, musinnahCount: 0 };
    if (jumlah <= 109)
      return {
        count: 3,
        desc: \`2 Ekor \${labelTabi} dan 1 Ekor \${labelMusinnah}\`,
        tabiCount: 2,
        musinnahCount: 1,
      };
    if (jumlah <= 119)
      return {
        count: 3,
        desc: \`1 Ekor \${labelTabi} dan 2 Ekor \${labelMusinnah}\`,
        tabiCount: 1,
        musinnahCount: 2,
      };`;

const replSapi = `    const namaHewan = jenis === "sapi" ? ($t('zakat.sapi') || "Sapi") : ($t('zakat.kerbau') || "Kerbau");
    const labelTabi = \`\${$t('zakat.tabi_label') || "Tabi'"} (\${namaHewan} \${$t('zakat.tabi_umur') || "jantan/betina umur 1 tahun"})\`;
    const labelMusinnah = \`\${$t('zakat.musinnah_label') || "Musinnah"} (\${namaHewan} \${$t('zakat.musinnah_umur') || "betina umur 2 tahun"})\`;
    const ekor = $t('zakat.ekor') || 'Ekor';
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
      };`;
s = s.replace(strSapi, replSapi);

const strSapi2 = `    let parts = [];
    if (tabiCount > 0) parts.push(\`\${tabiCount} Ekor Tabi' (\${namaHewan} umur 1 tahun)\`);
    if (musinnahCount > 0) parts.push(\`\${musinnahCount} Ekor Musinnah (\${namaHewan} betina umur 2 tahun)\`);
    return {
      count: tabiCount + musinnahCount,
      desc: parts.join(" dan "),
      tabiCount,
      musinnahCount,
    };`;
const replSapi2 = `    let parts = [];
    if (tabiCount > 0) parts.push(\`\${tabiCount} \${ekor} \${labelTabi}\`);
    if (musinnahCount > 0) parts.push(\`\${musinnahCount} \${ekor} \${labelMusinnah}\`);
    return {
      count: tabiCount + musinnahCount,
      desc: parts.join(\` \${dan} \`),
      tabiCount,
      musinnahCount,
    };`;
s = s.replace(strSapi2, replSapi2);

fs.writeFileSync(file, s);
console.log('Template logic for Zakat Hewan updated.');


// Locales
const path = require('path');
const localesDir = path.join('src', 'lib', 'i18n');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  kambing_umur: {
    id: "(Umur minimal 1 Tahun)",
    en: "(Minimum age 1 Year)",
    ar: "(العمر الأدنى 1 سنة)",
    zh: "(最低年龄 1 岁)",
    ja: "(最低年齢1歳)",
    ko: "(최소 연령 1세)"
  },
  domba_umur: {
    id: "(Umur minimal 1 Tahun / telah tanggal gigi)",
    en: "(Minimum age 1 Year / teeth have fallen out)",
    ar: "(العمر الأدنى 1 سنة / ثنيية)",
    zh: "(最低年龄 1 岁 / 已掉牙)",
    ja: "(最低年齢1歳 / 歯が抜けている)",
    ko: "(최소 연령 1세 / 이갈이를 한 경우)"
  },
  kelipatan_100_ekor: {
    id: "(setiap kelipatan 100 ekor bertambah 1 ekor)",
    en: "(every multiple of 100 animals adds 1 animal)",
    ar: "(لكل 100 رأس إضافية، يضاف رأس واحد)",
    zh: "(每增加 100 头，增加 1 头)",
    ja: "(100頭ごとに1頭追加)",
    ko: "(100마리마다 1마리 추가)"
  },
  tabi_label: {
    id: "Tabi'",
    en: "Tabi'",
    ar: "تبيع",
    zh: "Tabi'",
    ja: "Tabi'",
    ko: "Tabi'"
  },
  musinnah_label: {
    id: "Musinnah",
    en: "Musinnah",
    ar: "مسنة",
    zh: "Musinnah",
    ja: "Musinnah",
    ko: "Musinnah"
  },
  tabi_umur: {
    id: "jantan/betina umur 1 tahun",
    en: "male/female age 1 year",
    ar: "ذكر أو أنثى عمر سنة واحدة",
    zh: "1 岁的公/母",
    ja: "1歳のオス/メス",
    ko: "1세의 수컷/암컷"
  },
  musinnah_umur: {
    id: "betina umur 2 tahun",
    en: "female age 2 years",
    ar: "أنثى عمر سنتين",
    zh: "2 岁的母",
    ja: "2歳のメス",
    ko: "2세의 암컷"
  },
  dan: {
    id: "dan",
    en: "and",
    ar: "و",
    zh: "和",
    ja: "と",
    ko: "및"
  },
  belum_wajib_zakat: {
    id: "Belum wajib zakat",
    en: "Not yet mandatory for zakat",
    ar: "لم تجب فيها الزكاة",
    zh: "尚未达到天课标准",
    ja: "まだザカートは義務ではありません",
    ko: "아직 자카트 의무가 없습니다"
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

console.log('JSON locales updated for Zakat Hewan.');
