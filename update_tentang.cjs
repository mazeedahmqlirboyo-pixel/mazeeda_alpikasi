const fs = require('fs');
const destPath = 'c:/MAZEEDA/MAZEEDA CODING/New folder/src/routes/tentang/+page.svelte';

let dest = fs.readFileSync(destPath, 'utf8');

const featuresDefinition = `
  import { Wallet, Bell } from 'lucide-svelte';

  const features = [
    { name: "Arah Kiblat", desc: "Cari arah kiblat sholat secara real-time dengan HP atau GPS.", image: "/images/kiblat_bg.png", color: "text-indigo-500", bg: "bg-indigo-50" },
    { name: "Kalkulator Zakat", desc: "Hitung Zakat Penghasilan, Maal, Emas, Peternakan, Saham, dll.", image: "/images/zakat_bg.png", color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Kalkulator Faraidh", desc: "Hitung pembagian waris secara syariat Islam dengan mudah.", image: "/images/faraidh_bg.png", color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Masehi & Hijriah", desc: "Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu layar.", image: "/images/kalender_bg.png", color: "text-green-500", bg: "bg-green-50" },
    { name: "Tasbih Digital", desc: "Hitung dan simpan zikir harianmu secara otomatis.", image: "/images/tasbih_icon.png", color: "text-teal-500", bg: "bg-teal-50" },
    { name: "Cash Flow", desc: "Catat Cash Flow harianmu dengan mudah dan aman sebagaimana isyarat QS. Al-Baqarah: 282.", icon: Wallet, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Jejak Lirboyo", desc: "Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo.", image: "/images/journey_compass.png", color: "text-teal-500", bg: "bg-teal-50" },
    { name: "Guruku (Asatidzah)", desc: "Direktori lengkap profil asatidzah dan pengajar.", image: "/images/asatidzah_icon_v3.png", color: "text-purple-500", bg: "bg-purple-50" },
    { name: "Kepengurusan", desc: "Struktur kepengurusan dan rekam jejak pengabdian.", image: "/images/kepengurusan_bg.png", color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Pusat Notifikasi", desc: "Pemberitahuan sistem secara real-time.", icon: Bell, color: "text-pink-500", bg: "bg-pink-50" },
    { name: "Al-Qur'an Digital", desc: "Bacaan Al-Qur'an lengkap dengan terjemahan dan progres tilawah.", image: "/images/quran_icon.png", color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Sangu & Wirid", desc: "Koleksi doa harian, sholawat, dan nadzom santri.", image: "/images/sangu_icon.png", color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Squad MAZEEDA", desc: "Direktori lengkap data santri, alumni, dan asatidzah.", image: "/images/squad_icon_v3.png", color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Mading & Artikel", desc: "Pusat informasi, mading digital, dan artikel bermanfaat.", image: "/images/timeline_icon.png", color: "text-rose-500", bg: "bg-rose-50" },
    { name: "Timeline Galeri", desc: "Bagikan momen dan kenangan tak terlupakan.", icon: Image, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "MAZEEDA AI", desc: "Asisten virtual super cerdas untuk berdiskusi dan curhat.", image: "/merak.png", color: "text-indigo-500", bg: "bg-indigo-50" }
  ];
`;

const featureArrayStart = dest.indexOf('const features = [');
const featureArrayEnd = dest.indexOf('];', featureArrayStart) + 2;
dest = dest.substring(0, featureArrayStart) + featuresDefinition + dest.substring(featureArrayEnd);

dest = dest.replace('Fitur Utama', 'Fitur-Fitur');

const iconHTML = `
              <div class="w-12 h-12 rounded-2xl {feature.bg} {feature.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
                {#if feature.image}
                  <img src={feature.image} alt={feature.name} class="w-full h-full object-cover scale-[1.3]" />
                {:else}
                  <svelte:component this={feature.icon} class="w-6 h-6" />
                {/if}
              </div>`;
              
const oldIconHTML = `<div class="w-12 h-12 rounded-2xl {feature.bg} {feature.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svelte:component this={feature.icon} class="w-6 h-6" />
              </div>`;

dest = dest.replace(oldIconHTML, iconHTML);

const oldText = `Berlandaskan ajaran <strong>Ahlussunnah wal Jama'ah</strong> dan tradisi khas pesantren (khususnya <em>MQL Lirboyo</em>), MAZEEDA mengusung semangat adaptasi teknologi yang positif. Kami percaya bahwa kemajuan zaman (AI, digitalisasi) harus dirangkul sebagai alat untuk menyebarkan kebaikan, tanpa pernah melupakan akar akhlak dan adab seorang santri.`;
const newText = `Berlandaskan ajaran Ahlussunnah wal Jama'ah dan tradisi khas pesantren Lirboyo, MAZEEDA mengusung semangat adaptasi teknologi yang positif. Kami percaya bahwa kemajuan zaman (digitalisasi) harus dirangkul sebagai alat untuk menyebarkan kebaikan, tanpa pernah melupakan akar akhlak dan adab seorang santri.`;

dest = dest.replace(oldText, newText);

dest = dest.replace('<p class="text-blue-100 text-sm leading-relaxed">', '<p class="text-blue-100 text-sm leading-relaxed text-justify">');
dest = dest.replace('<p class="text-blue-100 text-sm leading-relaxed">', '<p class="text-blue-100 text-sm leading-relaxed text-justify">');

if (dest.includes('© 2026 MAZEEDA Community. Hak Cipta Dilindungi.')) {
  dest = dest.replace('© 2026 MAZEEDA Community. Hak Cipta Dilindungi.', '© 2026 MAZEEDA - Hak Cipta Dilindungi.');
} else if (dest.includes('© {new Date().getFullYear()} MAZEEDA Community. Hak Cipta Dilindungi.')) {
  dest = dest.replace('© {new Date().getFullYear()} MAZEEDA Community. Hak Cipta Dilindungi.', '© {new Date().getFullYear()} MAZEEDA - Hak Cipta Dilindungi.');
}

fs.writeFileSync(destPath, dest, 'utf8');
console.log('Successfully updated tentang/+page.svelte');
