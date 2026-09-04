<script lang="ts">
  import { X, ZoomIn } from "lucide-svelte";
  import { fade } from "svelte/transition";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  export let data: any;
  $: kyai = data.kyai;
  
  let showLightbox = false;
</script>

<div class="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 pb-24 font-sans selection:bg-amber-100 selection:text-amber-900">
  
  <PageHeader noMargin={true} title={kyai.name} backTo="/khasanah/mozaik" variant="small" />
  <div class="max-w-4xl mx-auto bg-white dark:bg-slate-900 lg:rounded-3xl lg:shadow-xl lg:overflow-hidden relative border-slate-100 dark:border-slate-800 lg:border mt-0 lg:mt-8 mb-8">

    <!-- Hero Section with Premium feel -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="relative w-full h-[55vh] min-h-[400px] lg:h-[450px] bg-slate-900 overflow-hidden group cursor-pointer" on:click={() => showLightbox = true}>
      <img src={kyai.image_url} alt={kyai.name} class="absolute inset-0 w-full h-full object-cover object-top opacity-70 filter saturate-[0.85] contrast-[1.1] group-hover:scale-105 transition-transform duration-700 ease-out" />
      
      <!-- Rich Gradients for premium feel -->
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent group-hover:via-slate-900/70 transition-all duration-500"></div>
      
      <!-- Click indicator -->
      <div class="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ZoomIn class="w-5 h-5" />
      </div>
      
      <div class="absolute bottom-24 lg:bottom-16 left-0 w-full px-6 text-white max-w-2xl mx-auto left-1/2 -translate-x-1/2 flex flex-col items-center text-center">
        <span class="inline-block px-3 py-1.5 bg-amber-600/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-4 shadow-lg ring-1 ring-white/20 backdrop-blur-sm group-hover:bg-amber-500 transition-colors">
          {kyai.title}
        </span>
        <h2 class="text-4xl md:text-5xl font-black leading-tight mb-2 drop-shadow-2xl">
          {kyai.name}
        </h2>
      </div>
    </div>

    <main class="max-w-3xl mx-auto px-0 sm:px-4 lg:px-8">
      <article class="bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-3xl px-6 py-10 sm:p-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] lg:shadow-none border border-white/50 dark:border-slate-800 lg:border-none -mt-16 relative z-10 
        prose prose-slate dark:prose-invert dark:prose-p:text-slate-100 dark:prose-headings:text-white prose-lg max-w-none
        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:text-white
        prose-a:text-amber-600 prose-a:no-underline hover:prose-a:text-amber-700
        prose-img:rounded-2xl prose-img:shadow-md dark:shadow-none
        text-slate-700 dark:text-slate-200 leading-relaxed">
        
        <!-- Decorative pull tab for mobile -->
        <div class="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 sm:hidden"></div>
        
        <!-- Dynamic HTML Rendering -->
        {@html kyai.content}
      </article>
    </main>
  </div>
</div>

{#if showLightbox}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" on:click={() => showLightbox = false} transition:fade={{ duration: 200 }}>
    <button class="absolute top-4 right-4 p-3 bg-white dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 rounded-full text-white transition-colors" on:click={() => showLightbox = false}>
      <X class="w-6 h-6" />
    </button>
    <img src={kyai.image_url} alt={kyai.name} class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" on:click|stopPropagation />
  </div>
{/if}

<style>
  /* Global styles for dynamic HTML content injected via @html */
  :global(.dark .prose), :global(.dark .prose *) {
    color: white !important;
  }

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
