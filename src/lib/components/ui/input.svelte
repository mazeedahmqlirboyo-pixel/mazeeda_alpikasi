<script lang="ts">
  export let value = '';
  export let placeholder = '';
  export let type = 'text';
  export let disabled = false;
  
  let className = '';
  export { className as class };
</script>

{#if type === 'password'}
  <input
    type="password"
    {placeholder}
    {disabled}
    bind:value
    on:input
    on:change
    on:keydown
    on:focus
    on:blur
    class="
      flex h-12 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 
      placeholder:text-slate-400 transition-all duration-200
      focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none
      disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50
      {className}
    "
  />
{:else if type === 'email'}
  <input
    type="email"
    {placeholder}
    {disabled}
    bind:value
    on:input
    on:change
    on:keydown
    on:focus
    on:blur
    class="
      flex h-12 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 
      placeholder:text-slate-400 transition-all duration-200
      focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none
      disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50
      {className}
    "
  />
{:else if type === 'number'}
  <input
    type="number"
    {placeholder}
    {disabled}
    bind:value
    on:input
    on:change
    on:keydown
    on:focus
    on:blur
    class="
      flex h-12 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 
      placeholder:text-slate-400 transition-all duration-200
      focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none
      disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50
      {className}
    "
  />
{:else if type === 'date'}
  <input
    type="date"
    {placeholder}
    {disabled}
    bind:value
    on:input
    on:change
    on:keydown
    on:focus
    on:blur
    class="
      flex h-12 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 
      placeholder:text-slate-400 transition-all duration-200
      focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none
      disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50
      {className}
    "
  />
{:else}
  <input
    type="text"
    {placeholder}
    {disabled}
    bind:value
    on:input
    on:change
    on:keydown
    on:focus
    on:blur
    class="
      flex h-12 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-slate-800 
      placeholder:text-slate-400 transition-all duration-200
      focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none
      disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50
      {className}
    "
  />
{/if}
