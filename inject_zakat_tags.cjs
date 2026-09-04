const fs = require('fs');
const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const translationsToInject = [
  // Dropdown options
  [`label: "Zakat Penghasilan"`, `label: $t('zakat.zakat_penghasilan') || "Zakat Penghasilan"`],
  [`label: "Zakat Maal (Harta)"`, `label: $t('zakat.zakat_maal') || "Zakat Maal (Harta)"`],
  [`label: "Zakat Fitrah"`, `label: $t('zakat.zakat_fitrah') || "Zakat Fitrah"`],
  [`label: "Zakat Tabungan"`, `label: $t('zakat.zakat_tabungan') || "Zakat Tabungan"`],
  [`label: "Zakat Emas"`, `label: $t('zakat.zakat_emas') || "Zakat Emas"`],
  [`label: "Zakat Perak"`, `label: $t('zakat.zakat_perak') || "Zakat Perak"`],
  [`label: "Zakat Pertanian"`, `label: $t('zakat.zakat_pertanian') || "Zakat Pertanian"`],
  [`label: "Zakat Perdagangan"`, `label: $t('zakat.zakat_perdagangan') || "Zakat Perdagangan"`],
  [`label: "Zakat Saham"`, `label: $t('zakat.zakat_saham') || "Zakat Saham"`],
  [`label: "Zakat Reksadana"`, `label: $t('zakat.zakat_reksadana') || "Zakat Reksadana"`],
  [`label: "Zakat Tambak / Perikanan"`, `label: $t('zakat.zakat_tambak') || "Zakat Tambak / Perikanan"`],
  [`label: "Zakat Perusahaan"`, `label: $t('zakat.zakat_perusahaan') || "Zakat Perusahaan"`],
  [`label: "Zakat Properti Sewa"`, `label: $t('zakat.zakat_properti') || "Zakat Properti Sewa"`],
  [`label: "Zakat Pertambangan"`, `label: $t('zakat.zakat_tambang') || "Zakat Pertambangan"`],

  // Form labels and texts
  [`>Pilih Jenis Zakat<`, `>{$t('zakat.pilih_jenis_zakat') || 'Pilih Jenis Zakat'}<`],
  [`>Ketuk tombol di atas untuk memilih atau mengubah jenis zakat yang ingin dihitung<`, `>{$t('zakat.ketuk_tombol') || 'Ketuk tombol di atas untuk memilih atau mengubah jenis zakat yang ingin dihitung'}<`],
  
  [`>Harga Emas Acuan<`, `>{$t('zakat.harga_emas_acuan') || 'Harga Emas Acuan'}<`],
  [`>REALTIME AKTIF<`, `>{$t('zakat.realtime_aktif') || 'REALTIME AKTIF'}<`],
  
  // Note: diperbarui is part of a longer sentence: (Diperbarui: {goldLastUpdated} via Aneka Logam...
  // Let's target the exact fragments
  [`(Diperbarui: `, `({$t('zakat.diperbarui') || 'Diperbarui'}: `],
  [`via `, `{$t('zakat.via') || 'via'} `],
  [`klik disini`, `{$t('zakat.klik_disini') || 'klik disini'}`],
  [`untuk merubah harga acuan manual`, `{$t('zakat.untuk_mengakses') || 'untuk merubah harga acuan manual'}`],

  [`>ISI PENDAPATAN<`, `>{$t('zakat.isi_pendapatan') || 'ISI PENDAPATAN'}<`],
  [`>Gaji Pokok / Penghasilan Bulanan<`, `>{$t('zakat.gaji_pokok') || 'Gaji Pokok / Penghasilan Bulanan'}<`],
  [`>Pendapatan Lain / Bonus Bulanan<`, `>{$t('zakat.pendapatan_lain') || 'Pendapatan Lain / Bonus Bulanan'}<`],
  [`>Kurangi Kebutuhan Pokok Bulanan<`, `>{$t('zakat.kurangi_kebutuhan') || 'Kurangi Kebutuhan Pokok Bulanan'}<`],
  
  [`>Hasil Perhitungan<`, `>{$t('zakat.hasil_perhitungan') || 'Hasil Perhitungan'}<`],
  [`>Wajib Zakat<`, `>{$t('zakat.wajib_zakat') || 'Wajib Zakat'}<`],
  [`>Belum Wajib Zakat<`, `>{$t('zakat.belum_wajib') || 'Belum Wajib Zakat'}<`],
  
  [`>Pendapatan Kotor Bulanan<`, `>{$t('zakat.pendapatan_kotor') || 'Pendapatan Kotor Bulanan'}<`],
  [`>Nisab Zakat Bulanan<`, `>{$t('zakat.nisab_zakat') || 'Nisab Zakat Bulanan'}<`],
  
  [`> / bln<`, `> {$t('zakat.per_bln') || '/ bln'}<`],
  [`>/ bln<`, `>{$t('zakat.per_bln') || '/ bln'}<`],
  
  [`Rekomendasi Sedekah / Infaq (2.5%)`, `{$t('zakat.rekomendasi_sedekah_25') || 'Rekomendasi Sedekah / Infaq (2.5%)'}`]
];

for (const [from, to] of translationsToInject) {
  // Use a regex with global flag but escape the 'from' string, EXCEPT if we manually write regex
  // Let's just use split and join to replace all occurrences safely
  s = s.split(from).join(to);
}

fs.writeFileSync(file, s);
console.log('Template texts replaced with $t tags!');
