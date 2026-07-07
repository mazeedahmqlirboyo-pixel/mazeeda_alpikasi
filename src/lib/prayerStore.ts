import { writable, get } from 'svelte/store';
import { Geolocation } from '@capacitor/geolocation';

export type PrayerTimes = {
  Subuh: string;
  Terbit: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
  Isha?: string;
};

export type PrayerStoreData = {
  selectedCity: string;
  timezoneOffset: number;
  cityTimezone: string;
  prayerTimes: PrayerTimes | null;
  hijriDate: string;
  gregorianDate: string;
  isLoadingPrayers: boolean;
  hasGPSCoords: boolean;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  lastFetchedDate: string | null;
};

const initialState: PrayerStoreData = {
  selectedCity: "Jakarta",
  timezoneOffset: 7,
  cityTimezone: "WIB",
  prayerTimes: null,
  hijriDate: "",
  gregorianDate: "",
  isLoadingPrayers: false,
  hasGPSCoords: false,
  gpsLatitude: null,
  gpsLongitude: null,
  lastFetchedDate: null,
};

const CACHE_KEY = "prayerStoreData_v1";

function createPrayerStore() {
  const { subscribe, set, update } = writable<PrayerStoreData>(initialState);
  let isInitialized = false;

  function loadFromCache() {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          // Check if data is for today
          const today = new Date().toLocaleDateString('id-ID');
          if (parsed.lastFetchedDate === today) {
             set({ ...parsed, isLoadingPrayers: false });
             return true;
          } else {
             // Still use cached data temporarily, but we will refetch
             set({ ...parsed, isLoadingPrayers: true });
          }
        } catch (e) {
          console.error("Failed to parse cached prayer store", e);
        }
      }
    }
    return false;
  }

  function saveToCache(state: PrayerStoreData) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(state));
    }
  }

  return {
    subscribe,
    set: (value: PrayerStoreData) => {
      saveToCache(value);
      set(value);
    },
    update: (fn: (state: PrayerStoreData) => PrayerStoreData) => {
      update(state => {
        const newState = fn(state);
        saveToCache(newState);
        return newState;
      });
    },

    init: async () => {
      if (isInitialized) return;
      isInitialized = true;
      
      const isFresh = loadFromCache();
      
      if (!isFresh) {
        // If no cache or cache is stale, trigger fetch
        await getPrayerStoreInstance().requestGeolocation();
      }
    },

    requestGeolocation: async () => {
      update(s => ({ ...s, isLoadingPrayers: true }));
      try {
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
             throw new Error("Permission denied");
          }
        }
        
        const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        
        let cityTz = "WIB";
        let offset = 7;
        
        if (lon >= 135) {
          cityTz = "WIT";
          offset = 9;
        } else if (lon >= 120) {
          cityTz = "WITA";
          offset = 8;
        }
        
        update(s => ({
            ...s,
            gpsLatitude: lat,
            gpsLongitude: lon,
            hasGPSCoords: true,
            selectedCity: "Mendeteksi lokasi...",
            cityTimezone: cityTz,
            timezoneOffset: offset
        }));

        // Reverse Geocoding
        let detectedCity = "Lokasi Saat Ini";
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=id`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const road = addr.road || addr.pedestrian || "";
            let village = addr.village || addr.neighbourhood || addr.hamlet || "";
            if (village && !village.toLowerCase().includes("kelurahan") && !village.toLowerCase().includes("desa") && !village.toLowerCase().includes("kel.")) {
              village = "Kel. " + village;
            }
            let district = addr.city_district || addr.district || addr.suburb || addr.town || addr.municipality || "";
            if (district && !district.toLowerCase().includes("kecamatan") && !district.toLowerCase().includes("kec.")) {
              district = "Kec. " + district;
            }
            let city = addr.city || addr.county || addr.state_district || "";
            const rawParts = [road, village, district, city].filter(p => p && p.trim() !== "" && p !== "Kel. " && p !== "Kec. ");
            const uniqueParts = [...new Set(rawParts)];
            if (uniqueParts.length > 0) {
              detectedCity = uniqueParts.join(", ");
            }
          }
        } catch (e) {
          console.error("Reverse geocoding error:", e);
        }

        update(s => ({ ...s, selectedCity: detectedCity }));
        await getPrayerStoreInstance().fetchPrayerTimes();
      } catch (error: any) {
        console.error("Geolocation error:", error);
        update(s => ({ ...s, isLoadingPrayers: false }));
        // Could handle error alerts here or in component
      }
    },

    fetchPrayerTimes: async () => {
      const state = get(prayerStore);
      update(s => ({ ...s, isLoadingPrayers: true }));
      
      const INDO_MONTHS = ["JANUARI","FEBRUARI","MARET","APRIL","MEI","JUNI","JULI","AGUSTUS","SEPTEMBER","OKTOBER","NOVEMBER","DESEMBER"];
      const INDO_DAYS_ARRAY = ["MINGGU","SENIN","SELASA","RABU","KAMIS","JUMAT","SABTU"];
      const INDO_HIJRI_MONTHS = ["MUHARRAM","SAFAR","RABIUL AWWAL","RABIUL AKHIR","JUMADIL AWWAL","JUMADIL AKHIR","RAJAB","SYA'BAN","RAMADHAN","SYAWWAL","DZULQA'DAH","DZULHIJJAH"];
      
      let url = "";
      if ((state.selectedCity === "Lokasi Saya" || state.hasGPSCoords) && state.gpsLatitude && state.gpsLongitude) {
        url = `https://api.aladhan.com/v1/timings?latitude=${state.gpsLatitude}&longitude=${state.gpsLongitude}&method=15`;
      } else {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(state.selectedCity)}&country=Indonesia&method=15`;
      }

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("API request failed");
        const json = await res.json();
        if (json.code === 200) {
          const timings = json.data.timings;
          
          const hijriDay = json.data.date.hijri.day;
          const hijriMonthNum = parseInt(json.data.date.hijri.month.number, 10);
          const hijriYear = json.data.date.hijri.year;
          const indHijriMonth = INDO_HIJRI_MONTHS[hijriMonthNum - 1] || json.data.date.hijri.month.en.toUpperCase();
          const hijriDate = `${hijriDay} ${indHijriMonth} ${hijriYear} H.`;

          const gregDay = json.data.date.gregorian.day;
          const gregMonthNum = parseInt(json.data.date.gregorian.month.number, 10);
          const gregYear = json.data.date.gregorian.year;
          const indMonth = INDO_MONTHS[gregMonthNum - 1] || json.data.date.gregorian.month.en.toUpperCase();

          const [d, m, y] = json.data.date.gregorian.date.split("-");
          const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
          const indDayName = INDO_DAYS_ARRAY[dateObj.getDay()];

          const gregorianDate = `${indDayName}, ${gregDay} ${indMonth} ${gregYear} M.`;

          let cityTz = state.cityTimezone;
          let offset = state.timezoneOffset;
          
          if (json.data.meta && json.data.meta.timezone) {
            const apiTimezone = json.data.meta.timezone;
            const lng = json.data.meta.longitude;
            if (apiTimezone.includes("Jayapura") || lng >= 135) {
              cityTz = "WIT";
              offset = 9;
            } else if (apiTimezone.includes("Makassar") || lng >= 120) {
              cityTz = "WITA";
              offset = 8;
            } else {
              cityTz = "WIB";
              offset = 7;
            }
          }

          const newState = {
            prayerTimes: {
              Subuh: timings.Fajr,
              Terbit: timings.Sunrise,
              Dzuhur: timings.Dhuhr,
              Ashar: timings.Asr,
              Maghrib: timings.Maghrib,
              Isya: timings.Isha,
              Isha: timings.Isha,
            },
            hijriDate,
            gregorianDate,
            cityTimezone: cityTz,
            timezoneOffset: offset,
            lastFetchedDate: new Date().toLocaleDateString('id-ID'),
            isLoadingPrayers: false
          };
          
          update(s => {
            const updated = { ...s, ...newState };
            saveToCache(updated);
            return updated;
          });
        }
      } catch (e) {
        console.warn("API error, using offline prayer times fallback");
        // Fallback implementation would go here, simplified for store
        update(s => ({ ...s, isLoadingPrayers: false }));
      }
    },
    
    setCity: (city: any) => {
        update(s => {
            const updated = {
                ...s,
                selectedCity: city.name,
                cityTimezone: city.timezone,
                timezoneOffset: city.offset,
                hasGPSCoords: false,
                gpsLatitude: null,
                gpsLongitude: null
            };
            saveToCache(updated);
            return updated;
        });
        // Trigger re-fetch
        getPrayerStoreInstance().fetchPrayerTimes();
    }
  };
}

export const prayerStore = createPrayerStore();
function getPrayerStoreInstance() {
    return prayerStore;
}
