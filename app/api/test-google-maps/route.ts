import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_MAPS_API_KEY not configured in environment' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const testType = searchParams.get('type') || 'geocoding';
  const address = searchParams.get('address') || '1600 Amphitheatre Parkway, Mountain View, CA';
  
  // Test results
  const results: Record<string, any> = {};
  
  try {
    // Test 1: Geocoding API
    if (testType === 'geocoding' || testType === 'all') {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();
      
      results.geocoding = {
        status: geocodeData.status,
        success: geocodeData.status === 'OK',
        results: geocodeData.results?.slice(0, 1).map((r: any) => ({
          formatted_address: r.formatted_address,
          location: r.geometry?.location,
          accuracy: r.geometry?.location_type
        })) || [],
        error_message: geocodeData.error_message
      };
    }

    // Test 2: Places API - Autocomplete
    if (testType === 'places' || testType === 'all') {
      const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&types=address&key=${apiKey}`;
      const placesResponse = await fetch(placesUrl);
      const placesData = await placesResponse.json();
      
      results.places = {
        status: placesData.status,
        success: placesData.status === 'OK',
        predictions: placesData.predictions?.slice(0, 3).map((p: any) => ({
          description: p.description,
          place_id: p.place_id,
          types: p.types
        })) || [],
        error_message: placesData.error_message
      };
    }

    // Test 3: Distance Matrix API
    if (testType === 'distance' || testType === 'all') {
      // Test from NYC to a destination
      const origins = '40.7128,-74.0060'; // NYC
      const destinations = '40.7580,-73.9855'; // Times Square
      
      const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&key=${apiKey}`;
      const distanceResponse = await fetch(distanceUrl);
      const distanceData = await distanceResponse.json();
      
      results.distanceMatrix = {
        status: distanceData.status,
        success: distanceData.status === 'OK',
        results: distanceData.rows?.[0]?.elements?.slice(0, 1).map((e: any) => ({
          distance: e.distance?.text,
          duration: e.duration?.text,
          distance_value_meters: e.distance?.value
        })) || [],
        error_message: distanceData.error_message
      };
    }

    // Test 4: Places Details API
    if (testType === 'details' || testType === 'all') {
      // First get a place_id from autocomplete
      const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&types=address&key=${apiKey}`;
      const placesResponse = await fetch(placesUrl);
      const placesData = await placesResponse.json();
      
      let placeDetails = null;
      if (placesData.predictions?.[0]?.place_id) {
        const placeId = placesData.predictions[0].place_id;
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,types&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        placeDetails = {
          status: detailsData.status,
          success: detailsData.status === 'OK',
          result: detailsData.result ? {
            formatted_address: detailsData.result.formatted_address,
            location: detailsData.result.geometry?.location,
            types: detailsData.result.types
          } : null,
          error_message: detailsData.error_message
        };
      }
      
      results.placesDetails = placeDetails;
    }

    // Overall status
    const allSuccessful = Object.values(results).every((r: any) => r.success);
    
    return NextResponse.json({
      success: allSuccessful,
      apiKeyConfigured: true,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      testAddress: address,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      apiKeyConfigured: !!apiKey,
      error: error instanceof Error ? error.message : 'Unknown error',
      results,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
