const fs = require('fs');

const file = 'src/routes/zakat-faraidh/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const keysMap = {
  "ASET MAAL (KEKAYAAN)": "aset_maal_kekayaan",
  "Emas / Logam Mulia (gram)": "emas_logam_mulia_gram",
  "Perak (gram)": "perak_gram",
  "Piutang Lancar (Uang dipinjamkan yang pasti tertagih)": "piutang_lancar",
  "Kewajiban / Hutang Jatuh Tempo (Dapat dikurangi)": "kewajiban_hutang_jatuh_tempo",
  "Deductions (Hutang)": "deductions_hutang",
  "Harta Bersih (Terkena Haul)": "harta_bersih_terkena_haul",
  "Nisab Zakat Maal Tahunan (85g Emas)": "nisab_zakat_maal_tahunan",
  "Nisab (Batas Minimum):": "nisab_batas_minimum",
  "Kadar Zakat:": "kadar_zakat",
  "Waktu Pembayaran:": "waktu_pembayaran",
  "Hitung Total Pendapatan:": "hitung_total_pendapatan",
  "Kurangi Pengeluaran Pokok (Opsional):": "kurangi_pengeluaran_pokok",
  "Hitung Zakatnya:": "hitung_zakatnya",
  "Rumus:": "rumus",
  "Pengeluaran pokok sandang, pangan, papan, & hutang mendesak": "pengeluaran_pokok_detail",
  "Pengurangan Kebutuhan": "pengurangan_kebutuhan",
  "Pendapatan Kena Zakat": "pendapatan_kena_zakat",
  "Haul (Waktu):": "haul_waktu"
};

for (const [text, key] of Object.entries(keysMap)) {
  const safeText = text.replace(/[.*+?^$\/()|[\]\\]/g, '\\$&'); // escape regex
  const regex = new RegExp(`>\\s*${safeText}\\s*<`, 'g');
  s = s.replace(regex, `>{$t('zakat.${key}') || '${text}'}<`);
}

// Special case for gram in inputs:
s = s.replace(/>gram</g, `>{$t('zakat.gram_satuan') || 'gram'}<`);

// Special cases for Estimasi Nilai: Rp {formatRupiah...
const regexEstimasi = />Estimasi Nilai:\s*\{formatRupiah/g;
s = s.replace(regexEstimasi, `>{$t('zakat.estimasi_nilai') || 'Estimasi Nilai:'} {formatRupiah`);

// There is one in a text node without HTML tags?
// "Estimasi Nilai Zakat (Dalam Rupiah)" at line 4238 - let's check if it exists:
s = s.replace(/>Estimasi Nilai Zakat \(Dalam Rupiah\)</g, `>{$t('zakat.estimasi_nilai_zakat_rupiah') || 'Estimasi Nilai Zakat (Dalam Rupiah)'}<`);


fs.writeFileSync(file, s);
console.log('Template tags injected for missed Maal text.');
