"use client";

import { useState, useCallback } from "react";
import { BEAUTICIAN } from "@/app/data/services";

export default function TravelCalculator() {
    const [address, setAddress] = useState("");
    const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState("");

    const calculateDistance = useCallback(async () => {
        if (!address.trim()) {
            setError("Please enter an address first");
            return;
        }

        setError("");
        setIsCalculating(true);

        try {
            const response = await fetch("/api/distance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address }),
            });

            if (response.ok) {
                const data = await response.json();
                setDistanceMiles(data.distanceMiles);
            } else {
                setError("Could not calculate distance. Please check the address.");
            }
        } catch {
            setError("An error occurred while calculating distance.");
        } finally {
            setIsCalculating(false);
        }
    }, [address]);

    const travelFee = distanceMiles !== null ? Math.round(distanceMiles * BEAUTICIAN.travelFeePerMile) : 0;

    return (
        <div className="step-content fade-in">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <h2 className="step-title" style={{ textAlign: 'center' }}>Travel Fee Calculator</h2>
                <p className="step-subtitle" style={{ textAlign: 'center' }}>
                    Enter your location to see the estimated travel fee to your address.
                </p>

                <div className="form-fields">
                    <div className="input-group">
                        <label htmlFor="calculator-address" className="input-label">
                            Your Location
                        </label>
                        <input
                            id="calculator-address"
                            type="text"
                            className={`input-field ${error ? "error" : ""}`}
                            placeholder="e.g. 123 Main St, Middletown, DE"
                            value={address}
                            onChange={(e) => {
                                setAddress(e.target.value);
                                setDistanceMiles(null);
                                setError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") calculateDistance();
                            }}
                        />
                        {error && <span className="input-error">{error}</span>}
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-full"
                        onClick={calculateDistance}
                        disabled={isCalculating || !address.trim()}
                    >
                        {isCalculating ? "Calculating..." : "Get Estimated Fee"}
                    </button>

                    {distanceMiles !== null && !isCalculating && (
                        <div className="pricing-panel fade-in" style={{ marginTop: 24, padding: 20 }}>
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
                        </div>
                    )}

                    <div className="policy-box" style={{ marginTop: 24 }}>
                        <strong>Note:</strong> Travel fees are calculated from our base in
                        {BEAUTICIAN.baseLocation.address}. This is an estimate and may vary slightly based on final route.
                    </div>
                </div>
            </div>

            {/* <div style={{ textAlign: 'center', marginTop: 32 }}>
                <a href="/" className="btn btn-ghost" style={{ fontSize: 14 }}>
                    ← Back to full booking
                </a>
            </div> */}
        </div>
    );
}
