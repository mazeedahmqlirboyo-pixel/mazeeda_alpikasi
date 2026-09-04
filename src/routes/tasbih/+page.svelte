<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { ArrowLeft, RotateCcw, Volume2, VolumeX, Vibrate, Target, X, Check } from 'lucide-svelte';
  import { Haptics, ImpactStyle } from '@capacitor/haptics';
  import { locale, t } from 'svelte-i18n';

  // State
  let count = 0;
  let totalCount = 0;
  let customTarget = 33;
  let isHapticEnabled = true;
  let isSoundEnabled = false;
  let mode: 'target' | 'free' = 'target';

  $: formatNumberDisplay = (num: number) => {
    if ($locale === 'ar') {
      const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      return num.toLocaleString('id-ID').replace(/[0-9]/g, w => arabicNumbers[parseInt(w)]);
    }
    return num.toLocaleString('id-ID');
  };

  // Drag State
  let buttonX = 0;
  let buttonY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialButtonX = 0;
  let initialButtonY = 0;
  let dragMoved = false;

  // Animation & UI triggers
  let isTapped = false;
  let targetReached = false;
  let showResetModal = false;
  let showTargetModal = false;
  let tempTargetInput = 33;

  // Load from local storage
  onMount(() => {
    const savedState = localStorage.getItem('mazeeda_tasbih_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        count = parsed.count || 0;
        totalCount = parsed.totalCount || 0;
        customTarget = parsed.customTarget || 33;
        tempTargetInput = customTarget;
        isHapticEnabled = parsed.isHapticEnabled ?? true;
        isSoundEnabled = parsed.isSoundEnabled ?? false;
        mode = parsed.mode || 'target';
        buttonX = parsed.buttonX || 0;
        buttonY = parsed.buttonY || 0;
      } catch (e) {
        console.warn('Failed to load tasbih state');
      }
    }
  });

  // Save to local storage whenever state changes
  $: if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mazeeda_tasbih_state', JSON.stringify({
      count,
      totalCount,
      customTarget,
      isHapticEnabled,
      isSoundEnabled,
      mode,
      buttonX,
      buttonY
    }));
  }

  // Pointer events for dragging the button
  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialButtonX = buttonX;
    initialButtonY = buttonY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragMoved = true;
    }
    
    buttonX = initialButtonX + dx;
    buttonY = initialButtonY + dy;
  }

  function handlePointerUp(e: PointerEvent) {
    if (isDragging && !dragMoved) {
      // It was just a tap on the button
      handleTap();
    }
    isDragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  // Tapping Logic
  async function handleTap() {
    if (showResetModal || showTargetModal) return; // Disable tap when modal is open

    isTapped = true;
    setTimeout(() => isTapped = false, 150);

    count++;
    totalCount++;

    // Check target completion
    const isTargetHit = mode === 'target' && count === customTarget;

    // Haptic feedback
    if (isHapticEnabled) {
      try {
        if (isTargetHit) {
          await Haptics.vibrate({ duration: 150 });
        } else {
          await Haptics.vibrate({ duration: 40 });
        }
      } catch (e) {}
    }

    // Sound feedback
    if (isSoundEnabled) {
      if (isTargetHit) {
        playTargetSound();
      } else {
        playClickSound();
      }
    }

    // Auto reset if hit target
    if (isTargetHit) {
      targetReached = true;
      setTimeout(() => {
        targetReached = false;
        count = 0;
      }, 1000); // 1s pause to celebrate
    }
  }

  // Audio generation logic
  function playClickSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) { }
  }

  function playTargetSound() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      
      // Play a lovely chime chord
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) { }
  }

  // Resets
  async function confirmReset() {
    count = 0;
    totalCount = 0;
    showResetModal = false;
    if (isHapticEnabled) {
      try { await Haptics.vibrate({ duration: 80 }); } catch (e) {}
    }
  }

  function saveCustomTarget() {
    if (tempTargetInput > 0) {
      customTarget = tempTargetInput;
      count = 0;
      mode = 'target';
    }
    showTargetModal = false;
  }
</script>

