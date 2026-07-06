<script lang="ts">
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { ScrollText } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Syarat & Ketentuan - MAZEEDA</title>
</svelte:head>

<div class="min-h-[100dvh] bg-slate-50 flex flex-col pb-safe">
  <PageHeader title="Syarat & Ketentuan" backTo="/" />

  <main class="flex-1 overflow-y-auto px-4 py-8">
    <div class="max-w-3xl mx-auto space-y-8">
      
      <!-- Hero Header -->
      <div class="text-center space-y-4 mb-8">
        <div class="mx-auto w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
          <ScrollText class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Syarat & Ketentuan</h1>
        <p class="text-slate-500 font-medium text-sm">
          Terakhir diperbarui: <span class="text-slate-700 font-bold">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
        <p class="max-w-lg mx-auto text-slate-500 text-sm leading-relaxed mt-4">
          Panduan, etika, dan ketentuan dasar penggunaan layanan aplikasi demi menjaga kenyamanan bersama di komunitas MAZEEDA.
        </p>
      </div>

      <!-- Content Box -->
      <div class="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100">
        <div class="space-y-8">
          
          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">1.</span> 
              <span>Ketentuan Penggunaan</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Dengan mengunduh atau menggunakan aplikasi MAZEEDA, Anda otomatis menyetujui syarat dan ketentuan ini. 
              </p>
              <p>
                Anda tidak diperkenankan menyalin, memodifikasi, mendistribusikan, atau menjual bagian mana pun dari aplikasi ini, maupun aset atau kode di dalamnya, tanpa izin tertulis dari pengembang MAZEEDA (MA HMQ Lirboyo).
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">2.</span> 
              <span>Etika Berkomunitas</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                MAZEEDA adalah aplikasi berbasis komunitas santri dan alumni. Pengguna diwajibkan untuk mematuhi hal-hal berikut:
              </p>
              <ul class="list-none space-y-2 mt-2">
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span>Menjaga adab dan kesopanan (akhlakul karimah) saat menggunakan fitur seperti Timeline dan MAZEEDA AI.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></span>
                  <span>Tidak mengunggah konten yang mengandung unsur SARA, pornografi, atau hal-hal yang melanggar syariat Islam dan hukum yang berlaku.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                  <span>Menggunakan identitas asli (atau nama masyhur) saat mendaftar ke Direktori Squad MAZEEDA agar mudah dikenali.</span>
                </li>
              </ul>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">3.</span> 
              <span>Tanggung Jawab & Layanan</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Aplikasi ini disediakan secara "apa adanya" (<em>as is</em>). 
              </p>
              <p>
                Meskipun kami selalu berupaya memastikan semua fitur (seperti Al-Qur'an, Jadwal Sholat, Arah Kiblat, dan Kalkulator Zakat) berjalan dengan akurat, kami tidak bertanggung jawab atas segala kerugian yang timbul akibat kesalahan atau ketidakakuratan data teknis (seperti gangguan sinyal/GPS pada perangkat).
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">4.</span> 
              <span>Hak Akses & Akun</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Admin MAZEEDA berhak sewaktu-waktu untuk menghapus, menangguhkan, atau menonaktifkan akun pengguna apabila ditemukan indikasi kuat adanya pelanggaran terhadap syarat dan ketentuan ini tanpa pemberitahuan sebelumnya.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-emerald-600 font-black">5.</span> 
              <span>Perubahan Syarat & Ketentuan</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu menyesuaikan dengan perkembangan layanan kami.
              </p>
              <p>
                Pengguna disarankan untuk meninjau halaman ini secara berkala. Perubahan dianggap berlaku segera setelah diposting dan diperbarui di halaman ini.
              </p>
            </div>
          </section>

        </div>
      </div>
      
      <!-- Footer Note -->
      <div class="text-center pt-4 pb-8">
        <p class="text-xs font-semibold text-slate-400">© {new Date().getFullYear()} MAZEEDA Community. Hak Cipta Dilindungi.</p>
      </div>

    </div>
  </main>
</div>

<style>
  .pb-safe {
    padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
  }
</style>
