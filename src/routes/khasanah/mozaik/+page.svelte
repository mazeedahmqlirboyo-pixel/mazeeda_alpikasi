<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  import Card from "$lib/components/ui/card.svelte";
  
  export let data: any;
  $: kyais = data.mozaik;
</script>

<div class="min-h-screen bg-slate-50 pb-24">
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="px-4 h-16 flex items-center max-w-2xl mx-auto">
      <a href="/khasanah" class="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
        <ChevronLeft class="h-6 w-6 text-slate-700" />
      </a>
      <h1 class="font-bold text-lg text-slate-900 tracking-tight ml-2">Mozaik Murobbi</h1>
    </div>
  </header>

  <main class="max-w-2xl mx-auto px-4 py-6 space-y-4">
    <p class="text-sm text-slate-500 mb-6">Mengenang jejak perjuangan dan keteladanan para pendiri dan pengasuh Pondok Pesantren Lirboyo.</p>

    {#each kyais as kyai}
      <a href={`/khasanah/mozaik/${kyai.slug}`} class="block group">
        <Card class="flex items-stretch overflow-hidden hover:shadow-md transition-shadow border-slate-200/60">
          <div class="w-1/3 relative bg-slate-200">
            <!-- Grayscale for classical historic feel, reveals on hover -->
            <img src={kyai.image} alt={kyai.name} class="absolute inset-0 w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
          </div>
          <div class="w-2/3 p-4 flex flex-col justify-center bg-white">
            <h3 class="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{kyai.name}</h3>
            <span class="text-xs font-semibold text-amber-600 mt-1">{kyai.title}</span>
            <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{kyai.short_desc}</p>
          </div>
        </Card>
      </a>
    {/each}
  </main>
</div>
