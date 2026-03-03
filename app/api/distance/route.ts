import { NextRequest, NextResponse } from "next/server";

// Beautician base location (Middletown, Delaware)
const BASE_LAT = 39.449556;
const BASE_LNG = -75.7163207;

/**
 * Get driving distance using Google Routes API
 * More accurate - provides actual driving route data
 */
async function getRoutesApiDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    apiKey: string
): Promise<{ distanceMeters: number; durationSeconds: number } | null> {
    try {
        const routesUrl = `https://routes.googleapis.com/v1:computeRoutes?key=${apiKey}`;
        
        const routesResponse = await fetch(routesUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                origin: {
                    location: {
                        latLng: {
                            latitude: originLat,
                            longitude: originLng,
                        },
                    },
                },
                destination: {
                    location: {
                        latLng: {
                            latitude: destLat,
                            longitude: destLng,
                        },
                    },
                },
                travelMode: 'DRIVE',
                routingPreference: 'TRAFFIC_AWARE',
            }),
        });

        if (!routesResponse.ok) {
            const errorText = await routesResponse.text();
            console.error('Routes API error:', routesResponse.status, errorText);
            return null;
        }

        const routesData = await routesResponse.json();

        if (routesData.routes && routesData.routes.length > 0) {
            const route = routesData.routes[0];
            return {
                distanceMeters: route.distanceMeters || 0,
                durationSeconds: parseDuration(route.duration || '0s'),
            };
        }

        return null;
    } catch (error) {
        console.error('Routes API exception:', error);
        return null;
    }
}

/**
 * Get driving distance using Google Distance Matrix API
 */
async function getDistanceMatrixDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    apiKey: string
): Promise<{ distanceMeters: number; durationSeconds: number } | null> {
    try {
        const origin = `${originLat},${originLng}`;
        const destination = `${destLat},${destLng}`;
        
        console.log('Distance Matrix Request:', { origin, destination, apiKey: apiKey.substring(0, 10) + '...' });
        
        const dmUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=imperial&key=${apiKey}`;
        
        const dmResponse = await fetch(dmUrl);
        const dmData = await dmResponse.json();
        
        console.log('Distance Matrix Response status:', dmData.status);
        
        if (dmData.status === 'OK' && dmData.rows?.[0]?.elements?.[0]?.status === 'OK') {
            const element = dmData.rows[0].elements[0];
            console.log('Distance Matrix Result:', element);
            return {
                distanceMeters: element.distance.value || 0,
                durationSeconds: element.duration.value || 0,
            };
        } else {
            console.error('Distance Matrix Error status:', {
                overallStatus: dmData.status,
                elementStatus: dmData.rows?.[0]?.elements?.[0]?.status,
                fullResponse: dmData
            });
        }
        
        return null;
    } catch (error) {
        console.error('Distance Matrix exception:', error);
        return null;
    }
}

/**
 * Parse Google duration string (e.g., "1234s" or "1h23m45s") to seconds
 */
function parseDuration(duration: string): number {
    if (!duration) return 0;
    
    // If already in seconds format like "1234s"
    if (duration.endsWith('s') && !duration.includes('h') && !duration.includes('m')) {
        return parseInt(duration.replace('s', ''), 10);
    }

    // Parse duration string like "1h23m45s" or "45m30s"
    let seconds = 0;
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    const secsMatch = duration.match(/(\d+)s/);

    if (hoursMatch) seconds += parseInt(hoursMatch[1], 10) * 3600;
    if (minutesMatch) seconds += parseInt(minutesMatch[1], 10) * 60;
    if (secsMatch) seconds += parseInt(secsMatch[1], 10);

    return seconds;
}

/**
 * Convert meters to miles
 */
function metersToMiles(meters: number): number {
    return meters / 1609.344;
}

/**
 * Main distance calculation function
 * Uses Google Routes API first, then Distance Matrix as fallback
 */
async function calculateDrivingDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    apiKey: string
): Promise<{ 
    distanceMiles: number; 
    travelTimeMinutes: number | null;
    distanceSource: string;
}> {
    // Try Routes API first (more accurate)
    let drivingData = await getRoutesApiDistance(originLat, originLng, destLat, destLng, apiKey);
    
    if (drivingData && drivingData.distanceMeters > 0) {
        return {
            distanceMiles: metersToMiles(drivingData.distanceMeters),
            travelTimeMinutes: Math.round(drivingData.durationSeconds / 60),
            distanceSource: 'google_routes',
        };
    }

    // Fallback to Distance Matrix API
    drivingData = await getDistanceMatrixDistance(originLat, originLng, destLat, destLng, apiKey);
    
    console.log('Distance Matrix drivingData:', drivingData);
    
    if (drivingData && drivingData.distanceMeters > 0) {
        return {
            distanceMiles: metersToMiles(drivingData.distanceMeters),
            travelTimeMinutes: Math.round(drivingData.durationSeconds / 60),
            distanceSource: 'google_distance_matrix',
        };
    }

    // Both APIs failed
    throw new Error('Unable to calculate driving distance. Both Routes and Distance Matrix APIs failed.');
}

export async function POST(request: NextRequest) {
    try {
        const { address, latitude, longitude } = await request.json();

        console.log('Distance API Request:', { address, latitude, longitude });

        if (!address) {
            return NextResponse.json(
                { error: "Address is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        console.log('API Key available:', !!apiKey);
        
        if (!apiKey) {
            return NextResponse.json(
                { error: "Google Maps API key not configured" },
                { status: 500 }
            );
        }

        let destLat: number;
        let destLng: number;
        let formattedAddress = address;

        // If we have coordinates from the frontend
        if (typeof latitude === 'number' && typeof longitude === 'number' && 
            latitude !== 0 && longitude !== 0) {
            destLat = latitude;
            destLng = longitude;
        } else {
            // Need to geocode the address first
            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
            console.log('Geocoding address:', address);
            
            const geocodeRes = await fetch(geocodeUrl);
            const geocodeData = await geocodeRes.json();
            
            console.log('Geocoding status:', geocodeData.status);

            if (geocodeData.status !== "OK" || !geocodeData.results || geocodeData.results.length === 0) {
                return NextResponse.json(
                    { error: "Unable to geocode address. Please enter a valid address." },
                    { status: 400 }
                );
            }

            destLat = geocodeData.results[0].geometry.location.lat;
            destLng = geocodeData.results[0].geometry.location.lng;
            formattedAddress = geocodeData.results[0].formatted_address;
        }

        // Calculate driving distance
        const result = await calculateDrivingDistance(
            BASE_LAT, BASE_LNG,
            destLat, destLng,
            apiKey
        );

        return NextResponse.json({
            distanceMiles: Math.round(result.distanceMiles * 10) / 10,
            travelFee: Math.round(result.distanceMiles),
            formattedAddress,
            coordinates: { lat: destLat, lng: destLng },
            travelTimeMinutes: result.travelTimeMinutes,
            isDrivingDistance: true,
            distanceSource: result.distanceSource,
        });
    } catch (error) {
        console.error('Distance calculation error:', error);
        
        const message = error instanceof Error ? error.message : 'Failed to calculate distance';
        
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
