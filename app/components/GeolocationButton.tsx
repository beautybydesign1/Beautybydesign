"use client";

import { useState, useCallback } from 'react';
import { GeolocationButtonProps, GeolocationError, GeolocationState } from '@/app/types/places';

/**
 * GeolocationButton Component
 * 
 * A button that triggers the browser's Geolocation API to detect
 * the user's current location with proper permission handling.
 */
export default function GeolocationButton({
    onLocationFound,
    onError,
    disabled = false,
}: GeolocationButtonProps) {
    const [state, setState] = useState<GeolocationState>({
        isLoading: false,
        error: null,
        permission: 'unknown',
    });

    /**
     * Get a human-readable address from coordinates using reverse geocoding
     */
    const getAddressFromCoordinates = async (
        latitude: number,
        longitude: number
    ): Promise<string> => {
        try {
            // Try to use Google Geocoding API if available
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            
            if (apiKey) {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
                );
                const data = await response.json();
                
                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    return data.results[0].formatted_address;
                }
            }
            
            // Fallback: return coordinates as string
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        } catch {
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        }
    };

    /**
     * Handle geolocation errors
     */
    const handleGeolocationError = useCallback((error: globalThis.GeolocationPositionError): GeolocationError => {
        let geolocationError: GeolocationError;

        switch (error.code) {
            case error.PERMISSION_DENIED:
                geolocationError = {
                    type: 'PERMISSION_DENIED',
                    message: 'Location access was denied. Please enable location permissions in your browser settings.',
                };
                setState(prev => ({ ...prev, permission: 'denied' }));
                break;
            case error.POSITION_UNAVAILABLE:
                geolocationError = {
                    type: 'POSITION_UNAVAILABLE',
                    message: 'Location information is unavailable. Please try again or enter your address manually.',
                };
                break;
            case error.TIMEOUT:
                geolocationError = {
                    type: 'TIMEOUT',
                    message: 'Location request timed out. Please try again or enter your address manually.',
                };
                break;
            default:
                geolocationError = {
                    type: 'UNKNOWN',
                    message: 'An unknown error occurred while getting your location.',
                };
        }

        return geolocationError;
    }, []);

    /**
     * Request the user's current location
     */
    const requestLocation = useCallback(async () => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            const error: GeolocationError = {
                type: 'UNKNOWN',
                message: 'Geolocation is not supported by your browser.',
            };
            onError?.(error);
            return;
        }

        setState({
            isLoading: true,
            error: null,
            permission: 'prompt',
        });

        // Check permission state if Permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
                
                if (permissionStatus.state === 'denied') {
                    const error: GeolocationError = {
                        type: 'PERMISSION_DENIED',
                        message: 'Location access was previously denied. Please enable it in your browser settings.',
                    };
                    setState({
                        isLoading: false,
                        error,
                        permission: 'denied',
                    });
                    onError?.(error);
                    return;
                }

                // Listen for permission changes
                permissionStatus.onchange = () => {
                    setState(prev => ({
                        ...prev,
                        permission: permissionStatus.state as 'prompt' | 'granted' | 'denied',
                    }));
                };
            } catch {
                // Permissions API might not be fully supported, continue anyway
            }
        }

        // Request location
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    // Get address from coordinates
                    const address = await getAddressFromCoordinates(latitude, longitude);
                    
                    setState({
                        isLoading: false,
                        error: null,
                        permission: 'granted',
                    });
                    
                    onLocationFound(latitude, longitude, address);
                } catch {
                    // Even if reverse geocoding fails, we still have coordinates
                    setState({
                        isLoading: false,
                        error: null,
                        permission: 'granted',
                    });
                    
                    onLocationFound(
                        latitude,
                        longitude,
                        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                    );
                }
            },
            (error) => {
                const geoError = handleGeolocationError(error);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: geoError,
                }));
                onError?.(geoError);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000,
            }
        );
    }, [onLocationFound, onError, handleGeolocationError]);

    return (
        <button
            type="button"
            onClick={requestLocation}
            disabled={disabled || state.isLoading}
            className="geolocation-button"
            title="Use my current location"
            aria-label="Use my current location"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                background: 'transparent',
                cursor: disabled || state.isLoading ? 'not-allowed' : 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                if (!disabled && !state.isLoading) {
                    e.currentTarget.style.background = 'rgba(197, 169, 129, 0.1)';
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
            }}
        >
            {state.isLoading ? (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    style={{
                        animation: 'spin 1s linear infinite',
                    }}
                >
                    <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="31.42"
                        strokeDashoffset="10"
                        style={{
                            stroke: 'var(--color-primary)',
                        }}
                    />
                </svg>
            ) : (
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        color: state.permission === 'denied' 
                            ? 'var(--color-error)' 
                            : 'var(--color-primary)',
                    }}
                >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
                </svg>
            )}
        </button>
    );
}
