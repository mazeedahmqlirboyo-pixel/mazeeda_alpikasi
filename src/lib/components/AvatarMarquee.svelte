<script lang="ts">
  export let images: string[] = [];
  
  // We duplicate the images array to create a seamless infinite scrolling effect
  // The CSS animation will translate the container by exactly half its width, 
  // and then instantly reset to 0.
  $: duplicatedImages = [...images, ...images];
</script>

<div class="w-full overflow-hidden py-6 relative">
  <!-- Optional gradient masks on edges for a fading effect -->
  <div class="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-slate-50 to-transparent"></div>
  <div class="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-slate-50 to-transparent"></div>

  <!-- The scrolling container -->
  <div class="flex w-max animate-marquee space-x-4 px-2 hover:pause-animation">
    {#each duplicatedImages as img, i}
      <div class="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-full overflow-hidden border-2 border-white shadow-md transition-transform hover:scale-110 cursor-pointer">
        <img 
          src={img} 
          alt="Avatar {i}" 
          class="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    {/each}
  </div>
</div>

<style>
  /* Define the keyframes for the marquee */
  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .animate-marquee {
    /* Adjust duration based on number of items to keep speed consistent, or hardcode it */
    animation: marquee 30s linear infinite;
  }

  /* Pause the animation when hovering */
  .hover\:pause-animation:hover {
    animation-play-state: paused;
  }
</style>
