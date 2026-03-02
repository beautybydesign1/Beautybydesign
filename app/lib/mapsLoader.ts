/**
 * Google Maps JavaScript API loader utility
 * Dynamically loads the Google Maps API with Places library
 */

// Track loading state
let loadPromise: Promise<typeof google> | null = null;

/**
 * Load the Google Maps API with Places library
 * Returns a promise that resolves when the API is loaded
 */
export async function loadGoogleMapsApi(): Promise<typeof google> {
    if (typeof window === 'undefined') {
        throw new Error('Google Maps API can only be loaded in the browser');
    }

    // Return existing promise if already loading
    if (loadPromise) {
        return loadPromise;
    }

    // Check if already loaded
    if (window.google?.maps?.places) {
        return Promise.resolve(window.google);
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        throw new Error(
            'Google Maps API key is not configured. ' +
            'Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.'
        );
    }

    // Create new load promise
    loadPromise = new Promise((resolve, reject) => {
        // Create script element
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;

        // Set up global callback
        (window as Window & { initGoogleMaps?: () => void }).initGoogleMaps = () => {
            if (window.google) {
                resolve(window.google);
            } else {
                reject(new Error('Google Maps failed to initialize'));
            }
        };

        // Handle script load error
        script.onerror = () => {
            loadPromise = null;
            reject(new Error('Failed to load Google Maps API'));
        };

        // Handle timeout
        const timeout = setTimeout(() => {
            loadPromise = null;
            reject(new Error('Google Maps API load timeout'));
        }, 30000);

        // Override callback to clear timeout
        const originalCallback = (window as Window & { initGoogleMaps?: () => void }).initGoogleMaps;
        (window as Window & { initGoogleMaps?: () => void }).initGoogleMaps = () => {
            clearTimeout(timeout);
            originalCallback?.();
        };

        document.head.appendChild(script);
    });

    try {
        const google = await loadPromise;
        return google;
    } catch (error) {
        loadPromise = null;
        throw error;
    }
}

/**
 * Check if Google Maps API is loaded and available
 */
export function isGoogleMapsLoaded(): boolean {
    return typeof window !== 'undefined' && 
           !!window.google?.maps?.places;
}

/**
 * Get the Places AutocompleteService
 * Loads the API if not already loaded
 */
export async function getAutocompleteService(): Promise<google.maps.places.AutocompleteService> {
    const google = await loadGoogleMapsApi();
    return new google.maps.places.AutocompleteService();
}

/**
 * Get the PlacesService (requires a map element, so we create a dummy one)
 */
export async function getPlacesService(): Promise<google.maps.places.PlacesService> {
    const google = await loadGoogleMapsApi();
    
    // Create a dummy map element (required for PlacesService)
    const dummyDiv = document.createElement('div');
    const dummyMap = new google.maps.Map(dummyDiv);
    
    return new google.maps.places.PlacesService(dummyMap);
}

/**
 * Get the Geocoder service
 */
export async function getGeocoder(): Promise<google.maps.Geocoder> {
    const google = await loadGoogleMapsApi();
    return new google.maps.Geocoder();
}

// Extend Window interface to include google
declare global {
    interface Window {
        google?: typeof google;
    }
}
