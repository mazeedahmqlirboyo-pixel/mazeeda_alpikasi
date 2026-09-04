<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';

  export let title: string = '';
  export let backTo: string = '/';
  export let backText: string = 'Kembali';
  export let transparent: boolean = false;
  export let variant: 'default' | 'small' = 'default';
  export let noMargin: boolean = false;
</script>

<header class="sticky top-0 z-40 {transparent ? 'bg-transparent' : 'bg-white dark:bg-slate-900/90 backdrop-blur-md'} border-b {transparent ? 'border-transparent' : 'border-slate-100 dark:border-slate-800/80'} shadow-sm dark:shadow-none {noMargin ? '' : '-mx-4 sm:-mx-6 px-4 sm:px-6'} mb-6 pb-2">
  <div class="flex items-center justify-between relative w-full">
    <a href={backTo} class="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors shrink-0">
      <ArrowLeft class="w-5 h-5" />
    </a>
    
    <h1 class="absolute left-1/2 -translate-x-1/2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block whitespace-nowrap pointer-events-none">
      {title}
    </h1>
    
    <div class="flex items-center justify-end shrink-0 w-10 h-10">
      <slot name="right" />
    </div>
  </div>
</header>
