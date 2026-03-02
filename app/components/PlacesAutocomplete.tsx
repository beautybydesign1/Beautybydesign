"use client";

import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react';
import { 
    PlacesAutocompleteProps, 
    PlaceSuggestion, 
    SelectedPlace,
    AutocompleteState 
} from '@/app/types/places';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useClickOutside } from '@/app/hooks/useClickOutside';
import { loadGoogleMapsApi, getAutocompleteService } from '@/app/lib/mapsLoader';
import GeolocationButton from './GeolocationButton';

/**
 * PlacesAutocomplete Component
 * 
 * A comprehensive Google Places Autocomplete input with:
 * - Real-time place suggestions
 * - Debounced API calls
 * - Geolocation support
 * - Keyboard navigation
 * - Click-outside handling
 * - Fallback behavior for API failures
 */
export default function PlacesAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = "Enter an address",
    label,
    error,
    disabled = false,
    id = "places-autocomplete",
    className = "",
}: PlacesAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Component state
    const [autocompleteState, setAutocompleteState] = useState<AutocompleteState>({
        isOpen: false,
        suggestions: [],
        highlightedIndex: -1,
        isLoading: false,
    });
    
    const [apiError, setApiError] = useState<string | null>(null);
    const [isApiAvailable, setIsApiAvailable] = useState<boolean>(true);

    // Debounce the input value for API calls
    const debouncedValue = useDebounce(value, 300);

    /**
     * Fetch place suggestions from Google Places API
     */
    const fetchSuggestions = useCallback(async (input: string) => {
        if (!input.trim() || input.length < 2) {
            setAutocompleteState(prev => ({
                ...prev,
                suggestions: [],
                isOpen: false,
                isLoading: false,
            }));
            return;
        }

        setAutocompleteState(prev => ({ ...prev, isLoading: true }));
        setApiError(null);

        try {
            // Check if API key is configured
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            
            if (!apiKey) {
                throw new Error('Google Maps API key is not configured');
            }

            // Load Google Maps API
            await loadGoogleMapsApi();
            
            // Get autocomplete service
            const service = await getAutocompleteService();

            // Create request
            const request: google.maps.places.AutocompletionRequest = {
                input,
                types: ['address'],
            };

            // Get predictions
            service.getPlacePredictions(
                request,
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        const suggestions: PlaceSuggestion[] = predictions.map(prediction => ({
                            placeId: prediction.place_id,
                            mainText: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
                            secondaryText: prediction.structured_formatting?.secondary_text || 
                                prediction.description.split(',').slice(1).join(',').trim(),
                            description: prediction.description,
                        }));

                        setAutocompleteState(prev => ({
                            ...prev,
                            suggestions,
                            isOpen: suggestions.length > 0,
                            isLoading: false,
                            highlightedIndex: -1,
                        }));
                        setIsApiAvailable(true);
                    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                        setAutocompleteState(prev => ({
                            ...prev,
                            suggestions: [],
                            isOpen: false,
                            isLoading: false,
                        }));
                    } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                        setApiError('Rate limit reached. Please try again later.');
                        setIsApiAvailable(false);
                        setAutocompleteState(prev => ({
                            ...prev,
                            isLoading: false,
                        }));
                    } else {
                        setApiError('Unable to fetch suggestions. Please try again.');
                        setIsApiAvailable(false);
                        setAutocompleteState(prev => ({
                            ...prev,
                            isLoading: false,
                        }));
                    }
                }
            );
        } catch (err) {
            console.error('Places API Error:', err);
            setApiError('Location search is temporarily unavailable.');
            setIsApiAvailable(false);
            setAutocompleteState(prev => ({
                ...prev,
                isLoading: false,
                isOpen: false,
            }));
        }
    }, []);

    /**
     * Get place details including coordinates
     */
    const getPlaceDetails = useCallback(async (placeId: string): Promise<SelectedPlace | null> => {
        try {
            const google = await loadGoogleMapsApi();
            
            // Create a dummy map element (required for PlacesService)
            const dummyDiv = document.createElement('div');
            const service = new google.maps.places.PlacesService(dummyDiv);

            return new Promise((resolve, reject) => {
                service.getDetails(
                    { placeId, fields: ['formatted_address', 'geometry', 'name'] },
                    (result, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
                            const selectedPlace: SelectedPlace = {
                                placeId,
                                formattedAddress: result.formatted_address || '',
                                latitude: result.geometry.location.lat(),
                                longitude: result.geometry.location.lng(),
                                name: result.name,
                            };
                            resolve(selectedPlace);
                        } else {
                            reject(new Error('Failed to get place details'));
                        }
                    }
                );
            });
        } catch (err) {
            console.error('Place Details Error:', err);
            return null;
        }
    }, []);

    /**
     * Handle place selection
     */
    const handleSelectPlace = useCallback(async (suggestion: PlaceSuggestion) => {
        setAutocompleteState(prev => ({
            ...prev,
            isOpen: false,
            suggestions: [],
            isLoading: false,
        }));

        // Update input value immediately for better UX
        onChange(suggestion.description);

        // Fetch full place details
        const placeDetails = await getPlaceDetails(suggestion.placeId);
        
        if (placeDetails) {
            onSelect(placeDetails);
        } else {
            // Fallback: create a partial place object
            onSelect({
                placeId: suggestion.placeId,
                formattedAddress: suggestion.description,
                latitude: 0,
                longitude: 0,
            });
        }
        
        // Focus back on input
        inputRef.current?.focus();
    }, [onChange, onSelect, getPlaceDetails]);

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        const { suggestions, isOpen, highlightedIndex } = autocompleteState;

        if (!isOpen || suggestions.length === 0) {
            // Allow Enter to submit even without dropdown
            if (e.key === 'Enter') {
                e.preventDefault();
                // If there's text, treat it as a manual entry
                if (value.trim()) {
                    const manualPlace: SelectedPlace = {
                        placeId: 'manual-entry',
                        formattedAddress: value,
                        latitude: 0,
                        longitude: 0,
                    };
                    onSelect(manualPlace);
                }
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setAutocompleteState(prev => ({
                    ...prev,
                    highlightedIndex: Math.min(
                        prev.highlightedIndex + 1,
                        prev.suggestions.length - 1
                    ),
                }));
                break;

            case 'ArrowUp':
                e.preventDefault();
                setAutocompleteState(prev => ({
                    ...prev,
                    highlightedIndex: Math.max(prev.highlightedIndex - 1, -1),
                }));
                break;

            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                    handleSelectPlace(suggestions[highlightedIndex]);
                } else if (value.trim()) {
                    // Manual entry
                    const manualPlace: SelectedPlace = {
                        placeId: 'manual-entry',
                        formattedAddress: value,
                        latitude: 0,
                        longitude: 0,
                    };
                    onSelect(manualPlace);
                }
                break;

            case 'Escape':
                e.preventDefault();
                setAutocompleteState(prev => ({
                    ...prev,
                    isOpen: false,
                    highlightedIndex: -1,
                }));
                break;
        }
    }, [autocompleteState, value, onSelect, handleSelectPlace]);

    /**
     * Handle geolocation result
     */
    const handleGeolocationFound = useCallback(async (latitude: number, longitude: number, address: string) => {
        // Update input with address
        onChange(address);

        // Create selected place object
        const place: SelectedPlace = {
            placeId: 'geolocation',
            formattedAddress: address,
            latitude,
            longitude,
        };

        onSelect(place);
        
        // Close any open suggestions
        setAutocompleteState(prev => ({
            ...prev,
            isOpen: false,
            suggestions: [],
        }));
    }, [onChange, onSelect]);

    /**
     * Handle geolocation errors
     */
    const handleGeolocationError = useCallback((error: { type: string; message: string }) => {
        // Error is handled by the GeolocationButton component
        console.warn('Geolocation error:', error);
    }, []);

    /**
     * Close dropdown when clicking outside
     */
    const handleClickOutside = useCallback(() => {
        setAutocompleteState(prev => ({
            ...prev,
            isOpen: false,
            highlightedIndex: -1,
        }));
    }, []);

    useClickOutside(containerRef, handleClickOutside);

    /**
     * Fetch suggestions when debounced value changes
     */
    useEffect(() => {
        if (debouncedValue.trim().length >= 2) {
            fetchSuggestions(debouncedValue);
        } else {
            setAutocompleteState(prev => ({
                ...prev,
                suggestions: [],
                isOpen: false,
            }));
        }
    }, [debouncedValue, fetchSuggestions]);

    const { suggestions, isOpen, highlightedIndex, isLoading } = autocompleteState;

    return (
        <div 
            ref={containerRef}
            className={`places-autocomplete-container ${className}`}
            style={{ position: 'relative', width: '100%' }}
        >
            {label && (
                <label 
                    htmlFor={id}
                    className="input-label"
                    style={{ 
                        display: 'block', 
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--color-text)',
                    }}
                >
                    {label}
                </label>
            )}
            
            <div style={{ position: 'relative' }}>
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) {
                            setAutocompleteState(prev => ({ ...prev, isOpen: true }));
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input-field ${error ? 'error' : ''}`}
                    style={{
                        width: '100%',
                        paddingRight: '50px', // Space for geolocation button
                    }}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-controls={`${id}-suggestions`}
                    aria-expanded={isOpen}
                    aria-activedescendant={
                        highlightedIndex >= 0 
                            ? `${id}-suggestion-${highlightedIndex}` 
                            : undefined
                    }
                    role="combobox"
                />
                
                <div
                    style={{
                        position: 'absolute',
                        right: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                    }}
                >
                    <GeolocationButton
                        onLocationFound={handleGeolocationFound}
                        onError={handleGeolocationError}
                        disabled={disabled}
                    />
                </div>

                {isLoading && (
                    <div
                        style={{
                            position: 'absolute',
                            right: '48px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}
                    >
                        <div
                            style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid var(--color-border)',
                                borderTopColor: 'var(--color-primary)',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                            }}
                        />
                    </div>
                )}
            </div>

            {error && (
                <span className="input-error" style={{ 
                    fontSize: '13px', 
                    color: 'var(--color-error)',
                    marginTop: '4px',
                    display: 'block',
                }}>
                    {error}
                </span>
            )}

            {apiError && !isApiAvailable && (
                <div
                    style={{
                        marginTop: '8px',
                        padding: '10px 14px',
                        background: 'rgba(196, 76, 68, 0.08)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--color-error)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                </div>
            )}

            {isOpen && suggestions.length > 0 && (
                <ul
                    id={`${id}-suggestions`}
                    role="listbox"
                    className="places-autocomplete-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--color-surface)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        maxHeight: '320px',
                        overflowY: 'auto',
                        zIndex: 1000,
                        listStyle: 'none',
                        margin: 0,
                        padding: '8px 0',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={suggestion.placeId}
                            id={`${id}-suggestion-${index}`}
                            role="option"
                            aria-selected={index === highlightedIndex}
                            onClick={() => handleSelectPlace(suggestion)}
                            onMouseEnter={() => 
                                setAutocompleteState(prev => ({ 
                                    ...prev, 
                                    highlightedIndex: index 
                                }))
                            }
                            className="places-autocomplete-item"
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                background: index === highlightedIndex 
                                    ? 'rgba(197, 169, 129, 0.1)' 
                                    : 'transparent',
                                borderLeft: index === highlightedIndex 
                                    ? '3px solid var(--color-primary)' 
                                    : '3px solid transparent',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 500,
                                    color: 'var(--color-text)',
                                    fontSize: '15px',
                                }}
                            >
                                {suggestion.mainText}
                            </div>
                            <div
                                style={{
                                    fontSize: '13px',
                                    color: 'var(--color-text-muted)',
                                    marginTop: '2px',
                                }}
                            >
                                {suggestion.secondaryText}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {isOpen && !isLoading && suggestions.length === 0 && value.trim().length >= 2 && (
                <div
                    className="places-autocomplete-dropdown places-autocomplete-no-results"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--color-surface)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        padding: '16px',
                        zIndex: 1000,
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                        fontSize: '14px',
                    }}
                >
                    No results found. Try a different search or enter manually.
                </div>
            )}
        </div>
    );
}
