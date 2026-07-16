<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';

  export let title: string = '';
  export let backTo: string = '/';
  export let backText: string = 'Kembali';
  export let transparent: boolean = false;
</script>

<header class="sticky top-0 z-40 {transparent ? 'bg-transparent' : 'bg-white/90 backdrop-blur-md'} border-b {transparent ? 'border-transparent' : 'border-slate-100/80'} shadow-sm -mx-2 sm:-mx-4 md:-mx-8 -mt-2 sm:-mt-4 md:-mt-8 mb-6">
  <div class="relative flex items-center justify-center w-full h-14">
    <a href={backTo} class="absolute left-2 sm:left-4 md:left-6 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100/50 text-slate-500 hover:text-primary transition-colors z-10">
      <ArrowLeft class="w-5 h-5" />
    </a>
    
    <h1 class="text-sm font-black text-slate-800 uppercase tracking-widest text-center whitespace-nowrap pointer-events-none">
      {title}
    </h1>
    
    <div class="absolute right-2 sm:right-4 md:right-6 flex items-center justify-end z-10">
      <slot name="right" />
    </div>
  </div>
</header>
