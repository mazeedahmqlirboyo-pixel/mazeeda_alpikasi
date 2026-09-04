<script lang="ts">
  import { t, locale } from "svelte-i18n";

  function formatNumberStr(num, loc) {
    if (typeof num === "undefined" || num === null) return num;
    if (loc === "ar") {
      const idArabic = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
      return num.toString().replace(/[0-9]/g, w => idArabic[w]);
    }
    return num.toLocaleString(loc === "id" ? "id-ID" : loc);
  }
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import { 
    ArrowLeft, 
    Compass, 
    MapPin, 
    RefreshCw, 
    Smartphone, 
    Search, 
    X, 
    Check, 
    Navigation,
    Info,
    HelpCircle
  } from 'lucide-svelte';

  // Mecca Coordinates
  const MECCA_LAT = 21.4225;
  const MECCA_LNG = 39.8262;

  // State
  let latitude: number | null = null;
  let longitude: number | null = null;
  let cityName = 'Mencari lokasi...';
  $: displayCityName = locationSource === 'gps' ? $t('kiblat.lokasi_saya_gps') || 'Lokasi Saya (GPS)' : locationSource === 'default' ? $t('kiblat.jakarta_default') || 'Jakarta (Default)' : locationSource === 'searching' ? $t('kiblat.mencari_lokasi') || 'Mencari lokasi...' : cityName;
  let locationSource: 'gps' | 'city' | 'default' | 'searching' = 'searching';
  
  let heading = 0; // Degrees from North (device direction)
  let qiblaBearing = 295; // Qibla angle from North (default Jakarta)
  let distanceToMecca = 7921; // km (default Jakarta)
  
  let isAbsolute = false;
  let sensorStatus = 'loading'; // 'loading', 'active', 'unsupported', 'denied'
  let isIOS = false;
  let hasVibrated = false;

  // Manual Drag (for desktop or sensorless devices)
  let compassElement: HTMLDivElement;
  let isDragging = false;
  let dragStartAngle = 0;
  let baseRotation = 0;

  // Searchable City Selector Modal Fallback
  let isCityModalOpen = false;
  let citySearchQuery = '';



  // Online search state for all regions in Indonesia
  let searchResults: { name: string; lat: number; lng: number }[] = [];
  let isSearchingOnline = false;
  let searchTimeout: any;

  // Reactively trigger online search on input changes (debounce 600ms)
  $: if (citySearchQuery.trim().length >= 3) {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchOnline, 600);
  } else {
    searchResults = [];
  }

  async function searchOnline() {
    const q = citySearchQuery.trim();
    if (!q) return;
    try {
      isSearchingOnline = true;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=id&format=json&limit=5`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'id'
        }
      });
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      searchResults = data.map((item: any) => {
        const parts = item.display_name.split(', ');
        const name = parts.slice(0, 3).join(', '); // Clean display name
        return {
          name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      });
    } catch (e) {
      console.warn('Geocoding lookup failed:', e);
    } finally {
      isSearchingOnline = false;
    }
  }

  // Calculate Qibla Bearing and Distance
  function updateQiblaCalculations(lat: number, lng: number) {
    // Bearing math
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const mLatRad = MECCA_LAT * Math.PI / 180;
    const mLngRad = MECCA_LNG * Math.PI / 180;

    const dLng = mLngRad - lngRad;
    const y = Math.sin(dLng);
    const x = Math.cos(latRad) * Math.tan(mLatRad) - Math.sin(latRad) * Math.cos(dLng);

    let qiblaRad = Math.atan2(y, x);
    let qiblaDeg = qiblaRad * 180 / Math.PI;
    qiblaBearing = Math.round((qiblaDeg + 360) % 360);

    // Distance math (Haversine)
    const R = 6371; // Earth radius in km
    const dLat = (MECCA_LAT - lat) * Math.PI / 180;
    const dLon = (MECCA_LNG - lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(MECCA_LAT * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceToMecca = Math.round(R * c);
  }

  // Get GPS Location
  function requestLocation() {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
          cityName = 'Lokasi Saya (GPS)';
          locationSource = 'gps';
          locationSource = 'gps';
          updateQiblaCalculations(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          // Set to default Jakarta if GPS fails
          selectDefaultCity();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      selectDefaultCity();
    }
  }

  function selectDefaultCity() {
    latitude = -6.2088;
    longitude = 106.8456;
    cityName = 'Jakarta (Default)';
    locationSource = 'default';
    locationSource = 'default';
    updateQiblaCalculations(latitude, longitude);
  }

  function selectCity(city: { name: string; lat: number; lng: number }) {
    latitude = city.lat;
    longitude = city.lng;
    cityName = city.name;
    locationSource = 'city';
    isCityModalOpen = false;
    citySearchQuery = '';
    updateQiblaCalculations(latitude, longitude);
  }

  // Orientation Event Handlers
  function handleOrientation(event: DeviceOrientationEvent) {
    let alpha = event.alpha;
    let webkitHeading = (event as any).webkitCompassHeading;

    if (webkitHeading !== undefined) {
      heading = webkitHeading;
      isAbsolute = true;
      sensorStatus = 'active';
    } else if (event.absolute === true || (event as any).absolute) {
      if (alpha !== null) {
        heading = 360 - alpha;
        isAbsolute = true;
        sensorStatus = 'active';
      }
    } else {
      // Relative sensor
      if (alpha !== null) {
        heading = 360 - alpha;
        sensorStatus = 'active'; // treated as active, but may not be North-aligned
      }
    }
  }

  // iOS Specific Permission
  function requestCompassPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            sensorStatus = 'active';
            window.addEventListener('deviceorientation', handleOrientation);
          } else {
            sensorStatus = 'denied';
          }
        })
        .catch((err: any) => {
          console.error('Compass permission error:', err);
          sensorStatus = 'denied';
        });
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
      sensorStatus = 'active';
    }
  }

  // Drag listeners for manual rotate
  function onDragStart(e: MouseEvent | TouchEvent) {
    if (sensorStatus === 'active' && isAbsolute) return; // disable if compass sensor is working absolutely
    isDragging = true;
    const rect = compassElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartAngle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
    baseRotation = heading;
  }

  function onDragMove(e: MouseEvent | TouchEvent) {
    if (!isDragging) return;
    const rect = compassElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const currentAngle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
    const diff = currentAngle - dragStartAngle;
    heading = (baseRotation - diff + 360) % 360;
  }

  function onDragEnd() {
    isDragging = false;
  }

  // Reactive alignment calculation
  // diff is how far we are from the Qibla direction (0 meaning perfectly facing Qibla)
  $: diff = (qiblaBearing - heading + 180) % 360 - 180;
  $: isAligned = Math.abs(diff) <= 3;

  // Generate SVG path for the turning guide arc
  function getArcPath(diffVal: number) {
    if (Math.abs(diffVal) < 3) return '';
    const r = 78;
    const startAngle = -90; // Top pointer is at -90 degrees (facing straight up)
    const endAngle = diffVal - 90; // Qibla target angle relative to heading
    
    const rad = (deg: number) => deg * Math.PI / 180;
    const x1 = 100 + r * Math.cos(rad(startAngle));
    const y1 = 100 + r * Math.sin(rad(startAngle));
    const x2 = 100 + r * Math.cos(rad(endAngle));
    const y2 = 100 + r * Math.sin(rad(endAngle));
    
    const largeArcFlag = Math.abs(diffVal) > 180 ? 1 : 0;
    const sweepFlag = diffVal > 0 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${x2} ${y2}`;
  }

  // Haptic Feedback when aligned
  $: if (isAligned) {
    if (!hasVibrated) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
      hasVibrated = true;
    }
  } else {
    hasVibrated = false;
  }

  onMount(() => {
    requestLocation();
    
    // Check if device supports DeviceOrientation
    isIOS = typeof window !== 'undefined' && 
            typeof DeviceOrientationEvent !== 'undefined' && 
            typeof (DeviceOrientationEvent as any).requestPermission === 'function';

    if (isIOS) {
      sensorStatus = 'loading'; // Will prompt for iOS click
    } else {
      if (typeof window !== 'undefined' && 'ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
        sensorStatus = 'active';
      } else if (typeof window !== 'undefined' && 'ondeviceorientation' in window) {
        window.addEventListener('deviceorientation', handleOrientation);
        sensorStatus = 'active';
      } else {
        sensorStatus = 'unsupported';
      }
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    }
  });
