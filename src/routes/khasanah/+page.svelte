<script lang="ts">
  import { ChevronLeft, BookOpen, Users, PenTool, Building2 } from "lucide-svelte";
  
  const menus = [
    {
      title: "Filosofi Logo",
      desc: "Makna mendalam lambang pesantren.",
      icon: PenTool,
      href: "/khasanah/filosofi",
      color: "from-teal-600 to-emerald-800",
      image: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80"
    },
    {
      title: "Mozaik Murobbi",
      desc: "Biografi pendiri & pengasuh.",
      icon: Users,
      href: "/khasanah/mozaik",
      color: "from-amber-600 to-orange-800",
      image: "https://images.unsplash.com/photo-1517409276906-8b9a2ab5f14e?w=800&q=80"
    },
    {
      title: "Dawuh & Sambutan",
      desc: "Pesan & nasehat masyayikh.",
      icon: BookOpen,
      href: "/khasanah/sambutan",
      color: "from-blue-600 to-indigo-900",
      image: "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?w=800&q=80"
    },
    {
      title: "Profil Unit",
      desc: "Lembaga & unit pendidikan.",
      icon: Building2,
      href: "/khasanah/unit",
      color: "from-rose-600 to-pink-900",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
    }
  ];
</script>

<div class="min-h-screen bg-slate-100 pb-24 font-sans">
  <!-- Elegant Header -->
  <header class="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm">
    <div class="px-4 h-16 flex items-center justify-between max-w-2xl mx-auto">
      <a href="/" class="p-2 -ml-2 rounded-full hover:bg-slate-200/50 transition-colors">
        <ChevronLeft class="h-6 w-6 text-slate-800" />
      </a>
      <h1 class="font-bold text-lg text-slate-900 tracking-tight">Khasanah Lirboyo</h1>
      <div class="w-10"></div>
    </div>
  </header>

  <main class="max-w-2xl mx-auto px-4 py-8 space-y-8">
    <div class="text-center space-y-3 mb-10">
      <h2 class="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm">Jejak & Sejarah</h2>
      <p class="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Menyelami khasanah keilmuan dan keteladanan Pondok Pesantren Lirboyo.</p>
    </div>

    <div class="grid grid-cols-1 gap-5">
      {#each menus as menu}
        <a href={menu.href} class="group block focus:outline-none">
          <div class="relative overflow-hidden rounded-3xl h-40 flex items-center shadow-md hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <!-- Background Image with Parallax effect on hover -->
            <img src={menu.image} alt={menu.title} class="absolute inset-0 w-full h-full object-cover filter brightness-75 grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
            
            <!-- Gradient Overlay -->
            <div class={`absolute inset-0 bg-gradient-to-r ${menu.color} opacity-80 mix-blend-multiply transition-opacity group-hover:opacity-60`}></div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            
            <!-- Content -->
            <div class="relative z-10 p-6 flex items-center w-full">
              <div class="bg-white/20 backdrop-blur-md p-3.5 rounded-2xl text-white mr-5 border border-white/30 shadow-inner group-hover:rotate-6 transition-transform duration-300">
                <svelte:component this={menu.icon} class="w-7 h-7" />
              </div>
              <div class="text-white">
                <h3 class="font-extrabold text-2xl mb-1 tracking-wide drop-shadow-md">{menu.title}</h3>
                <p class="text-white/80 text-sm font-medium leading-relaxed drop-shadow-sm">{menu.desc}</p>
              </div>
            </div>
          </div>
        </a>
      {/each}
    </div>
  </main>
</div>
