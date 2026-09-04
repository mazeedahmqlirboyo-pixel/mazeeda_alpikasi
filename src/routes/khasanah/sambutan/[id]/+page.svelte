<script lang="ts">
  import { Quote } from "lucide-svelte";
  import PageHeader from "$lib/components/ui/PageHeader.svelte";
  
  export let data: any;
  $: item = data.item;
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
  <PageHeader noMargin={true} title={item.author} backTo="/khasanah/sambutan" variant="small" />

  <main class="max-w-2xl mx-auto px-4 py-8">
    <section class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative">
      <div class="absolute top-4 right-4 text-slate-100 opacity-50">
        <Quote class="w-24 h-24" />
      </div>
      
      <div class="p-6 sm:p-8 relative z-10">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 border-b border-slate-50 dark:border-slate-800 pb-6">
          <img src={item.image_url} alt={item.author} class="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-md dark:shadow-none border-4 border-white dark:border-slate-800" />
          <div class="text-center sm:text-left pt-2 flex-1 min-w-0 w-full">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white break-words">{item.author}</h2>
            <p class="text-sm font-semibold text-amber-600 mt-1">{item.title}</p>
          </div>
        </div>

        <div class="space-y-4">
          <p class="text-xl font-medium text-slate-800 dark:text-slate-100 leading-snug italic text-center sm:text-left">"{item.quote}"</p>
          <div class="text-slate-600 dark:text-slate-300 leading-relaxed text-justify prose prose-slate dark:prose-invert dark:prose-p:text-slate-100 dark:prose-headings:text-white">{@html item.content}</div>
        </div>

        {#if item.signature_url}
        <div class="mt-8 flex justify-end">
          <div class="text-center">
            <span class="block text-xs text-slate-400 dark:text-slate-500 mb-2">Tertanda,</span>
            <img src={item.signature_url} alt="Tanda Tangan" class="h-16 object-contain opacity-80 mix-blend-multiply dark:mix-blend-normal dark:invert" />
          </div>
        </div>
        {/if}
      </div>
    </section>
  </main>
</div>

<style>
  :global(.dark .prose), :global(.dark .prose *) {
    color: white !important;
  }
</style>
