<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  import Card from "$lib/components/ui/card.svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  export let data: any;
  $: logos = data.filosofi;
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
  <PageHeader noMargin={true} title="Filosofi Logo" backTo="/khasanah" />

  <main class="max-w-2xl mx-auto px-4 py-8">
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
      {#each logos as logo}
        <a href={`/khasanah/filosofi/${logo.slug}`} class="group flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(6,81,237,0.1)] transition-all duration-300 hover:-translate-y-1">
          <img src={logo.image_url} alt={logo.title} class="w-24 h-24 object-contain mb-5 filter drop-shadow-sm dark:shadow-none group-hover:scale-110 transition-transform duration-500" />
          <h3 class="font-bold text-slate-800 dark:text-slate-100 text-sm text-center tracking-tight">{logo.title}</h3>
        </a>
      {/each}
    </div>
  </main>
</div>
