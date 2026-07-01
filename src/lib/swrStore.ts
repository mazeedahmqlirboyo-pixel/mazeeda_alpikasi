import { writable } from 'svelte/store';

/**
 * Custom SWR (Stale-While-Revalidate) store using Local Storage
 * @param key - Unique key for localStorage
 * @param fetchFunction - Function returning a promise that fetches fresh data
 * @param initialDefault - Default value if no cache exists
 */
export function createSWRStore<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    initialDefault: T | null = null
) {
    let initialData: T | null = initialDefault;
    
    // 1. Load stale data from cache if available (Client side only)
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(`swr-${key}`);
        if (cached) {
            try {
                initialData = JSON.parse(cached);
            } catch (e) {
                console.error(`Failed to parse cache for swr-${key}`, e);
            }
        }
    }

    // 2. Initialize store
    const { subscribe, set, update } = writable<T | null>(initialData);

    let isFetching = false;

    // 3. Revalidate function to fetch fresh data
    const revalidate = async () => {
        if (typeof window === 'undefined' || isFetching) return;
        isFetching = true;
        try {
            const freshData = await fetchFunction();
            set(freshData);
            localStorage.setItem(`swr-${key}`, JSON.stringify(freshData));
        } catch (error) {
            console.error(`SWR fetch error for ${key}:`, error);
        } finally {
            isFetching = false;
        }
    };

    // Automatically revalidate when the store is created (on client)
    if (typeof window !== 'undefined') {
        // Use setTimeout to avoid blocking initial render
        setTimeout(() => {
            revalidate();
        }, 0);
    }

    return {
        subscribe,
        set,
        update,
        revalidate
    };
}
