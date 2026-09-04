<script lang="ts">
  import { ChevronRight } from "lucide-svelte";
  import Card from "$lib/components/ui/card.svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  export let data: any;
  $: kyais = data.mozaik;
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
  <PageHeader noMargin={true} title="Mozaik Murobbi" backTo="/khasanah" />

  <main class="max-w-2xl mx-auto px-4 py-6 space-y-3 sm:space-y-4">
    {#each kyais as kyai}
      <a href={`/khasanah/mozaik/${kyai.slug}`} class="block group focus:outline-none">
        <Card noPadding={true} class="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          <div class="flex flex-row items-center p-4 sm:p-5 gap-4">
            <!-- Image Section -->
            <div class="shrink-0">
              <img src={kyai.image_url || kyai.image} alt={kyai.name} class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm border-2 border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform duration-300 relative z-10" />
            </div>
            
            <!-- Content Section -->
            <div class="flex-1 flex flex-col justify-center">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors relative z-10 leading-tight">{kyai.name}</h3>
              <p class="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wider relative z-10">{kyai.title}</p>
            </div>
            
            <!-- Chevron -->
            <div class="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors">
              <ChevronRight class="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>
      </a>
    {/each}
  </main>
</div>
