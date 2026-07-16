<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  export let data: any;
  $: kyai = data.kyai;
</script>

<div class="min-h-screen bg-slate-50 pb-24">
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="px-4 h-16 flex items-center max-w-2xl mx-auto">
      <a href="/khasanah/mozaik" class="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
        <ChevronLeft class="h-6 w-6 text-slate-700" />
      </a>
      <h1 class="font-bold text-lg text-slate-900 tracking-tight ml-2">Profil Murobbi</h1>
    </div>
  </header>

  <!-- Hero Section with Parallax feel -->
  <div class="relative w-full h-64 sm:h-80 bg-slate-900">
    <img src={kyai.image_url} alt={kyai.name} class="absolute inset-0 w-full h-full object-cover object-top opacity-60 filter sepia-[0.3]" />
    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
    <div class="absolute bottom-0 left-0 w-full p-6 text-white max-w-2xl mx-auto left-1/2 -translate-x-1/2">
      <span class="inline-block px-2 py-1 bg-amber-600/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest rounded mb-3 border border-amber-500/50">{kyai.title}</span>
      <h2 class="text-3xl sm:text-4xl font-black leading-tight mb-2 drop-shadow-lg">{kyai.name}</h2>
    </div>
  </div>

  <main class="max-w-2xl mx-auto px-4 py-8">
    <article class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 -mt-12 relative z-10 prose prose-slate prose-img:rounded-xl max-w-none">
      <!-- Dynamic HTML Rendering -->
      {@html kyai.content}
    </article>
  </main>
</div>

<style>
  /* Global styles for dynamic HTML content injected via @html */
  :global(.prose p) {
    text-align: justify;
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
