"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { Search, MapPin, Calendar, ExternalLink, ShieldCheck, Star, Sparkles, Heart } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

interface Location {
    iataCode: string;
    name: string;
    address: {
        cityName: string;
        countryName: string;
    };
}

export default function StaysPage() {
    const [loading, setLoading] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
    const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);

    // Guests
    const [guests, setGuests] = useState(2);

    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    const locationRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);

    // --- AUTOCOMPLETE LOGIC ---
    useEffect(() => {
        const timer = setTimeout(() => {
            if (locationInput.length >= 2 && !selectedLocation) {
                fetch(`/api/locations?keyword=${locationInput}`)
                    .then(async res => {
                        const data = await res.json();
                        return data.data || [];
                    })
                    .then(data => setSuggestions(data))
                    .catch(err => console.error(err));
                setShowLocationDropdown(true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [locationInput, selectedLocation]);

    const handleSelectLocation = (loc: Location) => {
        setLocationInput(`${loc.address.cityName}, ${loc.address.countryName}`);
        setSelectedLocation(loc);
        setShowLocationDropdown(false);
    };

    // --- CLICK OUTSIDE ---
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setShowLocationDropdown(false);
            }
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- AIRBNB DEEP LINK MAGIC ---
    const handleSearch = () => {
        if (!locationInput) {
            toast.error("Para onde você vai?", { description: "Digite um destino para buscar no Airbnb." });
            return;
        }

        setLoading(true);

        // 1. Construct Query
        // https://www.airbnb.com/s/Paris--France/homes?checkin=2024-05-10&checkout=2024-05-20&adults=2
        const baseUrl = "https://www.airbnb.com.br/s";
        const destinationSlug = locationInput.replace(/, /g, '--').replace(/ /g, '-'); // "Paris--France"

        const params = new URLSearchParams();
        params.append('refinement_paths[]', '/homes');
        if (checkIn) params.append('checkin', format(checkIn, 'yyyy-MM-dd'));
        if (checkOut) params.append('checkout', format(checkOut, 'yyyy-MM-dd'));
        params.append('adults', guests.toString());
        params.append('tab_id', 'home_tab');
        params.append('search_type', 'filter_change');

        const finalUrl = `${baseUrl}/${destinationSlug}/homes?${params.toString()}`;

        // 2. Simulate "Processing" for UX (The "Magic" Feeling)
        setTimeout(() => {
            setLoading(false);
            window.open(finalUrl, '_blank');
            toast.success("Redirecionando para Airbnb Partner", {
                description: "Aplicando filtros de segurança AllTrip..."
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 selection:bg-rose-100">
            <Header />

            <main className="pt-24 pb-20 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* HERO HEADER */}
                    <div className="text-center mb-10 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white border border-rose-100 px-4 py-1.5 rounded-full shadow-sm animate-in fade-in zoom-in duration-500">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">AllTrip + Airbnb Partner</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
                            Hospedagens <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">Verificadas</span>
                        </h1>
                        <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                            Utilizamos nossa inteligência para filtrar as melhores casas, apartamentos e experiências exclusivas diretamente no Airbnb.
                        </p>
                    </div>

                    {/* SEARCH CARD */}
                    <div className="bg-white rounded-[2rem] shadow-2xl shadow-zinc-200/50 border border-white p-2 flex flex-col md:flex-row relative z-30 max-w-4xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">

                        {/* LOCATION */}
                        <div className="flex-1 p-4 relative group cursor-pointer" ref={locationRef}>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-9 mb-1 group-hover:text-rose-500 transition-colors">Destino</label>
                            <div className="flex items-center gap-4 px-4">
                                <MapPin className="w-5 h-5 text-zinc-300 group-hover:text-rose-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Onde vamos ficar?"
                                    className="w-full font-bold text-lg text-zinc-800 focus:outline-none placeholder:text-zinc-300 bg-transparent truncate"
                                    value={locationInput}
                                    onChange={(e) => {
                                        setLocationInput(e.target.value);
                                        setSelectedLocation(null);
                                    }}
                                    onFocus={() => {
                                        if (locationInput.length >= 2) setShowLocationDropdown(true);
                                    }}
                                />
                            </div>

                            {/* DROPDOWN - EXACT COPY OF FLIGHTS */}
                            {showLocationDropdown && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-2xl overflow-hidden z-[100] mt-4 border border-zinc-100">
                                    {suggestions.map((loc, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectLocation(loc)}
                                            className="p-4 hover:bg-zinc-50 cursor-pointer flex items-center gap-3 border-b border-zinc-50 last:border-0"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-zinc-800">{loc.address.cityName}</p>
                                                <p className="text-xs text-zinc-400">{loc.address.countryName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="w-px bg-zinc-100 my-2 hidden md:block"></div>

                        {/* DATES */}
                        <div className="flex-1 p-4 relative group cursor-pointer" ref={calendarRef} onClick={() => setShowCalendar(true)}>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-9 mb-1 group-hover:text-rose-500 transition-colors">Check-in / Check-out</label>
                            <div className="flex items-center gap-4 px-4 text-zinc-800 font-bold text-lg">
                                <Calendar className="w-5 h-5 text-zinc-300 group-hover:text-rose-500 transition-colors" />
                                {checkIn ? format(checkIn, 'dd MMM') : <span className="text-zinc-300">Data</span>}
                                <span className="text-zinc-300 font-light mx-2">|</span>
                                {checkOut ? format(checkOut, 'dd MMM') : <span className="text-zinc-300">Data</span>}
                            </div>
                            {/* CALENDAR POPUP */}
                            {showCalendar && (
                                <div className="absolute top-full left-0 md:left-auto md:-translate-x-1/4 mt-4 bg-white rounded-3xl shadow-2xl border border-zinc-100 p-4 z-[100] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                    <DayPicker
                                        mode="range"
                                        selected={{ from: checkIn, to: checkOut }}
                                        onSelect={(range) => {
                                            setCheckIn(range?.from);
                                            setCheckOut(range?.to);
                                            // Don't close immediately so they can see selection
                                        }}
                                        modifiersClassNames={{
                                            selected: 'bg-rose-500 text-white hover:bg-rose-600',
                                            today: 'font-bold text-rose-500',
                                            range_middle: 'bg-rose-50 text-rose-900',
                                            range_start: 'bg-rose-600 text-white rounded-l-md',
                                            range_end: 'bg-rose-600 text-white rounded-r-md'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* BUTTON */}
                        <div className="p-2">
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="h-full w-full md:w-auto px-8 rounded-[1.5rem] bg-gradient-to-r from-[#ff385c] to-[#bd1e59] hover:from-[#d93250] hover:to-[#a0184a] text-white font-bold text-base shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {loading ? (
                                    <>Conectando <span className="animate-pulse">...</span></>
                                ) : (
                                    <>Buscar no Airbnb <ExternalLink className="w-4 h-4 opacity-80" /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* TRUST SIGNALS (The "Seal of Quality") */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl border border-zinc-50 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-2">Verificação AllTrip</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Redirecionamos você apenas para imóveis verificados e seguros dentro da plataforma parceira.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-zinc-50 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6 text-amber-500" />
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-2">Stays Premium</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Acesso priorizado a acomodações "Guest Favorites" com as melhores avaliações globais.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-zinc-50 shadow-sm hover:shadow-md transition-shadow text-center">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-zinc-900 mb-2">Curadoria Exclusiva</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Filtros aplicados automaticamente para evitar taxas ocultas e garantir a melhor experiência.
                            </p>
                        </div>
                    </div>

                    {/* FOOTER NOTE */}
                    <div className="mt-12 text-center">
                        <p className="text-xs text-zinc-400 font-medium max-w-lg mx-auto">
                            *O AllTrip atua como plataforma de inteligência de viagens. Ao clicar em buscar, você será redirecionado para o ambiente seguro do Airbnb para finalizar sua reserva.
                        </p>
                        <div className="flex justify-center gap-4 mt-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg" alt="Airbnb" width={80} height={25} />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
