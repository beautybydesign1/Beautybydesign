"use client";

import { useState, useCallback } from "react";
import { Service, BEAUTICIAN } from "@/app/data/services";
import { calculatePricing, PricingBreakdown } from "@/app/lib/pricing";
import StepIndicator from "@/app/components/StepIndicator";
import DetailsStep, {
    CustomerDetails,
} from "@/app/components/steps/DetailsStep";
import ServiceStep from "@/app/components/steps/ServiceStep";
import AddressStep from "@/app/components/steps/AddressStep";
import ConfirmationStep from "@/app/components/steps/ConfirmationStep";

function generateBookingId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "BBD-";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function BookingForm() {
    // Step management
    const [currentStep, setCurrentStep] = useState(1);

    // Step 1: Customer Details
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
        fullName: "",
        phone: "",
        email: "",
    });

    // Step 2: Service & DateTime
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // Step 3: Address & Pricing
    const [address, setAddress] = useState("");
    const [distanceMiles, setDistanceMiles] = useState<number | null>(null);
    const [payFull, setPayFull] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Step 4: Confirmation
    const [bookingId, setBookingId] = useState("");

    // Calculated pricing
    const pricing: PricingBreakdown = calculatePricing(
        selectedServices,
        distanceMiles,
        BEAUTICIAN.travelFeePerMile,
        BEAUTICIAN.depositPercentage,
        payFull
    );

    // Distance calculation (simulated for MVP — will use Google Maps API later)
    const calculateDistance = useCallback(async () => {
        if (!address.trim()) return;
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
                // Fallback: estimate distance randomly for demo
                const estimatedDistance = Math.round(5 + Math.random() * 25);
                setDistanceMiles(estimatedDistance);
            }
        } catch {
            // Fallback: estimate distance for demo
            const estimatedDistance = Math.round(5 + Math.random() * 25);
            setDistanceMiles(estimatedDistance);
        } finally {
            setIsCalculating(false);
        }
    }, [address]);

    // Handle booking confirmation
    const handleConfirm = async () => {
        // Generate booking ID
        const id = generateBookingId();
        setBookingId(id);

        // In production: call Stripe Checkout API here
        // For MVP, proceed to confirmation
        setCurrentStep(4);

        // Optionally call webhook to store booking
        try {
            await fetch("/api/booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: id,
                    customer: customerDetails,
                    services: selectedServices.map((s) => ({
                        id: s.id,
                        title: s.title,
                        price: s.price,
                    })),
                    date,
                    time,
                    address,
                    distanceMiles,
                    pricing: {
                        serviceTotal: pricing.serviceTotal,
                        travelFee: pricing.travelFee,
                        grandTotal: pricing.grandTotal,
                        depositAmount: pricing.depositAmount,
                        amountDue: pricing.amountDue,
                        payFull,
                    },
                }),
            });
        } catch {
            // Silently fail — booking still confirmed on client
        }
    };

    return (
        <>
            {/* Brand Header */}
            <header className="brand-header">
                <img
                    src="/logo.webp"
                    alt="Beauty by Design Logo"
                    className="brand-logo"
                />
                <h1 className="brand-name">{BEAUTICIAN.businessName}</h1>
                <p className="brand-tagline">
                    Mobile Salon · Middletown, DE & Beyond ✨
                </p>
            </header>

            {/* Step Indicator */}
            {currentStep < 4 && (
                <StepIndicator currentStep={currentStep} totalSteps={3} />
            )}

            {/* Steps */}
            {currentStep === 1 && (
                <DetailsStep
                    data={customerDetails}
                    onChange={setCustomerDetails}
                    onNext={() => setCurrentStep(2)}
                />
            )}

            {currentStep === 2 && (
                <ServiceStep
                    selectedServices={selectedServices}
                    date={date}
                    time={time}
                    onSelectServices={setSelectedServices}
                    onDateChange={setDate}
                    onTimeChange={setTime}
                    onNext={() => setCurrentStep(3)}
                    onBack={() => setCurrentStep(1)}
                />
            )}

            {currentStep === 3 && (
                <AddressStep
                    address={address}
                    distanceMiles={distanceMiles}
                    pricing={pricing}
                    onAddressChange={(val) => {
                        setAddress(val);
                        setDistanceMiles(null);
                    }}
                    onCalculateDistance={calculateDistance}
                    onTogglePayFull={() => setPayFull(!payFull)}
                    onConfirm={handleConfirm}
                    onBack={() => setCurrentStep(2)}
                    isCalculating={isCalculating}
                />
            )}

            {currentStep === 4 && (
                <ConfirmationStep
                    customerName={customerDetails.fullName}
                    date={date}
                    time={time}
                    pricing={pricing}
                    bookingId={bookingId}
                />
            )}
        </>
    );
}
