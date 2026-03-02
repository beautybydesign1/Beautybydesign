/**
 * Mapbox Geocoding API utilities
 * 
 * Free tier: 100,000 requests/month
 * Website: https://www.mapbox.com/geocoding
 * 
 * Requires API key from Mapbox account
 */

import { 
    MapboxGeocodingResponse, 
    MapboxFeature, 
    MapboxGeocodingResult,
    MapboxGeocodingOptions 
} from '@/app/types/mapbox';

const MAPBOX_API_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

/**
 * Get Mapbox API key from environment
 */
function getMapboxApiKey(): string {
    const apiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!apiKey) {
        throw new Error(
            'Mapbox API key is not configured. ' +
            'Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables. ' +
            'Get a free key at https://account.mapbox.com/access-tokens/'
        );
    }
    return apiKey;
}

/**
 * Search for places with autocomplete using Mapbox
 * 
 * @param query - Search query
 * @param options - Search options
 * @returns Array of geocoding results
 */
export async function mapboxAutocomplete(
    query: string,
    options: MapboxGeocodingOptions = {}
): Promise<MapboxGeocodingResult[]> {
    if (!query.trim() || query.length < 2) {
        return [];
    }

    const apiKey = getMapboxApiKey();
    
    const params = new URLSearchParams({
        access_token: apiKey,
        autocomplete: 'true',
        limit: (options.limit || 5).toString(),
        language: options.language || 'en',
    });

    // Add US bias for better US address results
    // Using approximate center of Delaware area
    params.append('proximity', '-75.5,39.2');
    
    // Limit to US addresses only
    params.append('country', 'us');

    // Filter to relevant place types for autocomplete
    if (options.types) {
        params.append('types', options.types.join(','));
    } else {
        // Default types for address autocomplete
        params.append('types', 'address,place,locality,neighborhood,postcode');
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `${MAPBOX_API_BASE}/${encodedQuery}.json?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Mapbox API error: ${response.status} ${response.statusText}`
            );
        }

        const data: MapboxGeocodingResponse = await response.json();
        
        return data.features.map(feature => mapboxFeatureToResult(feature));
    } catch (error) {
        console.error('Mapbox API error:', error);
        throw error;
    }
}

/**
 * Reverse geocode - get address from coordinates
 * 
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Geocoding result or null
 */
export async function mapboxReverseGeocode(
    lat: number,
    lon: number
): Promise<MapboxGeocodingResult | null> {
    const apiKey = getMapboxApiKey();
    
    const params = new URLSearchParams({
        access_token: apiKey,
        language: 'en',
        types: 'address,place',
    });

    const url = `${MAPBOX_API_BASE}/${lon},${lat}.json?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
        }

        const data: MapboxGeocodingResponse = await response.json();
        
        if (data.features && data.features.length > 0) {
            return mapboxFeatureToResult(data.features[0]);
        }

        return null;
    } catch (error) {
        console.error('Mapbox reverse geocode error:', error);
        throw error;
    }
}

/**
 * Convert Mapbox feature to simplified result
 */
function mapboxFeatureToResult(feature: MapboxFeature): MapboxGeocodingResult {
    const context = feature.context || [];
    
    // Extract context information
    const place = context.find(c => c.id.startsWith('place.'));
    const region = context.find(c => c.id.startsWith('region.'));
    const country = context.find(c => c.id.startsWith('country.'));
    const postcode = context.find(c => c.id.startsWith('postcode.'));

    return {
        id: feature.id,
        formattedAddress: feature.place_name,
        latitude: feature.center[1],
        longitude: feature.center[0],
        placeType: feature.place_type[0],
        relevance: feature.relevance,
        address: feature.address,
        city: place?.text,
        state: region?.text,
        country: country?.text,
        postcode: postcode?.text,
    };
}

/**
 * Format Mapbox feature for display
 */
export function formatMapboxDisplay(feature: MapboxFeature): {
    mainText: string;
    secondaryText: string;
} {
    let mainText = feature.text;
    
    // For addresses, include house number if available
    if (feature.place_type.includes('address') && feature.address) {
        mainText = `${feature.address} ${feature.text}`;
    }

    // Build secondary text from context
    const contextParts: string[] = [];
    
    for (const ctx of feature.context) {
        // Add place (city)
        if (ctx.id.startsWith('place.')) {
            contextParts.push(ctx.text);
        }
        // Add region (state)
        else if (ctx.id.startsWith('region.')) {
            contextParts.push(ctx.text);
        }
        // Add postcode
        else if (ctx.id.startsWith('postcode.')) {
            contextParts.push(ctx.text);
        }
    }

    const secondaryText = contextParts.join(', ');

    return { mainText, secondaryText };
}

/**
 * Get place type icon for display
 */
export function getMapboxPlaceTypeIcon(feature: MapboxFeature): string {
    const placeType = feature.place_type[0];
    
    switch (placeType) {
        case 'address':
            return '🏠';
        case 'poi':
            return '📍';
        case 'place':
            return '🏙️';
        case 'locality':
        case 'neighborhood':
            return '🏘️';
        case 'postcode':
            return '📮';
        case 'district':
            return '🏛️';
        case 'region':
            return '🗺️';
        case 'country':
            return '🌍';
        default:
            return '📍';
    }
}

/**
 * Get place type label
 */
export function getMapboxPlaceTypeLabel(feature: MapboxFeature): string {
    const placeType = feature.place_type[0];
    
    const labels: Record<string, string> = {
        address: 'Address',
        poi: 'Place',
        place: 'City',
        locality: 'Area',
        neighborhood: 'Neighborhood',
        postcode: 'ZIP Code',
        district: 'District',
        region: 'State',
        country: 'Country',
    };

    return labels[placeType] || 'Location';
}
