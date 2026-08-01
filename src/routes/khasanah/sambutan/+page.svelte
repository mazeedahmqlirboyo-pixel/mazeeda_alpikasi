<script lang="ts">
  import { ChevronLeft, Quote } from "lucide-svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  export let data: any;
  $: sambutan = data.sambutan;
</script>

<div class="min-h-screen bg-slate-50 pb-24">
  <PageHeader noMargin={true} title="Dawuh & Sambutan" backTo="/khasanah" />

  <main class="max-w-2xl mx-auto px-4 py-8 space-y-12">
    {#each sambutan as item}
      <section class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div class="absolute top-4 right-4 text-slate-100 opacity-50">
          <Quote class="w-24 h-24" />
        </div>
        
        <div class="p-6 sm:p-8 relative z-10">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 border-b border-slate-50 pb-6">
            <img src={item.image_url} alt={item.author} class="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-md border-4 border-white" />
            <div class="text-center sm:text-left pt-2">
              <h2 class="text-2xl font-black text-slate-900">{item.author}</h2>
              <p class="text-sm font-semibold text-amber-600 mt-1">{item.title}</p>
            </div>
          </div>

          <div class="space-y-4">
            <p class="text-xl font-medium text-slate-800 leading-snug italic text-center sm:text-left">"{item.quote}"</p>
            <div class="text-slate-600 leading-relaxed text-justify prose prose-slate">{@html item.content}</div>
          </div>

          <div class="mt-8 flex justify-end">
            <div class="text-center">
              <span class="block text-xs text-slate-400 mb-2">Tertanda,</span>
              <img src={item.signature_url} alt="Tanda Tangan" class="h-16 object-contain opacity-80 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </section>
    {/each}
  </main>
</div>
