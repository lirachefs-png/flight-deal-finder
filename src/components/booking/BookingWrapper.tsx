'use client';

import React, { useState } from 'react';
import SeatMap from './SeatMap';
import BaggageSelector from './BaggageSelector';
import PassengerForm from './PassengerForm';

interface BookingWrapperProps {
    offer: any;
}

export default function BookingWrapper({ offer }: BookingWrapperProps) {
    const [selectedServices, setSelectedServices] = useState<any[]>([]);

    // Handler for baggage updates
    // For now, we simulate service objects since we don't have the full service list from backend yet
    // Handler for baggage updates
    const handleBaggageUpdate = (bags: number[]) => {
        // Find a baggage service from the offer
        // Duffel services usually have type: 'baggage'
        const baggageService = offer.available_services?.find((s: any) => s.type === 'baggage');

        if (!baggageService) {
            console.warn("No baggage service found for this offer.");
            // Ideally we should disable the selector, but for now we just won't add valid services
            return;
        }

        const bagServices = bags.flatMap((count, index) => {
            const passengerId = offer.passengers[index].id;
            // Create N bag service items using the REAL service ID
            return Array(count).fill({
                id: baggageService.id,
                quantity: 1,
                passenger_id: passengerId
            });
        });

        // Merge with existing non-baggage services (like seats)
        // Filter out old bags (by checking if ID matches the current baggage service ID)
        const otherServices = selectedServices.filter(s => s.id !== baggageService.id);
        setSelectedServices([...otherServices, ...bagServices]);
    };

    return (
        <div className="flex flex-col gap-6">

            {/* 1. SEAT MAP */}
            <SeatMap
                offerId={offer.id}
                selectedServices={selectedServices}
                onSelectionChange={setSelectedServices}
                passengers={offer.passengers}
            />

            {/* 2. BAGGAGE */}
            <BaggageSelector
                passengers={offer.passengers}
                onUpdate={handleBaggageUpdate}
            />

            {/* 3. FINAL FORM */}
            <PassengerForm
                offerId={offer.id}
                totalAmount={offer.total_amount}
                currency={offer.total_currency}
                passengers={offer.passengers}
                // Pass the gathered services to the form for submission
                selectedServices={selectedServices}
            />
        </div>
    );
}
