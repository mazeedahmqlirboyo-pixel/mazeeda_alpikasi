<script lang="ts">
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { Heart, Sparkles, BookOpen, Users, Megaphone, Image as ImageIcon, Bot, ShieldCheck, Code, Smartphone, Wallet, Bell } from 'lucide-svelte';
  const features = [
    { name: "Arah Kiblat", desc: "Cari arah kiblat sholat secara real-time dengan HP atau GPS.", image: "/images/kiblat_bg.png", color: "text-indigo-500", bg: "bg-indigo-50", offset: "scale-[1.2]" },
    { name: "Kalkulator Zakat", desc: "Hitung Zakat Penghasilan, Maal, Emas, Peternakan, Saham, dll.", image: "/images/zakat_bg.png", color: "text-emerald-500", bg: "bg-emerald-50", offset: "scale-[1.2]" },
    { name: "Kalkulator Faraidh", desc: "Hitung pembagian waris secara syariat Islam dengan mudah.", image: "/images/faraidh_bg.png", color: "text-amber-500", bg: "bg-amber-50", offset: "scale-[1.2]" },
    { name: "Masehi & Hijriah", desc: "Lihat penanggalan Masehi dan Hijriah secara interaktif dalam satu layar.", image: "/images/kalender_bg.png", color: "text-green-500", bg: "bg-green-50", offset: "scale-[1.2]" },
    { name: "Tasbih Digital", desc: "Hitung dan simpan zikir harianmu secara otomatis.", image: "/images/tasbih_icon.png", color: "text-teal-500", bg: "bg-teal-50", offset: "scale-[1.2]" },
    { name: "Cash Flow", desc: "Catat Cash Flow harianmu dengan mudah dan aman sebagaimana isyarat QS. Al-Baqarah: 282.", image: "/images/cashflow_icon.png", color: "text-blue-500", bg: "bg-blue-50", offset: "scale-[1.15]" },
    { name: "Jejak Lirboyo", desc: "Selami nilai-nilai sejarah, filosofi, dan profil lengkap Pondok Pesantren Lirboyo.", image: "/images/journey_compass.png", color: "text-teal-500", bg: "bg-teal-50", offset: "scale-[1.2]" },
    { name: "Guruku (Asatidzah)", desc: "Direktori lengkap profil asatidzah dan pengajar.", image: "/images/asatidzah_icon_v3.png", color: "text-purple-500", bg: "bg-purple-50", offset: "scale-110" },
    { name: "Kepengurusan", desc: "Struktur kepengurusan dan rekam jejak pengabdian.", image: "/images/kepengurusan_bg.png", color: "text-orange-500", bg: "bg-orange-50", offset: "scale-[1.2]" },
    { name: "Pusat Notifikasi", desc: "Pemberitahuan sistem secara real-time.", image: "/images/notifikasi_icon.png", color: "text-pink-500", bg: "bg-pink-50", offset: "scale-[1.15]" },
    { name: "Al-Qur'an Digital", desc: "Bacaan Al-Qur'an lengkap dengan terjemahan dan progres tilawah.", image: "/images/quran_icon.png", color: "text-emerald-500", bg: "bg-emerald-50", offset: "scale-110" },
    { name: "Sangu & Wirid", desc: "Koleksi doa harian, sholawat, dan nadzom santri.", image: "/images/sangu_icon.png", color: "text-amber-500", bg: "bg-amber-50", offset: "scale-110" },
    { name: "Squad MAZEEDA", desc: "Direktori lengkap data santri, alumni, dan asatidzah.", image: "/images/squad_icon_v3.png", color: "text-blue-500", bg: "bg-blue-50", offset: "scale-110" },
    { name: "Mading & Artikel", desc: "Pusat informasi, mading digital, dan artikel bermanfaat.", image: "/images/mading_icon.png", color: "text-rose-500", bg: "bg-rose-50", offset: "scale-110" },
    { name: "Timeline Galeri", desc: "Bagikan momen dan kenangan tak terlupakan.", image: "/images/timeline_icon.png", color: "text-purple-500", bg: "bg-purple-50", offset: "scale-110" },
    { name: "MAZEEDA AI", desc: "Asisten virtual super cerdas untuk berdiskusi dan curhat.", image: "/merak.png", color: "text-indigo-500", bg: "bg-indigo-50", offset: "scale-110" }
  ];
