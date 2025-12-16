
'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Luggage, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface BaggageSelectionProps {
    offerId: string;
    selectedServices: any[];
    onSelectionChange: (services: any[]) => void;
    passengers: any[];
}

export default function BaggageSelection({ offerId, selectedServices, onSelectionChange, passengers }: BaggageSelectionProps) {
    const [availableServices, setAvailableServices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/services?offer_id=${offerId}`);
                const data = await res.json();

                if (data.services) {
                    // Filter mainly for baggage
                    const bags = data.services.filter((s: any) => s.type === 'baggage');
                    setAvailableServices(bags);
                }
            } catch (err) {
                console.error("Failed to load services", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (offerId) fetchServices();
    }, [offerId]);

    const handleQuantityChange = (service: any, delta: number) => {
        const currentCount = selectedServices.filter(s => s.id === service.id).length;
        const newCount = currentCount + delta;

        if (newCount < 0) return;
        if (newCount > service.maximum_quantity) return; // Respect max quantity if provided

        if (delta > 0) {
            // Add service
            const bagService = {
                id: service.id,
                type: 'baggage',
                name: service.metadata?.description || 'Bagagem Extra',
                total_amount: service.total_amount,
                currency: service.total_currency,
                passenger_id: service.passenger_id
            };
            onSelectionChange([...selectedServices, bagService]);
        } else {
            // Remove one instance of this service
            const indexToRemove = selectedServices.findIndex(s => s.id === service.id);
            if (indexToRemove !== -1) {
                const newServices = [...selectedServices];
                newServices.splice(indexToRemove, 1);
                onSelectionChange(newServices);
            }
        }
    };

    if (isLoading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
    if (availableServices.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mt-6 text-center">
                <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                    <Luggage className="w-5 h-5 text-zinc-400" />
                    Bagagem
                </h3>
                <p className="text-zinc-500 text-sm">Nenhuma opção adicional encontrada.</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl shadow-sm border border-indigo-800 p-8 text-white relative overflow-hidden mt-6">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            <h3 className="font-bold text-2xl mb-6 flex items-center gap-3 relative z-10">
                <span className="bg-indigo-500/30 p-2 rounded-lg"><Luggage className="w-6 h-6 text-white" /></span>
                Bagagem Extra
            </h3>

            <div className="space-y-4 relative z-10">
                {availableServices.map((service, idx) => {
                    const price = Number(service.total_amount);
                    const quantity = selectedServices.filter(s => s.id === service.id).length;

                    // Try to match passenger name if possible (optional improvement for later)
                    // const passenger = passengers.find(p => p.id === service.passenger_id);

                    return (
                        <div key={service.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-lg">{service.metadata?.description || 'Bagagem Despachada'}</div>
                                <div className="text-indigo-200 text-sm">
                                    {service.total_currency} {price.toFixed(2)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-black/20 rounded-lg p-1">
                                <button
                                    onClick={() => handleQuantityChange(service, -1)}
                                    disabled={quantity === 0}
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 disabled:opacity-30 transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-bold w-4 text-center">{quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(service, 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
