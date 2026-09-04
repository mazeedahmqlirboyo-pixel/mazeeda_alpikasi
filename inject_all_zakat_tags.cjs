const fs = require('fs');
const path = require('path');

const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const keysMap = {
  // MAAL
  "Hitung Total Harta:": "hitung_total_harta",
  "Kurangi Utang:": "kurangi_utang",
  "Uang Tunai / Tabungan / Giro / Deposito": "uang_tunai_dll",
  "Saham / Investasi / Reksadana / Crypto": "saham_investasi_dll",
  "Nilai Properti Komersial / Nilai Kontrakan / Kendaraan Dagang": "nilai_properti_dll",
  "Total Aset Maal": "total_aset_maal",
  
  // FITRAH
  "Isi Data Zakat Fitrah": "isi_data_fitrah",
  "Besaran per Jiwa:": "besaran_per_jiwa",
  "Siapa yang Wajib?": "siapa_wajib",
  "Hitung Jumlah Jiwa:": "hitung_jumlah_jiwa",
  "Kalikan dengan Besaran Zakat:": "kalikan_besaran_zakat",
  "Hasil Perhitungan Zakat Fitrah": "hasil_hitung_fitrah",
  "Jumlah Jiwa": "jumlah_jiwa",
  "Kewajiban per Jiwa": "kewajiban_per_jiwa",
  "Harga Beras per kg": "harga_beras_per_kg",
  "Beras": "beras",
  
  // TABUNGAN
  "Isi Saldo Tabungan": "isi_saldo_tabungan",
  "Hasil Perhitungan Zakat Tabungan": "hasil_hitung_tabungan",
  "Total Saldo Tabungan": "total_saldo_tabungan",

  // EMAS & PERAK
  "Harga Perak Acuan": "harga_perak_acuan",
  "Isi Jumlah Kepemilikan Emas": "isi_jumlah_emas",
  "Emas Perhiasan:": "emas_perhiasan",
  "Masukkan Berat Emas:": "masukkan_berat_emas",
  "Hasil Perhitungan Zakat Emas": "hasil_hitung_emas",
  "Emas Wajib Zakat": "emas_wajib_zakat",
  "Nisab Emas": "nisab_emas",
  "Nilai Emas Acuan per gram": "nilai_emas_acuan_per_gram",
  "Total Estimasi Nilai Emas": "total_estimasi_nilai_emas",
  "Isi Jumlah Kepemilikan Perak": "isi_jumlah_perak",
  "Masukkan Berat Perak:": "masukkan_berat_perak",
  "Hasil Perhitungan Zakat Perak": "hasil_hitung_perak",
  "Perak Wajib Zakat": "perak_wajib_zakat",
  "Nisab Perak": "nisab_perak",
  "Harga Perak per gram": "harga_perak_per_gram",
  "Total Nilai Perak": "total_nilai_perak",

  // PERTANIAN
  "Isi Hasil Pertanian": "isi_hasil_pertanian",
  "Hitung Hasil Panen:": "hitung_hasil_panen",
  "Tentukan Tarif Zakat:": "tentukan_tarif_zakat",
  "Metode Pengairan / Irigasi": "metode_pengairan",
  "Hasil Perhitungan Zakat Pertanian": "hasil_hitung_pertanian",
  "Total Hasil Panen": "total_hasil_panen",
  "Nisab Pertanian": "nisab_pertanian",
  "Tarif Zakat": "tarif_zakat",
  "Detail Perhitungan:": "detail_perhitungan",
  "Total Panen:": "total_panen",
  "Metode Pengairan:": "metode_pengairan_label",
  "Status:": "status_label",
  "Jika Diuangkan:": "jika_diuangkan",
  "Hasil Panen": "hasil_panen",

  // PERDAGANGAN
  "Hitung Total Aset Usaha:": "hitung_aset_usaha",
  "Kurangi Hutang Usaha:": "kurangi_hutang_usaha",
  "Hasil Perhitungan Zakat Perdagangan": "hasil_hitung_perdagangan",
  "Total Aset Lancar Usaha": "total_aset_lancar_usaha",
  "Hutang Jangka Pendek": "hutang_jangka_pendek",
  "Harta Perdagangan Wajib Zakat": "harta_perdagangan_wajib",
  "Total Aset Usaha:": "total_aset_usaha",
  "Hutang Dagang/Usaha:": "hutang_dagang_usaha",
  "Harta Bersih Perdagangan:": "harta_bersih_perdagangan",

  // SAHAM & REKSADANA
  "Isi Nilai Portofolio Saham": "isi_nilai_portofolio",
  "Hitung Nilai Portofolio:": "hitung_nilai_portofolio",
  "Tambahkan Dividen & Kurangi Hutang:": "tambah_dividen_kurangi_hutang",
  "Hasil Perhitungan Zakat Saham": "hasil_hitung_saham",
  "Nilai Portofolio Saham": "nilai_portofolio_saham",
  "Dividen Saham": "dividen_saham",
  "Hutang Lancar Saham": "hutang_lancar_saham",
  "Harta Saham Wajib Zakat": "harta_saham_wajib",
  "Nilai Saham:": "nilai_saham",
  "Dividen Saham:": "dividen_saham_label",
  "Hutang Saham:": "hutang_saham_label",
  "Harta Saham Kena Zakat:": "harta_saham_kena",
  "Isi Nilai Reksa Dana": "isi_nilai_reksa_dana",
  "Tentukan Nilai Investasi:": "tentukan_nilai_investasi",
  "Hasil Perhitungan Zakat Reksa Dana": "hasil_hitung_reksa_dana",
  "Nilai Investasi Reksa Dana": "nilai_investasi_reksa",
  "Nilai Reksadana:": "nilai_reksadana",

  // PETERNAKAN
  "Isi Data Hewan Ternak": "isi_data_hewan",
  "Nisab Kambing/Domba:": "nisab_kambing",
  "Nisab Sapi/Kerbau:": "nisab_sapi",
  "Syarat Ternak:": "syarat_ternak",
  "Kambing/Domba:": "kambing_domba",
  "Sapi/Kerbau:": "sapi_kerbau",
  "Hasil Perhitungan Zakat Peternakan": "hasil_hitung_peternakan",
  "Total Ternak": "total_ternak",
  "Batas Nisab": "batas_nisab",
  "Jenis Ternak:": "jenis_ternak",
  "Jumlah Kepemilikan:": "jumlah_kepemilikan",
  "Status Nisab:": "status_nisab",
  "Belum Mencapai Nisab": "belum_mencapai_nisab",
  "Kewajiban Zakat:": "kewajiban_zakat",
  "Rincian Jika Diuangkan:": "rincian_diuangkan",

  // TAMBAK, PERUSAHAAN, PROPERTI, TAMBANG
  "Hitung Pendapatan Tambak:": "hitung_pendapatan_tambak",
  "Kurangi Pengeluaran:": "kurangi_pengeluaran",
  "Hasil Perhitungan Zakat Tambak": "hasil_hitung_tambak",
  "Total Aset Lancar Tambak": "total_aset_lancar_tambak",
  "Harta Tambak Kena Zakat": "harta_tambak_kena",
  "Total Aset Tambak:": "total_aset_tambak",
  "Pengurang:": "pengurang",
  "Aset Bersih Tambak:": "aset_bersih_tambak",
  "Isi Data Aset Perusahaan": "isi_data_aset_perusahaan",
  "Hitung Aset Bersih Perusahaan:": "hitung_aset_bersih_perusahaan",
  "Hitung Porsi Kepemilikan Anda:": "hitung_porsi_kepemilikan",
  "Hasil Perhitungan Zakat Perusahaan": "hasil_hitung_perusahaan",
  "Isi Pendapatan Sewa Properti": "isi_pendapatan_sewa",
  "Objek Zakat:": "objek_zakat",
  "Hitung Hasil Sewa:": "hitung_hasil_sewa",
  "Kurangi Biaya Perawatan:": "kurangi_biaya_perawatan",
  "Hasil Perhitungan Zakat Properti Sewa": "hasil_hitung_properti",
  "Total Pendapatan Sewa": "total_pendapatan_sewa",
  "Biaya Perawatan Properti": "biaya_perawatan_properti",
  "Hasil Sewa Bersih": "hasil_sewa_bersih",
  "Total Pendapatan Sewa:": "total_pendapatan_sewa_label",
  "Biaya Perawatan Properti:": "biaya_perawatan_properti_label",
  "Hasil Sewa Bersih:": "hasil_sewa_bersih_label",
  "Isi Data Hasil Tambang": "isi_data_hasil_tambang",
  "Tentukan Nilai Hasil Tambang:": "tentukan_nilai_tambang",
  "Kurangi Biaya Eksploitasi:": "kurangi_biaya_eksploitasi",
  "Hasil Perhitungan Zakat Pertambangan": "hasil_hitung_tambang",
  "Total Nilai Hasil Tambang": "total_nilai_tambang",
  "Biaya Eksploitasi": "biaya_eksploitasi",
  "Hasil Tambang Bersih": "hasil_tambang_bersih",
  "Total Nilai Hasil Tambang:": "total_nilai_tambang_label",
  "Biaya Eksploitasi/Operasional:": "biaya_eksploitasi_label",
  "Hasil Tambang Bersih:": "hasil_tambang_bersih_label",

  // FARAIDH
  "Harta Warisan Pewaris": "harta_warisan",
  "Hutang Pewaris": "hutang_pewaris",
  "Pengurusan Jenazah": "pengurusan_jenazah",
  "Wasiat Pewaris": "wasiat_pewaris",
  "Peringatan Syariah:": "peringatan_syariah",
  "Ahli Waris yang Ditinggalkan": "ahli_waris_ditinggalkan",
  "Tidak Ada": "tidak_ada",
  "Meninggalkan Suami": "meninggalkan_suami",
  "Meninggalkan Istri": "meninggalkan_istri",
  "Jumlah Istri:": "jumlah_istri",
  "Orang Tua Kandung": "orangtua_kandung",
  "Ayah Kandung": "ayah_kandung",
  "Masih hidup saat pewaris wafat": "masih_hidup_saat_wafat",
  "Ibu Kandung": "ibu_kandung",
  "Anak Laki-laki": "anak_laki",
  "Anak Perempuan": "anak_perempuan",
  "Kakek & Nenek": "kakek_nenek",
  "Cucu Laki-laki": "cucu_laki",
  "Cucu Perempuan": "cucu_perempuan",
  "Saudara Kandung": "saudara_kandung",
  "Saudara Laki-laki": "saudara_laki",
  "Saudara Perempuan": "saudara_perempuan",
  "Rincian Pembagian Warisan": "rincian_pembagian",
  "Distribusi Visual": "distribusi_visual",
  "Nominal Bagian": "nominal_bagian",
  "Baitul Maal": "baitul_maal",
  "Sisa Nominal": "sisa_nominal",
  "Catatan Hukum Faraidh": "catatan_faraidh"
};