</script>

<svelte:head>
  <title>Tentang MAZEEDA</title>
</svelte:head>

<div class="min-h-[100dvh] bg-slate-50 dark:bg-slate-800 flex flex-col pb-safe">
  <PageHeader title="Tentang Aplikasi" backTo="/" />

  <!-- Hero Section -->
  <main class="flex-1 overflow-y-auto px-4 py-8">
    <div class="max-w-3xl mx-auto space-y-10">
      
      <!-- App Header -->
      <div class="text-center space-y-4">
        <div class="mx-auto w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-blue-500/20 mb-6 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800">
          <img src="/logo.png" alt="MAZEEDA Logo" class="w-full h-full object-cover" />
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">MAZEEDA</h1>
        <p class="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Lebih dari sekadar aplikasi, MAZEEDA adalah "Rumah Digital" yang menyatukan seluruh keluarga besar santri dan alumni di mana pun berada. Kami hadir untuk merawat tradisi pesantren dengan sentuhan inovasi digital masa kini.
        </p>
        <div class="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          <span class="text-xs font-bold text-blue-700 tracking-wider">VERSI 1.0.0 (STABIL)</span>
        </div>
      </div>

      <!-- Features Grid -->
      <div class="space-y-4">
        <div class="flex items-center gap-2 px-2">
          <Sparkles class="w-5 h-5 text-indigo-500" />
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">Fitur-Fitur</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {#each features as feature}
            <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-shadow flex items-center gap-4 group cursor-default">
              <div class="w-12 h-12 rounded-2xl {feature.bg} {feature.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
                {#if feature.image}
                  <img src={feature.image} alt={feature.name} class="w-full h-full object-contain mix-blend-multiply drop-shadow-sm dark:shadow-none relative z-10 {feature.offset || ''}" />
                {:else}
                  <!-- @ts-ignore -->
                  <!-- @ts-ignore -->
                  <svelte:component this={feature.icon} class="w-6 h-6" />
                {/if}
              </div>
              <div>
                <h3 class="font-bold text-slate-800 dark:text-slate-100 mb-1">{feature.name}</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Visi & Tujuan -->
      <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 shadow-lg shadow-blue-500/20 text-white relative overflow-hidden">
        <!-- Abstract Shapes -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-slate-900 opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-white dark:bg-slate-900 opacity-5 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div class="relative z-10 space-y-6">
          <div>
            <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-blue-200" />
              Tujuan MAZEEDA
            </h2>
            <p class="text-blue-100 text-sm leading-relaxed text-justify">
              Aplikasi MAZEEDA didedikasikan sebagai pusat informasi, komunikasi, dan sarana ibadah digital yang mudah diakses. Tujuan utamanya adalah untuk mempermudah santri dan alumni dalam menjaga produktivitas amaliyah (seperti rutinan wirid & ngaji), sekaligus mempererat ikatan silaturahmi yang tak lekang oleh waktu dan jarak.
            </p>
          </div>
          
          <div class="w-full h-px bg-white dark:bg-slate-900/20"></div>

          <div>
            <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
              <ShieldCheck class="w-5 h-5 text-blue-200" />
              Nilai & Semangat
            </h2>
            <p class="text-blue-100 text-sm leading-relaxed text-justify">
              Berlandaskan ajaran Ahlussunnah wal Jama'ah serta tradisi luhur pondok pesantren Lirboyo Kediri, khususnya di lingkungan MA HMQ Lirboyo, MAZEEDA hadir mengusung semangat adaptasi teknologi yang positif. Kami percaya bahwa modernisasi dan digitalisasi harus dirangkul sebagai sarana menyebarkan kemaslahatan, dengan tetap memegang teguh prinsip akhlakul karimah dan adab santri yang kokoh.
            </p>
          </div>
        </div>
      </div>

      <!-- Footer Credits -->
      <div class="text-center pt-8 pb-4">
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
          Dibuat dengan <Heart class="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" /> untuk MAZEEDA
        </p>
        <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2">© {new Date().getFullYear()} MAZEEDA - Hak Cipta Dilindungi.</p>
      </div>

    </div>
  </main>
</div>

<style>
  .pb-safe {
    padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
  }
  @keyframes shimmer {
    100% {
      background-position: -250% 0;
    }
  }
</style>
