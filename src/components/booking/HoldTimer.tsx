'use client';

import React, { useState, useEffect } from 'react';
import { differenceInSeconds, format } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';

interface HoldTimerProps {
    expiresAt: string;
}

export default function HoldTimer({ expiresAt }: HoldTimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const now = new Date();
            const expiration = new Date(expiresAt);
            const diff = differenceInSeconds(expiration, now);

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft('Expirado');
                clearInterval(interval);
                return;
            }

            setSecondsRemaining(diff);

            const h = Math.floor(diff / 3600);
            const m = Math.floor((diff % 3600) / 60);
            const s = diff % 60;

            const hDisplay = h > 0 ? `${h}h ` : '';
            const mDisplay = m > 0 ? `${m}m ` : '';
            const sDisplay = `${s}s`;

            setTimeLeft(`${hDisplay}${mDisplay}${sDisplay}`);

        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!expiresAt || isExpired) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-center gap-3 text-red-600 font-bold animate-pulse">
                <AlertTriangle className="w-5 h-5" />
                <span>Esta reserva expirou.</span>
            </div>
        );
    }

    if (secondsRemaining === null) return null; // Initial load

    // Styling based on urgency
    const isUrgent = secondsRemaining < 3600; // Less than 1 hour
    const bgColor = isUrgent ? 'bg-orange-50' : 'bg-emerald-50';
    const borderColor = isUrgent ? 'border-orange-100' : 'border-emerald-100';
    const textColor = isUrgent ? 'text-orange-700' : 'text-emerald-700';

    return (
        <div className={`${bgColor} border ${borderColor} rounded-xl p-4 flex items-center justify-between shadow-sm`}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isUrgent ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                    <Clock className={`w-5 h-5 ${textColor}`} />
                </div>
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${textColor} opacity-80`}>
                        Garantia de Preço
                    </p>
                    <p className={`text-sm font-medium ${textColor}`}>
                        Sua reserva e preço estão garantidos por:
                    </p>
                </div>
            </div>
            <div className={`text-2xl font-mono font-bold ${textColor}`}>
                {timeLeft}
            </div>
        </div>
    );
}
