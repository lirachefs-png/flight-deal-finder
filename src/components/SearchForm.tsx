'use client';

import React, { useState } from 'react';
import { Search, Calendar, DollarSign, MapPin } from 'lucide-react';

interface SearchFormProps {
    onSearch: (params: { origin: string; date: string; maxPrice: number }) => void;
    isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [origin, setOrigin] = useState('LIS');
    const [date, setDate] = useState('2025-03-10');
    const [maxPrice, setMaxPrice] = useState(200);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ origin, date, maxPrice });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Origin Input */}
                <div className="relative">
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">From</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-zinc-900 dark:text-white"
                            placeholder="Origin (e.g. LIS)"
                            required
                        />
                    </div>
                </div>

                {/* Date Input */}
                <div className="relative">
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">When</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-zinc-900 dark:text-white"
                            required
                        />
                    </div>
                </div>

                {/* Budget Input */}
                <div className="relative">
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Budget (EUR)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-zinc-900 dark:text-white"
                            placeholder="Max Price"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Hunting Deals...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Find Cheap Flights
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
