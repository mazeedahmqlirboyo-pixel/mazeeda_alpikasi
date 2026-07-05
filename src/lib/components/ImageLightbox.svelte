<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide-svelte';
  import { fade, scale } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  export let show = false;
  export let imageUrl = '';
  
  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div 
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    on:click={close}
    role="dialog"
  >
    <!-- Close button -->
    <button 
      class="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-20 cursor-pointer backdrop-blur-sm border border-white/10 flex items-center justify-center"
      on:click|stopPropagation={close}
    >
      <X class="h-4 w-4" />
    </button>

    <!-- Image -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="relative flex items-center justify-center w-full h-full max-w-[95vw] max-h-[90vh]"
      on:click|stopPropagation
      transition:scale={{ duration: 300, start: 0.95, easing: cubicOut }}
    >
      <img 
        src={imageUrl} 
        alt="Enlarged view" 
        class="w-auto h-auto min-w-[300px] min-h-[300px] sm:min-w-[500px] sm:min-h-[500px] max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      />
    </div>
  </div>
{/if}
