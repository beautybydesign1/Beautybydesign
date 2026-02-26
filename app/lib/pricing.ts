import { Service } from "@/app/data/services";

export interface PricingBreakdown {
    services: { title: string; price: number }[];
    serviceTotal: number;
    distanceMiles: number | null;
    travelFee: number;
    grandTotal: number;
    depositAmount: number;
    remainingBalance: number;
    payFull: boolean;
    amountDue: number;
}

export function calculatePricing(
    selectedServices: Service[],
    distanceMiles: number | null,
    travelFeePerMile: number,
    depositPercentage: number,
    payFull: boolean = false
): PricingBreakdown {
    const serviceItems = selectedServices.map((s) => ({
        title: s.title,
        price: s.price,
    }));

    const serviceTotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
    const travelFee =
        distanceMiles !== null ? Math.round(distanceMiles * travelFeePerMile) : 0;
    const grandTotal = serviceTotal + travelFee;
    const depositAmount = Math.ceil(grandTotal * (depositPercentage / 100));
    const remainingBalance = grandTotal - depositAmount;
    const amountDue = payFull ? grandTotal : depositAmount;

    return {
        services: serviceItems,
        serviceTotal,
        distanceMiles,
        travelFee,
        grandTotal,
        depositAmount,
        remainingBalance,
        payFull,
        amountDue,
    };
}
