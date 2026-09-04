const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// 1. Inject selectedCurrency and n2words
if (!s.includes('let selectedCurrency = "IDR";')) {
  s = s.replace(
    /import \{ t, locale \} from "svelte-i18n";/,
    () => `import { t, locale } from "svelte-i18n";\n  import n2words from "n2words";\n  let selectedCurrency = "IDR";`
  );
}

// 2. Replace formatRupiah with formatCurrency
if (!s.includes('function formatCurrency(num: number')) {
  const oldFormat = /function formatRupiah\(num: number, loc: string = 'id'\): string \{[\s\S]*?return "Rp " \+ valStr;\s*\}/m;
  const oldFormat2 = /function formatRupiah\(num: number, loc: string = 'id', \$locale\): string \{[\s\S]*?return "Rp " \+ valStr;\s*\}/m;
  
  const newFormat = `function formatCurrency(num: number, loc: string = 'id'): string {
    let effectiveLoc = loc || 'id';
    let style = new Intl.NumberFormat(effectiveLoc === 'ar' ? 'ar-SA' : (effectiveLoc === 'id' ? 'id-ID' : effectiveLoc), { style: 'currency', currency: selectedCurrency, maximumFractionDigits: 0 }).format(Math.round(num));
    if (effectiveLoc === "ar") {
      const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
      style = style.replace(/[0-9]/g, w => idArabic[w]);
    }
    return style;
  }`;
  
  if (oldFormat.test(s)) s = s.replace(oldFormat, () => newFormat);
  else if (oldFormat2.test(s)) s = s.replace(oldFormat2, () => newFormat);
  else {
     s = s.replace(/function formatRupiah\(.*?\).*?\{[\s\S]*?return.*?\}/m, () => newFormat);
  }
}

// 3. Replace Terbilang
if (!s.includes('function terbilang(')) {
  const oldTerbilang = /\/\/ Indonesian Terbilang \(number to words helper\)[\s\S]*?return hasil \? hasil \+ " Rupiah" : "";\s*\}/m;
  const newTerbilang = `// Multi-language Terbilang (number to words helper)
  function terbilang(nilai: number): string {
    const langCode = $locale || 'id';
    if (nilai === 0) return langCode === 'id' ? "Nol" : "Zero";
    let n2lang = 'en';
    if (langCode === 'id') n2lang = 'id';
    else if (langCode === 'ar') n2lang = 'ar';
    else if (langCode === 'zh') n2lang = 'zh';
    else if (langCode === 'ko') n2lang = 'ko';
    else if (langCode === 'ja') n2lang = 'ja';
    
    let words = "";
    try {
      words = n2words(Math.round(nilai), { lang: n2lang });
    } catch(e) {
      words = n2words(Math.round(nilai), { lang: 'en' });
    }
    
    // Capitalize first letter of each word
    words = words.replace(/(^\\w|\\s\\w)/g, m => m.toUpperCase());

    const currencyKey = 'currency_' + selectedCurrency.toLowerCase();
    const currStr = $t('zakat.' + currencyKey) || selectedCurrency;
    
    // If arabic, convert numbers if any
    if (langCode === 'ar') {
       const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
       words = words.replace(/[0-9]/g, w => idArabic[w]);
    }

    return \`\${words} \${currStr}\`;
  }`;
  if (oldTerbilang.test(s)) s = s.replace(oldTerbilang, () => newTerbilang);
  else s = s.replace(/function terbilang\(.*?\).*?\{[\s\S]*?\}/m, () => newTerbilang);
}

// 4. Change all formatRupiah to formatCurrency
s = s.replace(/formatRupiah/g, () => 'formatCurrency');

// 5. Replace hardcoded "Rp" inside spans
const dynamicCurrSymbol = `>{selectedCurrency === 'IDR' ? 'Rp' : (selectedCurrency === 'USD' ? '$' : (selectedCurrency === 'SAR' ? 'ر.س' : (selectedCurrency === 'CNY' ? '¥' : (selectedCurrency === 'JPY' ? '¥' : '₩'))))}</span`;
s = s.replace(/>\s*Rp\s*<\/span/g, () => dynamicCurrSymbol);

// Replace Rp {formatCurrency
s = s.replace(/Rp\s*\{formatCurrency/g, () => '{selectedCurrency === \'IDR\' ? \'Rp\' : (selectedCurrency === \'USD\' ? \'$\' : (selectedCurrency === \'SAR\' ? \'ر.س\' : (selectedCurrency === \'CNY\' ? \'¥\' : (selectedCurrency === \'JPY\' ? \'¥\' : \'₩\'))))} {formatCurrency');

// Replace (Rupiah) with (Mata Uang) or ({selectedCurrency})
s = s.replace(/\(Rupiah\)/g, () => `({selectedCurrency})`);

// 6. Currency Selector UI
const currencySelectorUI = `
  <!-- Currency Selector -->
  <div class="px-4 md:px-8 mb-4 max-w-4xl mx-auto flex justify-end">
    <div class="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
      <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{$t('zakat.pilih_mata_uang') || 'Pilih Mata Uang'}:</span>
      <select bind:value={selectedCurrency} class="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer">
        <option value="IDR">{$t('zakat.currency_idr') || 'IDR'}</option>
        <option value="USD">{$t('zakat.currency_usd') || 'USD'}</option>
        <option value="SAR">{$t('zakat.currency_sar') || 'SAR'}</option>
        <option value="CNY">{$t('zakat.currency_cny') || 'CNY'}</option>
        <option value="JPY">{$t('zakat.currency_jpy') || 'JPY'}</option>
        <option value="KRW">{$t('zakat.currency_krw') || 'KRW'}</option>
      </select>
    </div>
  </div>

  <Tabs bind:active={calculatorType}`;

if (!s.includes('<!-- Currency Selector -->')) {
  s = s.replace(/<Tabs bind:active=\{calculatorType\}/, () => currencySelectorUI);
}

// 7. Inject terbilang below the main calculation results
s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatPenghasilan, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatPenghasilan)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatMaal, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatMaal)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(totalZakatUangFitrah, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(totalZakatUangFitrah)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatTabungan, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatTabungan)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatEmas, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatEmas)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatPerak, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatPerak)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatPertanianRupiah, \$locale\)\}\s*<\/div>)/, (match) => match + '\n                <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatPertanianRupiah)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatPerniagaan, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatPerniagaan)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatSaham, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatSaham)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatReksadana, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatReksadana)}</div>');

s = s.replace(/(<div class="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">\s*\{formatCurrency\(totalNilaiZakatTernak, \$locale\)\}\s*<\/div>)/, (match) => match + '\n                <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(totalNilaiZakatTernak)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatTambak, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatTambak)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatPerusahaanPribadi, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatPerusahaanPribadi)}</div>');

s = s.replace(/(<div class="text-3xl font-black text-emerald-600 dark:text-emerald-400">\s*\{formatCurrency\(jumlahZakatTambang, \$locale\)\}\s*<\/div>)/, (match) => match + '\n              <div class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 italic">{terbilang(jumlahZakatTambang)}</div>');


// 8. ALSO WE NEED TO RE-APPLY THE ZAKAT HEWAN LOGIC
// Because git checkout removed it.
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
    s = s.replace(regexKambing, () => replKambing);
}

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
    s = s.replace(regexSapi, () => replSapi);
}

s = s.replace(/\(Nisab:/g, () => `({$t('zakat.nisab') || 'Nisab'}:`);

fs.writeFileSync(file, s);
console.log('Successfully refactored +page.svelte safely.');
