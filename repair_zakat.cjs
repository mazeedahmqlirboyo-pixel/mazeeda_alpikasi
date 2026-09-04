const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'routes', 'zakat-faraidh', '+page.svelte');
let s = fs.readFileSync(file, 'utf8');

// Fix malformed translations
const malformedRegex = /\{\$t\('zakat\.rekomendasi_sedekah_25'\)\s*\|\|\s*'\{\$t\('zakat\.rekomendasi_sedekah_infaq'\)\s*\|\|\s*'Rekomendasi Sedekah \/ Infaq'\}\s*\(2\.5\%\)'\}/g;
s = s.replace(malformedRegex, `{$t('zakat.rekomendasi_sedekah_25') || 'Rekomendasi Sedekah / Infaq (2.5%)'}`);

// Also check for the base infaq one if it got malformed
const malformedInfaqRegex = /\{\$t\('zakat\.rekomendasi_sedekah_infaq'\)\s*\|\|\s*'Rekomendasi Sedekah \/ Infaq'\}/g;
// Actually the base infaq one is mostly fine, except if it's already fixed.
// The grep showed it's: {$t('zakat.rekomendasi_sedekah_infaq') || 'Rekomendasi Sedekah / Infaq'} which is correct.

// Fix hitungZakatKambingDomba
// The function was mangled around line 80-90.
// We need to restore it. 
// It currently looks like:
//   function formatCurrency(num: number, loc: string = 'id'): string {
//     ...
//     return style;
//   };
//     if (jumlah <= 120) return { count: 1, desc: `1 Ekor ${namaHewan} ${syaratUmur}` };

const brokenKambingRegex = /return style;\s*\};\s*if \(jumlah <= 120\) return \{ count: 1,/m;
const fixKambing = `return style;
  };

  function hitungZakatKambingDomba(jumlah: number, jenis: string, $t: any): { count: number; desc: string } {
    const namaHewan = jenis === "kambing" ? ($t('zakat.kambing') || "Kambing") : ($t('zakat.domba') || "Domba");
    const syaratUmur = jenis === "kambing" 
      ? ($t('zakat.kambing_umur') || "(Umur minimal 1 Tahun)") 
      : ($t('zakat.domba_umur') || "(Umur minimal 1 Tahun / telah tanggal gigi)");
    
    if (jumlah < 40) return { count: 0, desc: $t('zakat.belum_wajib_zakat') || "Belum wajib zakat" };
    if (jumlah <= 120) return { count: 1,`;

if (brokenKambingRegex.test(s)) {
    s = s.replace(brokenKambingRegex, fixKambing);
}

fs.writeFileSync(file, s);
console.log('Repaired zakat-faraidh/+page.svelte');
