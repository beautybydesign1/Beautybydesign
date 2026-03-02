/**
 * Photon API (Komoot) - Free Geocoding Service
 * No API key required!
 * 
 * Photon is an open-source geocoder for OpenStreetMap data.
 * It's completely free to use with fair usage limits.
 * 
 * Website: https://photon.komoot.io
 * Documentation: https://github.com/komoot/photon
 */

import { PhotonFeature, PhotonResponse, PhotonGeocodingResult } from '@/app/types/photon';

const PHOTON_API_BASE = 'https://photon.komoot.io';

/**
 * Search for places with autocomplete
 * @param query - Search query (address, place name, etc.)
 * @param limit - Maximum number of results (default: 5)
 * @param lang - Language for results (default: 'en')
 */
export async function photonAutocomplete(
    query: string,
    limit: number = 5,
    lang: string = 'en'
): Promise<PhotonFeature[]> {
    if (!query.trim() || query.length < 2) {
        return [];
    }

    const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
        lang: lang,
    });

    // Add US bias for better US address results
    // bbox format: minLon, minLat, maxLon, maxLat (continental US)
    params.append('bbox', '-125.0,25.0,-66.0,49.0');

    const url = `${PHOTON_API_BASE}/api/?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Photon API error: ${response.status} ${response.statusText}`);
        }

        const data: PhotonResponse = await response.json();
        return data.features || [];
    } catch (error) {
        console.error('Photon API error:', error);
        throw error;
    }
}

/**
 * Reverse geocode - get address from coordinates
 * @param lat - Latitude
 * @param lon - Longitude
 */
export async function photonReverseGeocode(
    lat: number,
    lon: number
): Promise<PhotonGeocodingResult | null> {
    const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
    });

    const url = `${PHOTON_API_BASE}/reverse?${params.toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Photon API error: ${response.status} ${response.statusText}`);
        }

        const data: PhotonResponse = await response.json();
        
        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            return {
                formattedAddress: formatPhotonAddress(feature),
                latitude: feature.geometry.coordinates[1],
                longitude: feature.geometry.coordinates[0],
                name: feature.properties.name,
                country: feature.properties.country,
                state: feature.properties.state,
                city: feature.properties.city || feature.properties.county,
                postcode: feature.properties.postcode,
                street: feature.properties.street,
                housenumber: feature.properties.housenumber,
            };
        }

        return null;
    } catch (error) {
        console.error('Photon reverse geocode error:', error);
        throw error;
    }
}

/**
 * Format a Photon feature into a readable address
 */
export function formatPhotonAddress(feature: PhotonFeature): string {
    const props = feature.properties;
    const parts: string[] = [];

    // Add name or house number + street
    if (props.housenumber && props.street) {
        parts.push(`${props.housenumber} ${props.street}`);
    } else if (props.street) {
        parts.push(props.street);
    } else if (props.name && feature.geometry.coordinates) {
        parts.push(props.name);
    }

    // Add city/county
    if (props.city) {
        parts.push(props.city);
    } else if (props.county) {
        parts.push(props.county);
    }

    // Add state
    if (props.state) {
        parts.push(props.state);
    }

    // Add postcode
    if (props.postcode) {
        // Add postcode to the last part (state) if exists
        const lastPart = parts[parts.length - 1];
        if (lastPart && props.state) {
            parts[parts.length - 1] = `${lastPart} ${props.postcode}`;
        } else {
            parts.push(props.postcode);
        }
    }

    // Add country
    if (props.country) {
        parts.push(props.country);
    }

    return parts.join(', ');
}

/**
 * Format a Photon feature for display in dropdown
 * Returns main text and secondary text
 */
export function formatPhotonDisplay(feature: PhotonFeature): {
    mainText: string;
    secondaryText: string;
} {
    const props = feature.properties;
    
    let mainText = '';
    let secondaryText = '';

    // Main text: house number + street or name
    if (props.housenumber && props.street) {
        mainText = `${props.housenumber} ${props.street}`;
    } else if (props.street) {
        mainText = props.street;
    } else if (props.name) {
        mainText = props.name;
    } else if (props.city) {
        mainText = props.city;
    }

    // Secondary text: city, state, country
    const secondaryParts: string[] = [];
    if (props.city && mainText !== props.city) {
        secondaryParts.push(props.city);
    }
    if (props.state) {
        secondaryParts.push(props.state);
    }
    if (props.country && props.country !== 'United States') {
        secondaryParts.push(props.country);
    }

    secondaryText = secondaryParts.join(', ');

    return { mainText, secondaryText };
}

/**
 * Get place type label for display
 */
export function getPhotonPlaceType(feature: PhotonFeature): string {
    const type = feature.properties.type;
    const osmKey = feature.properties.osm_key;
    const osmValue = feature.properties.osm_value;

    if (type === 'house' || osmValue === 'residential') {
        return 'Address';
    } else if (type === 'street' || osmKey === 'highway') {
        return 'Street';
    } else if (type === 'city' || type === 'administrative') {
        return 'City';
    } else if (osmKey === 'amenity') {
        return 'Place';
    } else if (osmKey === 'shop') {
        return 'Business';
    }

    return 'Location';
}
