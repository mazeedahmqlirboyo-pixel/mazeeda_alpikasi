const fs = require('fs');
const file = 'src/routes/kiblat/+page.svelte';
let s = fs.readFileSync(file, 'utf8');

const reps = [
  [`<PageHeader title="Arah Kiblat"`, `<PageHeader title={$t('kiblat.arah_kiblat') || 'Arah Kiblat'}`],
  [`Jarak ke Baitullah`, `{$t('kiblat.jarak_ke_baitullah') || 'Jarak ke Baitullah'}`],
  [`Koordinat Saya`, `{$t('kiblat.koordinat_saya') || 'Koordinat Saya'}`],
  [`Sudut Kiblat</span`, `{$t('kiblat.sudut_kiblat') || 'Sudut Kiblat'}</span`],
  [`Utara</span`, `{$t('kiblat.utara') || 'Utara'}</span`],
  [`Arahkan Ponsel</span`, `{$t('kiblat.arahkan_ponsel') || 'Arahkan Ponsel'}</span`],
  [`Putar ke kanan`, `{$t('kiblat.putar_ke_kanan') || 'Putar ke kanan'}`],
  [`Putar ke kiri`, `{$t('kiblat.putar_ke_kiri') || 'Putar ke kiri'}`],
  [`Kiblat Terbimbing</span`, `{$t('kiblat.kiblat_terbimbing') || 'Kiblat Terbimbing'}</span`],
  [`Sempurna! Sudut hadap ponsel Anda sudah tepat mengarah ke Ka'bah`, `{$t('kiblat.sempurna_kiblat') || 'Sempurna! Sudut hadap ponsel Anda sudah tepat mengarah ke Ka\\'bah'}`],
  [`Hadap Ponsel</span`, `{$t('kiblat.hadap_ponsel') || 'Hadap Ponsel'}</span`],
  [`Arah Ka'bah</span`, `{$t('kiblat.arah_kabah') || 'Arah Ka\\'bah'}</span`],
  [`Lokasi Kurang Akurat?</h4`, `{$t('kiblat.lokasi_kurang_akurat') || 'Lokasi Kurang Akurat?'}</h4`],
  [`Gunakan pilihan kota manual di seluruh Indonesia</p`, `{$t('kiblat.gunakan_pilihan_kota') || 'Gunakan pilihan kota manual di seluruh Indonesia'}</p`],
  [`Pilih Kota Manual</span`, `{$t('kiblat.pilih_kota_manual') || 'Pilih Kota Manual'}</span`],
  [`Aktivasi Sensor Gerak Apple</h3`, `{$t('kiblat.aktivasi_sensor') || 'Aktivasi Sensor Gerak Apple'}</h3`],
  [`Koneksi Tidak Aman (HTTP)</h3`, `{$t('kiblat.koneksi_tidak_aman') || 'Koneksi Tidak Aman (HTTP)'}</h3`],
  [`Apple iOS (iPhone) memblokir akses sensor arah kompas pada koneksi HTTP biasa. Sensor hanya dapat aktif jika situs diakses melalui HTTPS (Koneksi Aman).</p`, `{$t('kiblat.koneksi_tidak_aman_desc') || 'Apple iOS (iPhone) memblokir akses sensor arah kompas pada koneksi HTTP biasa. Sensor hanya dapat aktif jika situs diakses melalui HTTPS (Koneksi Aman).'}</p`],
  [`Cari nama kota, kabupaten atau provinsi...`, `{$t('kiblat.cari_nama_kota') || 'Cari nama kota, kabupaten atau provinsi...'}`],
  [`Ketik minimal 3 huruf untuk mencari...`, `{$t('kiblat.ketik_minimal') || 'Ketik minimal 3 huruf untuk mencari...'}`],
  [`Mencari kota...`, `{$t('kiblat.mencari_kota') || 'Mencari kota...'}`],
  [`Lokasi tidak ditemukan`, `{$t('kiblat.lokasi_tidak_ditemukan') || 'Lokasi tidak ditemukan'}`],
  [`Pilih Kota</h2`, `{$t('kiblat.pilih_kota') || 'Pilih Kota'}</h2`]
];

for (const [from, to] of reps) {
  if (s.includes(from)) {
    s = s.replace(from, to);
  } else {
    console.log("NOT FOUND: ", from);
  }
}

// Handle compass cardinal directions specifically
s = s.replace(
  />U<\/text>/,
  `>{$t('kiblat.utara') ? $t('kiblat.utara')[0].toUpperCase() : 'U'}</text>`
);
s = s.replace(
  />T<\/text>/,
  `>{$t('kiblat.timur') ? $t('kiblat.timur')[0].toUpperCase() : 'T'}</text>`
);
s = s.replace(
  />S<\/text>/,
  `>{$t('kiblat.selatan') ? $t('kiblat.selatan')[0].toUpperCase() : 'S'}</text>`
);
s = s.replace(
  />B<\/text>/,
  `>{$t('kiblat.barat') ? $t('kiblat.barat')[0].toUpperCase() : 'B'}</text>`
);

fs.writeFileSync(file, s);
console.log("All missing kiblat translations patched successfully!");
