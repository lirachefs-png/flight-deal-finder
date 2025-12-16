"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const router = useRouter();

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-zinc-100">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>

                <h1 className="text-3xl font-black text-zinc-900 mb-4">Reserva Confirmada!</h1>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                    Sua viagem está garantida. Enviamos os detalhes e os bilhetes para o seu e-mail.
                </p>

                {orderId && (
                    <div className="bg-zinc-50 rounded-2xl p-4 mb-8 border border-zinc-200">
                        <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Código do Pedido</span>
                        <span className="font-mono text-xl font-bold text-zinc-800">{orderId}</span>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-zinc-900 text-white font-bold py-4 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                    >
                        <Home className="w-5 h-5" /> Voltar ao Início
                    </button>
                    <a href="#" className="text-rose-600 font-bold text-sm hover:underline py-2">
                        Baixar Comprovante
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
