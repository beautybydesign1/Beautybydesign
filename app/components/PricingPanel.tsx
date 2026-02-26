"use client";

import { PricingBreakdown } from "@/app/lib/pricing";

interface PricingPanelProps {
    pricing: PricingBreakdown;
    onTogglePayFull: () => void;
}

export default function PricingPanel({
    pricing,
    onTogglePayFull,
}: PricingPanelProps) {
    const fmt = (n: number) => `$${n.toFixed(2)}`;

    return (
        <div className="pricing-panel">
            <h3 className="heading-section" style={{ marginBottom: 16 }}>
                Order Summary
            </h3>

            {pricing.services.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 14 }}>
                    Select a service to see pricing
                </p>
            ) : (
                <>
                    {pricing.services.map((s, i) => (
                        <div className="pricing-row" key={i}>
                            <span className="label">{s.title}</span>
                            <span className="value">{fmt(s.price)}</span>
                        </div>
                    ))}

                    <div className="pricing-divider" />

                    <div className="pricing-row">
                        <span className="label">Service Total</span>
                        <span className="value">{fmt(pricing.serviceTotal)}</span>
                    </div>

                    <div className="pricing-row">
                        <span className="label">
                            Travel Fee
                            {pricing.distanceMiles !== null
                                ? ` (${pricing.distanceMiles.toFixed(1)} mi × $1)`
                                : ""}
                        </span>
                        <span className="value">
                            {pricing.distanceMiles !== null
                                ? fmt(pricing.travelFee)
                                : "—"}
                        </span>
                    </div>

                    <div className="pricing-divider" />

                    <div className="pricing-row pricing-total">
                        <span className="label">Grand Total</span>
                        <span className="value">{fmt(pricing.grandTotal)}</span>
                    </div>

                    <div className="pricing-deposit">
                        <div className="pricing-row" style={{ padding: 0 }}>
                            <span className="label">
                                {pricing.payFull
                                    ? "Amount Due Today"
                                    : "Deposit Due Today (50%)"}
                            </span>
                            <span className="value">{fmt(pricing.amountDue)}</span>
                        </div>
                    </div>

                    {!pricing.payFull && pricing.grandTotal > 0 && (
                        <div
                            className="toggle-wrapper"
                            style={{ marginTop: 16, paddingBottom: 0 }}
                        >
                            <button
                                type="button"
                                className={`toggle ${pricing.payFull ? "active" : ""}`}
                                onClick={onTogglePayFull}
                                aria-pressed={pricing.payFull}
                                aria-label="Pay in full instead"
                            >
                                <span className="toggle-knob" />
                            </button>
                            <span className="toggle-label">Pay in full instead</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
