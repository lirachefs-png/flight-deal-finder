'use client';

import React, { useState } from 'react';
import { Plane, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface DestinationCardProps {
    id?: string;
    city: string;
    country: string;
    price: number;
    currency: string;
    images?: string[]; // Array of images
    imageUrl?: string; // Fallback
    dateRange: string;
    originCode?: string;
    destinationCode?: string;
    airline?: string;
}

export default function DestinationCard({
    id,
    city,
    country,
    price,
    currency,
    images,
    imageUrl,
    dateRange,
    originCode,
    destinationCode,
    airline
}: DestinationCardProps) {
    const router = useRouter();
    // Determine image source
    const gallery = images && images.length > 0 ? images : [imageUrl || ''];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isBooking, setIsBooking] = useState(false);

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    };

    const handleBook = async () => {
        setIsBooking(true);

        try {
            // 1. Check Login
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error("Login necessário", {
                    description: "Faça login para reservar esta oferta.",
                    action: {
                        label: "Login",
                        onClick: () => router.push('/login')
                    }
                });
                setIsBooking(false);
                return;
            }

            // If ID is mock or missing, redirect to search
            if (!id || id.startsWith('mock')) {
                toast.info("Oferta Simulada", {
                    description: "Redirecionando para busca em tempo real..."
                });
                // Redirect to search with params
                const query = new URLSearchParams({
                    origin: originCode || 'LIS',
                    destination: destinationCode || '',
                    date: new Date().toISOString().split('T')[0] // today as fallback
                });
                router.push(`/?${query.toString()}`);
                setIsBooking(false);
                return;
            }

            // 2. Initiate Order
            const res = await fetch('/api/orders/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offer_id: id,
                    user_id: session.user.id,
                    amount: price,
                    currency: currency,
                    passengers: [{ type: 'adult' }], // Default for deals
                    trip_details: {
                        origin: originCode || 'UNK',
                        destination: destinationCode || 'UNK',
                        departure_date: new Date().toISOString(), // Fallback if missing, usually not critical for Initiate if Offer ID is valid
                        raw_offer: { id, airline: airline || 'Partner' }
                    }
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Reserva Iniciada!");
                router.push(`/checkout/${data.order_id}`);
            } else {
                // If fails (often due to expired offer), fallback to search
                toast.warning("Oferta Expirada", { description: "Buscando novas opções..." });
                const query = new URLSearchParams({
                    origin: originCode || 'LIS',
                    destination: destinationCode || '',
                    date: new Date().toISOString().split('T')[0]
                });
                router.push(`/?${query.toString()}`);
            }

        } catch (error) {
            console.error(error);
            toast.error("Erro de conexão");
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <div className="group relative h-80 w-full rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            {/* Background Image Carousel */}
            {gallery.map((img, idx) => (
                <div
                    key={idx}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${idx === currentImageIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`}
                    style={{ backgroundImage: `url('${img}')` }}
                ></div>
            ))}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

            {/* Carousel Controls (Show on Hover) */}
            {gallery.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        {gallery.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/30'}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-0 pointer-events-none">

                {/* Top Badge */}
                <div className="flex justify-end pointer-events-auto">
                    <div className="bg-rose-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-wider">
                        <Plane className="w-3 h-3 fill-current" />
                        Best Price
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto">
                    <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-1">{country}</p>
                    <h3 className="text-white text-3xl font-black mb-2 leading-tight">{city}</h3>
                    <p className="text-zinc-300 text-sm mb-4 font-medium">{dateRange}</p>

                    <div className="flex items-center justify-between border-t border-white/20 pt-4">
                        <div className="flex flex-col">
                            <span className="text-zinc-400 text-xs">from</span>
                            <span className="text-white text-2xl font-black">
                                {price.toLocaleString('pt-BR', { style: 'currency', currency: currency })}*
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBook();
                            }}
                            disabled={isBooking}
                            className="bg-white/10 hover:bg-white text-white hover:text-rose-900 backdrop-blur-md px-4 py-2 rounded-lg font-bold text-sm transition-colors border border-white/20 hover:border-transparent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Book Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
