/**
 * Type definitions for Mapbox Geocoding API
 * https://docs.mapbox.com/api/search/geocoding/
 */

/**
 * Mapbox Geocoding API response
 */
export interface MapboxGeocodingResponse {
    type: 'FeatureCollection';
    query: string[];
    features: MapboxFeature[];
    attribution: string;
}

/**
 * A single feature (place) from Mapbox
 */
export interface MapboxFeature {
    id: string;
    type: 'Feature';
    place_type: MapboxPlaceType[];
    relevance: number;
    address?: string;
    text: string;
    place_name: string;
    matching_text?: string;
    matching_place_name?: string;
    center: [number, number]; // [longitude, latitude]
    geometry: {
        type: 'Point';
        coordinates: [number, number];
    };
    bbox?: [number, number, number, number];
    properties: {
        accuracy?: string;
        address?: string;
        category?: string;
        maki?: string;
        wikidata?: string;
        short_code?: string;
    };
    context: MapboxContext[];
}

/**
 * Types of places Mapbox can return
 */
export type MapboxPlaceType =
    | 'country'
    | 'region'
    | 'postcode'
    | 'district'
    | 'place'
    | 'locality'
    | 'neighborhood'
    | 'address'
    | 'poi';

/**
 * Context information for a feature
 */
export interface MapboxContext {
    id: string;
    mapbox_id: string;
    text: string;
    wikidata?: string;
    short_code?: string;
}

/**
 * Simplified geocoding result
 */
export interface MapboxGeocodingResult {
    id: string;
    formattedAddress: string;
    latitude: number;
    longitude: number;
    placeType: MapboxPlaceType;
    relevance: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
}

/**
 * Mapbox API error response
 */
export interface MapboxError {
    message: string;
}

/**
 * Options for Mapbox geocoding requests
 */
export interface MapboxGeocodingOptions {
    /** Limit results (1-10, default: 5) */
    limit?: number;
    /** Bias results to a proximity (format: "longitude,latitude") */
    proximity?: string;
    /** Filter by country (ISO 3166-1 alpha-2, comma-separated) */
    country?: string;
    /** Filter by place types (comma-separated) */
    types?: MapboxPlaceType[];
    /** Bbox to filter results: [minX, minY, maxX, maxY] */
    bbox?: [number, number, number, number];
    /** Language for results (ISO 639-1) */
    language?: string;
    /** Include autocomplete suggestions */
    autocomplete?: boolean;
}
