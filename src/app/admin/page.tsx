"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    Activity,
    TrendingUp,
    ShoppingCart,
    Users,
    Euro,
    DollarSign,
    Server,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { isAdminEmail } from '@/lib/adminAuth';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [health, setHealth] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        const init = async () => {
            // 1. Check Auth
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !isAdminEmail(session.user.email)) {
                router.push('/');
                return;
            }

            // 2. Fetch Data Parallel
            try {
                const [statsRes, healthRes] = await Promise.all([
                    fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
                    fetch('/api/admin/health')
                ]);

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                if (healthRes.ok) {
                    const healthData = await healthRes.json();
                    setHealth(healthData);
                }

            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        };

        init();

        // Poll System Health every 15s (less aggressive)
        const interval = setInterval(async () => {
            const res = await fetch('/api/admin/health');
            if (res.ok) setHealth(await res.json());
        }, 15000);

        return () => clearInterval(interval);
    }, [router]);

    if (loading) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full"></div>
                <p className="text-zinc-400 text-sm font-medium">Carregando painel...</p>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-zinc-50 p-8 pb-32">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Visão Geral</h1>
                        <p className="text-zinc-500">Bem-vindo ao painel administrativo da AllTrip.</p>
                    </div>

                    {/* System Status Badge */}
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-zinc-200 shadow-sm">
                        <div className={`flex items-center gap-2 text-xs font-bold ${health?.status === 'operational' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${health?.status === 'operational' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                            {health?.status === 'operational' ? 'SISTEMA OPERACIONAL' : 'INSTABILIDADE DETECTADA'}
                        </div>
                        <div className="w-px h-4 bg-zinc-200"></div>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                            <Server className="w-3 h-3" />
                            {health?.system?.database_latency_ms || '-'}ms
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Orders */}
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <ShoppingCart className="w-16 h-16 text-rose-500" />
                        </div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Vendas Totais</p>
                        <h2 className="text-4xl font-black text-zinc-900 mb-1">{stats?.totalOrders || 0}</h2>
                        <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 w-fit px-2 py-1 rounded-full">
                            <TrendingUp className="w-3 h-3" />
                            +12% essa semana
                        </div>
                    </div>

                    {/* Revenue EUR */}
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Euro className="w-16 h-16 text-blue-500" />
                        </div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Receita (EUR)</p>
                        <h2 className="text-4xl font-black text-zinc-900 mb-1">
                            € {stats?.totalRevenueEUR?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                        </h2>
                        <p className="text-zinc-400 text-xs">Total processado em Euros</p>
                    </div>

                    {/* Revenue BRL */}
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                            <DollarSign className="w-16 h-16 text-emerald-500" />
                        </div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Receita (BRL)</p>
                        <h2 className="text-4xl font-black text-zinc-900 mb-1">
                            R$ {stats?.totalRevenueBRL?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                        </h2>
                        <p className="text-zinc-400 text-xs">Total processado em Reais</p>
                    </div>
                </div>

                {/* Recent Orders Section */}
                <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
                        <h3 className="font-bold text-xl text-zinc-900">Pedidos Recentes</h3>
                        <button className="text-sm font-bold text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-full transition-colors">
                            Ver todos
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-zinc-400 uppercase bg-zinc-50/50 text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-bold">ID do Pedido</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Passageiro / Email</th>
                                    <th className="px-6 py-4 font-bold">Rota</th>
                                    <th className="px-6 py-4 font-bold text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {stats?.recentOrders?.length > 0 ? (
                                    stats.recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4 font-medium text-zinc-900 group-hover:text-rose-600 transition-colors">
                                                #{order.id.substring(0, 8)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'ticketed' ? 'bg-blue-100 text-blue-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {order.status === 'ticketed' ? 'Emitido' :
                                                        order.status === 'paid' ? 'Pago' :
                                                            order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-zinc-700">Cliente AllTrip</span>
                                                    <span className="text-xs text-zinc-400">{order.user_id ? 'Usuário Registrado' : 'Convidado'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-600">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold bg-zinc-100 px-2 py-1 rounded text-xs">{order.origin}</span>
                                                    <span className="text-zinc-300">→</span>
                                                    <span className="font-bold bg-zinc-100 px-2 py-1 rounded text-xs">{order.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-zinc-900">
                                                {Number(order.amount).toLocaleString('pt-BR', { style: 'currency', currency: order.currency })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                                            Nenhum pedido encontrado recentemente.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
