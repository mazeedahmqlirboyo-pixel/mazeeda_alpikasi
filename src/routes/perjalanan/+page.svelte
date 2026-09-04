<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { ArrowLeft, Compass } from 'lucide-svelte';
  import { fly, fade } from 'svelte/transition';

  const milestones = [
    {
      year: 2023,
      chapter: "01",
      title: "Langkah\nPertama",
      subtitle: "Di sinilah semuanya bermula",
      body: "Dari sebuah tekad yang tulus dan doa yang dipanjatkan, MAZEEDA resmi berdiri. Santri-santri pertama melangkah masuk membawa mimpi dan harapan. Bukan hanya sebuah lembaga yang lahir — tapi sebuah keluarga.",
      reflection: "Setiap jejak langkah pertama di halaman madrasah ini adalah saksi bisu dari niat suci yang akan terus menggema hingga puluhan tahun ke depan.",
      image: "https://picsum.photos/seed/mzd2023/1200/800",
      accent: "#38bdf8",
      bg: "from-[#0a1628] to-[#0d2247]",
      stat: "Awal Mula",
      quote: "\"Perjalanan seribu mil dimulai dari satu langkah yang penuh keyakinan.\"",
      layout: "left", // text left, image right
    },
    {
      year: 2024,
      chapter: "02",
      title: "Pondasi\nDitegakkan",
      subtitle: "Ilmu, iman, dan akhlak dibangun bersama",
      body: "Kurikulum pertama disusun. Jadwal pertama ditegakkan. Suara hafalan mulai mengalun di setiap sudut. Bukan hanya ilmu yang ditanam di sini — tapi karakter yang akan bertahan seumur hidup.",
      reflection: "Bangunan yang menjulang tinggi selalu bermula dari pondasi yang tak terlihat namun kokoh mencengkeram bumi.",
      image: "https://picsum.photos/seed/mzd2024/1200/800",
      accent: "#818cf8",
      bg: "from-[#0f0a2e] to-[#1a1050]",
      stat: "Tahun Ke-2",
      quote: "\"Ilmu tanpa akhlak adalah ibarat pohon tanpa buah.\"",
      layout: "right",
    },
    {
      year: 2025,
      chapter: "03",
      title: "Tumbuh\nBersama",
      subtitle: "Semakin ramai, semakin semangat",
      body: "Jumlah santri terus bertambah. Kelas makin ramai, tawa makin sering terdengar. MAZEEDA mulai menemukan identitasnya — bukan sekadar madrasah, tapi sebuah rumah kedua yang hangat dan hidup.",
      reflection: "Di tempat ini, kita tidak hanya belajar dari kitab-kitab, tetapi juga belajar dari senyum, tangis, dan kebersamaan saudara seiman.",
      image: "https://picsum.photos/seed/mzd2025/1200/800",
      accent: "#a78bfa",
      bg: "from-[#150a35] to-[#2d1060]",
      stat: "Komunitas Berkembang",
      quote: "\"Sendiri kita bisa sedikit, bersama kita bisa menggapai semesta.\"",
      layout: "left",
    },
    {
      year: 2026,
      chapter: "04",
      title: "Prestasi\nPertama",
      subtitle: "Buah dari kerja keras yang nyata",
      body: "Buah dari kerja keras mulai terlihat. Santri-santri MAZEEDA unjuk gigi, membuktikan bahwa pesantren bisa melahirkan generasi unggul yang tak hanya fasih beribadah, tapi juga berprestasi di kancah yang lebih luas.",
      reflection: "Keringat yang jatuh di atas sajadah dan meja belajar kini mekar menjadi piala dan kebanggaan.",
      image: "https://picsum.photos/seed/mzd2026/1200/800",
      accent: "#f472b6",
      bg: "from-[#2d0a24] to-[#4a1040]",
      stat: "Prestasi Diraih",
      quote: "\"Usaha tidak akan pernah mengkhianati doa dan keikhlasan.\"",
      layout: "right",
    },
    {
      year: 2027,
      chapter: "05",
      title: "Setengah\nJalan",
      subtitle: "Berhenti sejenak, melihat ke belakang",
      body: "Tepat di tengah perjalanan. MAZEEDA berhenti sejenak untuk merenungi betapa jauhnya sudah melangkah. Ikatan yang terbentuk antara santri dan asatidzah bukan lagi sekadar hubungan murid-guru — tapi satu keluarga.",
      reflection: "Setengah dekade berlalu, meninggalkan ribuan cerita yang terukir di dinding-dinding asrama dan sanubari kita.",
      image: "https://picsum.photos/seed/mzd2027/1200/800",
      accent: "#fb7185",
      bg: "from-[#300a15] to-[#500d20]",
      stat: "5 Tahun Perjalanan",
      quote: "\"Kita tak akan tahu betapa jauh perjalanan, kecuali kita berhenti sejenak untuk bersyukur.\"",
      layout: "left",
    },
    {
      year: 2028,
      chapter: "06",
      title: "Meluaskan\nSayap",
      subtitle: "Nama MAZEEDA semakin dikenal",
      body: "Program-program baru hadir. Kegiatan makin beragam dan inovatif. Nama MAZEEDA mulai bergema lebih jauh di luar tembok pesantren, menjadi inspirasi dan referensi bagi banyak pihak.",
      reflection: "Seperti burung rajawali yang perlahan mengepakkan sayapnya, MAZEEDA bersiap mengarungi langit yang lebih luas.",
      image: "https://picsum.photos/seed/mzd2028/1200/800",
      accent: "#f97316",
      bg: "from-[#2d1500] to-[#4a2000]",
      stat: "Ekspansi Program",
      quote: "\"Pohon yang rindang memberikan keteduhan bagi siapa saja yang singgah di bawahnya.\"",
      layout: "right",
    },
    {
      year: 2029,
      chapter: "07",
      title: "Generasi\nMatang",
      subtitle: "Tradisi diwariskan antar generasi",
      body: "Santri angkatan awal kini telah menjadi kakak yang menjadi teladan. Tradisi keilmuan, akhlak, dan semangat diwariskan dari satu generasi ke generasi berikutnya — inilah rantai keberkahan yang tak boleh putus.",
      reflection: "Keteladanan adalah sebaik-baiknya nasihat. Yang muda menghormati, yang tua menyayangi.",
      image: "https://picsum.photos/seed/mzd2029/1200/800",
      accent: "#fb923c",
      bg: "from-[#2d1800] to-[#4a2800]",
      stat: "Regenerasi Berjalan",
      quote: "\"Sebaik-baik peninggalan bukanlah harta, melainkan ilmu dan akhlak mulia.\"",
      layout: "left",
    },
    {
      year: 2030,
      chapter: "08",
      title: "Menuju\nPuncak",
      subtitle: "Setiap momen semakin berharga",
      body: "Dua tahun menjelang penutupan. Semangat semakin membara. Setiap kegiatan terasa lebih bermakna, setiap senyum lebih hangat, setiap pertemuan lebih disyukuri. MAZEEDA memasuki fase kematangan penuh.",
      reflection: "Waktu seakan berlalu begitu cepat ketika kita berada di tempat yang kita cintai bersama orang-orang yang kita hargai.",
      image: "https://picsum.photos/seed/mzd2030/1200/800",
      accent: "#fbbf24",
      bg: "from-[#2d2000] to-[#4a3300]",
      stat: "Fase Kematangan",
      quote: "\"Puncak bukan ujung perjalanan, melainkan tempat untuk melihat seberapa jauh kita telah mendaki.\"",
      layout: "right",
    },
    {
      year: 2031,
      chapter: "09",
      title: "Tahun\nTerakhir",
      subtitle: "Detik-detik yang tak terlupakan",
      body: "Satu tahun sebelum penutupan. Para santri merasakan campuran haru dan bangga yang tak tertandingi. Setiap hari dijalani dengan penuh kesadaran — bahwa kenangan ini adalah harta yang paling berharga.",
      reflection: "Air mata haru mulai menggenang ketika menyadari bahwa sebentar lagi kebersamaan ini akan berganti menjadi kerinduan.",
      image: "https://picsum.photos/seed/mzd2031/1200/800",
      accent: "#fde68a",
      bg: "from-[#2d2a00] to-[#4a4200]",
      stat: "Satu Tahun Lagi",
      quote: "\"Hargailah setiap detik kebersamaan, karena waktu tak akan pernah kembali terulang.\"",
      layout: "left",
    },
    {
      year: 2032,
      chapter: "10",
      title: "Selamat\nJalan",
      subtitle: "Ini bukan akhir — ini awal yang baru",
      body: "Babak pertama MAZEEDA resmi tuntas dengan penuh kebanggaan. Para santri melangkah keluar membawa lebih dari sekadar ijazah — mereka membawa ilmu, iman, karakter, dan kenangan yang tak akan pernah pudar sepanjang hayat.",
      reflection: "Gerbang madrasah terbuka lebar, mengantarkan para ksatria ilmu menuju medan juang yang sesungguhnya di tengah masyarakat.",
      image: "https://picsum.photos/seed/mzd2032/1200/800",
      accent: "#fcd34d",
      bg: "from-[#1a1500] to-[#2d2400]",
      stat: "Babak Sempurna",
      quote: "\"اللَّهُمَّ انْفَعْنَا بِمَا عَلَّمْتَنَا — Ya Allah, berikanlah manfaat atas apa yang telah Engkau ajarkan kepada kami.\"",
      layout: "right",
    },
  ];

  let activeIndex = 0;
  let scrollProgress = 0;
  let sections: HTMLElement[] = [];
  let containerEl: HTMLElement;
  let ticking = false;
  let scrollY = 0;

  function handleScroll() {
    scrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        const docHeight = document.body.scrollHeight - window.innerHeight;
        scrollProgress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));

        // Detect active section
        sections.forEach((section, i) => {
          if (!section) return;
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.5) {
            activeIndex = i;
          }
        });

        ticking = false;
      });
      ticking = true;
    }
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  });

  // Action for scroll reveal animation
  function reveal(node: HTMLElement, { delay = 0, duration = 1000, y = 50, scale = 1, threshold = 0.05, finalOpacity = 1 } = {}) {
    node.style.opacity = '0';
    node.style.transform = `translateY(${y}px) scale(${scale})`;
    node.style.transition = `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        node.style.opacity = finalOpacity.toString();
        node.style.transform = 'translateY(0) scale(1)';
        observer.unobserve(node);
      }
    }, { threshold });
    
    observer.observe(node);
    
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }

  // Action for parallax background
  function parallax(node: HTMLElement, { speed = 0.2 } = {}) {
    let y = 0;
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        window.addEventListener('scroll', updateParallax, { passive: true });
      } else {
        window.removeEventListener('scroll', updateParallax);
      }
    });
    
    observer.observe(node);
    
    function updateParallax() {
      const rect = node.getBoundingClientRect();
      // Calculate offset based on center of screen
      const centerOffset = (rect.top + rect.height / 2) - window.innerHeight / 2;
      y = centerOffset * speed;
      node.style.transform = `translateY(${y}px) scale(1.1)`; // scale 1.1 to prevent edges showing during parallax
    }
    
    updateParallax(); // init
    
    return {
      destroy() {
        observer.disconnect();
        window.removeEventListener('scroll', updateParallax);
      }
    };
  }
</script>

<svelte:head>
  <title>Perjalanan Kami — MAZEEDA 2023–2032</title>
  <meta name="description" content="Satu dekade penuh makna. Perjalanan MAZEEDA dari 2023 hingga 2032 — ilmu, iman, dan kenangan abadi." />
</svelte:head>

<!-- Progress Bar Top -->
<div class="fixed top-0 left-0 right-0 z-50 h-1 bg-white dark:bg-slate-900/5">
  <div
    class="h-full transition-all duration-150 relative"
    style="width: {scrollProgress}%; background: linear-gradient(90deg, #38bdf8, #818cf8, #f472b6, #fbbf24);"
  >
    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-slate-900 shadow-[0_0_10px_#fff]"></div>
  </div>
</div>

<!-- Back Button -->
<a
  href="/"
  class="fixed top-5 left-5 z-50 flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/30 hover:bg-white dark:bg-slate-900/10 backdrop-blur-md"
>
  <ArrowLeft class="w-4 h-4" />
</a>

<!-- Side Year Progress (desktop only) -->
<div class="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3">
  {#each milestones as m, i}
    <button
      class="group flex items-center gap-2 transition-all duration-500"
      on:click={() => sections[i]?.scrollIntoView({ behavior: 'smooth' })}
      aria-label="Go to {m.year}"
    >
      <span class="text-[10px] font-black transition-all duration-300 {activeIndex === i ? 'text-white opacity-100 scale-110' : 'text-white/20 opacity-0 group-hover:opacity-100 group-hover:text-white/60'}">{m.year}</span>
      <span
        class="block rounded-full transition-all duration-500 {activeIndex === i ? 'w-8 h-2.5' : 'w-2 h-2'}"
        style="background: {activeIndex === i ? m.accent : 'rgba(255,255,255,0.2)'}; box-shadow: {activeIndex === i ? `0 0 15px ${m.accent}90` : 'none'};"
      ></span>
    </button>
  {/each}
</div>

<div class="bg-[#060a12]" bind:this={containerEl}>

  <!-- ===== HERO ===== -->
  <section class="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
    <!-- Background layers -->
    <div class="absolute inset-0">
      <div class="absolute inset-0" style="background: radial-gradient(ellipse 80% 60% at 50% 0%, #0d2247 0%, #060a12 70%);"></div>
      <!-- Stars -->
      {#each Array(60) as _, i}
        <div
          class="absolute rounded-full bg-white dark:bg-slate-900 animate-pulse"
          style="
            width: {Math.random() * 2 + 1}px;
            height: {Math.random() * 2 + 1}px;
            top: {Math.random() * 100}%;
            left: {Math.random() * 100}%;
            opacity: {Math.random() * 0.5 + 0.1};
            animation-delay: {Math.random() * 5}s;
            animation-duration: {Math.random() * 3 + 2}s;
          "
        ></div>
      {/each}
    </div>

    <div class="relative z-10 max-w-4xl mx-auto mt-10">
      <p in:fly|global={{ delay: 300, y: -20, duration: 1000 }} class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-sky-400/80 mb-6">
        <Compass class="w-3 h-3" /> MA HMQ LIRBOYO
      </p>

      <h1 class="text-[clamp(3rem,12vw,9rem)] font-black leading-none tracking-tight mb-6">
        <span in:fly|global={{ delay: 500, y: 30, duration: 1000 }} class="block text-white">Perjalanan</span>
        <span in:fly|global={{ delay: 700, y: 30, duration: 1000 }} class="block" style="background: linear-gradient(135deg, #38bdf8 0%, #818cf8 45%, #fbbf24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          MAZEEDA
        </span>
      </h1>

      <div in:fade|global={{ delay: 900, duration: 1000 }} class="flex items-center justify-center gap-4 mb-6">
        <span class="text-white/30 font-mono text-sm tracking-widest">2023</span>
        <div class="h-px w-24 sm:w-40 relative overflow-hidden bg-white dark:bg-slate-900/10">
          <div class="absolute inset-0 bg-gradient-to-r from-[#38bdf8] to-[#fbbf24] animate-[shimmer_3s_infinite]"></div>
        </div>
        <span class="text-white/30 font-mono text-sm tracking-widest">2032</span>
      </div>

      <p in:fly|global={{ delay: 1100, y: 20, duration: 1000 }} class="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-12">
        Satu dekade. Seribu kenangan. Satu keluarga besar yang tak pernah terlupakan. Kisah ini didedikasikan untuk setiap jiwa yang pernah singgah.
      </p>

      <!-- Scroll Cue -->
      <div in:fade|global={{ delay: 1300, duration: 1000 }} class="flex flex-col items-center gap-3 text-white/30">
        <span class="text-xs tracking-widest uppercase">Mulai Menjelajah</span>
        <div class="w-px h-16 relative overflow-hidden bg-white dark:bg-slate-900/10">
          <div class="absolute top-0 left-0 w-full h-1/2 bg-white dark:bg-slate-900/80 animate-[scrollCue_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===== MILESTONE SECTIONS ===== -->
  {#each milestones as milestone, i}
    {@const isLeft = milestone.layout === 'left'}
    <section
      bind:this={sections[i]}
      class="relative min-h-screen flex items-center overflow-hidden"
    >
      <!-- Full-bleed background image with parallax -->
      <div class="absolute inset-0 overflow-hidden">
        <img
          src={milestone.image}
          alt=""
          class="w-full h-full object-cover origin-center"
          use:parallax={{ speed: 0.15 }}
          style="opacity: 0.15; filter: blur(3px) saturate(0.6);"
          loading="lazy"
          aria-hidden="true"
        />
        <div class="absolute inset-0 bg-gradient-to-b {milestone.bg} opacity-95"></div>
      </div>

      <!-- Giant year watermark with slow reveal -->
      <div
        class="absolute {isLeft ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 pointer-events-none select-none overflow-hidden z-0"
        aria-hidden="true"
        use:reveal={{ delay: 100, y: 0, scale: 0.9, duration: 1500, finalOpacity: 0.05 }}
        style="opacity: 0.05;"
      >
        <span class="block font-black text-white" style="font-size: clamp(8rem, 25vw, 22rem); line-height: 1; letter-spacing: -0.05em;">
          {milestone.year}
        </span>
      </div>

      <!-- Chapter Number -->
      <div class="absolute top-8 left-8 sm:top-12 sm:left-12" use:reveal={{ delay: 200, y: -20 }}>
        <span class="font-mono text-xs font-bold tracking-[0.3em] uppercase" style="color: {milestone.accent}; opacity: 0.8;">
          BAB {milestone.chapter}
        </span>
      </div>

      <!-- Content Grid -->
      <div class="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center {isLeft ? '' : 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1'}">

          <!-- Text Side -->
          <div class="space-y-6">
            <!-- Year badge -->
            <div class="inline-flex items-center gap-3" use:reveal={{ delay: 100, y: 20 }}>
              <div class="w-12 h-px" style="background: {milestone.accent};"></div>
              <span class="text-base font-black tracking-widest font-mono" style="color: {milestone.accent};">{milestone.year}</span>
            </div>

            <!-- Title -->
            <h2 class="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[1.1] tracking-tight text-white" style="white-space: pre-line;" use:reveal={{ delay: 200, y: 30 }}>
              {milestone.title}
            </h2>

            <!-- Subtitle -->
            <p class="text-sm sm:text-base font-semibold uppercase tracking-[0.2em]" style="color: {milestone.accent}; opacity: 0.9;" use:reveal={{ delay: 300, y: 20 }}>
              {milestone.subtitle}
            </p>

            <!-- Body -->
            <p class="text-white/70 text-base sm:text-lg leading-relaxed max-w-lg" use:reveal={{ delay: 400, y: 20 }}>
              {milestone.body}
            </p>

            <!-- Reflection -->
            <p class="text-white/50 text-sm leading-relaxed max-w-lg border-l-2 pl-4 py-1" style="border-color: {milestone.accent}50;" use:reveal={{ delay: 500, y: 20 }}>
              <span class="block mb-1 text-[10px] uppercase tracking-widest" style="color: {milestone.accent}">Refleksi</span>
              {milestone.reflection}
            </p>

            <!-- Quote -->
            <blockquote class="italic text-base sm:text-lg text-white/90 font-serif pt-2" use:reveal={{ delay: 600, y: 20 }}>
              {milestone.quote}
            </blockquote>

            <!-- Stat chip -->
            <div class="pt-4" use:reveal={{ delay: 700, y: 20 }}>
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-500 hover:scale-105" style="border-color: {milestone.accent}50; color: {milestone.accent}; background: {milestone.accent}15; box-shadow: 0 0 20px {milestone.accent}20;">
                <span class="w-2 h-2 rounded-full animate-pulse" style="background: {milestone.accent}; box-shadow: 0 0 10px {milestone.accent};"></span>
                {milestone.stat}
              </div>
            </div>
          </div>

          <!-- Image Side -->
          <div class="relative group" use:reveal={{ delay: 300, y: 50, scale: 0.95, duration: 1200 }}>
            <!-- Glow behind image -->
            <div class="absolute -inset-6 rounded-[2rem] blur-3xl opacity-20 transition-all duration-1000 group-hover:opacity-40" style="background: {milestone.accent};"></div>

            <!-- Image frame -->
            <div class="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] transform transition-transform duration-700 group-hover:-translate-y-2">
              <img
                src={milestone.image}
                alt="Moment {milestone.year}"
                class="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                loading="lazy"
              />
              <!-- Overlay gradient -->
              <div class="absolute inset-0" style="background: linear-gradient(to top, #000000cc 0%, transparent 50%, transparent 100%);"></div>

              <!-- Corner year badge -->
              <div class="absolute bottom-6 left-6">
                <span class="px-4 py-2 rounded-xl text-sm font-black border backdrop-blur-md shadow-lg flex items-center gap-2" style="background: rgba(0,0,0,0.6); border-color: {milestone.accent}60; color: {milestone.accent};">
                  <Compass class="w-4 h-4" />
                  Momen {milestone.year}
                </span>
              </div>
            </div>
            
            <!-- Floating accent element -->
            <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full border-4 opacity-30 animate-[spin_10s_linear_infinite]" style="border-color: {milestone.accent} border-top-color: transparent; border-bottom-color: transparent;"></div>
          </div>

          <!-- Mini Gallery Row (Ramein foto per tahun) -->
          <div class="lg:col-span-2 grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12" use:reveal={{ delay: 400, y: 40 }}>
            {#each [1, 2, 3] as picIdx}
              <div class="rounded-[1.25rem] overflow-hidden border border-white/10 shadow-lg aspect-[4/3] sm:aspect-video transform transition-all hover:-translate-y-2 hover:shadow-2xl cursor-pointer group/pic">
                <img src="https://picsum.photos/seed/mzd{milestone.year}_{picIdx}/800/600" alt="Galeri {milestone.year} Foto {picIdx}" class="w-full h-full object-cover transition-transform duration-[2000ms] group-hover/pic:scale-110" loading="lazy" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/pic:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <Compass class="w-6 h-6 text-white" />
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Bottom divider line -->
      <div class="absolute bottom-0 left-0 right-0 h-px opacity-30" style="background: linear-gradient(90deg, transparent, {milestone.accent}, transparent);"></div>
    </section>
  {/each}

  <!-- ===== CLOSING ===== -->
  <section class="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
    <!-- Glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-15 blur-3xl" style="background: radial-gradient(circle, #fbbf24, #f97316, transparent);"></div>
    </div>

    <div class="relative z-10 max-w-3xl mx-auto">
      <p use:reveal={{ delay: 100, y: -20 }} class="text-7xl mb-8 animate-bounce" style="animation-duration: 2s; filter: drop-shadow(0 0 20px rgba(251,191,36,0.4));">🎓</p>

      <h2 class="text-[clamp(3rem,8vw,6.5rem)] font-black leading-[1.1] mb-8" use:reveal={{ delay: 300, y: 30 }}>
        <span class="text-white block">Bukan Akhir,</span>
        <span class="block mt-2" style="background: linear-gradient(135deg, #fbbf24, #f97316, #fb7185); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
          Tapi Sebuah Awal
        </span>
      </h2>

      <p class="text-white/60 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-8 font-medium" use:reveal={{ delay: 500, y: 20 }}>
        Setiap santri yang melangkah keluar dari MAZEEDA membawa lebih dari sekadar ijazah. Mereka membawa nilai kehidupan, kebesaran jiwa, dan kenangan yang tak lekang oleh waktu.
      </p>
      
      <p class="text-white/40 italic text-base mb-12 max-w-xl mx-auto" use:reveal={{ delay: 600, y: 20 }}>
        "Jadilah lentera di manapun kalian berpijak. Bawalah nama baik madrasah ini dalam setiap kebaikan yang kalian taburkan."
      </p>

      <p class="text-3xl sm:text-4xl font-bold text-amber-400/90 mb-16 font-arabic" dir="rtl" use:reveal={{ delay: 700, y: 20 }} style="text-shadow: 0 0 20px rgba(251,191,36,0.3);">
        اللَّهُمَّ انْفَعْنَا بِمَا عَلَّمْتَنَا
      </p>

      <!-- Timeline recap bar -->
      <div class="flex items-center justify-center gap-0 mb-16 max-w-xl mx-auto overflow-hidden rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]" use:reveal={{ delay: 800, y: 20, scale: 0.9 }}>
        {#each milestones as m}
          <div class="flex-1 h-2 hover:h-4 transition-all duration-300" style="background: {m.accent};"></div>
        {/each}
      </div>

      <div use:reveal={{ delay: 1000, y: 20 }}>
        <a
          href="/"
          class="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-sm text-white transition-all duration-500 hover:scale-105 active:scale-95 hover:shadow-2xl border border-amber-400/40 relative overflow-hidden"
          style="background: linear-gradient(135deg, #92400e, #78350f); box-shadow: 0 0 40px rgba(251,191,36,0.2);"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <ArrowLeft class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Beranda
        </a>
      </div>
    </div>
  </section>

</div>

<style>
  @keyframes scrollCue {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(200%); opacity: 0; }
  }
  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
</style>
