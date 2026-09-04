<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PartyPopper, Gift, CalendarHeart } from 'lucide-svelte';
  import Card from '$lib/components/ui/card.svelte';

  export let tanggalLahir: string = ''; // format: YYYY-MM-DD
  export let userName: string = 'User';
  export let placement: 'top' | 'bottom' = 'top';

  let state: 'LOADING' | 'COUNTDOWN_LONG' | 'COUNTDOWN_SHORT' | 'HARI_H' | 'TELAT' | 'HIDDEN' = 'LOADING';
  let daysLeft = 0;
  let hoursLeft = 0;
  let minutesLeft = 0;
  let secondsLeft = 0;

  let ageYears = 0;
  let ageDays = 0;
  let lateDays = 0;

  let timerInterval: any;

  function calculateBirthday() {
    if (!tanggalLahir) {
      state = 'HIDDEN';
      return;
    }

    const [year, month, day] = tanggalLahir.split('-').map(Number);
    if (!month || !day) {
      state = 'HIDDEN';
      return;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bdayThisYear = new Date(now.getFullYear(), month - 1, day);

    // Calculate Exact Age
    ageYears = today.getFullYear() - year;
    if (today.getTime() < bdayThisYear.getTime()) {
      ageYears -= 1;
      const bdayLastYear = new Date(today.getFullYear() - 1, month - 1, day);
      const diffTimeAge = today.getTime() - bdayLastYear.getTime();
      ageDays = Math.floor(diffTimeAge / (1000 * 60 * 60 * 24));
    } else {
      const diffTimeAge = today.getTime() - bdayThisYear.getTime();
      ageDays = Math.floor(diffTimeAge / (1000 * 60 * 60 * 24));
    }

    if (today.getTime() > bdayThisYear.getTime()) {
      lateDays = Math.floor((today.getTime() - bdayThisYear.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (today.getTime() === bdayThisYear.getTime()) {
      state = 'HARI_H';
    } else if (today.getTime() < bdayThisYear.getTime()) {
      const diffTime = bdayThisYear.getTime() - today.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 14) {
        state = 'COUNTDOWN_SHORT';
      } else if (diffDays <= 30) {
        state = 'COUNTDOWN_LONG';
      } else {
        state = 'HIDDEN';
      }
      
      if (state !== 'HIDDEN') {
        updateCountdown(bdayThisYear);
      }
    } else {
      // Passed this year
      if (lateDays <= 7) {
        state = 'TELAT';
      } else {
        state = 'HIDDEN';
      }
    }
  }

  function updateCountdown(targetDate: Date) {
    const now = new Date();
    // targetDate is at midnight. Let's countdown to the start of the birthday.
    const diffTime = targetDate.getTime() - now.getTime();
    
    if (diffTime <= 0) {
      calculateBirthday(); // Transition to Hari H
      return;
    }

    daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    hoursLeft = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutesLeft = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    secondsLeft = Math.floor((diffTime % (1000 * 60)) / 1000);
  }

  onMount(() => {
    calculateBirthday();
    if (state.startsWith('COUNTDOWN')) {
      timerInterval = setInterval(() => {
        if (state.startsWith('COUNTDOWN')) {
          const [year, month, day] = tanggalLahir.split('-').map(Number);
          const bdayThisYear = new Date(new Date().getFullYear(), month - 1, day);
          updateCountdown(bdayThisYear);
        }
      }, 1000); // Update every second
    }
  });

  onDestroy(() => {
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

{#if placement === 'top'}
  {#if state === 'COUNTDOWN_SHORT'}
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-rose-50 to-amber-50 border border-rose-100 shadow-soft-sm p-4 mb-5 group">
      <!-- Decorative Silhouette -->
      <div class="absolute -right-4 -top-4 text-rose-200/40 transform rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        <Gift class="w-24 h-24" strokeWidth={1} />
      </div>
      
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div class="flex flex-col items-center sm:items-start">
          <div class="inline-flex items-center space-x-1 bg-white dark:bg-slate-900/60 backdrop-blur-sm border border-rose-100 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-rose-600 mb-1.5">
            <CalendarHeart class="w-3 h-3" />
            <span>Menuju Ulang Tahunmu!</span>
          </div>
          <h3 class="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">Siap-siap tambah umur, Cantik! 🥳</h3>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium max-w-[260px] leading-snug mt-0.5">Pstt... jangan lupa banyakin senyum, bulan spesialmu udah di depan mata lohhh! ✨</p>
        </div>

        <div class="flex items-center justify-center space-x-1.5 sm:space-x-2 bg-white dark:bg-slate-900/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/60 shadow-sm dark:shadow-none self-center sm:self-auto w-auto mt-1 sm:mt-0">
          <div class="flex flex-col items-center">
            <span class="text-lg sm:text-xl font-black text-rose-600 font-mono tracking-tighter leading-none">{daysLeft}</span>
            <span class="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Hari</span>
          </div>
          <div class="text-slate-300 font-black text-base animate-pulse relative -top-1">:</div>
          <div class="flex flex-col items-center">
            <span class="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-200 font-mono tracking-tighter leading-none drop-shadow-sm dark:shadow-none">{hoursLeft.toString().padStart(2, '0')}</span>
            <span class="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Jam</span>
          </div>
          <div class="text-slate-300 font-black text-base animate-pulse relative -top-1">:</div>
          <div class="flex flex-col items-center">
            <span class="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-200 font-mono tracking-tighter leading-none">{minutesLeft.toString().padStart(2, '0')}</span>
            <span class="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Mnt</span>
          </div>
          <div class="text-slate-300 font-black text-base animate-pulse relative -top-1">:</div>
          <div class="flex flex-col items-center">
            <span class="text-lg sm:text-xl font-black text-rose-500 font-mono tracking-tighter leading-none">{secondsLeft.toString().padStart(2, '0')}</span>
            <span class="text-[7px] font-bold text-rose-400 uppercase tracking-widest mt-1">Dtk</span>
          </div>
        </div>
      </div>
    </div>

  {:else if state === 'HARI_H' || state === 'TELAT'}
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 shadow-lg p-6 sm:p-8 mb-6 text-white text-center sm:text-left transform hover:-translate-y-1 transition-all duration-300">
      <!-- Festive Background Elements -->
      <div class="absolute -left-10 -bottom-10 text-white/10 transform -rotate-12 pointer-events-none">
        <Gift class="w-48 h-48" strokeWidth={0.5} />
      </div>
      <div class="absolute -right-10 -top-10 text-white/10 transform rotate-12 pointer-events-none">
        <PartyPopper class="w-40 h-40" />
      </div>
      
      <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div class="space-y-2 max-w-lg">
          {#if state === 'TELAT'}
            <div class="inline-block bg-white dark:bg-slate-900/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm dark:shadow-none mb-1">
              🎉 TELAT {lateDays} HARI 😅
            </div>
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Barakallah Fii Umrik,<br/>Cantik! 🎉
            </h2>
            <p class="text-sm text-pink-100 font-medium leading-relaxed opacity-90 mt-2">
              Maafkan ya agak telat {lateDays} hari! Tapi doa terbaik tetap mengalir buat kamu. Semoga di usiamu yang baru ini selalu dilancarkan urusannya dan penuh senyum bahagia! ✨
            </p>
          {:else}
            <div class="inline-block bg-white dark:bg-slate-900/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm dark:shadow-none mb-1 animate-pulse">
              ✨ HARI SPESIAL ✨
            </div>
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Barakallah Fii Umrik,<br/>Cantik! 🎉
            </h2>
            <p class="text-sm text-pink-100 font-medium leading-relaxed opacity-90 mt-2">
              Selamat ulang tahun ya! Semoga hari-harimu ke depan penuh kebahagiaan, rezekinya ngalir terus, dan semua doa baikmu cepat terkabul. Jangan lupa tersenyum hari ini! ✨
            </p>
          {/if}

          <!-- Age Display -->
          <div class="mt-4 inline-flex items-center space-x-3 bg-black/20 backdrop-blur-sm rounded-xl p-2.5 px-4 shadow-inner border border-white/10 self-start">
            <div class="text-2xl drop-shadow-md dark:shadow-none">⏳</div>
            <div class="flex flex-col text-left">
              <span class="text-[10px] text-pink-100 uppercase font-bold tracking-wider mb-0.5">Tepatnya Usiamu Sekarang:</span>
              <span class="text-base font-black text-white leading-none">
                {ageYears} <span class="text-xs font-semibold opacity-80 font-sans">Tahun</span>
                {#if ageDays > 0}
                  <span class="text-pink-300 mx-1">•</span> {ageDays} <span class="text-xs font-semibold opacity-80 font-sans">Hari</span>
                {/if}
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex-shrink-0 animate-in zoom-in duration-500 delay-150">
          <div class="w-24 h-24 sm:w-28 sm:h-28 bg-white dark:bg-slate-900/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/30 shadow-xl">
            <span class="text-5xl drop-shadow-lg">🎂</span>
          </div>
        </div>
      </div>
    </div>

  {/if}

{:else if placement === 'bottom'}
  {#if state === 'COUNTDOWN_LONG'}
    <div class="group flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 border border-purple-100 rounded-xl p-3 mt-2 shadow-sm dark:shadow-none hover:shadow-md dark:shadow-none transition-all duration-300 overflow-hidden relative">
      <div class="absolute -right-4 -bottom-4 text-purple-200/40 transform -rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        <PartyPopper class="w-16 h-16" />
      </div>
      
      <div class="relative z-10 flex items-center space-x-3">
        <div class="bg-white dark:bg-slate-900 p-2 rounded-lg text-purple-500 shadow-sm dark:shadow-none border border-purple-50 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
          <Gift class="w-4 h-4" strokeWidth={1.5} />
        </div>
        <div class="flex flex-col">
          <h4 class="text-[11px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-none">Cieee, yang mau nambah umur! 🎉</h4>
          <div class="flex items-center space-x-1 mt-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 font-mono tracking-tighter">
            <span>Sisa:</span>
            <span class="text-purple-600">{daysLeft}h</span>
            <span class="animate-pulse">:</span>
            <span class="text-purple-600">{hoursLeft.toString().padStart(2, '0')}j</span>
            <span class="animate-pulse">:</span>
            <span class="text-purple-600">{minutesLeft.toString().padStart(2, '0')}m</span>
            <span class="animate-pulse">:</span>
            <span class="text-purple-600">{secondsLeft.toString().padStart(2, '0')}d</span>
          </div>
        </div>
      </div>
    </div>
  {/if}
{/if}
