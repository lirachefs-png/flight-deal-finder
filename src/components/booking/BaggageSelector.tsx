'use client';

import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';

interface BaggageSelectorProps {
    passengers: any[];
    onUpdate: (bags: any[]) => void;
}

export default function BaggageSelector({ passengers, onUpdate }: BaggageSelectorProps) {
    // State: count of bags per passenger index
    const [bags, setBags] = useState<number[]>(new Array(passengers.length).fill(0));

    const handleUpdate = (index: number, delta: number) => {
        const newBags = [...bags];
        newBags[index] = Math.max(0, Math.min(3, newBags[index] + delta)); // Max 3 bags
        setBags(newBags);

        // Notify parent
        // For now, we just pass the counts. 
        // In full integration we'd map to specific Duffel service IDs if available
        onUpdate(newBags);
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mt-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-rose-600" />
                Bagagem Despachada
            </h3>

            <div className="flex flex-col gap-4">
                {passengers.map((p, idx) => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div>
                            <span className="font-bold text-sm block">
                                {p.given_name || `Passageiro ${idx + 1}`} ({p.type === 'adult' ? 'Adulto' : 'Criança'})
                            </span>
                            <span className="text-xs text-zinc-400">Mala de 23kg</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleUpdate(idx, -1)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${bags[idx] === 0 ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-white text-zinc-600 shadow-sm hover:bg-zinc-100'}`}
                                disabled={bags[idx] === 0}
                            >-</button>

                            <span className="font-bold w-4 text-center">{bags[idx]}</span>

                            <button
                                onClick={() => handleUpdate(idx, 1)}
                                className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-zinc-600 shadow-sm hover:bg-zinc-100"
                            >+</button>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-center text-xs text-zinc-400 mt-4">
                *Adicionar bagagem agora é mais barato que no aeroporto.
            </p>
        </div>
    );
}
