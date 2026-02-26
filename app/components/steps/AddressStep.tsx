"use client";

import { useState } from "react";
import { PricingBreakdown } from "@/app/lib/pricing";
import PricingPanel from "@/app/components/PricingPanel";
import { BEAUTICIAN } from "@/app/data/services";

interface AddressStepProps {
    address: string;
    distanceMiles: number | null;
    pricing: PricingBreakdown;
    onAddressChange: (address: string) => void;
    onCalculateDistance: () => void;
    onTogglePayFull: () => void;
    onConfirm: () => void;
    onBack: () => void;
    isCalculating: boolean;
}

export default function AddressStep({
    address,
    distanceMiles,
    pricing,
    onAddressChange,
    onCalculateDistance,
    onTogglePayFull,
    onConfirm,
    onBack,
    isCalculating,
}: AddressStepProps) {
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (!address.trim()) {
            setError("Please enter your service address");
            return;
        }
        setError("");
        onConfirm();
    };

    return (
        <div className="step-content">
            <h2 className="step-title">Your Address & Review</h2>
            <p className="step-subtitle">
                Where should we come? We&apos;ll calculate the travel fee.
            </p>

            <div className="form-fields">
                <div className="input-group">
                    <label htmlFor="address" className="input-label">
                        Service Address
                    </label>
                    <input
                        id="address"
                        type="text"
                        className={`input-field ${error ? "error" : ""}`}
                        placeholder="Enter your address"
                        value={address}
                        onChange={(e) => onAddressChange(e.target.value)}
                        autoComplete="street-address"
                    />
                    {error && <span className="input-error">{error}</span>}

                    {!distanceMiles && address.trim() && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onCalculateDistance}
                            disabled={isCalculating}
                            style={{ marginTop: 8 }}
                        >
                            {isCalculating ? "Calculating..." : "📍 Calculate Travel Fee"}
                        </button>
                    )}

                    {distanceMiles !== null && (
                        <div className="address-result">
                            <span>📍</span>
                            <span>
                                {distanceMiles.toFixed(1)} miles from base — Travel fee: $
                                {pricing.travelFee.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                <PricingPanel pricing={pricing} onTogglePayFull={onTogglePayFull} />

                <div className="policy-box">
                    <strong>Cancellation Policy</strong>
                    {BEAUTICIAN.cancellationPolicy}
                </div>
            </div>

            <div className="step-navigation">
                <button type="button" className="btn btn-ghost" onClick={onBack}>
                    ← Back
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-full"
                    onClick={handleConfirm}
                    disabled={pricing.services.length === 0}
                >
                    💳 Pay & Confirm Booking
                </button>
            </div>
        </div>
    );
}
