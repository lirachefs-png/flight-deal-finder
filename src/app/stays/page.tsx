"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { BedDouble, Search, MapPin, Calendar, Star, Hotel, Loader2, Filter, Wifi, Coffee, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Location {
    iataCode: string;
    name: string;
    address: {
        cityName: string;
        countryName: string;
    };
}

export default function StaysPage() {
    // Search State
    const [loading, setLoading] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Dates
    const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
    const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);

    // Results & Filters
    const [results, setResults] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);

    // Filters State
    const [priceRange, setPriceRange] = useState(500);
    const [minRating, setMinRating] = useState(0);

    // UI Toggles
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [suggestions, setSuggestions] = useState<Location[]>([]);

    // Refs
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

    // --- CLICK OUTSIDE LOGIC ---
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

    // --- SEARCH HANDLER ---
    const handleSearch = async () => {
        if (!locationInput) {
            toast.error("Para onde vamos? Digite um destino.");
            return;
        }

        setLoading(true);
        setSearched(true);
        setResults([]);

        try {
            const query = new URLSearchParams({
                location: locationInput,
                checkIn: checkIn ? format(checkIn, 'yyyy-MM-dd') : '',
                checkOut: checkOut ? format(checkOut, 'yyyy-MM-dd') : ''
            });

            const res = await fetch(`/api/stays/search?${query.toString()}`);
            const data = await res.json();

            if (data.error) {
                toast.error(data.error);
            } else {
                const stays = data.mock ? data.data.results : data.data;
                setResults(stays || []);
                if (data.mock) toast.info("Resultados de demonstração (Premium UI)");
            }
        } catch (error) {
            console.error(error);
            toast.error("Falha ao buscar hospedagens");
        } finally {
            setLoading(false);
        }
    };

    // --- CLIENT SIDE FILTERING ---
    const filteredResults = results.filter(stay => {
        const price = stay.price?.amount || 0;
        const rating = stay.rating || 0;
        return price <= priceRange && rating >= minRating;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-rose-100">
            <Header />

            <main className="pt-28 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* HERO HEADER */}
                    <div className="text-center mb-12 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider mb-2">
                            <Sparkles className="w-3 h-3" /> All Trip Stays
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                            Hospedagens <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-500">Exclusivas</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                            Descubra hotéis e resorts avaliados por nossa curadoria premium.
                        </p>
                    </div>

                    {/* SEARCH BAR (PREMIUM RE-DESIGN) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-2 border border-slate-100 mb-16 max-w-5xl mx-auto relative z-30"
                    >
                        <div className="flex flex-col md:flex-row gap-2">

                            {/* LOCATION INPUT */}
                            <div className="relative flex-1 group" ref={locationRef}>
                                <div className="h-20 px-8 rounded-[1.5rem] bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-slate-100 transition-all flex flex-col justify-center cursor-text" onClick={() => (document.getElementById('stay-loc') as HTMLInputElement)?.focus()}>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Destino</label>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-rose-500" />
                                        <input
                                            id="stay-loc"
                                            type="text"
                                            placeholder="Ex: Paris, França"
                                            className="w-full font-bold text-lg text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-300"
                                            value={locationInput}
                                            onChange={(e) => {
                                                setLocationInput(e.target.value);
                                                setSelectedLocation(null);
                                            }}
                                            onFocus={() => {
                                                if (locationInput.length >= 2) setShowLocationDropdown(true);
                                            }}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* DROPDOWN */}
                                <AnimatePresence>
                                    {showLocationDropdown && suggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 w-full bg-white shadow-xl rounded-2xl overflow-hidden z-[100] mt-2 border border-slate-100 p-2"
                                        >
                                            {suggestions.map((loc, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSelectLocation(loc)}
                                                    className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800">{loc.address.cityName}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{loc.address.countryName}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* DATES INPUT */}
                            <div className="relative flex-1 group" ref={calendarRef}>
                                <div
                                    className="h-20 px-8 rounded-[1.5rem] bg-slate-50 border border-transparent hover:border-slate-200 hover:bg-slate-100 transition-all flex flex-col justify-center cursor-pointer"
                                    onClick={() => setShowCalendar(true)}
                                >
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Período</label>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-rose-500" />
                                        <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
                                            <span className={!checkIn ? "text-slate-300" : ""}>{checkIn ? format(checkIn, 'dd MMM') : 'Check-in'}</span>
                                            <span className="text-slate-300 font-bold text-sm mx-1">/</span>
                                            <span className={!checkOut ? "text-slate-300" : ""}>{checkOut ? format(checkOut, 'dd MMM') : 'Check-out'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* CALENDAR POPUP */}
                                <AnimatePresence>
                                    {showCalendar && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute top-full left-0 md:left-auto md:right-0 mt-2 bg-white rounded-3xl shadow-xl border border-slate-100 p-4 z-[100]"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DayPicker
                                                mode="range"
                                                selected={{ from: checkIn, to: checkOut }}
                                                onSelect={(range) => {
                                                    setCheckIn(range?.from);
                                                    setCheckOut(range?.to);
                                                }}
                                                modifiersClassNames={{
                                                    selected: 'bg-rose-500 text-white hover:bg-rose-600',
                                                    today: 'font-bold text-rose-500',
                                                    range_middle: 'bg-rose-50 text-rose-900',
                                                    range_start: 'bg-rose-500 text-white rounded-l-md',
                                                    range_end: 'bg-rose-500 text-white rounded-r-md'
                                                }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* SEARCH BUTTON (Matching Flight Design) */}
                            <div className="relative group z-10 w-full md:w-auto h-20">
                                <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-orange-600 rounded-[1.6rem] blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="relative w-full md:w-auto h-full px-10 rounded-[1.5rem] bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-xl shadow-rose-200/50 flex flex-row items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                                >
                                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out"></div>
                                    <Search className="w-6 h-6 stroke-[3]" />
                                    <span className="text-sm font-black uppercase tracking-wider">Buscar</span>
                                </motion.button>
                            </div>

                        </div>
                    </motion.div>

                    {/* RESULTS AREA */}
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* FILTERS SIDEBAR */}
                        {(searched || results.length > 0) && (
                            <aside className="w-full lg:w-1/4 h-fit sticky top-24">
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold text-lg">
                                        <Filter className="w-5 h-5 text-rose-500" /> Filtros
                                    </div>

                                    {/* Price Slider */}
                                    <div className="mb-8">
                                        <label className="flex justify-between text-sm font-bold text-slate-700 mb-3">
                                            Orçamento <span className="text-rose-600">${priceRange}</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="50"
                                            max="1000"
                                            step="50"
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(Number(e.target.value))}
                                            className="w-full h-2 rounded-lg appearance-none bg-slate-100 accent-rose-500"
                                        />
                                    </div>

                                    {/* Rating Select */}
                                    <div>
                                        <label className="text-sm font-bold text-slate-700 mb-3 block">Estrelas</label>
                                        <div className="flex gap-2">
                                            {[3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    onClick={() => setMinRating(minRating === star ? 0 : star)}
                                                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${minRating === star ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                                >
                                                    {star} <Star className={`w-3 h-3 inline ml-1 ${minRating === star ? 'fill-white' : 'fill-slate-300'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}

                        {/* LISTINGS GRID */}
                        <div className="flex-1">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="relative w-20 h-20">
                                        <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                                        <Hotel className="absolute inset-0 m-auto text-rose-500 w-6 h-6 opacity-50" />
                                    </div>
                                    <p className="font-bold text-slate-400 mt-6 animate-pulse">Consultando disponibilidade...</p>
                                </div>
                            )}

                            {!loading && searched && (
                                <div className="flex flex-col gap-6">
                                    <motion.h2
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xl font-bold text-slate-900"
                                    >
                                        {filteredResults.length} opções encontradas em {locationInput.split(',')[0]}
                                    </motion.h2>

                                    {filteredResults.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-8">
                                            {filteredResults.map((stay, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={i}
                                                    className="bg-white rounded-[2rem] p-3 shadow-lg hover:shadow-2xl shadow-slate-100 border border-slate-100 transition-all duration-300 group flex flex-col md:flex-row gap-4"
                                                >
                                                    {/* IMAGE CARD */}
                                                    <div className="md:w-72 h-56 md:h-auto shrink-0 relative rounded-[1.5rem] overflow-hidden">
                                                        <Image
                                                            src={stay.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"}
                                                            alt={stay.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                        <div className="absolute top-4 left-4">
                                                            <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-black text-rose-600 shadow-sm border border-white/50">
                                                                PREMIUM
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* CONTENT */}
                                                    <div className="p-4 flex flex-col justify-between flex-1">
                                                        <div>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                                                                        <Star className="w-4 h-4 fill-current" />
                                                                        <span className="font-bold text-sm">{stay.rating || 4.8}</span>
                                                                        <span className="text-slate-300 text-xs">(120 reviews)</span>
                                                                    </div>
                                                                    <h3 className="font-black text-2xl text-slate-900 leading-tight group-hover:text-rose-600 transition-colors mb-2">{stay.name}</h3>
                                                                    <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                                                                        <MapPin className="w-4 h-4 text-slate-400" /> 2.5km do centro de {locationInput.split(',')[0]}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-slate-400 font-bold line-through">${(stay.price?.amount * 1.3).toFixed(0)}</p>
                                                                    <div className="flex items-baseline gap-1 justify-end">
                                                                        <span className="text-xs font-bold text-slate-500">por noite</span>
                                                                        <p className="text-2xl font-black text-rose-600">${stay.price?.amount}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2 mt-4">
                                                                {['Wi-Fi Grátis', 'Café da Manhã', 'Piscina', 'Academia'].slice(0, 3).map((tag, t) => (
                                                                    <span key={t} className="px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1 border border-slate-100">
                                                                        {t === 0 && <Wifi className="w-3 h-3" />}
                                                                        {t === 1 && <Coffee className="w-3 h-3" />}
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 flex items-center justify-end">
                                                            <button className="px-8 py-3 bg-slate-900 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-slate-200 hover:shadow-rose-200">
                                                                Ver Disponibilidade
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Hotel className="w-10 h-10 text-slate-300" />
                                            </div>
                                            <h3 className="text-slate-500 font-bold text-lg">Nenhuma estadia encontrada.</h3>
                                            <p className="text-slate-400 mb-6">Tente ajustar seus filtros para ver mais opções.</p>
                                            <button
                                                onClick={() => { setPriceRange(1000); setMinRating(0); }}
                                                className="text-rose-600 font-bold hover:bg-rose-50 px-6 py-2 rounded-full transition-colors"
                                            >
                                                Limpar Filtros
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* EMPTY STATE */}
                            {!searched && (
                                <div className="text-center py-32 pointer-events-none opacity-40">
                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 bg-rose-200 blur-3xl opacity-20 rounded-full"></div>
                                        <BedDouble className="w-32 h-32 text-slate-200 relative" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mt-6">Explore o Mundo</h2>
                                    <p className="text-slate-500 font-medium text-lg">Digite seu destino para ver hotéis incríveis.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
