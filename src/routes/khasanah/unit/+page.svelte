<script lang="ts">
  import { ChevronLeft } from "lucide-svelte";
  import Card from "$lib/components/ui/card.svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  export let data: any;
  $: units = data.units;
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
  <PageHeader noMargin={true} title="Profil Unit Pondok" backTo="/khasanah" />

  <main class="max-w-2xl mx-auto px-4 py-8 space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {#each units as unit}
        <a href={`/khasanah/unit/${unit.slug}`} class="text-left w-full focus:outline-none">
          <Card class="overflow-hidden flex flex-col group hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 h-full">
            <div class="relative h-40 w-full overflow-hidden">
              <img src={unit.image_url} alt={unit.name} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
              <div class="absolute bottom-3 left-4 right-4">
                <span class="px-2 py-1 bg-white/20 dark:bg-slate-900/20 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider border border-white/20 inline-block mb-1">{unit.type}</span>
              </div>
            </div>
            <div class="p-5 flex-1 bg-white dark:bg-slate-900">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">{unit.name}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{unit.short_desc}</p>
            </div>
          </Card>
        </a>
      {/each}
    </div>
  </main>
</div>
