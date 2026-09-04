const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  // Zakat Penghasilan -> zakat.zakat_penghasilan
  [`zakat.zakat_penghasilan`, `Zakat Penghasilan`],
  
  // Harga Emas Acuan -> ZAKAT.HARGA_EMAS_ACUAN
  [`{$t('zakat.harga_emas_acuan') || 'Harga Emas Acuan'}`, `Harga Emas Acuan`],
  [`ZAKAT.HARGA_EMAS_ACUAN`, `Harga Emas Acuan`], // Just in case it was written as literal
  
  // Realtime Aktif -> ZAKAT.REALTIME_AKTIF
  [`ZAKAT.REALTIME_AKTIF`, `Realtime Aktif`],
  
  // Nisab 85g -> zakat.nisab_85g
  [`zakat.nisab_85g`, `Nisab (85g)`],
  
  // Diperbarui -> zakat.diperbarui: 
  [`zakat.diperbarui: `, `Diperbarui: `],
  
  // Klik disini -> zakat.klik_disini
  [`zakat.klik_disini`, `klik disini`],
  
  // Untuk mengakses -> zakat.untuk_mengakses
  [`zakat.untuk_mengakses`, `untuk merubah harga acuan manual`],
  
  // Isi Pendapatan -> ZAKAT.ISI_PENDAPATAN
  [`ZAKAT.ISI_PENDAPATAN`, `Isi Pendapatan / Gaji / Pemasukan`],
  
  // Gaji Pokok -> zakat.gaji_pokok
  [`zakat.gaji_pokok`, `Gaji Pokok / Penghasilan Bulanan`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.replace(new RegExp(from.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'), 'g'), to);
  } else {
    console.log("NOT FOUND: ", from);
  }
}

fs.writeFileSync(file, s);
console.log("Zakat text artifacts cleaned!");
