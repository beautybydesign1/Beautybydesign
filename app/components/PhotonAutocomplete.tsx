"use client";

import { useState, useRef, useCallback, KeyboardEvent, useEffect } from 'react';
import { PhotonFeature, PhotonGeocodingResult } from '@/app/types/photon';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useClickOutside } from '@/app/hooks/useClickOutside';
import { 
    photonAutocomplete, 
    photonReverseGeocode,
    formatPhotonAddress, 
    formatPhotonDisplay,
    getPhotonPlaceType 
} from '@/app/lib/photonApi';
import GeolocationButton from './GeolocationButton';

interface PhotonAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (result: PhotonGeocodingResult) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    id?: string;
    className?: string;
}

/**
 * PhotonAutocomplete Component
 * 
 * A free, no-API-key-required autocomplete using Photon (Komoot).
 * Perfect for small to medium applications.
 * 
 * Features:
 * - No API key required (completely free)
 * - US address bias for better US results
 * - Debounced search (300ms)
 * - Keyboard navigation
 * - Geolocation support
 * - Click-outside handling
 */
export default function PhotonAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = "Enter an address",
    label,
    error,
    disabled = false,
    id = "photon-autocomplete",
    className = "",
}: PhotonAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Debounce the input value for API calls
    const debouncedValue = useDebounce(value, 300);

    /**
     * Fetch suggestions from Photon API
     */
    const fetchSuggestions = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setApiError(null);

        try {
            const features = await photonAutocomplete(query, 5);
            setSuggestions(features);
            setIsOpen(features.length > 0);
            setHighlightedIndex(-1);
        } catch (err) {
            console.error('Photon search error:', err);
            setApiError('Unable to search addresses. Please try again.');
            setSuggestions([]);
            setIsOpen(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Handle place selection
     */
    const handleSelectPlace = useCallback((feature: PhotonFeature) => {
        const formattedAddress = formatPhotonAddress(feature);
        const { mainText } = formatPhotonDisplay(feature);
        
        onChange(formattedAddress);
        setIsOpen(false);
        setSuggestions([]);

        const result: PhotonGeocodingResult = {
            formattedAddress,
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

        onSelect(result);
        inputRef.current?.focus();
    }, [onChange, onSelect]);

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === 'Enter' && value.trim()) {
                e.preventDefault();
                // Manual entry
                onSelect({
                    formattedAddress: value,
                    latitude: 0,
                    longitude: 0,
                });
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    Math.min(prev + 1, suggestions.length - 1)
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => Math.max(prev - 1, -1));
                break;

            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    handleSelectPlace(suggestions[highlightedIndex]);
                } else if (value.trim()) {
                    onSelect({
                        formattedAddress: value,
                        latitude: 0,
                        longitude: 0,
                    });
                }
                break;

            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    }, [isOpen, suggestions, highlightedIndex, value, onSelect, handleSelectPlace]);

    /**
     * Handle geolocation result
     */
    const handleGeolocationFound = useCallback(async (latitude: number, longitude: number) => {
        setIsLoading(true);
        try {
            const result = await photonReverseGeocode(latitude, longitude);
            if (result) {
                onChange(result.formattedAddress);
                onSelect(result);
                setIsOpen(false);
                setSuggestions([]);
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
            // Fallback to coordinates as address
            const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            onChange(coordsAddress);
            onSelect({
                formattedAddress: coordsAddress,
                latitude,
                longitude,
            });
        } finally {
            setIsLoading(false);
        }
    }, [onChange, onSelect]);

    /**
     * Close dropdown when clicking outside
     */
    const handleClickOutside = useCallback(() => {
        setIsOpen(false);
        setHighlightedIndex(-1);
    }, []);

    useClickOutside(containerRef, handleClickOutside);

    /**
     * Fetch suggestions when debounced value changes
     */
    useEffect(() => {
        const debouncedSearch = async () => {
            if (debouncedValue.trim().length >= 2) {
                await fetchSuggestions(debouncedValue);
            } else {
                setSuggestions([]);
                setIsOpen(false);
            }
        };

        debouncedSearch();
    }, [debouncedValue, fetchSuggestions]);

    return (
        <div 
            ref={containerRef}
            className={`photon-autocomplete-container ${className}`}
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
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input-field ${error ? 'error' : ''}`}
                    style={{
                        width: '100%',
                        paddingRight: '50px',
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

            {apiError && (
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
                    className="photon-autocomplete-dropdown"
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
                    {suggestions.map((feature, index) => {
                        const { mainText, secondaryText } = formatPhotonDisplay(feature);
                        const placeType = getPhotonPlaceType(feature);
                        
                        return (
                            <li
                                key={`${feature.properties.osm_id}-${index}`}
                                id={`${id}-suggestion-${index}`}
                                role="option"
                                aria-selected={index === highlightedIndex}
                                onClick={() => handleSelectPlace(feature)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                className="photon-autocomplete-item"
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
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span style={{ 
                                        fontSize: '11px', 
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        padding: '2px 6px',
                                        background: 'var(--color-border)',
                                        borderRadius: '4px',
                                        color: 'var(--color-text-muted)',
                                        fontWeight: 600,
                                    }}>{placeType}</span>
                                    {mainText}
                                </div>
                                {secondaryText && (
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            color: 'var(--color-text-muted)',
                                            marginTop: '2px',
                                            marginLeft: '28px',
                                        }}
                                    >
                                        {secondaryText}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {isOpen && !isLoading && suggestions.length === 0 && value.trim().length >= 2 && (
                <div
                    className="photon-autocomplete-no-results"
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
