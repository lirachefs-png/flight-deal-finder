"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Sparkles, Send, MapPin, Calendar, Heart, ArrowRight, Save, Share2 } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Message = {
    id: string;
    sender: 'maya' | 'user';
    text: string;
    type?: 'text' | 'options' | 'itinerary';
    options?: string[];
    itinerary?: any;
};

import { useSettings } from '@/context/SettingsContext';

export default function MayaPage() {
    const router = useRouter();
    const { language, t } = useSettings(); // Get language and t
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    // Initialize/Reset Greeting when language changes
    useEffect(() => {
        setMessages([
            {
                id: '1',
                sender: 'maya',
                text: t('maya.greeting'),
                type: 'text'
            }
        ]);
    }, [language, t]); // Re-run when language changes

    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        // User Message
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/maya', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages,
                    language: language // Pass current language
                })
            });
            const data = await res.json();

            setIsTyping(false);

            // Handle Flight Search Redirect
            if (data.type === 'flight_search') {
                const searchParams = new URLSearchParams({
                    origin: data.data.origin || 'URA',
                    destination: data.data.destination || 'LIS',
                    date: data.data.date || new Date().toISOString().split('T')[0]
                });

                // Show Maya's confirmation message first
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'maya',
                    text: data.text,
                    type: 'text'
                }]);

                // Redirect after short delay
                setTimeout(() => {
                    router.push(`/?${searchParams.toString()}`);
                }, 1500);

                return;
            }

            if (data.type === 'itinerary') {
                // First text bubble
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'maya',
                    text: data.text,
                    type: 'text'
                }]);

                // Then Card
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: (Date.now() + 1).toString(),
                        sender: 'maya',
                        text: "Ver Roteiro",
                        type: 'itinerary',
                        itinerary: data.data
                    }]);
                }, 500);

            } else {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'maya',
                    text: data.text || "Desculpe, tive um soluço. Pode repetir?",
                    type: 'text'
                }]);
            }

        } catch (error) {
            console.error(error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'maya',
                text: "Ops! Minha conexão com o satélite falhou. Tente novamente!",
                type: 'text'
            }]);
        }
    };

    const handleSaveItinerary = async (itinerary: any) => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            toast.error("Faça login para salvar!", {
                description: "Seus roteiros ficarão salvos na sua conta."
            });
            return;
        }

        const loadingToast = toast.loading("Salvando roteiro...");

        try {
            const { error } = await supabase.from('saved_itineraries').insert({
                user_id: session.user.id,
                title: itinerary.title,
                destination: itinerary.title.replace('Roteiro ', ''), // Simple extraction
                content: itinerary
            });

            if (error) throw error;

            toast.dismiss(loadingToast);
            toast.success("Roteiro salvo com sucesso!", {
                description: "Veja em Minha Conta > Meus Roteiros",
                action: {
                    label: "Ver",
                    onClick: () => window.location.href = '/account'
                }
            });

        } catch (error: any) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Erro ao salvar", { description: error.message });
        }
    };

    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus when bot stops typing
    useEffect(() => {
        if (!isTyping) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isTyping]);

    const [isAvatarZoomed, setIsAvatarZoomed] = useState(false);

    // ... existing useEffects ...

    return (
        <main className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            <Header />

            {/* Background Blob */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-3xl opacity-50" />
            </div>

            {/* Avatar Zoom Modal */}
            {isAvatarZoomed && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsAvatarZoomed(false)}
                >
                    <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                        <Image
                            src="/maya-avatar.png"
                            alt="Maya Full Size"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            )}

            <div className="flex-1 pt-24 pb-24 px-4 max-w-5xl mx-auto w-full z-10 flex flex-col justify-end min-h-0">

                {/* Messages Area */}
                <div className="flex flex-col gap-6 overflow-y-auto no-scrollbar py-4 px-2">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>

                            {/* Avatar */}
                            {msg.sender === 'maya' && (
                                <div
                                    className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-lg shadow-purple-200 mt-1 relative border-2 border-white cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => setIsAvatarZoomed(true)}
                                >
                                    <Image
                                        src="/maya-avatar.png"
                                        alt="Maya"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Bubble Container */}
                            <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>

                                {/* Text Bubble */}
                                {msg.type !== 'itinerary' && msg.text && (
                                    <div className={`px-6 py-4 rounded-3xl shadow-sm text-base leading-relaxed ${msg.sender === 'user'
                                        ? 'bg-zinc-900 text-white rounded-br-none'
                                        : 'bg-white text-zinc-900 border border-zinc-100 rounded-bl-none shadow-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                )}

                                {/* Options Chips */}
                                {msg.type === 'options' && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {msg.options?.map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSend(opt)}
                                                className="px-4 py-2 bg-white border border-rose-100 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-50 transition-colors shadow-sm shadow-rose-100/50"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Itinerary Card (Cleaner Style) */}
                                {msg.type === 'itinerary' && msg.itinerary && (
                                    <div className="bg-white rounded-3xl p-0 shadow-2xl shadow-purple-900/10 border border-zinc-100 mt-2 w-full animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 overflow-hidden">

                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-purple-600 to-rose-500 p-5 text-white">
                                            <div className="flex items-center gap-2 mb-1 opacity-80 text-xs font-bold tracking-widest uppercase">
                                                <Sparkles className="w-3 h-3" /> Roteiro Personalizado
                                            </div>
                                            <h3 className="font-black text-xl leading-tight">{msg.itinerary.title}</h3>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-5 space-y-6 relative">
                                            {/* Dotted Line */}
                                            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 border-l-2 border-dotted border-zinc-200"></div>

                                            {msg.itinerary.days.map((day: any, i: number) => (
                                                <div key={i} className="relative flex gap-4">
                                                    {/* Day Badge */}
                                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-purple-100 ring-4 ring-purple-50 flex items-center justify-center shrink-0 z-10 text-xs font-black text-purple-600 shadow-sm">
                                                        {day.day}
                                                    </div>
                                                    {/* Day Content */}
                                                    <div className="flex-1 pt-1">
                                                        <h4 className="font-bold text-zinc-900 mb-2">{day.title}</h4>
                                                        <ul className="space-y-2">
                                                            {day.items.map((item: string, j: number) => (
                                                                <li key={j} className="text-sm text-zinc-600 flex items-start gap-2 bg-zinc-50 p-2 rounded-lg border border-zinc-100/50">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                                                    <span className="leading-snug">{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2">
                                            <button
                                                onClick={() => handleSaveItinerary(msg.itinerary)}
                                                className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                                            >
                                                <Save className="w-4 h-4" /> Salvar na Conta
                                            </button>
                                            <button className="flex-none w-12 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-50 hover:text-rose-600 transition-colors flex items-center justify-center">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 justify-start opacity-70">
                            <div
                                className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-lg shadow-purple-200 mt-1 relative border-2 border-white cursor-pointer"
                                onClick={() => setIsAvatarZoomed(true)}
                            >
                                <Image
                                    src="/maya-avatar.png"
                                    alt="Maya"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-zinc-100 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="relative mt-2">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                        className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-2xl shadow-purple-900/5 border border-white/50 flex gap-4 items-center"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('maya.placeholder')}
                            className="flex-1 bg-transparent px-6 py-4 outline-none text-zinc-800 placeholder:text-zinc-400 font-medium text-lg"
                            disabled={isTyping}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-rose-500/20"
                        >
                            <Send className="w-5 h-5 ml-0.5" />
                        </button>
                    </form>
                </div>

            </div>
        </main>
    );
}
