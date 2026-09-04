<script lang="ts">
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { ScrollText } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Syarat & Ketentuan - MAZEEDA</title>
</svelte:head>

<div class="min-h-[100dvh] bg-slate-50 dark:bg-slate-800 flex flex-col pb-safe">
  <PageHeader title="Syarat & Ketentuan" backTo="/" />

  <main class="flex-1 overflow-y-auto px-4 py-8">
    <div class="max-w-3xl mx-auto space-y-8">
      
      <!-- Hero Header -->
      <div class="text-center space-y-4 mb-8">
        <div class="mx-auto w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
          <ScrollText class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Syarat & Ketentuan</h1>
        <p class="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium text-sm">
          Terakhir diperbarui: <span class="text-slate-700 dark:text-slate-200 font-bold">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
        <p class="max-w-lg mx-auto text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm leading-relaxed mt-4">
          Panduan, etika, dan ketentuan dasar penggunaan layanan aplikasi demi menjaga kenyamanan bersama di komunitas MAZEEDA.
        </p>
      </div>

      <!-- Content Box -->
      <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-10 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800">
        <div class="space-y-8">
          
          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">1.</span> 
              <span>Ketentuan Penggunaan</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Dengan mengunduh, mendaftar, atau menggunakan aplikasi MAZEEDA, Anda secara otomatis menyetujui seluruh syarat dan ketentuan yang berlaku di halaman ini.
              </p>
              <p>
                Anda tidak diperkenankan untuk menyalin, memodifikasi, mendistribusikan, membongkar kode (reverse engineer), atau menjual bagian mana pun dari aplikasi ini, maupun aset di dalamnya, tanpa izin tertulis dari pengembang MAZEEDA (MA HMQ Lirboyo).
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50 dark:bg-slate-800"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">2.</span> 
              <span>Etika Berkomunitas & Penggunaan Data</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                MAZEEDA adalah aplikasi berbasis komunitas Guru, SantrI, dan Alumni. Pengguna diwajibkan untuk mematuhi hal-hal berikut:
              </p>
              <ul class="list-none space-y-2 mt-2">
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span>Menjaga adab, kesopanan (akhlakul karimah), dan nilai-nilai pesantren saat menggunakan fitur interaktif seperti Timeline maupun MAZEEDA AI.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                  <span>Tidak mengunggah, membagikan, atau mengirimkan konten yang mengandung unsur SARA, ujaran kebencian, pornografi, atau hal-hal lain yang melanggar syariat Islam serta hukum yang berlaku.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                  <span>Menggunakan nama asli (atau nama panggilan/masyhur yang dikenal di pondok) saat mendaftar ke Direktori Squad MAZEEDA agar mudah diidentifikasi demi kelancaran silaturahmi.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                  <span>Dilarang keras menyalin, menyebarluaskan, atau menyalahgunakan data pribadi anggota lain (seperti nomor telepon, daerah, atau kamar) yang diperoleh dari direktori aplikasi untuk kepentingan komersial atau hal lain di luar koordinasi resmi MAZEEDA SQUAD.</span>
                </li>
              </ul>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50 dark:bg-slate-800"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">3.</span> 
              <span>Tanggung Jawab & Batasan Layanan</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Aplikasi ini disediakan secara "apa adanya" (<em>as is</em>). 
              </p>
              <p>
                Meskipun kami selalu berupaya memastikan semua fitur (seperti Al-Qur'an, Jadwal Sholat, Arah Kiblat, dan Kalkulator Zakat) berjalan dengan akurat, kami tidak bertanggung jawab atas segala kendala atau ketidakakuratan data teknis yang disebabkan oleh faktor eksternal (seperti gangguan sinyal, GPS perangkat, atau gangguan server pihak ketiga).
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50 dark:bg-slate-800"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">4.</span> 
              <span>Hak Akses & Penangguhan Akun</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Akun Anda hanya boleh digunakan oleh Anda sendiri dan tidak boleh dipinjamkan kepada pihak luar pondok.
              </p>
              <p>
                Admin MAZEEDA berhak sewaktu-waktu untuk menghapus, menangguhkan, atau menonaktifkan akun pengguna apabila ditemukan indikasi kuat adanya pelanggaran aturan, tanpa perlu memberikan pemberitahuan terlebih dahulu.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50 dark:bg-slate-800"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">5.</span> 
              <span>Perubahan Syarat & Ketentuan</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu menyesuaikan dengan perkembangan sistem dan layanan kami.
              </p>
              <p>
                Pengguna disarankan untuk meninjau halaman ini secara berkala. Perubahan aturan dianggap berlaku segera setelah diperbarui di halaman ini.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50 dark:bg-slate-800"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">6.</span> 
              <span>Kontak Hubung Layanan</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Jika Anda menemui kendala teknis, ingin melaporkan pelanggaran akun, atau memiliki pertanyaan seputar ketentuan ini, silakan hubungi Admin MAZEEDA melalui tautan langsung di bawah ini:
              </p>
              
              <div class="flex flex-col gap-3 mt-4">
                <a href="mailto:mazeedahmqlirboyo@gmail.com" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 transition-colors group/link border border-slate-100 dark:border-slate-800">
                  <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm dark:shadow-none text-emerald-600 group-hover/link:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</p>
                    <p class="font-semibold text-slate-800 dark:text-slate-100 group-hover/link:text-emerald-700">mazeedahmqlirboyo@gmail.com</p>
                  </div>
                </a>
                
                <a href="https://wa.me/6285111653232" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-teal-50 transition-colors group/link border border-slate-100 dark:border-slate-800">
                  <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm dark:shadow-none text-teal-600 group-hover/link:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">WhatsApp</p>
                    <p class="font-semibold text-slate-800 dark:text-slate-100 group-hover/link:text-teal-700">0851-1165-3232</p>
                  </div>
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
      
      <!-- Footer Note -->
      <div class="text-center pt-4 pb-8">
        <p class="text-xs font-semibold text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} MAZEEDA Community. Hak Cipta Dilindungi.</p>
      </div>

    </div>
  </main>
</div>

<style>
  .pb-safe {
    padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
  }
</style>