</script>

<PageHeader title={$t('kiblat.arah_kiblat') || 'Arah Kiblat'} backText="Dashboard" />

<div class="space-y-6 pt-0 pb-12 max-w-xl mx-auto relative px-2 -mt-2">
  <!-- Subtle premium ambient glow background -->
  <div class="absolute -z-10 w-80 h-80 bg-indigo-500/10 blur-[120px] rounded-full top-[25%] left-1/2 -translate-x-1/2 pointer-events-none"></div>
  <div class="absolute -z-10 w-80 h-80 bg-emerald-500/5 blur-[120px] rounded-full top-[45%] left-1/2 -translate-x-1/2 pointer-events-none"></div>

  <!-- Redesigned Info Card (Glassmorphic Dark Emerald-Indigo Gradient) -->
  <Card class="bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-white border-slate-800/80 relative overflow-hidden shadow-xl p-5">
    <!-- SVG Connection Backdrop Graphic -->
    <div class="absolute inset-0 opacity-15 pointer-events-none">
      <svg viewBox="0 0 400 200" class="w-full h-full" preserveAspectRatio="none">
        <!-- Curved connection path from GPS to Kaaba -->
        <path d="M 50,150 Q 200,20 350,150" fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="4,4" />
        <circle cx="50" cy="150" r="4" fill="#60a5fa" />
        <circle cx="350" cy="150" r="6" fill="#10b981" />
        <!-- Concentric signal rings -->
        <circle cx="50" cy="150" r="10" fill="none" stroke="#60a5fa" stroke-width="0.5" stroke-dasharray="2,2" />
        <circle cx="350" cy="150" r="14" fill="none" stroke="#10b981" stroke-width="0.5" />
      </svg>
    </div>

    <!-- Decorative floating spinning compass in background -->
    <div class="absolute -right-8 -top-8 text-white/5 pointer-events-none">
      <Compass class="h-32 w-32 animate-spin" style="animation-duration: 60s" />
    </div>
    
    <div class="space-y-4 z-10 relative">
      <div class="flex items-start justify-between">
        <div class="space-y-1.5">
          <span class="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 shadow-soft-xs">
            <MapPin class="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{displayCityName}</span>
          </span>
          <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider pt-2">{$t('kiblat.jarak_ke_baitullah') || 'Jarak ke Baitullah'}</p>
          <div class="flex items-baseline gap-1.5">
            <h2 class="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-200">
              {formatNumberStr(distanceToMecca, $locale)}
            </h2>
            <span class="text-[10px] font-black text-emerald-300 uppercase tracking-widest">KM</span>
          </div>
        </div>
        
        <button 
          on:click={requestLocation} 
          class="bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all p-2 rounded-xl active:scale-95 flex items-center justify-center cursor-pointer shadow-soft-xs hover:border-white/20"
          title="Refresh lokasi GPS"
        >
          <RefreshCw class="h-4 w-4 text-slate-200" />
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-4 text-center text-xs border-t border-white/10">
        <div class="text-left">
          <span class="text-slate-400 font-bold block text-[9px] uppercase tracking-widest">{$t('kiblat.koordinat_saya') || 'Koordinat Saya'}</span>
          <span class="font-mono mt-0.5 block font-semibold text-slate-200">
            {#if latitude !== null && longitude !== null}
              {formatNumberStr(latitude.toFixed(4), $locale)}°, {formatNumberStr(longitude.toFixed(4), $locale)}°
            {:else}
              Mencari...
            {/if}
          </span>
        </div>
        <div class="text-right">
          <span class="text-slate-400 font-bold block text-[9px] uppercase tracking-widest">{$t('kiblat.sudut_kiblat') || 'Sudut Kiblat'}</span>
          <span class="font-mono mt-0.5 block font-black text-emerald-400 text-sm tracking-wide">
            {formatNumberStr(qiblaBearing, $locale)}° <span class="text-[9px] font-bold text-slate-300">{$t('kiblat.utara') || 'Utara'}</span>
          </span>
        </div>
      </div>
    </div>
  </Card>

  <!-- Compass Widget Card -->
  <Card class="bg-white/90 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md flex flex-col items-center py-8 relative overflow-hidden shadow-lg dark:shadow-none p-4">
    <!-- Pulse glow background overlay when aligned -->
    {#if isAligned}
      <div class="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent animate-pulse duration-1000 pointer-events-none z-0"></div>
    {/if}

    <!-- Aligned / Sighting status info -->
    <div class="mb-7 text-center z-10 w-full px-4">
      {#if isAligned}
        <div class="inline-flex flex-col items-center justify-center space-y-1">
          <div class="inline-flex items-center space-x-1.5 bg-emerald-500 text-white font-extrabold text-[10px] px-5 py-2 rounded-full shadow-lg shadow-emerald-500/20 border border-emerald-400 uppercase tracking-widest animate-pulse">
            <span class="inline-block">✨</span>
            <span>{$t('kiblat.kiblat_terbimbing') || 'Kiblat Terbimbing'}</span>
          </div>
          <p class="text-[10px] text-emerald-600 font-black mt-1.5">{$t('kiblat.sempurna_kiblat') || 'Sempurna! Sudut hadap ponsel Anda sudah tepat mengarah ke Ka\'bah'}</p>
        </div>
      {:else}
        <div class="inline-flex flex-col items-center justify-center space-y-1">
          <div class="inline-flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold text-[10px] px-4.5 py-1.5 rounded-full uppercase tracking-wider">
            <span>🧭</span>
            <span>{$t('kiblat.arahkan_ponsel') || 'Arahkan Ponsel'}</span>
          </div>
          <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1.5">
            {#if diff > 0}
              {$t('kiblat.putar_ke_kanan') || 'Putar ke kanan'} <span class="text-indigo-600 font-black font-mono">{formatNumberStr(Math.round(diff), $locale)}°</span> {$t('kiblat.lagi') || 'lagi'}
            {:else}
              {$t('kiblat.putar_ke_kiri') || 'Putar ke kiri'} <span class="text-indigo-600 font-black font-mono">{formatNumberStr(Math.round(Math.abs(diff)), $locale)}°</span> {$t('kiblat.lagi') || 'lagi'}
            {/if}
          </p>
        </div>
      {/if}
    </div>

    <!-- Compass Container -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      bind:this={compassElement}
      on:mousedown={onDragStart}
      on:touchstart|passive={onDragStart}
      on:mousemove={onDragMove}
      on:touchmove|passive={onDragMove}
      on:mouseup={onDragEnd}
      on:touchend={onDragEnd}
      class="relative w-72 h-72 mx-auto rounded-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 shadow-md dark:shadow-none flex items-center justify-center cursor-grab select-none z-10 transition-all duration-300
             {isAligned ? 'ring-10 ring-emerald-500/10 border-emerald-400 shadow-emerald-100/50' : 'active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-600'}"
    >
      <svg viewBox="0 0 200 200" class="w-full h-full p-1 drop-shadow-md">
        <!-- Definitions for styling gradients and filters -->
        <defs>
          <!-- Neon glows -->
          <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" flood-opacity="0.25" />
          </filter>

          <!-- Dial face gradient: deep space blue to slate-950 -->
          <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="70%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#020617" />
          </radialGradient>

          <!-- Kaaba Badge Gradient -->
          <radialGradient id="kaabaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#34d399" />
            <stop offset="60%" stop-color="#10b981" />
            <stop offset="100%" stop-color="#047857" />
          </radialGradient>

          <!-- Gold gradients for compass rose and borders -->
          <linearGradient id="gold1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#d97706" />
          </linearGradient>
          <linearGradient id="gold2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>

          <!-- Luxury gold bezel gradient -->
          <linearGradient id="bezelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="30%" stop-color="#fbbf24" />
            <stop offset="50%" stop-color="#fffbeb" />
            <stop offset="70%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#78350f" />
          </linearGradient>

          <!-- Arc gradient -->
          <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#6366f1" />
            <stop offset="100%" stop-color="#a855f7" />
          </linearGradient>
        </defs>

        <!-- Outer Luxury Bezel Rings (Gold & Silver) -->
        <circle cx="100" cy="100" r="97" fill="none" stroke="url(#bezelGrad)" stroke-width="1.5" />
        <circle cx="100" cy="100" r="95" fill="none" stroke="#e2e8f0" stroke-width="1" />
        <circle cx="100" cy="100" r="92" fill="url(#dialGrad)" stroke="#1e293b" stroke-width="1.5" filter="url(#shadow)" />
        <circle cx="100" cy="100" r="89" fill="none" stroke="url(#gold2)" stroke-width="0.5" opacity="0.3" />

        <!-- Celestial coordinate grid lines (astrolabe markings) -->
        <circle cx="100" cy="100" r="70" fill="none" stroke="url(#gold2)" stroke-width="0.25" opacity="0.12" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="url(#gold2)" stroke-width="0.25" opacity="0.12" />
        <line x1="100" y1="12" x2="100" y2="188" stroke="url(#gold2)" stroke-width="0.25" opacity="0.08" />
        <line x1="12" y1="100" x2="188" y2="100" stroke="url(#gold2)" stroke-width="0.25" opacity="0.08" />

        <!-- Rotating Dial Face (Rotates with -heading to point North) -->
        <g transform="rotate({-heading} 100 100)">
          <!-- Slow spinning geometric mandala behind the compass rose, fading in when aligned -->
          <g class="transition-opacity duration-700 {isAligned ? 'opacity-35' : 'opacity-0'}">
            <g class="animate-spin" style="animation-duration: 25s; transform-origin: 100px 100px;">
              <!-- 8-Pointed Star (Rub el Hizb) Islamic pattern -->
              <rect x="66" y="66" width="68" height="68" fill="none" stroke="url(#gold1)" stroke-width="0.5" transform="rotate(0 100 100)" />
              <rect x="66" y="66" width="68" height="68" fill="none" stroke="url(#gold1)" stroke-width="0.5" transform="rotate(45 100 100)" />
              <rect x="69" y="69" width="62" height="62" fill="none" stroke="url(#gold2)" stroke-width="0.3" stroke-dasharray="1,1" transform="rotate(15 100 100)" />
              <rect x="69" y="69" width="62" height="62" fill="none" stroke="url(#gold2)" stroke-width="0.3" stroke-dasharray="1,1" transform="rotate(60 100 100)" />
              
              <!-- Core mandala nested rings -->
              <circle cx="100" cy="100" r="39" fill="none" stroke="url(#gold1)" stroke-width="0.4" opacity="0.6" />
              <circle cx="100" cy="100" r="31" fill="none" stroke="url(#gold2)" stroke-width="0.4" stroke-dasharray="2,2" opacity="0.5" />
              
              <!-- Small glowing star dots -->
              {#each Array(8) as _, idx}
                <circle cx="100" cy="48" r="1.2" fill="#fbbf24" transform="rotate({idx * 45} 100 100)" />
              {/each}
            </g>
          </g>

          <!-- Fine Ticks (every 2 degrees) -->
          {#each Array(180) as _, i}
            {#if i % 15 !== 0 && i % 5 !== 0}
              <line 
                x1="100" y1="12" x2="100" y2="14" 
                stroke="#475569" stroke-width="0.5" 
                transform="rotate({i * 2} 100 100)"
              />
            {/if}
          {/each}

          <!-- Medium Ticks (every 10 degrees) -->
          {#each Array(36) as _, i}
            {#if i % 3 !== 0}
              <line 
                x1="100" y1="12" x2="100" y2="16" 
                stroke="#64748b" stroke-width="0.75" 
                transform="rotate({i * 10} 100 100)"
              />
            {/if}
          {/each}

          <!-- Major Ticks and Degree Labels (every 30 degrees) -->
          {#each Array(12) as _, i}
            <line 
              x1="100" y1="12" x2="100" y2="18.5" 
              stroke="url(#gold1)" stroke-width="1" 
              transform="rotate({i * 30} 100 100)"
            />
            
            {#if i * 30 !== 0 && i * 30 !== 90 && i * 30 !== 180 && i * 30 !== 270}
              <text 
                x="100" y="25.5" 
                font-size="4.5" font-weight="900" fill="#64748b" 
                text-anchor="middle"
                transform="rotate({i * 30} 100 100)"
              >
                {i * 30}
              </text>
            {/if}
          {/each}

          <!-- Cardinal Labels (Indonesian) -->
          <text x="100" y="24" font-size="10.5" font-weight="900" fill="#f43f5e" filter="url(#redGlow)" text-anchor="middle" transform="rotate(0 100 100)" style="user-select: none;">{$t('kiblat.utara') ? $t('kiblat.utara')[0].toUpperCase() : 'U'}</text>
          <text x="100" y="22.5" font-size="8.5" font-weight="900" fill="#cbd5e1" text-anchor="middle" transform="rotate(90 100 100)" style="user-select: none;">{$t('kiblat.timur') ? $t('kiblat.timur')[0].toUpperCase() : 'T'}</text>
          <text x="100" y="22.5" font-size="8.5" font-weight="900" fill="#cbd5e1" text-anchor="middle" transform="rotate(180 100 100)" style="user-select: none;">{$t('kiblat.selatan') ? $t('kiblat.selatan')[0].toUpperCase() : 'S'}</text>
          <text x="100" y="22.5" font-size="8.5" font-weight="900" fill="#cbd5e1" text-anchor="middle" transform="rotate(270 100 100)" style="user-select: none;">{$t('kiblat.barat') ? $t('kiblat.barat')[0].toUpperCase() : 'B'}</text>

          <!-- Elegant Gold 3D Compass Rose -->
          <g transform="translate(100, 100) scale(0.56)" opacity="0.8">
            <!-- N -->
            <polygon points="0,0 -6,-45 0,-50" fill="url(#gold1)" />
            <polygon points="0,0 6,-45 0,-50" fill="url(#gold2)" />
            <!-- S -->
            <polygon points="0,0 -6,45 0,50" fill="url(#gold2)" />
            <polygon points="0,0 6,45 0,50" fill="url(#gold1)" />
            <!-- E -->
            <polygon points="0,0 45,-6 50,0" fill="url(#gold1)" />
            <polygon points="0,0 45,6 50,0" fill="url(#gold2)" />
            <!-- W -->
            <polygon points="0,0 -45,-6 -50,0" fill="url(#gold2)" />
            <polygon points="0,0 -45,6 -50,0" fill="url(#gold1)" />
            
            <!-- NE -->
            <polygon points="0,0 23,-27 29,-30" fill="url(#gold2)" opacity="0.85" />
            <polygon points="0,0 27,-23 29,-30" fill="url(#gold1)" opacity="0.85" />
            <!-- NW -->
            <polygon points="0,0 -23,-27 -29,-30" fill="url(#gold1)" opacity="0.85" />
            <polygon points="0,0 -27,-23 -29,-30" fill="url(#gold2)" opacity="0.85" />
            <!-- SE -->
            <polygon points="0,0 23,29 29,30" fill="url(#gold1)" opacity="0.85" />
            <polygon points="0,0 27,23 29,30" fill="url(#gold2)" opacity="0.85" />
            <!-- SW -->
            <polygon points="0,0 -23,29 -29,30" fill="url(#gold2)" opacity="0.85" />
            <polygon points="0,0 -27,23 -29,30" fill="url(#gold1)" opacity="0.85" />
          </g>

          <!-- Qibla target needle inside the dial (Fixed at the calculated Qibla bearing) -->
          <g transform="rotate({qiblaBearing} 100 100)">
            <!-- Glow background line -->
            <line x1="100" y1="100" x2="100" y2="35" stroke="#10b981" stroke-width="4" stroke-linecap="round" opacity="0.3" filter="url(#emeraldGlow)" />
            <!-- Elegant golden needle pointer pointer arrow -->
            <polygon points="100,32 96,65 100,56 104,65" fill="url(#gold1)" stroke="url(#gold2)" stroke-width="0.5" />
            <!-- Line connecting center to pointer -->
            <line x1="100" y1="56" x2="100" y2="100" stroke="url(#gold1)" stroke-width="0.75" stroke-dasharray="2,2" />
            <!-- Emerald glowing core line -->
            <line x1="100" y1="56" x2="100" y2="100" stroke="#10b981" stroke-width="0.75" />
            
            <!-- Custom Vector 3D isometric Kaaba Marker -->
            <g transform="translate(100, 31)">
              <!-- Outer glowing aura ring -->
              <circle cx="0" cy="0" r="14" fill="url(#kaabaGlow)" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)" />
              <circle cx="0" cy="0" r="14" fill="none" stroke="#34d399" stroke-width="1" class="animate-ping opacity-75" />
              
              <!-- 3D Vector Isometric Kaaba drawing -->
              <g transform="translate(0, -1) scale(0.9)">
                <!-- Left Wall (Facing shade) -->
                <polygon points="-8,-3 0,1 0,8 -8,4" fill="#090d16" />
                <!-- Right Wall (Facing light) -->
                <polygon points="0,1 8,-3 8,4 0,8" fill="#1b2436" />
                <!-- Roof -->
                <polygon points="-8,-3 0,-7 8,-3 0,1" fill="#020611" />
                
                <!-- Gold Kiswah Band (Belt) -->
                <!-- Left Belt -->
                <polygon points="-8,-0.5 0,3.5 0,2.5 -8,-1.5" fill="url(#gold1)" />
                <!-- Right Belt -->
                <polygon points="0,3.5 8,-0.5 8,-1.5 0,2.5" fill="url(#gold1)" />
                
                <!-- Golden Door (Babut Taubah) on right wall -->
                <polygon points="2.5,3.1 5.5,1.6 5.5,6.1 2.5,7.6" fill="url(#gold2)" />
                <line x1="2.5" y1="3.1" x2="2.5" y2="7.6" stroke="#fbbf24" stroke-width="0.4" />
                <line x1="5.5" y1="1.6" x2="5.5" y2="6.1" stroke="#fbbf24" stroke-width="0.4" />
              </g>
            </g>
          </g>
        </g>

        <!-- Dynamic turning guide arc (Visible when NOT aligned) -->
        {#if !isAligned && Math.abs(diff) > 2}
          <path 
            d={getArcPath(diff)} 
            fill="none" 
            stroke="url(#arcGrad)" 
            stroke-width="3" 
            stroke-linecap="round"
            stroke-dasharray="4,3"
            opacity="0.8"
            class="animate-pulse"
          />
        {/if}

        <!-- Center Stationary Marker / Pivot (luxury brass pin) -->
        <circle cx="100" cy="100" r="8.5" fill="url(#gold1)" stroke="#ffffff" stroke-width="1" filter="url(#shadow)" />
        <circle cx="100" cy="100" r="5" fill="#0f172a" />
        <circle cx="100" cy="100" r="2.5" fill="url(#gold2)" />
        <circle cx="100" cy="100" r="1.2" fill="#ffffff" />

        <!-- Top Sighting Alignment Pointer (Precision red cursor triangle pointer) -->
        <g transform="translate(100, 4)" filter="url(#shadow)">
          <polygon points="0,6 -5,0 5,0" fill="#f43f5e" filter="url(#redGlow)" />
          <line x1="0" y1="0" x2="0" y2="18" stroke="#f43f5e" stroke-width="1" stroke-dasharray="3,1" opacity="0.8" />
        </g>
      </svg>
    </div>

    <!-- Centered Dashboard Degree counter details (Fulfills request #7 perfectly) -->
    <div class="mt-6 flex justify-center items-center gap-5 text-center z-10 w-full max-w-xs mx-auto px-1">
      <!-- Hadap Ponsel Counter -->
      <div class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-3 shadow-soft-xs relative overflow-hidden transition-all duration-300 {isAligned ? 'bg-emerald-50/20 border-emerald-100 ring-2 ring-emerald-500/10' : ''}">
        {#if isAligned}
          <div class="absolute -right-3 -top-3 w-8 h-8 bg-emerald-500/5 rounded-full pointer-events-none"></div>
        {/if}
        <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-widest leading-none">{$t('kiblat.hadap_ponsel') || 'Hadap Ponsel'}</span>
        <span class="font-mono text-2xl font-black text-slate-800 dark:text-slate-100 block mt-1.5 transition-colors duration-300 {isAligned ? 'text-emerald-600' : ''}">
          {formatNumberStr(Math.round(heading), $locale)}°
        </span>
      </div>
      
      <!-- Center Compass Icon separator -->
      <div class="flex-shrink-0 h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center shadow-soft-xs text-slate-400 dark:text-slate-500">
        <Compass class="h-4.5 w-4.5 animate-spin" style="animation-duration: 25s; animation-play-state: {isDragging ? 'running' : 'paused'}" />
      </div>

      <!-- Arah Ka'bah Target Counter -->
      <div class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 px-3 shadow-soft-xs relative overflow-hidden transition-all duration-300 {isAligned ? 'bg-emerald-50/20 border-emerald-100 ring-2 ring-emerald-500/10' : ''}">
        {#if isAligned}
          <div class="absolute -right-3 -top-3 w-8 h-8 bg-emerald-500/5 rounded-full pointer-events-none"></div>
        {/if}
        <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-widest leading-none">{$t('kiblat.arah_kabah') || 'Arah Ka\'bah'}</span>
        <span class="font-mono text-2xl font-black text-emerald-600 block mt-1.5">
          {formatNumberStr(qiblaBearing, $locale)}°
        </span>
      </div>
    </div>

    <!-- Manual City Selector Activation Button inside the main widget card -->
    <div class="w-full border-t border-slate-100 dark:border-slate-800 mt-6 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left z-10 px-2">
      <div class="space-y-0.5">
        <h4 class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">{$t('kiblat.lokasi_kurang_akurat') || 'Lokasi Kurang Akurat?'}</h4>
        <p class="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{$t('kiblat.gunakan_pilihan_kota') || 'Gunakan pilihan kota manual di seluruh Indonesia'}</p>
      </div>
      <Button 
        on:click={() => isCityModalOpen = true}
        variant="outline" 
        size="sm"
        class="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary hover:border-primary/20 hover:bg-slate-50 dark:hover:bg-slate-800 font-extrabold text-[10px] uppercase h-9 rounded-xl px-4 flex items-center gap-1.5 cursor-pointer shadow-soft-xs"
      >
        <Navigation class="h-3 w-3 shrink-0" />
        <span>{$t('kiblat.pilih_kota_manual') || 'Pilih Kota Manual'}</span>
      </Button>
    </div>
  </Card>

  <!-- iOS Permission Trigger Card -->
  {#if isIOS && sensorStatus === 'loading'}
    <Card class="bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-900/50 p-4.5 text-center space-y-3.5 shadow-md">
      <div class="flex justify-center text-amber-500">
        <Smartphone class="h-6.5 w-6.5 animate-bounce" />
      </div>
      <div class="space-y-1">
        <h3 class="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">{$t('kiblat.aktivasi_sensor') || 'Aktivasi Sensor Gerak Apple'}</h3>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          Perangkat Apple Safari/iOS memerlukan izin khusus agar kompas dapat memutar otomatis secara real-time saat Anda bergerak.
        </p>
      </div>
      <Button 
        on:click={requestCompassPermission} 
        size="sm" 
        class="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase h-9.5 shadow-md px-6 rounded-xl cursor-pointer"
      >
        Aktifkan Sensor HP
      </Button>
    </Card>
  {/if}

  <!-- Insecure Context Warning (HTTP on Mobile) -->
  {#if typeof window !== 'undefined' && !window.isSecureContext}
    <Card class="bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-900/50 p-4.5 text-center space-y-3 shadow-md">
      <div class="flex justify-center text-rose-500">
        <span class="text-2xl">⚠️</span>
      </div>
      <div class="space-y-1">
        <h3 class="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider text-rose-700">{$t('kiblat.koneksi_tidak_aman') || 'Koneksi Tidak Aman (HTTP)'}</h3>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
          Apple iOS (iPhone) memblokir akses sensor arah kompas pada koneksi <strong>HTTP biasa</strong>. Sensor hanya dapat aktif jika situs diakses melalui <strong>HTTPS (Koneksi Aman)</strong>. Silakan deploy situs ke hosting HTTPS (seperti Supabase/Vercel) untuk mencoba sensor otomatis.
        </p>
      </div>
    </Card>
  {/if}

  <!-- Instruction list formatted as modern step cards -->
  <div class="space-y-3">
    <div class="flex items-center space-x-2 px-1">
      <Info class="h-4 w-4 text-emerald-500" />
      <h3 class="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">{$t('kiblat.panduan_sighting') || 'Panduan Sighting Arah'}</h3>
    </div>

    <div class="grid grid-cols-1 gap-2.5">
      {#each [
        { step: '1', title: $t('kiblat.posisikan_hp') || 'Posisikan HP Mendatar', desc: $t('kiblat.posisikan_hp_desc') || 'Taruh ponsel Anda mendatar sejajar dengan dada untuk hasil sensor magnetometer yang maksimal.' },
        { step: '2', title: $t('kiblat.jauhi_gangguan') || 'Jauhi Gangguan Elektromagnetik', desc: $t('kiblat.jauhi_gangguan_desc') || 'Hindari meletakkan HP di dekat benda logam, magnet, speaker besar, atau laptop karena dapat mengacaukan sensor.' },
        { step: '3', title: $t('kiblat.sesuaikan_dial') || 'Sesuaikan Dial Manual', desc: $t('kiblat.sesuaikan_dial_desc') || 'Jika sensor HP Anda mati/tidak didukung, geser dial kompas di layar secara manual memakai jari Anda.' },
        { step: '4', title: $t('kiblat.hadapkan_ujung') || 'Hadapkan Ujung Atas HP', desc: $t('kiblat.hadapkan_ujung_desc') || 'Putar badan Anda sampai jarum Kaaba selaras dengan garis penunjuk merah di atas (Glow Hijau menyala).' }
      ] as item}
        <div class="bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-4 flex gap-3.5 items-center hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-300 shadow-soft-xs dark:shadow-none">
          <div class="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-extrabold text-xs flex items-center justify-center text-center leading-none shadow-emerald-100/50 shadow-md">
            {item.step}
          </div>
          <div class="space-y-0.5">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</h4>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">{item.desc}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Slide-Up Premium Bottom Sheet / Modal for manual region selection -->
{#if isCityModalOpen}
  <div 
    class="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
    transition:fade={{ duration: 150 }}
  >
    <!-- Backdrop overlay -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div 
      class="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
      on:click={() => isCityModalOpen = false}
    ></div>

    <!-- Modal Drawer Sheet -->
    <div 
      class="relative w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-2xl shadow-2xl overflow-hidden border-t sm:border border-slate-100 flex flex-col max-h-[85vh] sm:max-h-[75vh] z-10"
      transition:fly={{ y: 250, duration: 250 }}
    >
      <!-- Drag Handle for Mobile view -->
      <div class="flex justify-center py-3.5 sm:hidden">
        <div class="w-12 h-1 bg-slate-200 rounded-full"></div>
      </div>

      <!-- Modal Header -->
      <div class="px-5 pt-2 pb-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 class="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Pilih Daerah Indonesia</h2>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Cari kelurahan, kecamatan, atau kota di Indonesia secara manual</p>
        </div>
        <button 
          on:click={() => isCityModalOpen = false}
          class="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X class="h-4.5 w-4.5" />
        </button>
      </div>

      <!-- Search Input -->
      <div class="p-5 pb-0">
        <div class="relative">
          <input 
            type="text" 
            bind:value={citySearchQuery} 
            placeholder="Ketik kelurahan, kecamatan, kota, atau kabupaten..." 
            class="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 rounded-xl py-2.5 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-semibold"
          />
          <Search class="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      <!-- Scrollable Region list -->
      <div class="px-5 pb-5 flex-1 overflow-y-auto max-h-72 custom-scrollbar space-y-2 mt-3">
        <div class="divide-y divide-slate-100">
          <!-- Search loading indicator -->
          {#if isSearchingOnline}
            <div class="text-center py-8 text-xs text-slate-400 font-semibold flex items-center justify-center gap-2">
              <span class="animate-spin text-sm">🔄</span>
              <span>Mencari data wilayah online...</span>
            </div>
          {/if}

          <!-- Online search results -->
          {#if searchResults.length > 0}
            <div class="pb-2">
              <div class="px-2.5 py-1 text-[9px] font-black text-primary bg-primary/5 rounded-md uppercase tracking-wider block mb-1.5">Hasil Wilayah di Indonesia</div>
              {#each searchResults as result}
                <button 
                  on:click={() => selectCity(result)}
                  class="w-full text-left py-2.5 px-3 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors flex justify-between items-center cursor-pointer font-bold border border-transparent hover:border-slate-100"
                >
                  <div class="flex items-center gap-2 truncate">
                    <MapPin class="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span class="truncate pr-2">{result.name}</span>
                  </div>
                  <span class="text-[9px] font-black text-slate-400 font-mono shrink-0">{result.lat.toFixed(2)}°, {result.lng.toFixed(2)}°</span>
                </button>
              {/each}
            </div>
          {/if}

          <!-- Initial guidance state -->
          {#if !citySearchQuery && !isSearchingOnline && searchResults.length === 0}
            <div class="text-center py-10 px-4 text-xs text-slate-400 font-semibold space-y-3 flex flex-col items-center">
              <div class="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shadow-soft-xs border border-slate-100">
                <Search class="h-4.5 w-4.5 text-slate-400 stroke-[2]" />
              </div>
              <div class="space-y-1">
                <span class="text-slate-600 font-bold block">Mulai Mencari</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-relaxed max-w-[240px] block">
                  Ketik nama kelurahan, kecamatan, kota, atau kabupaten di Indonesia untuk mencari koordinat otomatis secara online.
                </span>
              </div>
            </div>
          {/if}

          <!-- Empty search state -->
          {#if citySearchQuery && searchResults.length === 0 && !isSearchingOnline}
            <div class="text-center py-10 px-4 text-xs text-slate-400 font-semibold space-y-3 flex flex-col items-center">
              <div class="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shadow-soft-xs border border-slate-100">
                <MapPin class="h-4.5 w-4.5 text-slate-400 stroke-[2]" />
              </div>
              <div class="space-y-1">
                <span class="text-slate-600 font-bold block">Daerah Tidak Ditemukan</span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-relaxed max-w-[240px] block">
                  Tidak dapat menemukan "{citySearchQuery}". Coba ketik nama kelurahan atau kecamatan yang lain.
                </span>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
