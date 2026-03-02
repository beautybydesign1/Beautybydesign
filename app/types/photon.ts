/**
 * Type definitions for Photon API (Komoot)
 * https://photon.komoot.io
 */

/**
 * A single feature (place) returned by Photon API
 */
export interface PhotonFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    properties: PhotonProperties;
}

/**
 * Properties of a Photon feature
 */
export interface PhotonProperties {
    // Basic info
    name?: string;
    type: string;
    
    // OSM data
    osm_id?: number;
    osm_type?: string;
    osm_key: string;
    osm_value: string;
    
    // Address components
    housenumber?: string;
    street?: string;
    postcode?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    countrycode?: string; // ISO 3166-1 alpha-2 (e.g., 'us')
    
    // Additional info
    district?: string;
    neighbourhood?: string;
    suburb?: string;
    
    // For ranking/scoring
    extent?: [number, number, number, number]; // bounding box
    
    // Additional tags (varies by feature)
    [key: string]: string | number | [number, number, number, number] | undefined;
}

/**
 * Full response from Photon API
 */
export interface PhotonResponse {
    type: 'FeatureCollection';
    features: PhotonFeature[];
    // Note: Photon doesn't return these standard GeoJSON fields
    // but they're here for completeness
    bbox?: [number, number, number, number];
}

/**
 * Simplified result for geocoding
 */
export interface PhotonGeocodingResult {
    formattedAddress: string;
    latitude: number;
    longitude: number;
    name?: string;
    country?: string;
    state?: string;
    city?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
}

/**
 * Photon API error response
 */
export interface PhotonError {
    message: string;
    status: number;
}

/**
 * Configuration options for Photon API calls
 */
export interface PhotonOptions {
    /** Maximum number of results (default: 5) */
    limit?: number;
    /** Language code (default: 'en') */
    lang?: string;
    /** Bounding box for bias: [minLon, minLat, maxLon, maxLat] */
    bbox?: [number, number, number, number];
    /** Limit to specific OSM tags */
    osm_tag?: string[];
    /** Location bias [lon, lat] */
    lat?: number;
    lon?: number;
    /** Bias location importance (0-1) */
    location_bias_scale?: number;
}
