<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let effect = 'none';

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let animationFrameId: number;
  let particles: any[] = [];
  let width = 0;
  let height = 0;

  // We use the Svelte action 'canvasAction' below instead of a reactive statement 
  // to avoid infinite reactive loops when mutating canvas properties (width/height).

  let frameCount = 0;
  let isDestroyed = false;

  function initParticles() {
    if (typeof window === 'undefined' || !canvas) return;
    console.log("SeasonalEffect: initParticles called for effect:", effect);
    particles = [];
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    const particleCount = effect === 'hujan' ? 80 : (effect === 'salju' ? 60 : (effect === 'idul_fitri' ? 30 : (effect === 'valentine' ? 35 : 0)));
    
    for (let i = 0; i < particleCount; i++) {
      if (effect === 'hujan') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 20 + 15, // longer rain lines: 15-35px
          speed: Math.random() * 8 + 6,
          opacity: Math.random() * 0.4 + 0.3,
          weight: Math.random() * 1.5 + 0.5
        });
      } else if (effect === 'salju') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 4 + 2, // larger snow particles: 2-6px
          density: Math.random() * 1,
          opacity: Math.random() * 0.7 + 0.3,
          speedY: Math.random() * 1.5 + 0.8,
          speedX: Math.random() * 1.5 - 0.75
        });
      } else if (effect === 'idul_fitri') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height, // scatter initially so they are immediately visible
          radius: Math.random() * 10 + 8, // much larger sizes: 8-18px
          speed: Math.random() * 1.2 + 0.6,
          opacity: Math.random() * 0.7 + 0.3,
          type: Math.random() > 0.5 ? 'star' : 'crescent',
          angle: Math.random() * 360,
          spin: Math.random() * 0.6 - 0.3
        });
      } else if (effect === 'valentine') {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 10 + 6, // 6px to 16px size
          speed: Math.random() * 1.5 + 0.5, // gentle drift upwards
          opacity: Math.random() * 0.6 + 0.3,
          angle: Math.random() * 360,
          spin: Math.random() * 0.4 - 0.2,
          color: ['#60a5fa', '#38bdf8', '#818cf8', '#22d3ee'][Math.floor(Math.random() * 4)] // Blue shades
        });
      }
    }
    console.log("SeasonalEffect: Initialized", particles.length, "particles.");
  }

  function draw() {
    if (isDestroyed || !ctx || !canvas || effect === 'none' || effect === 'ramadhan') return;
    
    frameCount++;
    if (frameCount % 180 === 0) {
      console.log("SeasonalEffect: draw loop is running. Effect:", effect, "Particles:", particles.length);
    }

    ctx.clearRect(0, 0, width, height);

    if (effect === 'hujan') {
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)'; // Sky-500 tint, highly visible
      ctx.lineWidth = 1.6; // slightly thicker
      for (let p of particles) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1, p.y + p.length);
        ctx.stroke();

        p.y += p.speed;
        p.x -= 0.5;
        
        if (p.y > height) {
          p.y = -30;
          p.x = Math.random() * width;
        }
      }
    } else if (effect === 'salju') {
      ctx.fillStyle = 'rgba(125, 211, 252, 0.75)'; // Soft sky-300 light blue (visible on white backgrounds!)
      for (let p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, true);
        ctx.fill();

        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y / 30) * 0.5;

        if (p.y > height || p.x > width || p.x < 0) {
          p.y = -10;
          p.x = Math.random() * width;
        }
      }
    } else if (effect === 'idul_fitri') {
      for (let p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`; // Warm amber-500 gold
        ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
        ctx.shadowBlur = 6;

        if (p.type === 'star') {
          // Draw standard 5-point star
          ctx.beginPath();
          ctx.moveTo(0, -p.radius);
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * p.radius, -Math.sin(((18 + i * 72) * Math.PI) / 180) * p.radius);
            ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (p.radius / 2.2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (p.radius / 2.2));
          }
          ctx.closePath();
          ctx.fill();
        } else {
          // Draw crescent moon
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, Math.PI * -0.5, Math.PI * 0.5, false);
          ctx.arc(p.radius * 0.3, 0, p.radius * 0.8, Math.PI * 0.5, Math.PI * -0.5, true);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        p.y += p.speed;
        p.angle += p.spin;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }
      }
    } else if (effect === 'valentine') {
      for (let p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        // Draw Heart Shape
        ctx.beginPath();
        ctx.moveTo(0, -p.radius * 0.3);
        ctx.bezierCurveTo(-p.radius * 0.8, -p.radius * 1.1, -p.radius * 1.5, -p.radius * 0.3, 0, p.radius * 1.0);
        ctx.bezierCurveTo(p.radius * 1.5, -p.radius * 0.3, p.radius * 0.8, -p.radius * 1.1, 0, -p.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        p.y -= p.speed; // float upwards
        p.angle += p.spin;
        p.x += Math.sin(p.y / 30) * 0.4; // gentle sway

        // Reset if floats off the top
        if (p.y < -p.radius * 2) {
          p.y = height + p.radius * 2;
          p.x = Math.random() * width;
        }
      }
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  function canvasAction(node: HTMLCanvasElement) {
    canvas = node;
    
    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', resize);
      resize();
      console.log("SeasonalEffect: Canvas action mounted, size initialized:", width, "x", height);
    }
    
    initParticles();
    
    if (typeof window !== 'undefined') {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(draw);
    }

    return {
      update(newEffect) {
        effect = newEffect;
        console.log("SeasonalEffect: Canvas action updated to effect:", effect);
        initParticles();
        if (typeof window !== 'undefined') {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(draw);
        }
      },
      destroy() {
        console.log("SeasonalEffect: Canvas action destroyed.");
        isDestroyed = true;
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', resize);
        }
        cancelAnimationFrame(animationFrameId);
        ctx = null;
        canvas = null as any;
      }
    };
  }

  onDestroy(() => {
    isDestroyed = true;
    cancelAnimationFrame(animationFrameId);
    ctx = null;
    canvas = null as any;
  });
</script>

{#if effect !== 'none'}
  <!-- Canvas layer for snow, rain, idul fitri particles -->
  {#if effect !== 'ramadhan'}
    <canvas 
      use:canvasAction={effect} 
      class="fixed inset-0 pointer-events-none z-[45] w-full h-full"
    ></canvas>
  {/if}

  <!-- Ramadan floating Swaying Ornaments (Lanterns & Ketupat) -->
  {#if effect === 'ramadhan'}
    <div class="fixed top-16 inset-x-0 h-40 pointer-events-none z-[35] overflow-hidden flex justify-between px-6 sm:px-12 md:px-24">
      
      <!-- Lampion 1 (Left) -->
      <div class="sway-ornament duration-1" style="height: 120px;">
        <svg class="h-full w-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]" viewBox="0 0 40 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Chain -->
          <line x1="20" y1="0" x2="20" y2="40" stroke="#d97706" stroke-width="1.5" />
          <!-- Lantern Cap -->
          <path d="M10 40 L30 40 L25 35 L15 35 Z" fill="#b45309" />
          <!-- Lantern Body (Glowing Amber) -->
          <path d="M8 40 Q20 45 32 40 L34 75 Q20 85 6 75 Z" fill="url(#lanternGlow)" />
          <!-- Lattice lines -->
          <path d="M12 43 C18 45 22 45 28 43 M10 55 C18 58 22 58 30 55 M8 67 C18 70 22 70 32 67" stroke="#b45309" stroke-width="1" opacity="0.3" />
          <line x1="20" y1="41" x2="20" y2="78" stroke="#b45309" stroke-width="1.2" opacity="0.5" />
          <!-- Lantern Bottom -->
          <rect x="12" y="75" width="16" height="5" rx="1" fill="#b45309" />
          <!-- Hanging Tassel -->
          <line x1="20" y1="80" x2="20" y2="95" stroke="#d97706" stroke-width="1.5" />
          <polygon points="20,95 18,115 22,115" fill="#d97706" />

          <defs>
            <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="50%" stop-color="#fbbf24" />
              <stop offset="100%" stop-color="#d97706" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <!-- Ketupat 1 (Center-Left) -->
      <div class="sway-ornament duration-2 hidden sm:block" style="height: 100px;">
        <svg class="h-full w-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]" viewBox="0 0 30 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="15" y1="0" x2="15" y2="40" stroke="#059669" stroke-width="1.5" />
          <!-- Diamond shape -->
          <path d="M15 40 L25 50 L15 60 L5 50 Z" fill="#34d399" stroke="#059669" stroke-width="1.5" />
          <!-- Weave lines -->
          <path d="M10 45 L20 55 M20 45 L10 55" stroke="#10b981" stroke-width="1" />
          <line x1="15" y1="60" x2="15" y2="75" stroke="#059669" stroke-width="1.5" />
          <!-- Ribbons -->
          <path d="M13 75 L10 100 M17 75 L20 100" stroke="#34d399" stroke-width="2" />
        </svg>
      </div>

      <!-- Ketupat 2 (Center-Right) -->
      <div class="sway-ornament duration-3 hidden sm:block" style="height: 90px;">
        <svg class="h-full w-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]" viewBox="0 0 30 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="15" y1="0" x2="15" y2="35" stroke="#059669" stroke-width="1.5" />
          <path d="M15 35 L24 44 L15 53 L6 44 Z" fill="#10b981" stroke="#047857" stroke-width="1.5" />
          <path d="M10.5 39.5 L19.5 48.5 M19.5 39.5 L10.5 48.5" stroke="#059669" stroke-width="0.8" />
          <line x1="15" y1="53" x2="15" y2="65" stroke="#047857" stroke-width="1.5" />
          <path d="M13 65 L11 88 M17 65 L19 88" stroke="#10b981" stroke-width="2" />
        </svg>
      </div>

      <!-- Lampion 2 (Right) -->
      <div class="sway-ornament duration-4" style="height: 110px;">
        <svg class="h-full w-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]" viewBox="0 0 40 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="20" y1="0" x2="20" y2="35" stroke="#d97706" stroke-width="1.5" />
          <path d="M12 35 L28 35 L24 30 L16 30 Z" fill="#b45309" />
          <path d="M10 35 Q20 40 30 35 L32 68 Q20 77 8 68 Z" fill="url(#lanternGlow)" />
          <path d="M13 38 C18 40 22 40 27 38 M11 50 C18 52 22 52 29 50 M9 62 C18 64 22 64 31 62" stroke="#b45309" stroke-width="1" opacity="0.3" />
          <line x1="20" y1="36" x2="20" y2="70" stroke="#b45309" stroke-width="1.2" opacity="0.5" />
          <rect x="13" y="68" width="14" height="4" rx="1" fill="#b45309" />
          <line x1="20" y1="72" x2="20" y2="85" stroke="#d97706" stroke-width="1.5" />
          <polygon points="20,85 18,105 22,105" fill="#d97706" />
          
          <defs>
            <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fef08a" />
              <stop offset="50%" stop-color="#fbbf24" />
              <stop offset="100%" stop-color="#d97706" />
            </radialGradient>
          </defs>
        </svg>
      </div>

    </div>
  {/if}
{/if}

<style>
  /* Sway animations for ornaments */
  .sway-ornament {
    transform-origin: top center;
    pointer-events: none;
    user-select: none;
  }
  .duration-1 {
    animation: swayEffect 4.5s ease-in-out infinite alternate;
  }
  .duration-2 {
    animation: swayEffect 5.2s ease-in-out infinite alternate;
  }
  .duration-3 {
    animation: swayEffect 4.8s ease-in-out infinite alternate;
  }
  .duration-4 {
    animation: swayEffect 4s ease-in-out infinite alternate;
  }

  @keyframes swayEffect {
    0% {
      transform: rotate(-6deg);
    }
    100% {
      transform: rotate(6deg);
    }
  }
</style>
