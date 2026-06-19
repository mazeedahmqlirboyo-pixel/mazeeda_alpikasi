<script lang="ts">
  let className = '';
  export { className as class };
  export let noPadding = false;
</script>

<div 
  on:click
  on:keydown
  role="button"
  tabindex="0"
  class="bg-white border border-slate-200/80 rounded-2xl shadow-soft-sm hover:shadow-soft-md hover:border-primary/20 transition-all duration-300 overflow-hidden text-left focus:outline-none focus:ring-2 focus:ring-primary/10 {className}"
>
  {#if $$slots.header || $$slots.title || $$slots.description}
    <div class="p-4 sm:p-5 pb-3 flex flex-col space-y-1">
      <slot name="header">
        {#if $$slots.title}
          <h3 class="text-lg font-black text-slate-800 tracking-tight">
            <slot name="title" />
          </h3>
        {/if}
        {#if $$slots.description}
          <p class="text-xs text-slate-400 font-normal leading-relaxed">
            <slot name="description" />
          </p>
        {/if}
      </slot>
    </div>
  {/if}
  
  {#if $$slots.default}
    <div class={noPadding ? "" : "p-4 sm:p-5 " + (($$slots.header || $$slots.title || $$slots.description) ? 'pt-0' : '')}>
      <slot />
    </div>
  {/if}

  {#if $$slots.footer}
    <div class="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center">
      <slot name="footer" />
    </div>
  {/if}
</div>
