'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, ArrowRightLeft, ArrowRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useRouter } from 'next/navigation';
import HoldButton from './HoldButton';
import { supabase } from '@/lib/supabase';

import { useSettings } from '@/context/SettingsContext';

interface Location {
    iataCode: string;
    name: string;
    address: {
        cityName: string;
        countryName: string;
    };
}

export default function SearchEngine() {
    const router = useRouter();
    const { currency, setCurrency, t } = useSettings();

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [originCode, setOriginCode] = useState('');
    const [destCode, setDestCode] = useState('');

    // Dates
    const [departDate, setDepartDate] = useState('');
    const [returnDate, setReturnDate] = useState('');

    // Options
    const [passengers, setPassengers] = useState({
        adults: 1,
        children: 0,
        infants: 0
    });

    const totalTravelers = passengers.adults + passengers.children + passengers.infants;

    const [cabin, setCabin] = useState('Y'); // Y=Economy, C=Business
    const [showOptions, setShowOptions] = useState(false);

    // FILTERS

    // FILTERS
    const [isDirectOnly, setIsDirectOnly] = useState(false);
    const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
    const [availableAirlines, setAvailableAirlines] = useState<{ name: string, count: number }[]>([]);

    const [timeFilters, setTimeFilters] = useState({
        morning: false,   // 06-12
        afternoon: false, // 12-18
        evening: false,   // 18-00
        night: false      // 00-06
    });

    const toggleTimeFilter = (period: keyof typeof timeFilters) => {
        setTimeFilters(prev => ({ ...prev, [period]: !prev[period] }));
    };

    const toggleAirline = (airlineName: string) => {
        setSelectedAirlines(prev =>
            prev.includes(airlineName)
                ? prev.filter(a => a !== airlineName)
                : [...prev, airlineName]
        );
    };

    // Advice
    const [originSuggestions, setOriginSuggestions] = useState<Location[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<Location[]>([]);
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);
    const [showDestDropdown, setShowDestDropdown] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [tripType, setTripType] = useState('Ida e volta');
    const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);

    // Results
    const [offers, setOffers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (origin.length >= 2 && !originCode) {
                fetch(`/api/locations?keyword=${origin}`)
                    .then(async res => {
                        const data = await res.json();
                        if (data.error) {
                            console.error("Autocomplete API Error:", data.error, data.details);
                            // Optional: Toast only if debugging
                            toast.error(`Erro na busca: ${data.details || data.error}`);
                            return [];
                        }
                        return data.data || [];
                    })
                    .then(data => setOriginSuggestions(data))
                    .catch(err => console.error("Fetch Error:", err));
                setShowOriginDropdown(true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [origin, originCode]);

    const calendarRef = useRef<HTMLDivElement>(null);
    const originRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const tripTypeRef = useRef<HTMLDivElement>(null);

    // Unified Click Outside Handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;

            if (calendarRef.current && !calendarRef.current.contains(target)) {
                setShowCalendar(false);
            }
            if (originRef.current && !originRef.current.contains(target)) {
                setShowOriginDropdown(false);
            }
            if (destRef.current && !destRef.current.contains(target)) {
                setShowDestDropdown(false);
            }
            if (optionsRef.current && !optionsRef.current.contains(target)) {
                setShowOptions(false);
            }
            if (tripTypeRef.current && !tripTypeRef.current.contains(target)) {
                setShowTripTypeDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (destination.length >= 2 && !destCode) {
                fetch(`/api/locations?keyword=${destination}`)
                    .then(res => res.json())
                    .then(data => setDestSuggestions(data.data || []));
                setShowDestDropdown(true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [destination, destCode]);

    const handleSelectOrigin = (loc: Location) => {
        setOrigin(`${loc.address.cityName} (${loc.iataCode})`);
        setOriginCode(loc.iataCode);
        setShowOriginDropdown(false);
    };

    const handleSelectDest = (loc: Location) => {
        setDestination(`${loc.address.cityName} (${loc.iataCode})`);
        setDestCode(loc.iataCode);
        setShowDestDropdown(false);
    };

    // Checkout Handler
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    const handleCheckout = async (offer: any) => {
        setIsProcessing(offer.id);

        // 1. Check Login
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error("Login necessário", {
                description: "Faça login para continuar a compra.",
                action: {
                    label: "Login",
                    onClick: () => router.push('/login') // Or trigger login modal
                }
            });
            setIsProcessing(null);
            return;
        }

        try {
            // 2. Initiate Order
            // 2. Initiate Order
            // FORCE CURRENCY CONVERSION: Use the selected "currency" context, not the offer's raw currency (which is stuck in EUR on Sandbox).
            // This ensures the Order is created in BRL/USD so Stripe shows the correct methods (Pix, etc).

            // Re-use exchange rates (duplicated for safety inside handler scope if needed, or moved up)
            const rates: { [key: string]: number } = { 'EUR': 1, 'USD': 1.05, 'BRL': 6.15, 'GBP': 0.85 };
            const offerAmount = parseFloat(offer.total_amount);
            const fromCurr = offer.total_currency;
            const toCurr = currency; // User selected

            let finalAmount = offerAmount;
            if (fromCurr !== toCurr) {
                const baseEUR = offerAmount / (rates[fromCurr] || 1);
                finalAmount = baseEUR * (rates[toCurr] || 1);
            }

            const res = await fetch('/api/orders/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offer_id: offer.id,
                    user_id: session.user.id,
                    amount: finalAmount, // Save the converted amount
                    currency: toCurr,    // Save the selected currency (BRL)
                    passengers: offer.passengers,
                    trip_details: {
                        origin: offer.slices[0].segments[0].origin.iata_code,
                        destination: offer.slices[0].segments[offer.slices[0].segments.length - 1].destination.iata_code,
                        departure_date: offer.slices[0].segments[0].departing_at,
                        // return_date: ... (needs logic if round trip, simplified for now)
                        raw_offer: offer
                    }
                })
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/checkout/${data.order_id}`);
            } else {
                toast.error('Erro ao iniciar compra', { description: data.error || 'Tente novamente.' });
                setIsProcessing(null);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão. Tente novamente.');
            setIsProcessing(null);
        }
    };

    const handleSearch = async () => {
        // Auto-resolve logic: If code is missing but we have suggestions, try to find a match
        let finalOriginCode = originCode;
        if (!finalOriginCode && origin.length === 3) finalOriginCode = origin.toUpperCase();
        if (!finalOriginCode && originSuggestions.length > 0) {
            // Try partial match on city name
            const match = originSuggestions.find(s => s.address.cityName.toLowerCase().includes(origin.toLowerCase()) || s.name.toLowerCase().includes(origin.toLowerCase()));
            if (match) finalOriginCode = match.iataCode;
        }

        let finalDestCode = destCode;
        if (!finalDestCode && destination.length === 3) finalDestCode = destination.toUpperCase();
        if (!finalDestCode && destSuggestions.length > 0) {
            const match = destSuggestions.find(s => s.address.cityName.toLowerCase().includes(destination.toLowerCase()) || s.name.toLowerCase().includes(destination.toLowerCase()));
            if (match) finalDestCode = match.iataCode;
        }

        if (!finalOriginCode || !finalDestCode || !departDate) {
            toast.error("Preencha os campos corretamente", {
                description: "Selecione a cidade na lista ou digite o código de 3 letras."
            });
            return;
        }

        setIsLoading(true);
        setOffers([]); // Clear previous

        try {
            const query = new URLSearchParams({
                origin: finalOriginCode,
                destination: finalDestCode,
                date: format(new Date(departDate), 'yyyy-MM-dd'),
                cabin: cabin === 'C' ? 'business' : 'economy',
                adults: passengers.adults.toString(),
                children: passengers.children.toString(),
                infants: passengers.infants.toString(),
                direct: isDirectOnly ? 'true' : 'false',
                currency: currency
            });

            console.log("Searching with:", query.toString()); // Debug

            const res = await fetch(`/api/search?${query.toString()}`);
            const data = await res.json();

            if (data.error) {
                toast.error("Erro na busca", { description: data.error });
            } else {
                setOffers(data.data || []);
                if (data.data?.length === 0) {
                    toast.info("Nenhum voo encontrado", { description: "Tente outras datas." });
                } else {
                    toast.success("Voos encontrados!", { description: `${data.data.length} opções disponíveis.` });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro de conexão", { description: "Tente novamente." });
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-refresh when currency changes
    const prevCurrency = useRef(currency);
    useEffect(() => {
        if (prevCurrency.current !== currency && offers.length > 0 && !isLoading) {
            toast.info(`Atualizando preços para ${currency}...`);
            handleSearch();
        }
        prevCurrency.current = currency;
    }, [currency]);

    // --- FILTER LOGIC ---
    useEffect(() => {
        if (offers.length > 0) {
            // Extract unique airlines
            const airlineCounts: { [key: string]: number } = {};
            offers.forEach(offer => {
                const name = offer.owner?.name || 'Unknown Airline';
                airlineCounts[name] = (airlineCounts[name] || 0) + 1;
            });
            const sortedAirlines = Object.entries(airlineCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count);

            setAvailableAirlines(sortedAirlines);
        }
    }, [offers]);

    const filteredOffers = offers.filter(offer => {
        // 1. Direct Flights (Already filtered by API mostly, but good double check if we implement toggle post-search)
        // If API returns mixed results despite request, client filter helps. 
        // NOTE: Our API now strictly respects 'direct', so this is just client-side switching if user toggles AFTER search.
        const slice = offer.slices[0];
        const stops = slice.segments.length - 1;
        if (isDirectOnly && stops > 0) return false;

        // 2. Airlines
        if (selectedAirlines.length > 0 && !selectedAirlines.includes(offer.owner?.name || '')) {
            return false;
        }

        // 3. Time Ranges
        // Morning: 06-12, Afternoon: 12-18, Evening: 18-24, Night: 00-06
        const isActiveTimeFilter = Object.values(timeFilters).some(v => v);
        if (isActiveTimeFilter) {
            const firstSegment = slice?.segments?.[0];
            if (!firstSegment?.departing_at) return false;

            const departDate = new Date(firstSegment.departing_at);
            const hour = departDate.getHours();

            let matches = false;
            if (timeFilters.morning && hour >= 6 && hour < 12) matches = true;
            if (timeFilters.afternoon && hour >= 12 && hour < 18) matches = true;
            if (timeFilters.evening && hour >= 18 && hour < 24) matches = true;
            if (timeFilters.night && hour >= 0 && hour < 6) matches = true;

            if (!matches) return false;
        }

        return true;
    });

    // --- SORTING LOGIC ---
    const [sortBy, setSortBy] = useState<'recommended' | 'cheapest' | 'fastest'>('recommended');

    const sortedOffers = [...filteredOffers].sort((a, b) => {
        if (sortBy === 'cheapest') {
            return Number(a.total_amount) - Number(b.total_amount);
        }
        if (sortBy === 'fastest') {
            const durationA = differenceInMinutes(new Date(a.slices[0].segments[a.slices[0].segments.length - 1].arriving_at), new Date(a.slices[0].segments[0].departing_at));
            const durationB = differenceInMinutes(new Date(b.slices[0].segments[b.slices[0].segments.length - 1].arriving_at), new Date(b.slices[0].segments[0].departing_at));
            return durationA - durationB;
        }
        // Recommended: Smart mix (Cheapest Direct -> Cheapest overall)
        const durationA = differenceInMinutes(new Date(a.slices[0].segments[a.slices[0].segments.length - 1].arriving_at), new Date(a.slices[0].segments[0].departing_at));
        const durationB = differenceInMinutes(new Date(b.slices[0].segments[b.slices[0].segments.length - 1].arriving_at), new Date(b.slices[0].segments[0].departing_at));

        // Simple weight: Price * 1 + Duration(min) * 0.5 (Just a heuristics for now)
        const scoreA = Number(a.total_amount) + (durationA * 0.2);
        const scoreB = Number(b.total_amount) + (durationB * 0.2);
        return scoreA - scoreB;
    });

    // Helper to format duration
    const getDuration = (start: string, end: string) => {
        const diff = differenceInMinutes(new Date(end), new Date(start));
        const hours = Math.floor(diff / 60);
        const minutes = diff % 60;
        return `${hours}h ${minutes}m`;
    };

    // --- CURRENCY CONVERSION (SANDBOX FIX) ---
    // Duffel Sandbox ignores currency params, so we estimate it client-side for the visual demo.
    const exchangeRates: { [key: string]: number } = {
        'EUR': 1,
        'USD': 1.05,
        'BRL': 6.15,
        'GBP': 0.85
    };

    const convertPrice = (amount: string | number, fromCurrency: string, toCurrency: string) => {
        if (fromCurrency === toCurrency) return { value: Number(amount), currency: toCurrency };

        const baseEUR = Number(amount) / (exchangeRates[fromCurrency] || 1);
        const converted = baseEUR * (exchangeRates[toCurrency] || 1);

        return { value: converted, currency: toCurrency };
    };

    return (
        <div className="flex flex-col gap-4 w-full text-zinc-800">

            {/* TOP CONTROLS */}
            <div className="flex items-center gap-4 px-2">

                {/* Trip Type Dropdown */}
                <div className="relative" ref={tripTypeRef}>
                    <button
                        onClick={() => setShowTripTypeDropdown(!showTripTypeDropdown)}
                        className="flex items-center gap-1 font-bold text-sm text-white/90 hover:text-white transition-colors bg-transparent outline-none"
                    >
                        {tripType}
                        <span className="text-[10px] text-white/60">▼</span>
                    </button>
                    {showTripTypeDropdown && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 p-1 w-40 z-50 flex flex-col gap-0.5">
                            {['Ida e volta', 'Só ida', 'Várias cidades'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => { setTripType(type); setShowTripTypeDropdown(false); }}
                                    className={`text-left px-3 py-2 rounded-md text-sm font-bold transition-colors ${tripType === type ? 'bg-sky-50 text-sky-700' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative" ref={optionsRef}>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="font-bold text-sm text-white/90 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        {totalTravelers} Viajante{totalTravelers > 1 ? 's' : ''}, {cabin === 'Y' ? 'Económica' : 'Executiva'}
                    </button>
                    {showOptions && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 p-6 w-80 z-50">

                            <h3 className="text-base font-bold text-zinc-900 mb-4">Passageiros e Classe</h3>

                            {/* Options List - Clean Style */}
                            <div className="space-y-4">
                                {/* Adults */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="block font-bold text-sm text-zinc-900">Adultos</span>
                                        <span className="text-xs text-zinc-500">18 anos ou mais</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))} className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 font-bold transition-colors">-</button>
                                        <span className="font-bold w-4 text-center text-zinc-900">{passengers.adults}</span>
                                        <button onClick={() => setPassengers(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))} className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 font-bold transition-colors">+</button>
                                    </div>
                                </div>

                                {/* Children */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="block font-bold text-sm text-zinc-900">Crianças</span>
                                        <span className="text-xs text-zinc-500">0 a 17 anos</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))} className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 font-bold transition-colors">-</button>
                                        <span className="font-bold w-4 text-center text-zinc-900">{passengers.children}</span>
                                        <button onClick={() => setPassengers(p => ({ ...p, children: Math.min(9, p.children + 1) }))} className="w-8 h-8 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200 font-bold transition-colors">+</button>
                                    </div>
                                </div>

                                {/* Class */}
                                <div className="pt-4 border-t border-zinc-100">
                                    <span className="block font-bold text-sm text-zinc-900 mb-2">Classe da cabine</span>
                                    <select
                                        value={cabin}
                                        onChange={(e) => setCabin(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 outline-none focus:border-sky-500 transition-colors"
                                    >
                                        <option value="Y">Económica</option>
                                        <option value="C">Executiva</option>
                                        <option value="F">Primeira Classe</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => setShowOptions(false)}
                                    className="w-full bg-[#0057ae] hover:bg-[#004385] text-white font-bold py-2.5 rounded-md text-sm transition-colors"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SEARCH BAR - REVERTED TO SEPARATE INPUTS */}
            <div className="w-full flex flex-col md:flex-row items-center gap-2">

                {/* ORIGIN */}
                <div className="flex-1 w-full bg-white rounded-md p-2 flex items-center gap-3 h-14 relative group shadow-sm hover:shadow-md transition-shadow" ref={originRef}>
                    <MapPin className="w-5 h-5 text-zinc-400 shrink-0 ml-1" />
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">{t('search.from')}</label>
                        <input
                            type="text"
                            placeholder="Cidade ou aeroporto"
                            className="w-full outline-none font-bold text-zinc-900 placeholder:text-zinc-300 text-sm truncate bg-transparent font-sans"
                            value={origin}
                            onChange={(e) => { setOrigin(e.target.value); setOriginCode(''); }}
                            onFocus={() => { if (origin.length >= 2) setShowOriginDropdown(true); }}
                        />
                    </div>
                    {/* ORIGIN SUGGESTIONS */}
                    {showOriginDropdown && originSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-md border border-zinc-200 z-[100] mt-2 overflow-hidden">
                            {originSuggestions.map((loc) => (
                                <div key={loc.iataCode} onClick={() => handleSelectOrigin(loc)} className="p-3 hover:bg-sky-50 cursor-pointer border-b border-zinc-50 last:border-0">
                                    <p className="font-bold text-zinc-900 text-sm">{loc.address.cityName}</p>
                                    <p className="text-xs text-zinc-500">{loc.name} ({loc.iataCode})</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* DESTINATION */}
                <div className="flex-1 w-full bg-white rounded-md p-2 flex items-center gap-3 h-14 relative group shadow-sm hover:shadow-md transition-shadow" ref={destRef}>
                    <MapPin className="w-5 h-5 text-zinc-400 shrink-0 ml-1" />
                    <div className="flex flex-col justify-center flex-1 overflow-hidden">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">{t('search.to')}</label>
                        <input
                            type="text"
                            placeholder="Cidade ou aeroporto"
                            className="w-full outline-none font-bold text-zinc-900 placeholder:text-zinc-300 text-sm truncate bg-transparent font-sans"
                            value={destination}
                            onChange={(e) => { setDestination(e.target.value); setDestCode(''); }}
                            onFocus={() => { if (destination.length >= 2) setShowDestDropdown(true); }}
                        />
                    </div>
                    {/* DEST SUGGESTIONS */}
                    {showDestDropdown && destSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white shadow-xl rounded-md border border-zinc-200 z-[100] mt-2 overflow-hidden">
                            {destSuggestions.map((loc) => (
                                <div key={loc.iataCode} onClick={() => handleSelectDest(loc)} className="p-3 hover:bg-sky-50 cursor-pointer border-b border-zinc-50 last:border-0">
                                    <p className="font-bold text-zinc-900 text-sm">{loc.address.cityName}</p>
                                    <p className="text-xs text-zinc-500">{loc.name} ({loc.iataCode})</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* DATES */}
                <div className="flex-1 w-full flex gap-2 relative" ref={calendarRef}>
                    {/* IDA */}
                    <div onClick={() => setShowCalendar(true)} className="flex-1 bg-white rounded-md p-2 flex items-center gap-2 h-14 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                        <Calendar className="w-5 h-5 text-zinc-400 shrink-0" />
                        <div className="flex flex-col justify-center overflow-hidden">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">{t('search.depart')}</label>
                            <span className={`font-bold text-sm truncate ${departDate ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                {departDate ? format(new Date(departDate), 'dd/MM/yyyy') : 'Data'}
                            </span>
                        </div>
                    </div>
                    {/* VOLTA */}
                    <div onClick={() => setShowCalendar(true)} className="flex-1 bg-white rounded-md p-2 flex items-center gap-2 h-14 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                        <Calendar className="w-5 h-5 text-zinc-400 shrink-0" />
                        <div className="flex flex-col justify-center overflow-hidden">
                            <label className="text-[10px] uppercase font-bold text-zinc-500">{t('search.return')}</label>
                            <span className={`font-bold text-sm truncate ${returnDate ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                {returnDate ? format(new Date(returnDate), 'dd/MM/yyyy') : 'Data'}
                            </span>
                        </div>
                    </div>

                    {/* CALENDAR POPUP */}
                    {showCalendar && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-zinc-200 p-4 z-[70] min-w-[300px]">
                            <DayPicker
                                mode="range"
                                selected={{ from: departDate ? new Date(departDate) : undefined, to: returnDate ? new Date(returnDate) : undefined }}
                                onSelect={(range) => {
                                    if (range?.from) setDepartDate(range.from.toISOString());
                                    if (range?.to) setReturnDate(range.to.toISOString());
                                    else if (!range?.to && range?.from) setReturnDate('');
                                }}
                                modifiersClassNames={{ selected: 'bg-[#0057ae] text-white', today: 'font-bold text-[#0057ae]' }}
                            />
                        </div>
                    )}
                </div>

                {/* SEARCH BUTTON with Premium Gradient */}
                <div className="relative group z-10 w-full md:w-auto h-14">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-600 to-orange-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="relative w-full md:w-auto h-full px-8 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-xl shadow-rose-200/50 flex flex-row items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out"></div>

                        <Search className="w-5 h-5 stroke-[3] group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-black uppercase tracking-wider">Buscar</span>
                    </motion.button>
                </div>
            </div>


            {/* MAIN CONTENT GRID */}
            <div className="flex flex-col lg:flex-row gap-6 mt-6">

                {/* FILTERS SIDEBAR */}
                {(offers.length > 0 || isLoading) && (
                    <div className="w-full lg:w-1/4 h-fit sticky top-24 animation-delay-200 animate-in slide-in-from-left-4 duration-700">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-6 flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-lg text-zinc-900 flex items-center gap-2">
                                    Filters <span className="text-xs bg-zinc-100 px-2 py-1 rounded-full text-zinc-500 font-medium">3</span>
                                </h3>
                                <button onClick={() => { setIsDirectOnly(false); setSelectedAirlines([]); setTimeFilters({ morning: false, afternoon: false, evening: false, night: false }); }} className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline transition-colors uppercase tracking-wide">Clean All</button>
                            </div>

                            {/* Direct Flights */}
                            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isDirectOnly ? 'bg-rose-500 border-rose-500' : 'border-zinc-300 group-hover:border-rose-400'}`}>
                                    {isDirectOnly && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                    <input type="checkbox" checked={isDirectOnly} onChange={(e) => setIsDirectOnly(e.target.checked)} className="hidden" />
                                </div>
                                <span className="font-bold text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">{t('search.direct')}</span>
                            </label>

                            <hr className="border-zinc-100" />
                            {/* Time Filters ... (Keep logic, update color to blue) */}
                            <div className="flex flex-col gap-2">
                                <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider mb-2">Departure Time</h4>
                                {[
                                    { key: 'morning', label: 'Morning (06-12h)', icon: '🌅' },
                                    { key: 'afternoon', label: 'Afternoon (12-18h)', icon: '☀️' },
                                    { key: 'evening', label: 'Evening (18-00h)', icon: '🌆' },
                                    { key: 'night', label: 'Night (00-06h)', icon: '🌙' },
                                ].map((item) => (
                                    <label key={item.key} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-50 transition-colors">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${timeFilters[item.key as keyof typeof timeFilters] ? 'bg-rose-500 border-rose-500' : 'border-zinc-300'}`}>
                                            {timeFilters[item.key as keyof typeof timeFilters] && <div className="w-2 h-2 bg-white rounded-full" />}
                                            <input type="checkbox" checked={timeFilters[item.key as keyof typeof timeFilters]} onChange={() => toggleTimeFilter(item.key as any)} className="hidden" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-600 flex-1">{item.label}</span>
                                        <span className="text-xs grayscale">{item.icon}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESULTS LIST */}
                <div className="flex-1">
                    {/* Date Navigation for Deal Hunting */}
                    {!isLoading && offers.length > 0 && departDate && (
                        <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm mb-6 animate-in slide-in-from-top-4 duration-500">
                            <button
                                onClick={() => {
                                    const prev = new Date(departDate);
                                    prev.setDate(prev.getDate() - 1);
                                    setDepartDate(prev.toISOString());
                                }}
                                className="text-xs font-bold text-zinc-500 hover:text-rose-600 flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow"
                            >
                                ← Prev Day
                            </button>

                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-full mb-1">Best Deals For</span>
                                <span className="font-black text-xl text-zinc-800 tracking-tight">{format(new Date(departDate), 'dd MMM yyyy', { locale: ptBR })}</span>
                            </div>

                            <button
                                onClick={() => {
                                    const next = new Date(departDate);
                                    next.setDate(next.getDate() + 1);
                                    setDepartDate(next.toISOString());
                                }}
                                className="text-xs font-bold text-zinc-500 hover:text-rose-600 flex items-center gap-2 px-4 py-2 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow"
                            >
                                Next Day →
                            </button>
                        </div>
                    )}

                    {/* SANDBOX NOTICE */}
                    {!isLoading && offers.length > 0 && (
                        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0 text-amber-600 font-bold border border-amber-200">Test</div>
                            <div>
                                <h4 className="font-black text-amber-900 text-sm">Sandbox Mode Active</h4>
                                <p className="text-xs text-amber-700/80 font-medium mt-0.5">
                                    Prices are simulated. In production, real dynamic pricing from 700+ airlines will appear here.
                                </p>
                            </div>
                        </div>
                    )}


                    {isLoading && (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-white rounded-lg animate-pulse shadow-sm border border-zinc-100" />
                            ))}
                        </div>
                    )}

                    {!isLoading && offers.length > 0 && (
                        <div className="flex flex-col gap-5 pb-20">

                            {/* SORTING TABS (Three Columns) */}
                            <div className="grid grid-cols-3 bg-white/80 p-1 backdrop-blur-md rounded-2xl shadow-lg shadow-zinc-200/50 border border-white/50 mb-4 sticky top-4 z-40 transform transition-all">
                                <button
                                    onClick={() => setSortBy('recommended')}
                                    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all relative ${sortBy === 'recommended' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 scale-105 z-10' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    <span className="font-bold text-xs uppercase tracking-wider">Recommended</span>
                                    {sortedOffers.length > 0 && <span className="text-sm font-black mt-0.5">
                                        {(() => {
                                            const price = convertPrice(sortedOffers[0].total_amount, sortedOffers[0].total_currency, currency);
                                            return price.value.toLocaleString('pt-BR', { style: 'currency', currency: price.currency, maximumFractionDigits: 0 });
                                        })()}
                                    </span>}
                                </button>
                                <button
                                    onClick={() => setSortBy('cheapest')}
                                    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all relative ${sortBy === 'cheapest' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-105 z-10' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    <span className="font-bold text-xs uppercase tracking-wider">Cheapest</span>
                                    {sortedOffers.length > 0 && <span className="text-sm font-black mt-0.5">
                                        {(() => {
                                            const cheapest = Math.min(...filteredOffers.map(o => Number(o.total_amount)));
                                            const price = convertPrice(cheapest, sortedOffers[0].total_currency, currency);
                                            return price.value.toLocaleString('pt-BR', { style: 'currency', currency: price.currency, maximumFractionDigits: 0 });
                                        })()}
                                    </span>}
                                </button>
                                <button
                                    onClick={() => setSortBy('fastest')}
                                    className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all relative ${sortBy === 'fastest' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-105 z-10' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                >
                                    <span className="font-bold text-xs uppercase tracking-wider">Fastest</span>
                                    {sortedOffers.length > 0 && <span className="text-sm font-black mt-0.5">
                                        {(() => {
                                            // Find shortest duration in minutes
                                            const minMinutes = Math.min(...filteredOffers.map(o => {
                                                const s = o.slices[0];
                                                return differenceInMinutes(new Date(s.segments[s.segments.length - 1].arriving_at), new Date(s.segments[0].departing_at));
                                            }));
                                            const h = Math.floor(minMinutes / 60);
                                            const m = minMinutes % 60;
                                            return `${h}h ${m}m`;
                                        })()}
                                    </span>}
                                </button>
                            </div>

                            {sortedOffers.length === 0 && (
                                <div className="p-12 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-300">
                                    <h3 className="text-xl font-bold text-zinc-900 mb-2">No flights match your filters</h3>
                                    <p className="text-zinc-500">Try adjusting your filters to see more results.</p>
                                    <button onClick={() => { setIsDirectOnly(false); setSelectedAirlines([]); setTimeFilters({ morning: false, afternoon: false, evening: false, night: false }); }} className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-colors">Clean Filters</button>
                                </div>
                            )}

                            {sortedOffers.map((offer, idx) => {
                                const slice = offer.slices?.[0];
                                if (!slice || !slice.segments?.length) return null; // Skip invalid offers

                                const segments = slice.segments;
                                const start = segments[0]?.departing_at;
                                const end = segments[segments.length - 1]?.arriving_at;

                                if (!start || !end) return null; // Skip if dates missing

                                const stops = segments.length - 1;
                                const duration = getDuration(start, end);
                                // NEW: Convert Price
                                const { value: priceValue, currency: priceCurrency } = convertPrice(offer.total_amount || 0, offer.total_currency || 'USD', currency);

                                // Flight Number Logic
                                const firstSeg = segments[0];
                                const carrierCode = firstSeg?.marketing_carrier?.iata_code || firstSeg?.operating_carrier?.iata_code || offer.owner?.iata_code || '??';
                                const flightNum = segments[0].marketing_carrier_flight_number || segments[0].operating_carrier_flight_number || '---';

                                return (
                                    <div key={offer.id} className="bg-white rounded-3xl shadow-lg shadow-zinc-200/40 border border-zinc-100 hover:shadow-2xl hover:scale-[1.01] hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col md:flex-row gap-8 relative group overflow-hidden">

                                        {/* Highlight Best Option */}
                                        {idx === 0 && sortBy === 'recommended' && (
                                            <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-sm z-20">
                                                Best Choice
                                            </div>
                                        )}

                                        {/* Decoration Gradient */}
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-zinc-200 to-transparent group-hover:from-rose-500 transition-colors"></div>

                                        {/* Left: Airline Logo & Time */}
                                        <div className="flex-1 flex flex-col justify-center gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 relative rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center p-2 group-hover:border-rose-100 transition-colors">
                                                    {offer.owner.logo_symbol_url ? (
                                                        <img src={offer.owner.logo_symbol_url} alt={offer.owner.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="font-bold text-zinc-400 text-xs">{offer.owner.iata_code}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-900 leading-tight">{offer.owner.name}</h4>
                                                    <p className="text-xs text-zinc-400 font-medium">Flight {carrierCode}{flightNum}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div>
                                                    <p className="text-3xl font-black text-zinc-800 tracking-tight">{format(new Date(start), 'HH:mm')}</p>
                                                    <p className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md w-fit mt-1">{slice.origin.iata_code}</p>
                                                </div>

                                                {/* Connecting Line */}
                                                <div className="flex-1 flex flex-col items-center gap-1">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{duration}</p>
                                                    <div className="w-full h-px bg-zinc-200 relative flex items-center justify-center">
                                                        <div className={`w-2 h-2 rounded-full ${stops === 0 ? 'bg-emerald-400' : 'bg-amber-400'} absolute left-0`}></div>
                                                        <Plane className="w-4 h-4 text-zinc-300 rotate-90 absolute" />
                                                        <div className={`w-2 h-2 rounded-full ${stops === 0 ? 'bg-emerald-400' : 'bg-amber-400'} absolute right-0`}></div>
                                                    </div>
                                                    <p className={`text-[10px] font-bold ${stops === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-zinc-800 tracking-tight">{format(new Date(end), 'HH:mm')}</p>
                                                    <p className="text-xs font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-md w-fit ml-auto mt-1">{slice.destination.iata_code}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="hidden md:block w-px bg-zinc-100 border-l border-dashed border-zinc-200 my-2"></div>

                                        {/* Right: Price & CTA */}
                                        <div className="md:w-48 flex flex-col justify-center items-end gap-2 text-right">
                                            <div>
                                                <span className="text-3xl font-black text-zinc-900 tracking-tighter">
                                                    {priceValue.toLocaleString('pt-BR', { style: 'currency', currency: priceCurrency, maximumFractionDigits: 0 })}
                                                </span>
                                                <p className="text-xs text-zinc-400 font-medium">per adult</p>
                                            </div>

                                            <button
                                                onClick={() => handleCheckout(offer)}
                                                disabled={!!isProcessing}
                                                className="w-full mt-2 bg-zinc-900 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-zinc-200 group-hover:shadow-rose-200 flex items-center justify-center gap-2"
                                            >
                                                {isProcessing === offer.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Select Flight"}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>

                                            {/* Hold Option (Small) */}
                                            <HoldButton
                                                offer={offer}
                                                passengers={offer.passengers}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper Plane Icon (Simple SVG)
function Plane(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12h20" />
            <path d="M13 5v7" />
            <path d="M16 5l-3 7-3-7" />
        </svg>
    )
}
