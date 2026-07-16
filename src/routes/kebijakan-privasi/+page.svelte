<script lang="ts">
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { ShieldCheck } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Kebijakan Privasi - MAZEEDA</title>
</svelte:head>

<div class="min-h-[100dvh] bg-slate-50 flex flex-col pb-safe">
  <PageHeader title="Kebijakan Privasi" backTo="/" />

  <main class="flex-1 overflow-y-auto px-4 py-8">
    <div class="max-w-3xl mx-auto space-y-8">
      
      <!-- Hero Header -->
      <div class="text-center space-y-4 mb-8">
        <div class="mx-auto w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
          <ShieldCheck class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">Kebijakan Privasi</h1>
        <p class="text-slate-500 font-medium text-sm">
          Terakhir diperbarui: <span class="text-slate-700 font-bold">{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </p>
        <p class="max-w-lg mx-auto text-slate-500 text-sm leading-relaxed mt-4">
          Keamanan dan privasi data Anda adalah prioritas utama kami. Berikut adalah penjelasan mengenai bagaimana kami mengelola informasi di aplikasi MAZEEDA.
        </p>
      </div>

      <!-- Content Box -->
      <div class="bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-slate-100">
        <div class="space-y-8">
          
          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">1.</span> 
              <span>Pengumpulan Informasi</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Kami mengumpulkan informasi dari Anda saat Anda terdaftar di Pondok Pesantren MA HMQ Lirboyo Kota Kediri Jawa Timur, serta saat memperbarui data (seperti data santri, daerah, kamar, dan informasi lainnya).
              </p>
              <p>
                Informasi yang dikumpulkan mencakup nama, alamat email, nomor telepon, peran/jabatan, dan data relevan lainnya yang berkaitan dengan keperluan administrasi serta silaturahmi MAZEEDA SQUAD.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">2.</span> 
              <span>Penggunaan Informasi</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Segala informasi yang kami kumpulkan dari Anda dapat digunakan untuk tujuan berikut:
              </p>
              <ul class="list-none space-y-2 mt-2">
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                  <span><strong>Personalisasi:</strong> Menyesuaikan pengalaman Anda dan memenuhi kebutuhan spesifik Guru, Santri, maupun Pengurus.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                  <span><strong>Peningkatan Layanan:</strong> Meningkatkan kualitas fitur, keamanan, dan performa aplikasi MAZEEDA.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span><strong>Fitur Direktori:</strong> Memfasilitasi fitur pencarian direktori SQUAD MAZEEDA secara efektif dan efisien.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                  <span><strong>Komunikasi:</strong> Mengirimkan pembaruan informasi atau pemberitahuan penting terkait kegiatan MAZEEDA.</span>
                </li>
              </ul>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">3.</span> 
              <span>Perlindungan dan Batasan Akses Data</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Kami menerapkan berbagai langkah keamanan ketat untuk menjaga kerahasiaan informasi pribadi Anda. Aplikasi ini menggunakan teknologi enkripsi mutakhir dan standar keamanan industri untuk memastikan data anggota Squad tetap aman dari akses luar yang tidak sah.
              </p>
              <p>
                <strong>Akses Pengguna Terdaftar:</strong> Informasi di dalam aplikasi ini (seperti nomor telepon, daerah, dan kamar) bersifat internal dan hanya dapat diakses serta dilihat oleh pengguna yang telah resmi terdaftar dan masuk (login) ke dalam aplikasi MAZEEDA.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">4.</span> 
              <span>Pengungkapan Kepada Pihak Ketiga</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Kami sangat menghargai privasi Anda. Kami tidak pernah menjual, memperdagangkan, atau memindahkan informasi pribadi Anda kepada pihak luar tanpa persetujuan Anda.
              </p>
              <p>
                Pengecualian berlaku untuk pihak ketiga tepercaya yang membantu kami mengoperasikan aplikasi, mengelola database cloud, atau memberikan pelayanan kepada Anda, selama pihak-pihak tersebut sepakat dan terikat perjanjian untuk senantiasa merahasiakan informasi ini.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">5.</span> 
              <span>Hak Pengguna dan Perubahan Data</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>Sebagai pengguna, Anda memiliki hak untuk:</p>
              <ul class="list-none space-y-2 mt-2">
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                  <span>Mengakses dan melihat data pribadi Anda yang tersimpan di dalam sistem setelah melakukan login.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                  <span>Mengajukan perubahan, pembaruan, atau koreksi data yang tidak akurat hanya dengan menghubungi dan melalui bantuan Admin.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span>Mengajukan permohonan penonaktifan akun atau penghapusan data pribadi dari database MAZEEDA melalui Admin jika sudah tidak lagi menjadi bagian dari organisasi.</span>
                </li>
              </ul>
            </div>
          </section>
          
          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">6.</span> 
              <span>Persetujuan Anda</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Dengan mendaftar, mengakses, dan menggunakan aplikasi MAZEEDA, Anda dengan ini menyatakan setuju dan tunduk pada seluruh ketentuan Kebijakan Privasi ini.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">7.</span> 
              <span>Kontak Layanan Admin</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Jika Anda memiliki pertanyaan, ingin memperbarui data, atau memiliki kendala terkait privasi data Anda, silakan hubungi tim administrasi kami secara langsung (klik tautan di bawah untuk langsung terhubung):
              </p>
              
              <div class="flex flex-col gap-3 mt-4">
                <a href="mailto:mazeedahmqlirboyo@gmail.com" class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-indigo-50 transition-colors group/link border border-slate-100">
                  <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-600 group-hover/link:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p class="font-semibold text-slate-800 group-hover/link:text-indigo-700">mazeedahmqlirboyo@gmail.com</p>
                  </div>
                </a>
                
                <a href="https://wa.me/6285111653232" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors group/link border border-slate-100">
                  <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 group-hover/link:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp</p>
                    <p class="font-semibold text-slate-800 group-hover/link:text-emerald-700">0851-1165-3232</p>
                  </div>
                </a>
              </div>
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
