'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        // Simulating API call
        setTimeout(() => {
            setStatus('success');
            toast.success("Bem-vindo ao Clube!", {
                description: "Você receberá as melhores ofertas em breve."
            });
            setEmail('');
        }, 1500);
    };

    return (
        <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900 px-6 py-16 sm:px-16 sm:py-24 lg:flex lg:max-w-7xl lg:items-center lg:p-20">

                    {/* Background Gradients */}
                    <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600 rounded-full blur-[128px] opacity-50"></div>
                    <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-500 rounded-full blur-[128px] opacity-40"></div>

                    {/* Content */}
                    <div className="relative z-10 lg:w-0 lg:flex-1">
                        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Receba ofertas secretas.
                            <br />
                            <span className="text-rose-400">Direto no seu email.</span>
                        </h2>
                        <p className="mt-4 max-w-xl text-lg text-zinc-300">
                            Junte-se a mais de 15.000 viajantes que economizam até 65% em passagens aéreas. Sem spam, apenas promoções imperdíveis.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="mt-12 sm:w-full sm:max-w-md lg:mt-0 lg:ml-8 lg:flex-1 relative z-10">
                        {status === 'success' ? (
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/10 animate-in fade-in zoom-in">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Inscrito com sucesso!</h3>
                                <p className="text-zinc-300">Fique de olho na sua caixa de entrada.</p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="mt-6 text-sm font-bold text-white hover:text-rose-400 underline"
                                >
                                    Cadastrar outro email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="sm:flex gap-3">
                                <label htmlFor="email-address" className="sr-only">Endereço de Email</label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-2xl border-0 bg-white/10 px-6 py-4 text-white placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm sm:leading-6 backdrop-blur-sm shadow-xl"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="mt-3 sm:mt-0 w-full sm:w-auto flex-none rounded-2xl bg-rose-600 px-8 py-4 text-sm font-bold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 transition-all shadow-rose-900/20 disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        'Enviando...'
                                    ) : (
                                        <>Entrar no Clube <Send className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        )}
                        <p className="mt-4 text-xs text-zinc-400">
                            Respeitamos sua privacidade. Cancele a qualquer momento.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
