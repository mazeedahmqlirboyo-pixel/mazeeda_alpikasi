<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  export let images: string[] = [];
  
  const dispatch = createEventDispatcher();
  
  // We duplicate the images array multiple times to ensure enough width for seamless looping even on large screens
  $: duplicatedImages = [...images, ...images, ...images, ...images];

  let container: HTMLDivElement;
  let animationFrameId: number;
  
  let currentX = 0;
  let isDragging = false;
  let startX = 0;
  let prevX = 0;
  let speed = 0.5; // pixels per frame, adjust as needed
  let hasDragged = false;

  function animate() {
    if (!isDragging) {
      currentX -= speed;
      
      if (container) {
        // Since we duplicated 4 times, half the width is 2 full sets.
        // Let's divide by 2 to get a safe loop point
        const loopWidth = container.scrollWidth / 2; 
        
        if (Math.abs(currentX) >= loopWidth) {
          currentX += loopWidth; // Seamless loop
        } else if (currentX > 0) {
          currentX -= loopWidth;
        }
      }
    }
    
    if (container) {
      container.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
    
    animationFrameId = requestAnimationFrame(animate);
  }

  onMount(() => {
    animationFrameId = requestAnimationFrame(animate);
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrameId);
  });

  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    hasDragged = false;
    startX = e.clientX;
    prevX = currentX;
    if (container) container.style.cursor = 'grabbing';
    
    // Capture pointer so it tracks even if pointer leaves element bounds
    if (container) container.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    if (Math.abs(deltaX) > 5) hasDragged = true;
    currentX = prevX + deltaX;
    
    if (container) {
      const loopWidth = container.scrollWidth / 2;
      if (Math.abs(currentX) >= loopWidth) {
        currentX += loopWidth;
        startX = e.clientX;
        prevX = currentX;
      } else if (currentX > 0) {
        currentX -= loopWidth;
        startX = e.clientX;
        prevX = currentX;
      }
      container.style.transform = `translate3d(${currentX}px, 0, 0)`;
    }
  }

  function handlePointerUp(e: PointerEvent) {
    isDragging = false;
    if (container) {
      container.style.cursor = 'grab';
      container.releasePointerCapture(e.pointerId);
    }
  }
</script>

<div class="w-full overflow-hidden py-6 relative select-none">
  <!-- Optional gradient masks on edges for a fading effect -->
  <div class="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent pointer-events-none"></div>
  <div class="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent pointer-events-none"></div>

  <!-- The scrolling container -->
  <div 
    bind:this={container}
    class="flex w-max space-x-4 px-2"
    style="cursor: grab; touch-action: none;"
    on:pointerdown={handlePointerDown}
    on:pointermove={handlePointerMove}
    on:pointerup={handlePointerUp}
    on:pointercancel={handlePointerUp}
  >
    {#each duplicatedImages as img, i}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div 
        class="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md dark:shadow-none transition-transform hover:scale-110 cursor-pointer"
        on:dragstart|preventDefault
        on:click={() => {
          if (!hasDragged) dispatch('imageClick', img);
        }}
      >
        <img 
          src={img} 
          alt="Avatar {i}" 
          class="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          draggable="false"
        />
      </div>
    {/each}
  </div>
</div>
