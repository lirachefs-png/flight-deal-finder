'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, Plane, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '@/components/StripeCheckoutForm';

// New Booking Components
import SeatMap from '@/components/booking/SeatMap';
import BaggageSelection from '@/components/booking/BaggageSelection';

const stripePromise = null; // Removed static init

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    // Stripe State
    const [clientSecret, setClientSecret] = useState("");
    const [stripeError, setStripeError] = useState<string | null>(null);
    const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

    // New Service State (Array of specific Duffel service objects)
    const [selectedServices, setSelectedServices] = useState<any[]>([]);

    const [basePrice, setBasePrice] = useState(0);
    const [currentTotal, setCurrentTotal] = useState(0);

    // Helper to calculate total dynamically
    const updateOrderTotal = async (newServices: any[]) => {
        setSelectedServices(newServices);

        // Sum up services
        const servicesTotal = newServices.reduce((sum, service) => sum + Number(service.total_amount), 0);
        const newTotal = basePrice + servicesTotal;

        setCurrentTotal(newTotal);

        // Update Backend
        setStripeError(null); // Clear errors while updating
        setClientSecret(""); // Hide form while updating

        try {
            await fetch('/api/orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: orderId,
                    total_amount: newTotal,
                    services: newServices
                })
            });
            // Reload Payment Intent
            createPaymentIntent(orderId);
        } catch (err) {
            console.error(err);
            toast.error("Erro ao atualizar pedido");
        }
    };

    useEffect(() => {
        if (!orderId) return;
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) {
            toast.error("Erro ao carregar pedido");
        } else {
            // Check if we have legacy format (obj) or new format (array)
            let storedServices = [];
            let savedServicesTotal = 0;

            if (data.metadata?.services && Array.isArray(data.metadata.services)) {
                storedServices = data.metadata.services;
                savedServicesTotal = storedServices.reduce((sum: number, s: any) => sum + Number(s.total_amount), 0);
            }

            setSelectedServices(storedServices);

            // Determine Base Price
            // If we have profit analytics, use that. Otherwise fallback.
            let detectedBase = 0;
            if (data.raw_offer?._profit_analytics?.base_amount) {
                // The saved 'amount' might include previous updates. 
                // Best to rely on stored profit info + markup or just subtract services from current total?
                // Safer: Current Amount - Saved Services = Base (roughly)
                detectedBase = Number(data.amount) - savedServicesTotal;
            } else {
                detectedBase = Number(data.amount) - savedServicesTotal;
            }

            setBasePrice(detectedBase);
            setCurrentTotal(Number(data.amount));

            setOrder(data);

            // --- SMART STRIPE KEY SWITCHING (FORCED KEYS) ---
            const isBRL = data.currency === 'BRL';

            // HARDCODED KEYS AS REQUESTED (User provided via chat)
            const PK_BR = 'pk_test_51SeKtlQ9stwXqujXpngTqEfw4chH9HbVwbxj5wWkHhkA3DpwBbXJg5bWMgOEINHjhzWa81odBCL1qYxZTbpG3S4L00yRGZe1I8';
            const PK_EU = 'pk_test_51ScsbwK1rOlKvVgtZf94Vr6VSSubMWCOsMHDRmwM3R54ltvy9voWOGy4FYfJtWoZNz7OaiYI9PBEviXhYkJsCJZo000Qx9WMum';

            const stripeKey = isBRL ? PK_BR : PK_EU;

            setStripePromise(loadStripe(stripeKey));

            if (data.status === 'ticketed' || data.status === 'paid') {
                setSuccess(true);
            } else {
                createPaymentIntent(data.id);
            }
        }
        setLoading(false);
    };

    const createPaymentIntent = async (id: string) => {
        try {
            setStripeError(null);
            const res = await fetch('/api/payment/intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: id })
            });

            if (!res.ok) {
                const errData = await res.text();
                throw new Error(`Erro API (${res.status}): ${errData}`);
            }

            const data = await res.json();
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
            } else {
                console.error("Failed to get clientSecret", data);
                throw new Error("Falha ao inicar pagamento (não recebeu client_secret)");
            }
        } catch (error: any) {
            console.error("Error fetching payment intent:", error);
            setStripeError(error.message || "Erro desconhecido ao carregar pagamento.");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-rose-500" /></div>;
    if (!order) return <div className="h-screen flex items-center justify-center">Pedido não encontrado.</div>;

    if (success) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-black text-emerald-900 mb-2">Compra Concluída!</h1>
                    <p className="text-zinc-500 mb-8">Sua passagem foi emitida com sucesso. Boa viagem!</p>

                    <div className="bg-zinc-50 rounded-2xl p-4 mb-6 text-left border border-zinc-100">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Destino</p>
                        <p className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                            {order.origin} <Plane className="w-4 h-4 text-zinc-300" /> {order.destination}
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                            {format(new Date(order.departure_date), 'dd/MM/yyyy')}
                        </p>
                        <div className="mt-4 pt-4 border-t border-zinc-200">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Serviços Adicionais</p>
                            {selectedServices.length > 0 ? (
                                <ul className="text-sm text-zinc-600 space-y-1">
                                    {selectedServices.map((s, idx) => (
                                        <li key={idx}>• {s.designator ? `Assento ${s.designator}` : s.name || 'Serviço Extra'}</li>
                                    ))}
                                </ul>
                            ) : <p className="text-xs text-zinc-400">Nenhum</p>}
                        </div>
                    </div>

                    <button
                        onClick={() => router.push('/account')}
                        className="w-full bg-zinc-900 text-white rounded-xl py-4 font-bold hover:bg-zinc-800 transition-colors"
                    >
                        Ver Minhas Viagens
                    </button>
                </div>
            </div>
        );
    }

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#e11d48',
            colorBackground: '#ffffff',
            colorText: '#18181b',
            colorDanger: '#ef4444',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            spacingUnit: '6px',
            borderRadius: '16px',
            fontSizeBase: '16px',
        },
        rules: {
            '.Tab': { border: '1px solid #e4e4e7', boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)', padding: '12px' },
            '.Tab:hover': { color: '#e11d48' },
            '.Tab--selected': { borderColor: '#e11d48', boxShadow: '0px 1px 3px rgba(225, 29, 72, 0.1)' },
            '.Input': { border: '1px solid #e4e4e7', boxShadow: 'none', paddingTop: '16px', paddingBottom: '16px' },
            '.Input:focus': { border: '1px solid #e11d48', boxShadow: '0px 0px 0px 1px #e11d48' },
        }
    };
    const options = { clientSecret, appearance };

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-10 flex flex-col items-center">

            <header className="w-full max-w-6xl flex justify-between items-center mb-8">
                <button onClick={() => router.back()} className="font-bold text-zinc-500 hover:text-zinc-900">
                    ← Voltar
                </button>
                <div className="text-sm font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-zinc-100 text-zinc-400">
                    Resumo do Pedido
                </div>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Trip Details */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 mb-8">
                        <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-3">
                            <Plane className="w-6 h-6 text-rose-500" />
                            Detalhes do Voo
                        </h2>

                        {/* Main Route Header */}
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Origem</p>
                                    <p className="text-4xl font-black text-zinc-800">{order.origin}</p>
                                </div>
                                <div className="flex-1 border-t-2 border-dashed border-zinc-200 mx-8 relative top-2">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs font-bold text-zinc-400 uppercase">
                                        {order.raw_offer?.slices?.[0]?.duration ?
                                            order.raw_offer.slices[0].duration.replace('PT', '').toLowerCase()
                                            : 'Direto'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Destino</p>
                                    <p className="text-4xl font-black text-zinc-800">{order.destination}</p>
                                </div>
                            </div>
                        </div>

                        {/* Segments */}
                        {/* ... (Segments rendering largely unchanged, kept concise here for update) ... */}
                        <div className="space-y-6">
                            {order.raw_offer?.slices?.[0]?.segments?.map((segment: any, index: number) => {
                                const isLastSegment = index === order.raw_offer.slices[0].segments.length - 1;
                                return (
                                    <div key={segment.id} className="relative pl-8 border-l-2 border-zinc-100 pb-8 last:pb-0 last:border-l-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-rose-500 border-4 border-white shadow-sm"></div>
                                        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="font-bold text-zinc-900 flex flex-col">
                                                        <span>{segment.marketing_carrier?.name || 'Companhia Aérea'}</span>
                                                        <span className="text-xs font-normal text-zinc-500">Voo {segment.marketing_carrier_flight_number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-3xl font-black text-zinc-800">{format(new Date(segment.departing_at), 'HH:mm')}</p>
                                                    <p className="text-xs text-zinc-500">{segment.origin.iata_code}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-zinc-800">{format(new Date(segment.arriving_at), 'HH:mm')}</p>
                                                    <p className="text-xs text-zinc-500">{segment.destination.iata_code}</p>
                                                </div>
                                            </div>
                                        </div>
                                        {!isLastSegment && <div className="my-4 text-xs text-center text-zinc-400 font-bold">CONEXÃO</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* --- DYNAMIC SERVICES SECTION --- */}
                    <SeatMap
                        offerId={order.duffel_offer_id}
                        selectedServices={selectedServices}
                        onSelectionChange={updateOrderTotal}
                        passengers={order.passengers || []}
                    />

                    <BaggageSelection
                        offerId={order.duffel_offer_id}
                        selectedServices={selectedServices}
                        onSelectionChange={updateOrderTotal}
                        passengers={order.passengers || []}
                    />
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-3xl shadow-lg border border-rose-100 p-8 h-fit sticky top-8">
                    <h3 className="font-bold text-lg text-zinc-900 mb-6">Resumo</h3>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Passagem</span>
                            <span className="font-bold text-zinc-800">{basePrice.toLocaleString('pt-BR', { style: 'currency', currency: order.currency })}</span>
                        </div>

                        {selectedServices.filter(s => s && s.total_amount).map((s, idx) => (
                            <div key={idx} className="flex justify-between text-sm animate-in fade-in slide-in-from-left-2">
                                <span className="text-zinc-500 flex items-center gap-1">
                                    {s.type === 'seat' ? <span className='text-rose-500 text-xs font-bold'>[{s.designator}]</span> : '+'} {s.name || 'Serviço Extra'}
                                </span>
                                <span className="font-bold text-emerald-600">
                                    {Number(s.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: s.currency })}
                                </span>
                            </div>
                        ))}

                        <div className="border-t border-zinc-100 pt-4 flex justify-between items-end">
                            <span className="font-black text-zinc-900">Total</span>
                            <span className="font-black text-2xl text-rose-600">{currentTotal.toLocaleString('pt-BR', { style: 'currency', currency: order.currency })}</span>
                        </div>
                    </div>

                    {stripeError ? (
                        <div className="text-center p-4">
                            <p className="text-red-500 font-bold text-sm mb-2">Erro ao carregar pagamento</p>
                            <p className="text-zinc-400 text-xs mb-4">{stripeError}</p>
                            <button onClick={() => createPaymentIntent(orderId)} className="text-sm bg-zinc-100 px-3 py-1 rounded-md hover:bg-zinc-200 font-bold">Tentar Novamente</button>
                        </div>
                    ) : clientSecret ? (
                        <Elements options={options} stripe={stripePromise}>
                            <StripeCheckoutForm orderId={orderId} onSuccess={() => setSuccess(true)} />
                        </Elements>
                    ) : (
                        <div className="flex justify-center p-4">
                            <Loader2 className="animate-spin text-zinc-300" />
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
