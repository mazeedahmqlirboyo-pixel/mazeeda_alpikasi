<script lang="ts">
  export let variant: 'default' | 'outline' | 'ghost' | 'link' | 'secondary' = 'default';
  export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled = false;
  
  let className = '';
  export { className as class };
</script>

<button
  {type}
  {disabled}
  on:click
  class="
    inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-40
    {variant === 'default' ? 'bg-primary text-white hover:bg-primary-hover shadow-soft-sm hover:shadow-soft-md' : ''}
    {variant === 'secondary' ? 'bg-surface text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:bg-slate-700 border border-border/80' : ''}
    {variant === 'outline' ? 'border border-border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-surface hover:text-primary shadow-soft-sm' : ''}
    {variant === 'ghost' ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 hover:text-primary' : ''}
    {variant === 'link' ? 'text-primary underline-offset-4 hover:underline p-0 bg-transparent' : ''}
    
    {size === 'default' ? 'h-12 px-6 text-sm' : ''} /* 48px tall touch target */
    {size === 'sm' ? 'h-9 px-4 text-xs' : ''}
    {size === 'lg' ? 'h-14 px-8 text-base' : ''} /* 56px tall */
    {size === 'icon' ? 'h-12 w-12' : ''} /* 48x48px touch target */
    {className}
  "
>
  <slot />
</button>
