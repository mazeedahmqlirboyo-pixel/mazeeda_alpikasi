<script lang="ts">
  import { BookOpen, Users, PenTool, Building2, ChevronRight } from "lucide-svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  const menus = [
    {
      title: "Filosofi Logo",
      desc: "Menyingkap makna mendalam di balik lambang kebesaran pesantren.",
      iconSrc: "/filosofi_ikon.jpg",
      href: "/khasanah/filosofi",
      bgDeco: "bg-teal-50"
    },
    {
      title: "Mozaik Murobbi",
      desc: "Menelusuri biografi, perjuangan, dan keteladanan para pendiri & pengasuh.",
      iconSrc: "/mozaik_ikon.png",
      href: "/khasanah/mozaik",
      bgDeco: "bg-amber-50"
    },
    {
      title: "Dawuh & Sambutan",
      desc: "Kumpulan pesan, nasihat, dan sambutan inspiratif dari para masyayikh.",
      iconSrc: "/dawuh_ikon.png",
      href: "/khasanah/sambutan",
      bgDeco: "bg-indigo-50"
    },
    {
      title: "Profil Unit",
      desc: "Mengenal lebih dekat berbagai lembaga dan unit pendidikan di bawah naungan pesantren.",
      iconSrc: "/profilunit_ikon.png",
      href: "/khasanah/unit",
      bgDeco: "bg-rose-50"
    }
  ];
</script>

<div class="min-h-screen bg-slate-50/50 pb-24 font-sans selection:bg-indigo-100">
  
  <PageHeader noMargin={true} title="Khasanah Lirboyo" backTo="/" />

  <main class="max-w-2xl mx-auto px-4 py-8 space-y-10">
    <div class="text-center space-y-3 mb-8 px-4">
      <div class="inline-flex items-center justify-center mb-4">
        <img src="/Joining%20puzzle%20pieces.svg" alt="Jejak Sejarah" class="w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-sm" />
      </div>
      <h2 class="text-3xl font-black text-slate-800 tracking-tight">Jejak & Sejarah</h2>
      <p class="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Penyelaman mendalam ke dalam khasanah keilmuan, sejarah, dan keteladanan Pondok Pesantren Lirboyo.</p>
    </div>

    <div class="grid grid-cols-1 gap-4">
      {#each menus as menu, i}
        <a href={menu.href} class="group block focus:outline-none" style="animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) {i * 0.08}s both;">
          <div class="relative overflow-hidden bg-white rounded-3xl p-5 flex items-center border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgb(0,0,0,0.06)] hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
            
            <!-- Oversized background icon decoration -->
            <div class="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300 pointer-events-none transform group-hover:scale-110 group-hover:-rotate-6 transition-transform">
              <img src={menu.iconSrc} alt={menu.title} class="w-40 h-40 object-contain grayscale" />
            </div>

            <!-- Icon Box -->
            <div class={`relative shrink-0 w-16 h-16 ${menu.bgDeco} rounded-[1.25rem] flex items-center justify-center mr-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner border border-white`}>
              <img src={menu.iconSrc} alt={menu.title} class="w-9 h-9 object-contain drop-shadow-sm" />
            </div>
            
            <!-- Text Content -->
            <div class="flex-1 pr-4">
              <h3 class="font-bold text-[17px] text-slate-800 mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">{menu.title}</h3>
              <p class="text-slate-500 text-xs leading-relaxed font-medium line-clamp-2">{menu.desc}</p>
            </div>

            <!-- Chevron Right -->
            <div class="shrink-0 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-500 group-hover:border-indigo-500 group-hover:shadow-md transition-all duration-300">
              <ChevronRight class="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        </a>
      {/each}
    </div>
  </main>
</div>

<style>
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
