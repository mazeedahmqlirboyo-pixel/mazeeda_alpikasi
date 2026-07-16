<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  export let data: any;
  $: kyai = data.kyai;
</script>

<div class="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-amber-100 selection:text-amber-900">
  <header class="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm transition-all duration-300">
    <div class="px-4 h-16 flex items-center justify-between max-w-2xl mx-auto">
      <a href="/khasanah/mozaik" class="flex items-center justify-center w-10 h-10 rounded-full bg-white/60 hover:bg-white text-slate-700 shadow-sm border border-slate-100 transition-all">
        <ChevronLeft class="h-5 w-5" />
      </a>
      <h1 class="font-bold text-sm uppercase tracking-widest text-slate-800">Profil Murobbi</h1>
      <div class="w-10"></div> <!-- spacer for centering -->
    </div>
  </header>

  <!-- Hero Section with Premium feel -->
  <div class="relative w-full h-[55vh] min-h-[400px] bg-slate-900 overflow-hidden">
    <img src={kyai.image_url} alt={kyai.name} class="absolute inset-0 w-full h-full object-cover object-top opacity-70 filter saturate-[0.85] contrast-[1.1]" />
    
    <!-- Rich Gradients for premium feel -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
    
    <div class="absolute bottom-24 left-0 w-full px-6 text-white max-w-2xl mx-auto left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
      <span class="inline-block px-3 py-1.5 bg-amber-600/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-4 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
        {kyai.title}
      </span>
      <h2 class="text-4xl md:text-5xl font-black leading-tight mb-2 drop-shadow-2xl">
        {kyai.name}
      </h2>
    </div>
  </div>

  <main class="max-w-2xl mx-auto px-0 sm:px-4">
    <article class="bg-white rounded-t-[2.5rem] sm:rounded-3xl px-6 py-10 sm:p-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] border-t border-x border-white/50 -mt-16 relative z-10 
      prose prose-slate prose-lg max-w-none
      prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
      prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-700
      prose-img:rounded-2xl prose-img:shadow-md
      text-slate-700 leading-relaxed">
      
      <!-- Decorative pull tab for mobile -->
      <div class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 sm:hidden"></div>
      
      <!-- Dynamic HTML Rendering -->
      {@html kyai.content}
    </article>
  </main>
</div>

<style>
  /* Global styles for dynamic HTML content injected via @html */
  :global(.prose p) {
    text-align: justify;
    hyphens: auto;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    word-break: normal;
    letter-spacing: -0.01em; 
  }
  
  :global(.prose > p:first-of-type::first-letter) {
    float: left;
    font-size: 4rem;
    line-height: 0.8;
    font-weight: 900;
    margin-right: 0.75rem;
    margin-top: 0.3rem;
    margin-bottom: 0.1rem;
    color: #d97706; /* amber-600 */
    text-shadow: 2px 2px 0px rgba(217, 119, 6, 0.1);
  }

  :global(.prose img.float-right) {
    float: right;
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
  :global(.prose img.float-left) {
    float: left;
    margin-right: 1.5rem;
    margin-bottom: 1rem;
  }
  /* Clearing floats */
  :global(.prose::after) {
    content: "";
    display: table;
    clear: both;
  }
</style>
