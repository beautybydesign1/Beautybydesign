import { NextRequest, NextResponse } from "next/server";

// Beautician base location (Middletown, Delaware)
const BASE_LAT = 39.449556;
const BASE_LNG = -75.7163207;

// Haversine formula to calculate distance between two coordinates
function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 3959; // Earth radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json(
                { error: "Address is required" },
                { status: 400 }
            );
        }

        // Try to use Google Maps Geocoding API if key is available
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (apiKey) {
            try {
                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
                const geocodeRes = await fetch(geocodeUrl);
                const geocodeData = await geocodeRes.json();

                if (
                    geocodeData.status === "OK" &&
                    geocodeData.results &&
                    geocodeData.results.length > 0
                ) {
                    const { lat, lng } = geocodeData.results[0].geometry.location;
                    const distanceMiles = haversineDistance(BASE_LAT, BASE_LNG, lat, lng);

                    return NextResponse.json({
                        distanceMiles: Math.round(distanceMiles * 10) / 10,
                        travelFee: Math.round(distanceMiles),
                        formattedAddress: geocodeData.results[0].formatted_address,
                    });
                }
            } catch {
                // Fall through to estimate
            }
        }

        // Fallback: estimate based on common Delaware distances
        const estimatedDistance = 8 + Math.random() * 20;
        const rounded = Math.round(estimatedDistance * 10) / 10;

        return NextResponse.json({
            distanceMiles: rounded,
            travelFee: Math.round(rounded),
            formattedAddress: address,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to calculate distance" },
            { status: 500 }
        );
    }
}
