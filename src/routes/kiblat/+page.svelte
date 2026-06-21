<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import Card from '$lib/components/ui/card.svelte';
  import Button from '$lib/components/ui/button.svelte';
  import { ArrowLeft, Compass, MapPin, RefreshCw, Smartphone } from 'lucide-svelte';

  // Mecca Coordinates
  const MECCA_LAT = 21.4225;
  const MECCA_LNG = 39.8262;

  // State
  let latitude: number | null = null;
  let longitude: number | null = null;
  let cityName = 'Mencari lokasi...';
  let locationSource: 'gps' | 'city' | 'default' = 'default';
  
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

  // Searchable City Selector Fallback
  let isCityDropdownOpen = false;
  let citySearchQuery = '';

  const fallbackCities = [
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
    { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
    { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
    { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { name: 'Medan', lat: 3.5952, lng: 98.6722 },
    { name: 'Makassar', lat: -5.1477, lng: 119.4327 },
    { name: 'Semarang', lat: -6.9667, lng: 110.4167 },
    { name: 'Palembang', lat: -2.9761, lng: 104.7754 },
    { name: 'Denpasar', lat: -8.6705, lng: 115.2126 },
    { name: 'Jayapura', lat: -2.5916, lng: 140.7178 },
    { name: 'Banda Aceh', lat: 5.5483, lng: 95.3238 },
    { name: 'Pontianak', lat: -0.0263, lng: 109.3425 },
    { name: 'Banjarmasin', lat: -3.3167, lng: 114.5900 },
    { name: 'Ambon', lat: -3.6954, lng: 128.1814 }
  ];

  $: filteredCities = fallbackCities.filter(c => 
    c.name.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

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
    updateQiblaCalculations(latitude, longitude);
  }

  function selectCity(city: typeof fallbackCities[0]) {
    latitude = city.lat;
    longitude = city.lng;
    cityName = city.name;
    locationSource = 'city';
    isCityDropdownOpen = false;
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
  async function requestCompassPermission() {
    if (isIOS && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          sensorStatus = 'active';
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          sensorStatus = 'denied';
        }
      } catch (err) {
        console.error('Compass permission error:', err);
        sensorStatus = 'denied';
      }
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

  function clickOutsideDropdown(event: MouseEvent) {
    const container = document.getElementById('city-selector');
    if (container && !container.contains(event.target as Node)) {
      isCityDropdownOpen = false;
    }
  }
</script>

<svelte:window on:click={clickOutsideDropdown} />

<div class="space-y-6 pb-12 max-w-xl mx-auto">
  <!-- Header Bar -->
  <div class="flex items-center justify-between">
    <a href="/" class="inline-flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold">
      <ArrowLeft class="h-4.5 w-4.5" />
      <span>Kembali</span>
    </a>
    <h1 class="text-base font-bold text-slate-800 uppercase tracking-wider">Arah Kiblat</h1>
    <div class="w-10"></div> <!-- spacing balance -->
  </div>

  <!-- Intro info card -->
  <Card class="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border-indigo-900/40 relative overflow-hidden shadow-soft-md">
    <div class="absolute -right-6 -top-6 text-indigo-500 opacity-20 pointer-events-none">
      <Compass class="h-28 w-28 animate-spin" style="animation-duration: 30s" />
    </div>
    
    <div class="space-y-3 z-10 relative">
      <div class="flex items-center justify-between">
        <span class="bg-indigo-500/20 border border-indigo-400/25 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-indigo-300">
          📍 {cityName}
        </span>
        <button 
          on:click={requestLocation} 
          class="text-white/60 hover:text-white transition-colors"
          title="Refresh lokasi GPS"
        >
          <RefreshCw class="h-4 w-4" />
        </button>
      </div>

      <div class="space-y-1">
        <p class="text-xs text-indigo-200/80 font-medium">Jarak ke Baitullah (Ka'bah)</p>
        <h2 class="text-2xl font-black tracking-tight">{distanceToMecca.toLocaleString('id-ID')} <span class="text-sm font-bold">KM</span></h2>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-2 text-center text-xs border-t border-white/10">
        <div>
          <span class="text-indigo-300/80 font-bold block text-[10px] uppercase">Koordinat Lokasi</span>
          <span class="font-mono mt-0.5 block">
            {#if latitude !== null && longitude !== null}
              {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
            {:else}
              Mencari...
            {/if}
          </span>
        </div>
        <div>
          <span class="text-indigo-300/80 font-bold block text-[10px] uppercase">Sudut Kiblat</span>
          <span class="font-mono mt-0.5 block font-bold text-emerald-400">{qiblaBearing}° dari Utara</span>
        </div>
      </div>
    </div>
  </Card>

  <!-- Compass Widget -->
  <Card class="bg-slate-50 border-slate-200/50 flex flex-col items-center py-8 relative overflow-hidden shadow-soft-sm">
    {#if isAligned}
      <div class="absolute inset-0 bg-emerald-500/5 animate-pulse duration-1000 pointer-events-none z-0"></div>
    {/if}

    <!-- Aligned / Rotating status info -->
    <div class="mb-6 text-center z-10">
      {#if isAligned}
        <div class="animate-bounce inline-flex items-center space-x-1.5 bg-emerald-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg border border-emerald-400 uppercase tracking-widest">
          <span>✨</span>
          <span>Searah dengan Kiblat</span>
        </div>
        <p class="text-[10px] text-emerald-600 font-extrabold mt-1">Sudut hadap Anda sudah tepat ke arah Ka'bah</p>
      {:else}
        <div class="inline-flex items-center space-x-1.5 bg-slate-200/80 border border-slate-300/50 text-slate-600 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
          <span>🧭</span>
          <span>Putar HP / Kompas</span>
        </div>
        <p class="text-[10px] text-slate-400 font-bold mt-1">
          {#if diff > 0}
            Putar ke kanan {Math.round(diff)}° lagi
          {:else}
            Putar ke kiri {Math.round(Math.abs(diff))}° lagi
          {/if}
        </p>
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
      class="relative w-72 h-72 rounded-full bg-white border border-slate-200/80 shadow-md flex items-center justify-center cursor-grab select-none z-10 transition-all duration-300
             {isAligned ? 'ring-8 ring-emerald-500/25 border-emerald-400 shadow-emerald-100/50' : 'active:cursor-grabbing hover:border-slate-350'}"
    >
      <svg viewBox="0 0 200 200" class="w-full h-full p-2">
        <!-- Definitions for styling gradients and filters -->
        <defs>
          <radialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="100%" stop-color="#f8fafc" stop-opacity="1" />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15" />
          </filter>
        </defs>

        <!-- Outer Ring -->
        <circle cx="100" cy="100" r="92" fill="url(#compassGlow)" stroke="#cbd5e1" stroke-width="1.5" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="#e2e8f0" stroke-width="0.75" stroke-dasharray="2,3" />

        <!-- Rotating Dial Face (Rotates with -heading to point North) -->
        <g transform="rotate({-heading} 100 100)">
          <!-- Fine Ticks (every 2 degrees) -->
          {#each Array(180) as _, i}
            {#if i % 15 !== 0 && i % 5 !== 0}
              <line 
                x1="100" y1="11" x2="100" y2="14" 
                stroke="#e2e8f0" stroke-width="0.5" 
                transform="rotate({i * 2} 100 100)"
              />
            {/if}
          {/each}

          <!-- Medium Ticks (every 10 degrees) -->
          {#each Array(36) as _, i}
            {#if i % 3 !== 0}
              <line 
                x1="100" y1="11" x2="100" y2="16" 
                stroke="#cbd5e1" stroke-width="0.75" 
                transform="rotate({i * 10} 100 100)"
              />
            {/if}
          {/each}

          <!-- Major Ticks and Degree Labels (every 30 degrees) -->
          {#each Array(12) as _, i}
            <line 
              x1="100" y1="11" x2="100" y2="19" 
              stroke="#64748b" stroke-width="1.5" 
              transform="rotate({i * 30} 100 100)"
            />
            
            {#if i * 30 !== 0 && i * 30 !== 90 && i * 30 !== 180 && i * 30 !== 270}
              <text 
                x="100" y="27" 
                font-size="6" font-weight="900" fill="#94a3b8" 
                text-anchor="middle"
                transform="rotate({i * 30} 100 100)"
              >
                {i * 30}
              </text>
            {/if}
          {/each}

          <!-- Cardinal Labels -->
          <text x="100" y="24" font-size="11" font-weight="900" fill="#ef4444" text-anchor="middle" transform="rotate(0 100 100)" style="user-select: none;">U</text>
          <text x="100" y="23" font-size="10" font-weight="900" fill="#334155" text-anchor="middle" transform="rotate(90 100 100)" style="user-select: none;">T</text>
          <text x="100" y="23" font-size="10" font-weight="900" fill="#334155" text-anchor="middle" transform="rotate(180 100 100)" style="user-select: none;">S</text>
          <text x="100" y="23" font-size="10" font-weight="900" fill="#334155" text-anchor="middle" transform="rotate(270 100 100)" style="user-select: none;">B</text>

          <!-- Shaded 3D Compass Rose -->
          <g transform="translate(100, 100) scale(0.62)" opacity="0.35">
            <!-- N / S -->
            <polygon points="0,0 -8,-45 0,-50" fill="#475569" />
            <polygon points="0,0 8,-45 0,-50" fill="#64748b" />
            <polygon points="0,0 -8,45 0,50" fill="#64748b" />
            <polygon points="0,0 8,45 0,50" fill="#475569" />
            <!-- E / W -->
            <polygon points="0,0 45,-8 50,0" fill="#475569" />
            <polygon points="0,0 45,8 50,0" fill="#64748b" />
            <polygon points="0,0 -45,-8 -50,0" fill="#64748b" />
            <polygon points="0,0 -45,8 -50,0" fill="#475569" />
            <!-- NE / NW / SE / SW -->
            <polygon points="0,0 25,-29 32,-32" fill="#94a3b8" />
            <polygon points="0,0 29,-25 32,-32" fill="#cbd5e1" />
            <polygon points="0,0 -25,-29 -32,-32" fill="#cbd5e1" />
            <polygon points="0,0 -29,-25 -32,-32" fill="#94a3b8" />
            <polygon points="0,0 25,29 32,32" fill="#cbd5e1" />
            <polygon points="0,0 29,25 32,32" fill="#94a3b8" />
            <polygon points="0,0 -25,29 -32,32" fill="#94a3b8" />
            <polygon points="0,0 -29,25 -32,32" fill="#cbd5e1" />
          </g>

          <!-- Qibla target needle inside the dial (Fixed at the calculated Qibla bearing) -->
          <g transform="rotate({qiblaBearing} 100 100)">
            <!-- Glow background line -->
            <line x1="100" y1="100" x2="100" y2="33" stroke="#10b981" stroke-width="4.5" stroke-linecap="round" opacity="0.3" />
            <line x1="100" y1="100" x2="100" y2="33" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" />
            
            <!-- Kaaba Symbol Marker -->
            <g transform="translate(100, 31)">
              <circle cx="0" cy="0" r="11" fill="#10b981" stroke="#ffffff" stroke-width="2" filter="url(#shadow)" />
              <text x="0" y="3" font-size="9" text-anchor="middle" fill="#ffffff" style="user-select: none;">🕋</text>
            </g>
          </g>
        </g>

        <!-- STATIONARY ELEMENTS (Overlaid on top, do not rotate with dial) -->

        <!-- Dynamic turning guide arc -->
        {#if !isAligned && Math.abs(diff) > 2}
          <path 
            d={getArcPath(diff)} 
            fill="none" 
            stroke={isAligned ? '#10b981' : '#6366f1'} 
            stroke-width="3" 
            stroke-linecap="round"
            stroke-dasharray="2,3"
            opacity="0.8"
            class="animate-pulse"
          />
        {/if}

        <!-- Center Stationary Marker / Pivot -->
        <circle cx="100" cy="100" r="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#shadow)" />
        <circle cx="100" cy="100" r="3.5" fill="#3b82f6" />

        <!-- Top Red Pointer Triangle indicating device orientation (front of user) -->
        <g transform="translate(100, 8)" filter="url(#shadow)">
          <polygon points="0,0 -6,-10 6,-10" fill="#ef4444" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,1" />
        </g>
      </svg>
    </div>

    <!-- Direction details -->

    <div class="mt-6 flex gap-6 text-center text-xs font-bold text-slate-500 z-10">
      <div>
        <span class="text-[9px] font-black text-slate-400 block uppercase">Hadap Ponsel</span>
        <span class="font-mono text-sm text-slate-700">{Math.round(heading)}°</span>
      </div>
      <div class="w-px bg-slate-200"></div>
      <div>
        <span class="text-[9px] font-black text-slate-400 block uppercase">Arah Ka'bah</span>
        <span class="font-mono text-sm text-emerald-600">{qiblaBearing}°</span>
      </div>
    </div>
  </Card>

  <!-- iOS Permission Trigger / Sensor status info -->
  {#if isIOS && sensorStatus === 'loading'}
    <Card class="bg-amber-50/70 border-amber-200/50 p-4 text-center space-y-3 shadow-soft-xs">
      <div class="flex justify-center text-amber-500">
        <Smartphone class="h-6 w-6" />
      </div>
      <div class="space-y-1">
        <h3 class="text-xs font-black text-slate-800 uppercase tracking-wider">Aktivasi Kompas Otomatis</h3>
        <p class="text-[10px] text-slate-500 leading-relaxed font-normal">
          Perangkat Apple iOS memerlukan izin akses sensor gerakan untuk memutar kompas secara otomatis saat Anda berputar.
        </p>
      </div>
      <Button 
        on:click={requestCompassPermission} 
        size="sm" 
        class="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] uppercase h-9 shadow-soft-sm px-6"
      >
        Aktifkan Sensor HP
      </Button>
    </Card>
  {/if}

  <!-- Selection city fallback for users with issues -->
  <div class="relative" id="city-selector">
    <div class="flex items-center justify-between px-1">
      <span class="text-xs text-slate-400 font-bold">Punya masalah sensor?</span>
      <button 
        on:click|stopPropagation={() => isCityDropdownOpen = !isCityDropdownOpen}
        class="text-xs font-bold text-primary hover:underline focus:outline-none cursor-pointer"
      >
        Pilih Kota Manual &rarr;
      </button>
    </div>

    {#if isCityDropdownOpen}
      <div 
        class="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 p-3 space-y-2 origin-bottom animate-in fade-in-50 slide-in-from-bottom-2 duration-150"
      >
        <div class="relative">
          <input 
            type="text" 
            bind:value={citySearchQuery} 
            placeholder="Cari kota terdekat..." 
            class="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 rounded-xl py-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
            on:click|stopPropagation={() => {}}
          />
          <svg class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="max-h-40 overflow-y-auto divide-y divide-slate-100 pr-1 custom-scrollbar">
          {#each filteredCities as city}
            <button 
              on:click={() => selectCity(city)}
              class="w-full text-left py-2 px-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-primary rounded-lg transition-colors flex justify-between items-center cursor-pointer font-bold"
            >
              <span>{city.name}</span>
              <span class="text-[9px] font-black text-slate-400 font-mono">{city.lat.toFixed(1)}°, {city.lng.toFixed(1)}°</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Instruction card -->
  <Card class="bg-white border-slate-200/50 p-5 space-y-3.5 shadow-soft-sm">
    <div class="flex items-center space-x-2 text-slate-800">
      <MapPin class="h-4.5 w-4.5 text-primary" />
      <h3 class="text-xs font-black uppercase tracking-wider">Panduan Kompas Kiblat</h3>
    </div>
    
    <ul class="space-y-2 text-xs text-slate-500 leading-relaxed font-normal list-decimal list-inside pl-1">
      <li>Posisikan ponsel Anda dalam keadaan mendatar (horizontal) sejajar dengan dada.</li>
      <li>Jauhkan HP dari benda logam, perangkat elektronik lain, atau magnet karena dapat mengganggu kalibrasi sensor kompas.</li>
      <li>Jika kompas tidak merespon gerakan Anda, putar kompas secara manual dengan menyeret/drag dial kompas menggunakan jari atau klik pilihan <strong>Pilih Kota Manual</strong>.</li>
      <li>Jika Anda menggunakan iPhone, tekan tombol <strong>Aktifkan Sensor HP</strong> di atas agar kompas dapat memutar otomatis secara real-time.</li>
    </ul>
  </Card>
</div>
