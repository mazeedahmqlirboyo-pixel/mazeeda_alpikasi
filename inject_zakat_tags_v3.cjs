const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  // Gaji Pokok
  [`>Gaji Pokok Saya Bulanan<`, `>{$t('zakat.gaji_pokok') || 'Gaji Pokok / Penghasilan Bulanan'}<`],
  // Pendapatan Lain
  [`>Pendapatan Lain Bulanan<`, `>{$t('zakat.pendapatan_lain') || 'Pendapatan Lain / Bonus Bulanan'}<`],
  // Kurangi Kebutuhan
  [`>Kurangi Kebutuhan Pokok Bulanan<`, `>{$t('zakat.kurangi_kebutuhan') || 'Kurangi Kebutuhan Pokok Bulanan'}<`],
  
  // What about "Rp 2.574.000"? Wait, the Rp is hardcoded in formatRupiah: return "Rp " + valStr;
  // If we want Rp to be translated to Arabic (ر.إ) or something, we can do it:
  // But wait, Rp is just Rp. 
  // Wait, what about the "klik disini" part? 
  // Let's check how it's actually written in the file right now
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.split(from).join(to);
  }
}

// Let's fix the "klik disini" part
s = s.replace(/>klik disini<\/button> untuk mengakses halaman tersebut\)/g, `>{$t('zakat.klik_disini') || 'klik disini'}</button> {$t('zakat.untuk_mengakses') || 'untuk merubah harga acuan manual'})`);

// Let's fix "via" and "Diperbarui"
s = s.replace(/\(Diperbarui: \{goldLastUpdated\} via /g, `({$t('zakat.diperbarui') || 'Diperbarui'}: {goldLastUpdated} {$t('zakat.via') || 'via'} `);
s = s.replace(/\(Diperbarui: \{silverLastUpdated\} via /g, `({$t('zakat.diperbarui') || 'Diperbarui'}: {silverLastUpdated} {$t('zakat.via') || 'via'} `);

fs.writeFileSync(file, s);
console.log('Final pass injection complete!');
