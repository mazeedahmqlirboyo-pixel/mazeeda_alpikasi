<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';

  export let title: string = '';
  export let backTo: string = '/';
  export let backText: string = 'Kembali';
  export let transparent: boolean = false;
</script>

<header class="sticky top-0 z-40 {transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md'} border-b {transparent ? 'border-transparent' : 'border-slate-100/80'} shadow-sm -mx-2 sm:-mx-4 md:-mx-8 mb-6">
  <div class="w-full px-2 sm:px-4 md:px-6 h-14 flex items-center justify-between">
    <a href={backTo} class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100/50 text-slate-500 hover:text-primary transition-colors z-10 flex-shrink-0 -ml-2">
      <ArrowLeft class="w-5 h-5" />
    </a>
    
    <h1 class="absolute left-1/2 -translate-x-1/2 text-sm font-black text-slate-800 uppercase tracking-widest text-center whitespace-nowrap pointer-events-none">
      {title}
    </h1>
    
    <div class="flex items-center justify-end flex-shrink-0 z-10 min-w-[3rem]">
      <slot name="right" />
    </div>
  </div>
</header>