<!-- Menggunakan fixed inset-0 untuk full screen immersive experience tanpa gangguan margin dari layout utama -->
<div class="fixed inset-0 z-[100] flex flex-col bg-slate-950 font-sans text-white overflow-hidden">
  
  <!-- Static elegant emerald theme -->
  <div class="absolute inset-0 z-0 opacity-40 bg-gradient-to-br from-emerald-900 to-teal-950"></div>
  <div class="absolute inset-0 z-0 bg-slate-950/80 backdrop-blur-3xl"></div>

  <!-- Ambient light blobs -->
  <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-15 mix-blend-screen animate-pulse duration-3000 pointer-events-none"></div>
  <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[120px] opacity-15 mix-blend-screen animate-pulse duration-4000 pointer-events-none"></div>

  <!-- Header Section -->
  <div class="relative z-10 flex items-center justify-between p-4 sm:p-6 pointer-events-auto">
    <a href="/" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
      <ArrowLeft class="h-5 w-5 text-white" />
    </a>
    
    <div class="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
      <button 
        on:click={() => { mode = 'target'; showTargetModal = true; tempTargetInput = customTarget; }}
        class="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all {mode === 'target' ? 'bg-white/20 text-white shadow-none' : 'text-slate-400 hover:text-white'}"
      >
        <Target class="h-3.5 w-3.5 {mode === 'target' ? 'text-emerald-400' : 'text-slate-400'}" />
        <span>{$t('tasbih.target') || 'Target'} {formatNumberDisplay(customTarget)}</span>
      </button>
      <button 
        on:click={() => { mode = 'free'; count = 0; }}
        class="px-4 py-1.5 rounded-full text-xs font-bold transition-all {mode === 'free' ? 'bg-white/20 text-white shadow-none' : 'text-slate-400 hover:text-white'}"
      >
        {$t('tasbih.bebas') || 'Bebas'}
      </button>
    </div>

    <div class="flex items-center space-x-2">
      <!-- Settings -->
      <button 
        on:click={() => isSoundEnabled = !isSoundEnabled}
        class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors {isSoundEnabled ? 'text-white' : 'text-slate-400'}"
      >
        {#if isSoundEnabled}
          <Volume2 class="h-4.5 w-4.5" />
        {:else}
          <VolumeX class="h-4.5 w-4.5" />
        {/if}
      </button>
      <button 
        on:click={() => isHapticEnabled = !isHapticEnabled}
        class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors {isHapticEnabled ? 'text-white' : 'text-slate-400'}"
      >
        <Vibrate class="h-4.5 w-4.5" />
      </button>
    </div>
  </div>

  <!-- Full Screen Background Tap Zone -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="absolute inset-0 z-0 cursor-pointer"
    on:click={() => { if (!dragMoved) handleTap(); }}
  ></div>

  <!-- Foreground Draggable Giant Button (Highest Z-index to block clicks behind it) -->
  <div class="flex-1 flex items-center justify-center pointer-events-none relative z-40">
    <div 
      class="relative cursor-grab active:cursor-grabbing touch-none pointer-events-auto"
      style="transform: translate({buttonX}px, {buttonY}px);"
      on:pointerdown|stopPropagation={handlePointerDown}
      on:pointermove|stopPropagation={handlePointerMove}
      on:pointerup|stopPropagation={handlePointerUp}
      on:pointercancel|stopPropagation={handlePointerUp}
    >
      <!-- Ripple rings -->
      {#if isTapped}
        <div class="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" style="animation-duration: 0.6s;"></div>
      {/if}
      
      <!-- Target Reached Glow -->
      {#if targetReached}
        <div class="absolute inset-0 rounded-full bg-emerald-400/30 animate-pulse blur-2xl" style="animation-duration: 0.5s;"></div>
      {/if}

      <!-- Main Physical Button Structure -->
      <div 
        class="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/20 backdrop-blur-xl shadow-2xl transition-transform duration-100 {isTapped ? 'scale-95' : 'scale-100'} shadow-emerald-500/20"
      >
        <div class="absolute inset-4 rounded-full border border-white/10 border-dashed opacity-50"></div>
        
        <!-- SVG Progress Ring -->
        {#if mode === 'target'}
          <svg class="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="4"/>
            <circle 
              cx="50%" cy="50%" r="48%" 
              fill="none" 
              stroke="#34d399" 
              stroke-width="5"
              stroke-dasharray="1000"
              stroke-dashoffset={1000 - (1000 * count) / customTarget}
              stroke-linecap="round"
              class="transition-all duration-300 ease-out"
            />
          </svg>
        {/if}

        <div class="flex flex-col items-center pointer-events-none">
          <span class="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-200  drop-shadow-lg">
            {#key count}
              <span in:scale={{ start: 0.8, duration: 200 }}>
                {formatNumberDisplay(count)}
              </span>
            {/key}
          </span>
          {#if mode === 'target'}
            <span class="text-xs font-bold text-emerald-300/70 mt-2 tracking-widest uppercase">{$t('tasbih.target') || 'Target'} / {formatNumberDisplay(customTarget)}</span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Footer Information -->
  <!-- Set a lower z-index so that the draggable button (z-50) will overlap and block clicks to it -->
  <div class="relative z-10 p-6 sm:p-8 flex items-end justify-between pointer-events-auto">
    <div class="space-y-1">
      <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest">{$t('tasbih.total_keseluruhan') || 'TOTAL KESELURUHAN'}</p>
      <p class="text-2xl font-black text-white  drop-shadow-md dark:shadow-none">{formatNumberDisplay(totalCount)}</p>
    </div>
    
    <button 
      on:click|stopPropagation={() => showResetModal = true}
      class="inline-flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/50 hover:bg-rose-500/20 text-slate-400 dark:text-slate-500 hover:text-rose-400 transition-all border border-white/5 hover:border-rose-500/30 backdrop-blur-md shadow-lg"
    >
      <RotateCcw class="h-5 w-5 mb-1" />
      <span class="text-[9px] font-bold uppercase tracking-wider">{$t('tasbih.reset') || 'RESET'}</span>
    </button>
  </div>

  <!-- ======================= MODALS ======================= -->

  <!-- Reset Confirmation Modal -->
  {#if showResetModal}
    <div class="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" in:fade={{duration: 200}} out:fade={{duration: 200}}>
      <div class="bg-slate-900 border border-slate-700 p-6 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6" in:scale={{start: 0.9, duration: 200}}>
        <div class="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center border border-rose-500/20">
          <RotateCcw class="h-8 w-8" />
        </div>
        <div class="space-y-2">
          <h3 class="text-lg font-bold text-white">{$t('tasbih.reset_title') || 'Reset Hitungan?'}</h3>
          <p class="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            {$t('tasbih.reset_desc') || 'Ini akan menghapus angka hitungan saat ini dan total hitungan keseluruhan. Anda yakin?'}
          </p>
        </div>
        <div class="flex gap-3">
          <button on:click={() => showResetModal = false} class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors border border-slate-700">
            {$t('tasbih.batal') || 'Batal'}
            </button>
          <button on:click={confirmReset} class="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-colors shadow-lg shadow-rose-600/20">
            {$t('tasbih.ya_reset') || 'Ya, Reset'}
            </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Target Setting Modal -->
  {#if showTargetModal}
    <div class="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" in:fade={{duration: 200}} out:fade={{duration: 200}}>
      <div class="bg-slate-900 border border-emerald-900/50 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-6" in:scale={{start: 0.9, duration: 200}}>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <Target class="h-5 w-5 text-emerald-500" /> {$t('tasbih.atur_target') || 'Atur Target'}
          </h3>
          <button on:click={() => showTargetModal = false} class="text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-white p-1">
            <X class="h-5 w-5" />
          </button>
        </div>
        
        <div class="space-y-2">
          <label for="targetInput" class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{$t('tasbih.target_number') || 'Angka Target'}</label>
          <input 
            id="targetInput" 
            type="number" 
            bind:value={tempTargetInput}
            min="1"
            class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-2xl  font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>
        
        <div class="grid grid-cols-4 gap-2">
          {#each [33, 100, 1000, 9999] as preset}
            <button 
              on:click={() => tempTargetInput = preset}
              class="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300  text-xs border border-slate-700 transition-colors"
            >
              {preset}
            </button>
          {/each}
        </div>

        <button on:click={saveCustomTarget} class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
          <Check class="h-4 w-4" /> {$t('tasbih.save_target') || 'Simpan Target'}
        </button>
      </div>
    </div>
  {/if}
</div>
