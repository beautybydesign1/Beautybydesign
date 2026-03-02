/**
 * Type definitions for Google Places API integration
 */

/**
 * Represents a place suggestion from Google Places Autocomplete
 */
export interface PlaceSuggestion {
    placeId: string;
    mainText: string;
    secondaryText: string;
    description: string;
}

/**
 * Represents a selected place with full details including coordinates
 */
export interface SelectedPlace {
    placeId: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
    name?: string;
}

/**
 * Geolocation state for tracking permission and loading states
 */
export interface GeolocationState {
    isLoading: boolean;
    error: GeolocationError | null;
    permission: PermissionState;
}

/**
 * Geolocation error types
 */
export type GeolocationError =
    | { type: 'PERMISSION_DENIED'; message: string }
    | { type: 'POSITION_UNAVAILABLE'; message: string }
    | { type: 'TIMEOUT'; message: string }
    | { type: 'UNKNOWN'; message: string };

/**
 * Permission states for geolocation
 */
export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';

/**
 * Notification types for toast messages
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * Notification message structure
 */
export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

/**
 * Google Maps API loading state
 */
export interface MapsApiState {
    isLoading: boolean;
    isLoaded: boolean;
    error: string | null;
}

/**
 * Autocomplete dropdown state
 */
export interface AutocompleteState {
    isOpen: boolean;
    suggestions: PlaceSuggestion[];
    highlightedIndex: number;
    isLoading: boolean;
}

/**
 * Props for the PlacesAutocomplete component
 */
export interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (place: SelectedPlace) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    id?: string;
    className?: string;
}

/**
 * Props for the GeolocationButton component
 */
export interface GeolocationButtonProps {
    onLocationFound: (latitude: number, longitude: number, address: string) => void;
    onError?: (error: GeolocationError) => void;
    disabled?: boolean;
}

/**
 * Google Places API response types
 */
export interface GooglePlacePrediction {
    place_id: string;
    description: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
    terms: Array<{
        offset: number;
        value: string;
    }>;
}

export interface GooglePlacesAutocompleteResponse {
    predictions: GooglePlacePrediction[];
    status: string;
    error_message?: string;
}

export interface GooglePlaceDetailsResponse {
    result: {
        place_id: string;
        formatted_address: string;
        name?: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    };
    status: string;
    error_message?: string;
}

export interface GoogleGeocodeResponse {
    results: Array<{
        formatted_address: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
        place_id: string;
    }>;
    status: string;
    error_message?: string;
}
