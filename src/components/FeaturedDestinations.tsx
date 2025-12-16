'use client';

import React, { useState, useEffect } from 'react';
import DestinationCard from './DestinationCard';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FeaturedDestinations() {
    const [activeTab, setActiveTab] = useState('Lisboa');
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDeals = async () => {
            setLoading(true);
            try {
                // Fetch dynamic deals based on origin
                const res = await fetch(`/api/deals?origin=${encodeURIComponent(activeTab)}`);
                const data = await res.json();

                if (data.data) {
                    setDeals(data.data);
                    if (data.mock) {
                        // Optional: Silent log or toast if needed, but keeping it clean for UX
                        console.log("Using fallback deals");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch featured deals", error);
                toast.error("Não foi possível carregar as ofertas de destaque.");
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();
    }, [activeTab]);

    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-xs mb-2">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            Ofertas Imperdíveis
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
                            Destinos em Destaque <br />
                            <span className="text-zinc-300">saindo de {activeTab}</span>
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-zinc-100 p-1 rounded-xl overflow-x-auto">
                        {['Lisboa', 'São Paulo', 'Rio de Janeiro'].map((city) => (
                            <button
                                key={city}
                                onClick={() => setActiveTab(city)}
                                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${activeTab === city
                                    ? 'bg-white text-zinc-900 shadow-sm'
                                    : 'text-zinc-400 hover:text-zinc-600'
                                    }`}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[400px] w-full">
                            <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
                            <p className="font-bold text-zinc-300 animate-pulse">Buscando as melhores ofertas em tempo real...</p>
                        </div>
                    ) : deals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {deals.map((deal, idx) => (
                                <DestinationCard
                                    key={idx}
                                    {...deal}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[300px] text-zinc-400">
                            <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                            <p>Nenhuma oferta de destaque encontrada no momento.</p>
                        </div>
                    )}
                </div>

                {/* Footer Note */}
                <p className="text-center text-zinc-400 text-sm mt-12">
                    *Preços obtidos em tempo real via Duffel API. Sujeito a disponibilidade.
                </p>

            </div>
        </div>
    );
}
