<script lang="ts">
  export let items: { label: string; value: string }[] = [];
  export let activeTab: string = '';
  
  let className = '';
  export { className as class };
</script>

<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-none w-full {className}">
  {#each items as item}
    <button
      type="button"
      on:click={() => activeTab = item.value}
      class="
        px-5 py-2 text-xs md:text-sm font-bold rounded-full border transition-all duration-300 whitespace-nowrap focus:outline-none
        {activeTab === item.value 
          ? 'bg-primary text-white border-primary shadow-soft-sm hover:bg-primary-hover' 
          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800'}"
      style="min-height: 40px;"
    >
      {item.label}
    </button>
  {/each}
</div>
