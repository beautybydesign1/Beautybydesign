"use client";

import { PricingBreakdown } from "@/app/lib/pricing";

interface ConfirmationStepProps {
    customerName: string;
    date: string;
    time: string;
    pricing: PricingBreakdown;
    bookingId: string;
}

export default function ConfirmationStep({
    customerName,
    date,
    time,
    pricing,
    bookingId,
}: ConfirmationStepProps) {
    const formattedDate = date
        ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : "";

    const fmt = (n: number) => `$${n.toFixed(2)}`;

    return (
        <div className="confirmation">
            <div className="confirmation-check">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M5 12L10 17L19 7" />
                </svg>
            </div>

            <h2>Booking Confirmed!</h2>
            <p>
                Thank you, {customerName}! You&apos;ll receive a WhatsApp confirmation
                shortly.
            </p>

            <div className="confirmation-details">
                <div className="confirmation-detail-row">
                    <span className="label">Booking ID</span>
                    <span className="value" style={{ fontFamily: "var(--font-mono)" }}>
                        {bookingId}
                    </span>
                </div>
                <div className="confirmation-detail-row">
                    <span className="label">Services</span>
                    <span className="value">
                        {pricing.services.map((s) => s.title).join(", ")}
                    </span>
                </div>
                <div className="confirmation-detail-row">
                    <span className="label">Date</span>
                    <span className="value">{formattedDate}</span>
                </div>
                <div className="confirmation-detail-row">
                    <span className="label">Time</span>
                    <span className="value">{time}</span>
                </div>
                <div className="confirmation-detail-row">
                    <span className="label">Grand Total</span>
                    <span className="value">{fmt(pricing.grandTotal)}</span>
                </div>
                <div className="confirmation-detail-row">
                    <span className="label">Paid Today</span>
                    <span className="value" style={{ color: "var(--color-success)" }}>
                        {fmt(pricing.amountDue)}
                    </span>
                </div>
                {!pricing.payFull && (
                    <div className="confirmation-detail-row">
                        <span className="label">Remaining Balance</span>
                        <span className="value">{fmt(pricing.remainingBalance)}</span>
                    </div>
                )}
            </div>

            <button
                type="button"
                className="btn btn-secondary btn-full"
                onClick={() => window.location.reload()}
            >
                Book Another Appointment
            </button>
        </div>
    );
}
