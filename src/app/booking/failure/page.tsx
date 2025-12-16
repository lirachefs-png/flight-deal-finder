"use client";

import { useRouter } from 'next/navigation';
import { XCircle, RefreshCcw } from 'lucide-react';

export default function BookingFailurePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center border border-zinc-100">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-black text-zinc-900 mb-4">Algo deu errado</h1>
                <p className="text-zinc-500 mb-8 leading-relaxed">
                    Não conseguimos completar sua reserva. Nenhuma cobrança foi feita. Por favor, tente novamente.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-200"
                    >
                        <RefreshCcw className="w-5 h-5" /> Tentar Novamente
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="text-zinc-400 font-bold text-sm hover:text-zinc-600 py-2"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
