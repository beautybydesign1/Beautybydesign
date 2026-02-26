import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const booking = await request.json();

        // Log booking for now (in production: save to Google Sheets, send WhatsApp)
        console.log("📋 New Booking Received:", {
            bookingId: booking.bookingId,
            customer: booking.customer?.fullName,
            services: booking.services?.map((s: { title: string }) => s.title),
            date: booking.date,
            time: booking.time,
            address: booking.address,
            grandTotal: booking.pricing?.grandTotal,
            amountPaid: booking.pricing?.amountDue,
        });

        // TODO: Integrate with Google Sheets API
        // TODO: Send WhatsApp notifications via Twilio
        // TODO: Send email confirmation

        return NextResponse.json({
            success: true,
            bookingId: booking.bookingId,
            message: "Booking confirmed",
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to process booking" },
            { status: 500 }
        );
    }
}
