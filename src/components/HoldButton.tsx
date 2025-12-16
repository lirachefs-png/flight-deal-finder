'use client';

import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface HoldButtonProps {
    offer: any;
    passengers: any;
}

export default function HoldButton({ offer, passengers }: HoldButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleHold = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent parent click

        // 1. Check Auth
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            toast.error("Login necessário", {
                description: "Para segurar o preço, você precisa estar logado.",
                action: {
                    label: "Login",
                    onClick: () => router.push('/') // Assuming Header handles login on Home or we act like it
                }
            });
            return;
        }

        setLoading(true);

        try {
            // 2. Call API
            const res = await fetch('/api/hold', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offer_id: offer.id,
                    passengers: passengers, // Basic array of passengers required by Duffel
                    user_id: session.user.id,
                    trip_details: {
                        origin: offer.slices[0].segments[0].origin.iata_code,
                        destination: offer.slices[0].segments[offer.slices[0].segments.length - 1].destination.iata_code,
                        departure_date: offer.slices[0].segments[0].departing_at
                    }
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Preço Segurado! 🔒", {
                    description: `Garantido até ${new Date(data.payment_required_by).toLocaleDateString()} às ${new Date(data.payment_required_by).toLocaleTimeString()}`
                });
                // Redirect to account to see hold?
                // router.push('/account');
            } else {
                throw new Error(data.error || 'Falha ao segurar');
            }

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao segurar", { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleHold}
            disabled={loading}
            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm md:mr-2"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            <span className="hidden md:inline">Segurar Preço</span>
            <span className="md:hidden">Hold</span>
        </button>
    );
}