// We will only do string replacement where it is safe (e.g. inside span or label, or text nodes).
// To be extremely safe, we will replace `>TEXT<` with `>{$t('zakat.key') || 'TEXT'}<`
for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&'); // escape regex
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
  
  // also handle some cases without > < boundaries that might be safe, but only if they are not already tagged
  const strictRegex = new RegExp(`(?<!\\|\\|\\s*['"])${safeText}(?!['"]\\})`, 'g');
  // to avoid breaking, let's just stick to >text< and placeholder="text"
  const regexPlace = new RegExp(`placeholder="${safeText}"`, 'g');
  s = s.replace(regexPlace, `placeholder="{$t('zakat.${key}') || '${text}'}"`);
}

// Special case for &times;
s = s.replace(/>Total Zakat = Jumlah Jiwa &times; 2,5 kg</g, `>{$t('zakat.rumus_beras_detail') || 'Total Zakat = Jumlah Jiwa &times; 2,5 kg'}<`);
s = s.replace(/>Total Zakat = Jumlah Jiwa &times; Harga Beras\/Jiwa</g, `>{$t('zakat.rumus_uang_detail') || 'Total Zakat = Jumlah Jiwa &times; Harga Beras/Jiwa'}<`);

fs.writeFileSync(file, s);
console.log('Template tags injected for all Zakat & Faraidh types.');
