const fs = require('fs');
const destPath = 'c:/MAZEEDA/MAZEEDA CODING/New folder/src/routes/tentang/+page.svelte';

let dest = fs.readFileSync(destPath, 'utf8');

const featuresDefinition = `
  import { Heart, Sparkles, BookOpen, Users, Megaphone, Image as ImageIcon, Bot, ShieldCheck, Code, Smartphone, Wallet, Bell } from 'lucide-svelte';

  const features = [
    { name: "Arah Kiblat", desc: "Cari arah kiblat sholat secara real-time dengan HP atau GPS.", image: "/images/kiblat_bg.png", color: "text-indigo-500", bg: "bg-indigo-50" },
    { name: "Kalkulator Zakat", desc: "Hitung Zakat Penghasilan, Maal, Emas, Peternakan, Saham, dll.", image: "/images/zakat_bg.png", color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Kalkulator Faraidh", desc: "Hitung pembagian waris secara syariat Islam dengan mudah.", image: "/images/faraidh_bg.png", color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Masehi & Hijriah", desc: "Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu layar.", image: "/images/kalender_bg.png", color: "text-green-500", bg: "bg-green-50" },
    { name: "Tasbih Digital", desc: "Hitung dan simpan zikir harianmu secara otomatis.", image: "/images/tasbih_icon.png", color: "text-teal-500", bg: "bg-teal-50" },
    { name: "Cash Flow", desc: "Catat Cash Flow harianmu dengan mudah dan aman sebagaimana isyarat QS. Al-Baqarah: 282.", image: "/images/cashflow_icon.png", color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Jejak Lirboyo", desc: "Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo.", image: "/images/journey_compass.png", color: "text-teal-500", bg: "bg-teal-50" },
    { name: "Guruku (Asatidzah)", desc: "Direktori lengkap profil asatidzah dan pengajar.", image: "/images/asatidzah_icon_v3.png", color: "text-purple-500", bg: "bg-purple-50" },
    { name: "Kepengurusan", desc: "Struktur kepengurusan dan rekam jejak pengabdian.", image: "/images/kepengurusan_bg.png", color: "text-orange-500", bg: "bg-orange-50" },
    { name: "Pusat Notifikasi", desc: "Pemberitahuan sistem secara real-time.", image: "/images/notifikasi_icon.png", color: "text-pink-500", bg: "bg-pink-50" },
    { name: "Al-Qur'an Digital", desc: "Bacaan Al-Qur'an lengkap dengan terjemahan dan progres tilawah.", image: "/images/quran_icon.png", color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Sangu & Wirid", desc: "Koleksi doa harian, sholawat, dan nadzom santri.", image: "/images/sangu_icon.png", color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Squad MAZEEDA", desc: "Direktori lengkap data santri, alumni, dan asatidzah.", image: "/images/squad_icon_v3.png", color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Mading & Artikel", desc: "Pusat informasi, mading digital, dan artikel bermanfaat.", image: "/images/mading_icon.png", color: "text-rose-500", bg: "bg-rose-50" },
    { name: "Timeline Galeri", desc: "Bagikan momen dan kenangan tak terlupakan.", image: "/images/timeline_icon.png", color: "text-purple-500", bg: "bg-purple-50" },
    { name: "MAZEEDA AI", desc: "Asisten virtual super cerdas untuk berdiskusi dan curhat.", image: "/merak.png", color: "text-indigo-500", bg: "bg-indigo-50" }
  ];
`;

const featureArrayStart = dest.indexOf('  import { Heart, Sparkles');
const featureArrayEnd = dest.indexOf('  ];', featureArrayStart) + 4;

dest = dest.substring(0, featureArrayStart) + featuresDefinition.trim() + dest.substring(featureArrayEnd);

fs.writeFileSync(destPath, dest, 'utf8');
console.log('Updated icons!');
