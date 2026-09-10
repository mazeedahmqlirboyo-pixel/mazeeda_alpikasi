<script lang="ts">
  import { onMount } from 'svelte';
  import { MapPin, Loader2, Cloud, Droplets, Wind } from 'lucide-svelte';

  let weatherData: any = null;
  let locationName = '';
  let loading = true;
  let errorMsg = '';
  const API_KEY = 'ae49030676655c1a89fb3df116df25f8';

  onMount(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchWeather(lat, lon);
        },
        (err) => {
          console.warn("Geolocation error:", err);
          fetchWeather(-6.2088, 106.8456);
          errorMsg = 'GPS tidak diizinkan, menampilkan cuaca Jakarta.';
        },
        { timeout: 10000 }
      );
    } else {
      fetchWeather(-6.2088, 106.8456);
      errorMsg = 'Browser tidak mendukung GPS.';
    }
  });

  async function fetchWeather(lat: number, lon: number) {
    try {
      loading = true;
      // Ambil detail lokasi dari OpenStreetMap Nominatim
      try {
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`);
        if (nomRes.ok) {
          const nomData = await nomRes.json();
          if (nomData && nomData.address) {
            const addr = nomData.address;
            locationName = addr.village || addr.suburb || addr.city_district || addr.town || addr.city || addr.county || '';
          }
        }
      } catch(e) {
        console.warn('Gagal ambil detail lokasi', e);
      }

      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=id`);
      if (!res.ok) throw new Error('Gagal mengambil data cuaca');
      weatherData = await res.json();
      
      if (!locationName) {
        locationName = weatherData.name;
      }
    } catch (err: any) {
      errorMsg = err.message || 'Terjadi kesalahan jaringan';
    } finally {
      loading = false;
    }
  }
</script>

{#if loading}
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-soft-sm flex items-center justify-center h-32 animate-pulse">
    <Loader2 class="h-8 w-8 text-blue-500 animate-spin" />
  </div>
{:else if weatherData}
  <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-soft-sm overflow-hidden transition-all">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Left: Location & Icon -->
      <div class="flex flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
        <div class="bg-blue-50 dark:bg-slate-800 rounded-2xl p-2 shrink-0">
          <img 
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
            alt={weatherData.weather[0].description} 
            class="w-16 h-16 object-contain"
          />
        </div>
        <div class="space-y-1">
          <div class="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
            <MapPin class="w-3.5 h-3.5" />
            <span class="text-xs font-bold uppercase tracking-wider">{locationName}</span>
          </div>
          <h3 class="text-3xl font-black leading-none text-slate-800 dark:text-white">{Math.round(weatherData.main.temp)}°C</h3>
          <p class="text-sm font-semibold capitalize text-slate-600 dark:text-slate-300">
            {weatherData.weather[0].description}
          </p>
        </div>
      </div>

      <!-- Right: Extra Stats -->
      <div class="flex flex-row gap-4 sm:gap-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 sm:px-5 sm:py-3 w-full sm:w-auto justify-around sm:justify-end border border-slate-100 dark:border-slate-700">
        <div class="flex flex-col items-center gap-1">
          <Droplets class="w-4 h-4 text-blue-500" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{weatherData.main.humidity}%</span>
          <span class="text-[9px] text-slate-400 uppercase tracking-widest">Lembab</span>
        </div>
        <div class="w-px bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex flex-col items-center gap-1">
          <Wind class="w-4 h-4 text-cyan-500" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round(weatherData.wind.speed * 3.6)} km/h</span>
          <span class="text-[9px] text-slate-400 uppercase tracking-widest">Angin</span>
        </div>
        <div class="w-px bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex flex-col items-center gap-1">
          <Cloud class="w-4 h-4 text-slate-400" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300">{weatherData.clouds.all}%</span>
          <span class="text-[9px] text-slate-400 uppercase tracking-widest">Awan</span>
        </div>
      </div>
    </div>
    {#if errorMsg}
      <p class="mt-3 text-[10px] text-rose-500 font-medium text-center sm:text-left">{errorMsg}</p>
    {/if}
  </section>
{/if}
