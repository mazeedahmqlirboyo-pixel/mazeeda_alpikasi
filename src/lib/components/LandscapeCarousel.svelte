<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  export let images: string[] = [];
  
  const dispatch = createEventDispatcher();

  let carouselRef: HTMLElement;
  let itemsRef: HTMLElement[] = [];

  let isDown = false;
  let hasDragged = false;
  let startX = 0;
  let scrollLeft = 0;

  function updateParallax() {
    if (!carouselRef || !itemsRef.length) return;
    const carouselCenter = carouselRef.getBoundingClientRect().left + carouselRef.offsetWidth / 2;

    itemsRef.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const elCenter = rect.left + rect.width / 2;
      
      // Calculate distance from center of viewport (-1 to 1)
      const distance = (elCenter - carouselCenter) / carouselRef.offsetWidth;
      
      const img = el.querySelector('img');
      if (img) {
        // Move image horizontally for parallax effect and scale up to prevent edges showing
        img.style.transform = `translateX(${distance * 25}%) scale(1.25)`;
      }
      
      // Scale down and fade cards that are not in the center
      const scale = Math.max(0.75, 1 - Math.abs(distance) * 0.4);
      const opacity = Math.max(0.4, 1 - Math.abs(distance) * 0.6);
      
      el.style.transform = `scale(${scale})`;
      el.style.opacity = opacity.toString();
      el.style.zIndex = Math.round(scale * 100).toString();
    });
  }

  onMount(() => {
    // initialize layout
    setTimeout(updateParallax, 50);
    window.addEventListener('resize', updateParallax);
    return () => window.removeEventListener('resize', updateParallax);
  });

  // Watch for image updates
  $: if (images.length > 0) {
    setTimeout(updateParallax, 50);
  }

  // Drag to scroll logic
  function handlePointerDown(e: PointerEvent) {
    isDown = true;
    hasDragged = false;
    startX = e.pageX - carouselRef.offsetLeft;
    scrollLeft = carouselRef.scrollLeft;
    carouselRef.style.scrollSnapType = 'none'; 
    carouselRef.setPointerCapture(e.pointerId);
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDown) return;
    isDown = false;
    carouselRef.style.scrollSnapType = 'x mandatory';
    carouselRef.releasePointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    if (Math.abs(walk) > 10) {
      hasDragged = true;
    }
    carouselRef.scrollLeft = scrollLeft - walk;
  }
</script>

<div class="relative w-full overflow-hidden select-none pb-8 pt-4 z-10">
  <div 
    bind:this={carouselRef}
    on:scroll={updateParallax}
    on:pointerdown={handlePointerDown}
    on:pointerup={handlePointerUp}
    on:pointercancel={handlePointerUp}
    on:pointermove={handlePointerMove}
    class="flex overflow-x-auto gap-2 sm:gap-4 px-[calc(50%-130px)] sm:px-[calc(50%-160px)] md:px-[calc(50%-200px)] snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing items-center h-[200px] sm:h-[240px] md:h-[300px]"
    style="scroll-behavior: smooth;"
  >
    {#each images as img, i}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div 
        bind:this={itemsRef[i]}
        class="snap-center shrink-0 w-[260px] sm:w-[320px] md:w-[400px] aspect-[4/3] sm:aspect-[16/9] rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-75 ease-linear relative bg-slate-100 dark:bg-slate-800 border-[4px] sm:border-[6px] border-white cursor-pointer"
        on:click={() => {
          if (hasDragged) return; // Prevent click if dragged
          if (!carouselRef || !itemsRef[i]) return;
          const carouselCenter = carouselRef.getBoundingClientRect().left + carouselRef.offsetWidth / 2;
          const rect = itemsRef[i].getBoundingClientRect();
          const elCenter = rect.left + rect.width / 2;
          const distance = Math.abs((elCenter - carouselCenter) / carouselRef.offsetWidth);
          
          if (distance < 0.2) {
            dispatch('imageClick', img);
          } else {
            carouselRef.scrollTo({
              left: itemsRef[i].offsetLeft - (carouselRef.offsetWidth / 2) + (itemsRef[i].offsetWidth / 2),
              behavior: 'smooth'
            });
          }
        }}
      >
        <img 
          src={img} 
          alt="Moment {i+1}" 
          class="absolute inset-0 w-full h-full object-cover pointer-events-none origin-center"
          loading="lazy"
          draggable="false"
        />
        <!-- Inner shadow for depth -->
        <div class="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.15)] pointer-events-none rounded-[1.5rem]"></div>
      </div>
    {/each}
  </div>
</div>

<style>
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
</style>
