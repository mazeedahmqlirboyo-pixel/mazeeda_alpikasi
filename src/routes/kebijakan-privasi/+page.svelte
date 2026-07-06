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
                Kami mengumpulkan informasi dari Anda saat Anda mendaftar di Pondok Pesantren MA HMQ Lirboyo Kota Kediri Jawa Timur, memperbarui profil (seperti data santri, daerah, dan kamar), atau menggunakan fitur aplikasi. 
              </p>
              <p>
                Informasi yang dikumpulkan mencakup nama, alamat email, nomor telepon, dan data relevan lainnya yang berkaitan dengan keperluan administrasi dan silaturahmi MAZEEDA Squad.
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
                  <span>Personalisasi pengalaman Anda dan memenuhi kebutuhan spesifik santri/alumni.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                  <span>Meningkatkan kualitas fitur dan performa aplikasi MAZEEDA.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                  <span>Memfasilitasi fitur pencarian direktori Squad MAZEEDA secara efektif.</span>
                </li>
                <li class="flex items-start gap-2.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                  <span>Mengirimkan pembaruan informasi atau pemberitahuan penting terkait kegiatan MAZEEDA.</span>
                </li>
              </ul>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">3.</span> 
              <span>Perlindungan Data</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Kami menerapkan berbagai langkah keamanan ketat untuk menjaga kerahasiaan informasi pribadi Anda.
              </p>
              <p>
                Aplikasi ini menggunakan teknologi enkripsi mutakhir (seperti sistem otentikasi Supabase) dan standar keamanan industri untuk memastikan data anggota Squad tetap aman dari akses yang tidak sah.
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
                Kami sangat menghargai privasi Anda. Kami <strong class="text-slate-800">tidak pernah</strong> menjual, memperdagangkan, atau memindahkan informasi pribadi Anda kepada pihak luar tanpa persetujuan Anda.
              </p>
              <p>
                Pengecualian berlaku untuk pihak ketiga tepercaya yang membantu kami mengoperasikan aplikasi atau memberikan pelayanan kepada Anda, selama pihak-pihak tersebut sepakat dan terikat perjanjian untuk senantiasa merahasiakan informasi ini.
              </p>
            </div>
          </section>

          <div class="w-full h-px bg-slate-50"></div>

          <section class="group">
            <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-3 flex items-start gap-3">
              <span class="text-blue-600 font-black">5.</span> 
              <span>Persetujuan Anda</span>
            </h2>
            <div class="pl-7 md:pl-8 text-slate-600 text-sm md:text-base leading-relaxed text-justify space-y-3">
              <p>
                Dengan mendaftar dan menggunakan aplikasi kami, Anda dengan ini menyatakan setuju dan tunduk pada seluruh ketentuan Kebijakan Privasi aplikasi MAZEEDA ini.
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
