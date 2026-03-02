"use client";

import { useState, useCallback } from "react";
import { BEAUTICIAN } from "@/app/data/services";
import PhotonAutocomplete from "./PhotonAutocomplete";
import NotificationContainer from "./NotificationToast";
import { useNotification } from "@/app/hooks/useNotification";
import { PhotonGeocodingResult } from "@/app/types/photon";

export default function TravelCalculatorPhoton() {
    const [address, setAddress] = useState("");
    const [selectedPlace, setSelectedPlace] = useState<PhotonGeocodingResult | null>(null);
    const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState("");
    const { notifications, removeNotification, error: showError, success: showSuccess } = useNotification();

    /**
     * Calculate distance between beautician's base location and selected address
     */
    const calculateDistance = useCallback(async () => {
        if (!address.trim()) {
            setError("Please enter an address first");
            return;
        }

        setError("");
        setIsCalculating(true);

        try {
            // If we have coordinates from Photon API or geolocation, use them
            if (selectedPlace && selectedPlace.latitude !== 0 && selectedPlace.longitude !== 0) {
                const response = await fetch("/api/distance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        address,
                        latitude: selectedPlace.latitude,
                        longitude: selectedPlace.longitude,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setDistanceMiles(data.distanceMiles);
                    showSuccess(`Distance calculated: ${data.distanceMiles.toFixed(1)} miles`);
                } else {
                    setError("Could not calculate distance. Please check the address.");
                    showError("Failed to calculate distance. Please try again.");
                }
            } else {
                // Fallback: send just the address for geocoding on the server
                const response = await fetch("/api/distance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ address }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setDistanceMiles(data.distanceMiles);
                    showSuccess(`Distance calculated: ${data.distanceMiles.toFixed(1)} miles`);
                } else {
                    setError("Could not calculate distance. Please check the address.");
                    showError("Failed to calculate distance. Please try again.");
                }
            }
        } catch {
            setError("An error occurred while calculating distance.");
            showError("An unexpected error occurred. Please try again.");
        } finally {
            setIsCalculating(false);
        }
    }, [address, selectedPlace, showSuccess, showError]);

    /**
     * Handle place selection from Photon autocomplete
     */
    const handlePlaceSelect = useCallback((result: PhotonGeocodingResult) => {
        setSelectedPlace(result);
        setAddress(result.formattedAddress);
        setDistanceMiles(null);
        setError("");
        
        showSuccess('Address selected successfully!');
    }, [showSuccess]);

    /**
     * Handle address input changes
     */
    const handleAddressChange = useCallback((value: string) => {
        setAddress(value);
        if (distanceMiles !== null) {
            setDistanceMiles(null);
        }
        setError("");
    }, [distanceMiles]);

    const travelFee = distanceMiles !== null ? Math.round(distanceMiles * BEAUTICIAN.travelFeePerMile) : 0;

    return (
        <div className="step-content fade-in">
            <NotificationContainer 
                notifications={notifications} 
                onDismiss={removeNotification} 
            />
            
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 className="step-title" style={{ textAlign: 'center' }}>Travel Fee Calculator</h2>
                <p className="step-subtitle" style={{ textAlign: 'center' }}>
                    Enter your location to see the estimated travel fee to your address.
                </p>

                {/* Powered by Photon badge */}
                {/* <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                }}>
                    <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(197, 169, 129, 0.1)',
                        borderRadius: '20px',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        Powered by Photon - Free Geocoding
                    </span>
                </div> */}

                <div className="form-fields">
                    <div className="input-group">
                        <PhotonAutocomplete
                            id="calculator-address"
                            label="Your Location"
                            value={address}
                            onChange={handleAddressChange}
                            onSelect={handlePlaceSelect}
                            placeholder="e.g. 123 Main St, Middletown, DE"
                            error={error}
                            disabled={isCalculating}
                        />
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-full"
                        onClick={calculateDistance}
                        disabled={isCalculating || !address.trim()}
                    >
                        {isCalculating ? (
                            <>
                                <svg 
                                    width="18" 
                                    height="18" 
                                    viewBox="0 0 24 24" 
                                    style={{ 
                                        animation: 'spin 1s linear infinite',
                                        marginRight: '8px',
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
                                    />
                                </svg>
                                Calculating...
                            </>
                        ) : (
                            "Get Estimated Fee"
                        )}
                    </button>

                    {distanceMiles !== null && !isCalculating && (
                        <div className="pricing-panel fade-in" style={{ marginTop: 24, padding: 20 }}>
                            {distanceMiles < 10 ? (
                                // No fee for under 10 miles
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <svg 
                                        width="48" 
                                        height="48" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="var(--color-success)" 
                                        strokeWidth="2"
                                        style={{ margin: '0 auto 16px' }}
                                    >
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    <h3 style={{ 
                                        fontSize: '20px', 
                                        fontWeight: 600, 
                                        color: 'var(--color-success)',
                                        marginBottom: '8px',
                                    }}>
                                        No Extra Travel Fee
                                    </h3>
                                    <p style={{ 
                                        color: 'var(--color-text-muted)', 
                                        fontSize: '14px',
                                        margin: 0,
                                    }}>
                                        Your location is {distanceMiles.toFixed(1)} miles away.<br/>
                                        No additional travel charges apply.
                                    </p>
                                </div>
                            ) : (
                                // Show fee for 10+ miles
                                <>
                                    <div className="pricing-row">
                                        <span className="label">Estimated Distance</span>
                                        <span className="value">{distanceMiles.toFixed(1)} miles</span>
                                    </div>
                                    <div className="pricing-row">
                                        <span className="label">Rate per Mile</span>
                                        <span className="value">${BEAUTICIAN.travelFeePerMile.toFixed(2)}</span>
                                    </div>
                                    <div className="pricing-divider" />
                                    <div className="pricing-row pricing-total" style={{ paddingBottom: 0 }}>
                                        <span className="label" style={{ fontSize: 18 }}>Estimated Travel Fee</span>
                                        <span className="value" style={{ fontSize: 22, color: 'var(--color-primary-dark)' }}>
                                            ${travelFee.toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            )}
                            
                            {selectedPlace && (
                                <div style={{ 
                                    marginTop: 12, 
                                    padding: '10px 14px',
                                    background: 'rgba(87, 165, 122, 0.08)',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    color: 'var(--color-success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Location found: {selectedPlace.city}, {selectedPlace.state}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="policy-box" style={{ marginTop: 24 }}>
                        <strong>Note:</strong> Travel fees are calculated from{" "}
                        {BEAUTICIAN.baseLocation.address}. This is an estimate and may vary slightly based on final route.
                    </div>
                </div>
            </div>
        </div>
    );
}
