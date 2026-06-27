<script lang="ts">
  import { onMount } from 'svelte';

  export let images: string[] = [];
  
  let currentIndex = Math.floor(images.length / 2); // Start in the middle
  
  // Drag state
  let isDragging = false;
  let startX = 0;
  let dragOffset = 0;

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    startX = e.clientX;
    dragOffset = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    dragOffset = e.clientX - startX;
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    
    // If dragged enough, change index
    if (dragOffset > 50 && currentIndex > 0) {
      currentIndex -= 1;
    } else if (dragOffset < -50 && currentIndex < images.length - 1) {
      currentIndex += 1;
    }
    
    isDragging = false;
    dragOffset = 0;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function goToIndex(index: number) {
    if (!isDragging) {
      currentIndex = index;
    }
  }

  // Calculate style for a given index based on its distance from the currentIndex
  function getStyles(index: number, current: number, drag: number) {
    // Add drag influence (a slight fraction to make it feel responsive while dragging)
    const dragInfluence = isDragging ? drag / 200 : 0; 
    
    // Difference between this item and the focused item
    let diff = index - current - dragInfluence;

    // Constrain diff to avoid items flying way off screen
    const absDiff = Math.abs(diff);

    // Scaling: Center is 1, sides shrink
    const scale = Math.max(0.6, 1 - absDiff * 0.15);

    // X Translation: Push sides outward
    // Center is 0. Side 1 is 120px, Side 2 is 220px, etc.
    const sign = Math.sign(diff);
    let translateX = 0;
    if (absDiff > 0) {
      translateX = sign * (80 + absDiff * 40); // Base push + scaling push
    }
    
    // Y Rotation: Center is 0. Sides rotate inward.
    const rotateY = sign * Math.min(45, absDiff * 30);
    
    // Z-index: Center is highest
    const zIndex = 100 - Math.round(absDiff * 10);
    
    // Opacity: Center is 1, sides fade out slightly
    const opacity = Math.max(0.3, 1 - absDiff * 0.3);

    return `
      transform: translateX(${translateX}%) scale(${scale}) perspective(1000px) rotateY(${-rotateY}deg);
      z-index: ${zIndex};
      opacity: ${opacity};
      transition: ${isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s, filter 0.4s'};
      filter: ${absDiff < 0.5 ? 'brightness(1)' : 'brightness(0.6)'};
    `;
  }
</script>

<div class="relative w-full max-w-5xl mx-auto py-10 overflow-hidden select-none">
  <!-- Draggable Container -->
  <div 
    class="relative h-[300px] sm:h-[400px] md:h-[500px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
    on:pointerdown={handlePointerDown}
    on:pointermove={handlePointerMove}
    on:pointerup={handlePointerUp}
    on:pointercancel={handlePointerUp}
  >
    {#each images as image, i}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div 
        class="absolute w-[200px] sm:w-[260px] md:w-[320px] aspect-[2/3] rounded-2xl shadow-2xl overflow-hidden cursor-pointer will-change-transform border-4 border-white/10"
        style={getStyles(i, currentIndex, dragOffset)}
        on:click={() => goToIndex(i)}
      >
        <img 
          src={image} 
          alt="Memory {i+1}" 
          class="w-full h-full object-cover pointer-events-none"
          loading="lazy"
        />
        
        <!-- Gradient Overlay for aesthetics -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
      </div>
    {/each}
  </div>

  <!-- Indicators -->
  <div class="flex items-center justify-center space-x-2 mt-6">
    {#each images as _, i}
      <button 
        class="w-2 h-2 rounded-full transition-all duration-300 {i === currentIndex ? 'bg-primary w-6' : 'bg-slate-300 hover:bg-slate-400'}"
        on:click={() => goToIndex(i)}
        aria-label="Go to slide {i+1}"
      ></button>
    {/each}
  </div>
</div>
