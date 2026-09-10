<script lang="ts">
  import { onMount } from 'svelte';
  import { t, locale } from 'svelte-i18n';
  import { 
    MapPin, Loader2, Droplets, Wind, 
    Cloud, Sun, Moon, CloudSun, CloudMoon, 
    CloudRain, CloudLightning, CloudSnow, CloudFog 
  } from 'lucide-svelte';

  let weatherData: any = null;
  let loading = true;
  let errorMsg = '';
  let lastLat: number | null = null;
  let lastLon: number | null = null;
  const API_KEY = 'ae49030676655c1a89fb3df116df25f8';

  // Menyimpan referensi bahasa terakhir yang diambil untuk mencegah loop
  let lastFetchedLang = '';

  onMount(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lastLat = position.coords.latitude;
          lastLon = position.coords.longitude;
          fetchWeather(lastLat, lastLon);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          lastLat = -6.2088;
          lastLon = 106.8456;
          fetchWeather(lastLat, lastLon);
          errorMsg = 'GPS tidak diizinkan, menampilkan cuaca Jakarta.';
        },
        { timeout: 10000 }
      );
    } else {
      lastLat = -6.2088;
      lastLon = 106.8456;
      fetchWeather(lastLat, lastLon);
      errorMsg = 'Browser tidak mendukung GPS.';
    }
  });

  // Re-fetch saat bahasa berubah
  $: if ($locale && lastLat !== null && lastLon !== null) {
    const currentLang = getOwmLang($locale);
    if (currentLang !== lastFetchedLang && !loading) {
      fetchWeather(lastLat, lastLon);
    }
  }

  function getOwmLang(loc: string | null | undefined) {
    if (!loc) return 'id';
    const l = loc.toLowerCase();
    if (l.includes('ar')) return 'ar';
    if (l.includes('en')) return 'en';
    if (l.includes('ko')) return 'kr'; // OpenWeatherMap Korea = kr
    if (l.includes('ja')) return 'ja';
    if (l.includes('zh')) return 'zh_cn';
    return 'id';
  }

  async function fetchWeather(lat: number, lon: number) {
    try {
      loading = true;
      const langParam = getOwmLang($locale);
      lastFetchedLang = langParam;

      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${langParam}`);
      if (!res.ok) throw new Error('Gagal mengambil data cuaca');
      weatherData = await res.json();
      
    } catch (err: any) {
      errorMsg = err.message || 'Terjadi kesalahan jaringan';
    } finally {
      loading = false;
    }
  }

  // Helper untuk mendapatkan icon Lucide yang sesuai dengan kode OpenWeather
  function getWeatherIcon(iconCode: string) {
    switch(iconCode.substring(0, 2)) {
      case '01': return iconCode.includes('d') ? Sun : Moon;
      case '02': return iconCode.includes('d') ? CloudSun : CloudMoon;
      case '03': 
      case '04': return Cloud;
      case '09':
      case '10': return CloudRain;
      case '11': return CloudLightning;
      case '13': return CloudSnow;
      case '50': return CloudFog;
      default: return Cloud;
    }
  }

  // Helper untuk warna icon
  function getIconColorClass(iconCode: string) {
    if (iconCode.includes('01') || iconCode.includes('02')) {
      return iconCode.includes('d') ? 'text-amber-500' : 'text-indigo-400';
    }
    if (iconCode.includes('09') || iconCode.includes('10')) return 'text-blue-500';
    if (iconCode.includes('11')) return 'text-purple-500';
    if (iconCode.includes('13')) return 'text-sky-300';
    return 'text-slate-400 dark:text-slate-300'; // Default awan abu-abu
  }
</script>

{#if loading}
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex items-center justify-center h-24 animate-pulse">
    <Loader2 class="h-6 w-6 text-slate-400 animate-spin" />
  </div>
{:else if weatherData}
  <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:px-6 shadow-sm overflow-hidden transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
    
    <!-- Left: Icon & Temp -->
    <div class="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
      <div class="{getIconColorClass(weatherData.weather[0].icon)}">
        <svelte:component this={getWeatherIcon(weatherData.weather[0].icon)} class="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.5]" />
      </div>
      
      <div class="flex flex-col">
        <div class="flex items-center space-x-1 text-slate-500 dark:text-slate-400 mb-1">
          <MapPin class="w-3.5 h-3.5" />
          <span class="text-xs font-bold uppercase tracking-wider">{weatherData.name}</span>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-3xl sm:text-4xl font-black leading-none text-slate-800 dark:text-white tracking-tighter">
            {Math.round(weatherData.main.temp)}°
          </h3>
          <span class="text-sm font-semibold capitalize text-slate-500 dark:text-slate-400">
            {weatherData.weather[0].description}
          </span>
        </div>
      </div>
    </div>

    <!-- Right: Minimalist Stats -->
    <div class="flex flex-row gap-6 sm:gap-8 w-full sm:w-auto justify-around sm:justify-end">
      <div class="flex flex-col items-center gap-1.5">
        <div class="flex items-center gap-1 text-blue-500">
          <Droplets class="w-3.5 h-3.5" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{weatherData.main.humidity}%</span>
        </div>
        <span class="text-[9px] text-slate-400 uppercase tracking-widest">{$t('weather.humidity') || 'Lembab'}</span>
      </div>
      
      <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
      
      <div class="flex flex-col items-center gap-1.5">
        <div class="flex items-center gap-1 text-cyan-500">
          <Wind class="w-3.5 h-3.5" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{Math.round(weatherData.wind.speed * 3.6)} km/h</span>
        </div>
        <span class="text-[9px] text-slate-400 uppercase tracking-widest">{$t('weather.wind') || 'Angin'}</span>
      </div>
      
      <div class="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
      
      <div class="flex flex-col items-center gap-1.5">
        <div class="flex items-center gap-1 text-slate-400 dark:text-slate-300">
          <Cloud class="w-3.5 h-3.5" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{weatherData.clouds.all}%</span>
        </div>
        <span class="text-[9px] text-slate-400 uppercase tracking-widest">{$t('weather.cloud') || 'Awan'}</span>
      </div>
    </div>

    {#if errorMsg}
      <div class="absolute bottom-1 right-2">
        <p class="text-[9px] text-rose-500/70 font-medium">{errorMsg}</p>
      </div>
    {/if}
  </section>
{/if}
