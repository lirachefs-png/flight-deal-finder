"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Package, LogOut, Settings, Sparkles, Plane, LayoutDashboard } from 'lucide-react';
import { isAdminEmail } from '@/lib/adminAuth';

export default function AccountPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [itineraries, setItineraries] = useState<any[]>([]);
    const [loadingItineraries, setLoadingItineraries] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/');
                return;
            }
            setUser(session.user);
            setLoading(false);

            // 1. Fetch Itineraries
            const { data: itinerariesData } = await supabase
                .from('saved_itineraries')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (itinerariesData) setItineraries(itinerariesData);
            setLoadingItineraries(false);

            // 2. Fetch Orders (My Trips)
            try {
                const res = await fetch(`/api/orders/my?userId=${session.user.id}`);
                const data = await res.json();
                if (data.orders) setOrders(data.orders);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoadingOrders(false);
            }
        };
        getUser();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <main className="min-h-screen bg-zinc-50 pb-20">
            <Header />

            <div className="pt-32 max-w-5xl mx-auto px-6">

                {/* Header Profile */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 flex flex-col md:flex-row items-center gap-8 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-rose-200">
                        {user.email?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-black text-zinc-900 mb-1">Minha Conta</h1>
                        <p className="text-zinc-500 font-medium">{user.email}</p>
                        <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full text-sm font-bold text-zinc-700 hover:bg-zinc-200 transition-colors">
                                <Settings className="w-4 h-4" /> Configurações
                            </button>

                            {/* ADMIN DASHBOARD BUTTON */}
                            {isAdminEmail(user.email) && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full text-sm font-bold text-white hover:bg-zinc-700 transition-colors shadow-lg shadow-zinc-200"
                                >
                                    <LayoutDashboard className="w-4 h-4" /> Painel Admin
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Sair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Saved Itineraries Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h2 className="text-zinc-900 font-bold text-lg">Meus Roteiros (Maya AI)</h2>
                    </div>

                    {loadingItineraries ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-zinc-100 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : itineraries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {itineraries.map((itinerary) => (
                                <div key={itinerary.id} className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-rose-500"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-full border border-zinc-100">
                                            {new Date(itinerary.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-zinc-900 text-lg mb-1 group-hover:text-purple-600 transition-colors line-clamp-2">{itinerary.title}</h3>
                                    <p className="text-zinc-500 text-sm mb-4">{itinerary.destination || 'Destino Surpresa'}</p>

                                    <div className="flex items-center text-xs font-bold text-zinc-400 gap-1">
                                        <span className="bg-zinc-100 px-2 py-1 rounded-md text-zinc-600">{itinerary.content?.days?.length || '?'} Dias</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-8 border border-zinc-100 text-center">
                            <Sparkles className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                            <h3 className="font-bold text-zinc-900">Nenhum roteiro salvo</h3>
                            <p className="text-zinc-500 text-sm mb-4">Converse com a Maya para criar viagens incríveis.</p>
                            <Link href="/ai-planner" className="text-purple-600 font-bold text-sm hover:underline">Ir para Maya AI &rarr;</Link>
                        </div>
                    )}
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Stats Card */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 md:col-span-1">
                        <h2 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-4">Total Economizado</h2>
                        <p className="text-4xl font-black text-zinc-900 tracking-tight">R$ 0,00</p>
                        <p className="text-zinc-400 text-sm mt-2">em suas viagens com a AllTrip.</p>
                    </div>

                    {/* Booking History Placeholder */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 md:col-span-2 min-h-[300px]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-zinc-900 font-bold text-lg flex items-center gap-2">
                                <Package className="w-5 h-5 text-rose-500" />
                                Minhas Viagens
                            </h2>
                            <button className="text-rose-600 text-sm font-bold hover:underline">Ver todas</button>
                        </div>

                        {/* Orders List */}
                        {loadingOrders ? (
                            <div className="flex flex-col gap-4 p-8">
                                <div className="h-12 w-full bg-zinc-50 rounded-xl animate-pulse" />
                                <div className="h-12 w-full bg-zinc-50 rounded-xl animate-pulse" />
                            </div>
                        ) : orders.length > 0 ? (
                            <div className="flex flex-col divide-y divide-zinc-50">
                                {orders.map(order => (
                                    <div key={order.id} className="p-6 hover:bg-zinc-50 transition-colors flex justify-between items-center group cursor-pointer" onClick={() => router.push(`/checkout/${order.id}`)}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl ${order.status === 'ticketed' ? 'bg-emerald-100 text-emerald-600' :
                                                order.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-400' :
                                                        'bg-amber-50 text-amber-500'
                                                }`}>
                                                <Plane className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 font-bold text-zinc-900">
                                                    {order.origin} <span className="text-zinc-300">→</span> {order.destination}
                                                </div>
                                                <p className="text-sm text-zinc-500">{new Date(order.departure_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${order.status === 'ticketed' ? 'bg-emerald-100 text-emerald-700' :
                                                order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                        'bg-amber-50 text-amber-600'
                                                }`}>
                                                {order.status === 'ticketed' ? 'Emitido' :
                                                    order.status === 'paid' ? 'Pago' :
                                                        order.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                                            </span>
                                            <p className="text-sm font-bold text-zinc-900 mt-1">
                                                {Number(order.amount).toLocaleString('pt-BR', { style: 'currency', currency: order.currency })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-zinc-300" />
                                </div>
                                <h3 className="text-zinc-900 font-bold mb-1">Nenhuma viagem encontrada</h3>
                                <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">
                                    Você ainda não realizou nenhuma reserva com a gente. Que tal planejar a próxima?
                                </p>
                                <Link href="/" className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-zinc-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                                    Buscar Voos
                                </Link>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </main>
    );
}
