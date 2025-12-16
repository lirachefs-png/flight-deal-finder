import React from 'react';
import { duffel } from '@/lib/duffel';
import Link from 'next/link';
import { CheckCircle, Plane, Calendar, User, FileText, Home } from 'lucide-react';
import { format } from 'date-fns';
import DownloadVoucherButton from '@/components/documents/DownloadVoucherButton';
import HoldTimer from '@/components/booking/HoldTimer';

export default async function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let order: any = null;
    let error: string | null = null;

    try {
        const res = await duffel.orders.get(id);
        order = res.data;
    } catch (e: any) {
        error = e.message || "Pedido não encontrado.";
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-zinc-900 mb-2">Ops! Pedido não encontrado.</h1>
                    <p className="text-zinc-500 mb-6">{error}</p>
                    <Link href="/" className="text-rose-600 font-bold hover:underline">Voltar para o início</Link>
                </div>
            </div>
        );
    }

    // Extract convenient data
    const bookingRef = order.booking_reference;
    const passenger = order.passengers[0]; // Assuming 1 pax for now
    const slice = order.slices[0];
    const segment = slice.segments[0];

    return (
        <main className="min-h-screen bg-zinc-50 font-sans text-zinc-900 py-10 px-6">
            <div className="max-w-2xl mx-auto">

                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 mb-2">Reserva Confirmada!</h1>
                    <p className="text-zinc-500 mb-6">Sua reserva foi criada com sucesso e está aguardando pagamento.</p>

                    {/* TIMER & STATUS */}
                    <div className="mb-8 max-w-md mx-auto">
                        <HoldTimer expiresAt={order.expires_at} />
                    </div>

                    {/* VOUCHER DOWNLOAD */}
                    <div className="mb-8">
                        <DownloadVoucherButton booking={order} />
                    </div>
                </div>

                {/* Ticket / Receipt Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden relative">

                    {/* Top Decor */}
                    <div className="h-2 bg-gradient-to-r from-rose-500 to-orange-500"></div>

                    <div className="p-8">
                        {/* PNR Section */}
                        <div className="flex justify-between items-start border-b border-dashed border-zinc-200 pb-8 mb-8">
                            <div>
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Código da Reserva (PNR)</span>
                                <p className="text-4xl font-mono font-bold text-zinc-900 mt-1">{bookingRef}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Valor Total</span>
                                <p className="text-2xl font-bold text-rose-600 mt-1">
                                    {Number(order.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: order.total_currency })}
                                </p>
                            </div>
                        </div>

                        {/* Itinerary Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-4">
                                    <Plane className="w-4 h-4 text-rose-500" /> Voo
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold">{segment.marketing_carrier.name}</p>
                                    <p className="text-zinc-500 text-sm">Voo {segment.marketing_carrier_flight_number}</p>
                                    <p className="text-zinc-500 text-sm mt-1">
                                        {segment.origin.iata_code} <span className="mx-1">→</span> {segment.destination.iata_code}
                                    </p>
                                    <p className="text-zinc-400 text-xs mt-1">
                                        {format(new Date(segment.departing_at), "dd 'de' MMM, HH:mm")}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-4">
                                    <User className="w-4 h-4 text-rose-500" /> Passageiro
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold">{passenger.given_name} {passenger.family_name}</p>
                                    <p className="text-zinc-500 text-sm">{passenger.email}</p>
                                    <p className="text-zinc-400 text-xs uppercase mt-1">
                                        {passenger.gender === 'm' ? 'Masculino' : 'Feminino'} • {passenger.type}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Instructions (Fake) */}
                        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 flex items-start gap-4">
                            <FileText className="w-6 h-6 text-zinc-400 mt-1" />
                            <div>
                                <h4 className="font-bold text-sm text-zinc-900">Pagamento Pendente</h4>
                                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                    Esta é uma reserva <strong>HOLD</strong> (Bloqueio). Para emitir o bilhete final, o pagamento deve ser processado em até 24h.
                                    <br /><span className="italic opacity-70">(Em um app real, aqui entraria o Gateway de Pagamento, ex: Stripe).</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-center">
                    <Link href="/" className="flex items-center gap-2 text-zinc-600 font-bold hover:text-zinc-900 transition-colors bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md border border-zinc-100">
                        <Home className="w-4 h-4" /> Voltar para o Início
                    </Link>
                </div>

            </div>
        </main>
    );
}
