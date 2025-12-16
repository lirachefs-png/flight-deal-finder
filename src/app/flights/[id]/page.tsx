import React from 'react';
import { duffel } from '@/lib/duffel';
import { ArrowLeft, Clock, Calendar, Plane } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import BookingWrapper from '@/components/booking/BookingWrapper';

export default async function FlightDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let offer: any = null;
    let error: string | null = null;

    try {
        const res = await duffel.offers.get(id, { return_available_services: true });
        offer = res.data;
    } catch (e: any) {
        error = e.message || "Erro ao carregar oferta.";
        console.error(e);
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                    <h1 className="text-xl font-bold text-red-500 mb-2">Erro ao carregar voo</h1>
                    <p className="text-zinc-600 mb-6">{error}</p>
                    <Link href="/" className="bg-zinc-900 text-white px-6 py-2 rounded-full font-bold">Voltar</Link>
                </div>
            </div>
        );
    }

    const slice = offer.slices[0];
    const segments = slice.segments;
    const airline = offer.owner;

    const getDuration = (start: string, end: string) => {
        const diff = differenceInMinutes(new Date(end), new Date(start));
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
    };

    return (
        <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
            {/* Header / Nav */}
            <nav className="bg-white px-6 py-4 shadow-sm flex items-center gap-4 sticky top-0 z-50">
                <Link href="/" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-zinc-600" />
                </Link>
                <div>
                    <h1 className="font-bold text-lg leading-tight">Detalhes do Voo</h1>
                    <p className="text-xs text-zinc-400">Oferta {offer.id.slice(0, 8)}...</p>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-6 mt-8">

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-zinc-100 overflow-hidden">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-6 text-white flex justify-between items-center">
                        <div>
                            <span className="font-bold text-2xl">{Number(offer.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: offer.total_currency })}</span>
                            <p className="text-white/80 text-sm">Preço total por passageiro</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <span className="font-bold text-sm">Econômica</span>
                        </div>
                    </div>

                    {/* Itinerary */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-8">
                            {airline.logo_symbol_url ? (
                                <Image src={airline.logo_symbol_url} alt={airline.name} width={40} height={40} className="rounded-full bg-zinc-100" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500">{airline.name.slice(0, 2)}</div>
                            )}
                            <span className="font-bold text-lg">{airline.name}</span>
                        </div>

                        {/* Segments Timeline */}
                        <div className="relative border-l-2 border-zinc-200 ml-4 space-y-10 py-2">
                            {segments.map((seg: any, idx: number) => (
                                <div key={seg.unique_segment_id || idx} className="relative pl-8">
                                    {/* Dot */}
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-rose-500 ring-4 ring-white"></div>

                                    {/* Dep / Arr */}
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-xl">{format(new Date(seg.departing_at), 'HH:mm')}</span>
                                                <span className="text-sm text-zinc-500 ml-2">{seg.origin.iata_code} - {seg.origin.name}</span>
                                            </div>
                                            <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded text-zinc-500">
                                                {format(new Date(seg.departing_at), 'dd MMM')}
                                            </span>
                                        </div>

                                        <p className="text-sm text-zinc-400 flex items-center gap-2 mt-2">
                                            <Clock className="w-3 h-3" /> Duração: {getDuration(seg.departing_at, seg.arriving_at)}
                                        </p>

                                        {seg.aircraft && (
                                            <p className="text-sm text-zinc-400 flex items-center gap-2">
                                                <Plane className="w-3 h-3" /> Aeronave: {seg.aircraft.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Connection / Arrival Visual Logic (Simplified) */}
                                    <div className="mt-8 mb-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-bold text-xl">{format(new Date(seg.arriving_at), 'HH:mm')}</span>
                                                <span className="text-sm text-zinc-500 ml-2">{seg.destination.iata_code} - {seg.destination.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Layover warning if next segment exists */}
                                    {idx < segments.length - 1 && (
                                        <div className="my-6 bg-orange-50 text-orange-700 p-3 rounded-xl text-sm font-bold flex items-center gap-2 justify-center">
                                            <Clock className="w-4 h-4" />
                                            Conexão: {getDuration(seg.arriving_at, segments[idx + 1].departing_at)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Booking Form */}
                    <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
                        <BookingWrapper offer={offer} />
                    </div>
                </div>

                {/* Debug Info */}
                <div className="mt-8 p-4 opacity-50 text-[10px] text-zinc-400 font-mono text-center">
                    Offer ID: {id} <br />
                    Source: Duffel API
                </div>
            </div>
        </main>
    );
}
