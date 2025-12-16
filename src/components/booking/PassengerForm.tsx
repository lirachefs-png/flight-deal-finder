'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plane, User, Baby } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Passenger {
    id: string; // The Duffel passenger ID (e.g. pas_0000...)
    type: string; // 'adult', 'child', 'infant_without_seat'
}

interface PassengerFormProps {
    offerId: string;
    totalAmount: string;
    currency: string;
    passengers: Passenger[];
    selectedServices?: any[];
}

export default function PassengerForm({ offerId, totalAmount, currency, passengers, selectedServices = [] }: PassengerFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Initial state: Array of objects, one for each passenger from the offer
    const [formsData, setFormsData] = useState(() => {
        return passengers.map(p => ({
            id: p.id,
            type: p.type,
            given_name: '',
            family_name: '',
            born_on: '',
            gender: 'm',
            email: '',
            phone_number: '+55'
        }));
    });

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormsData(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [name]: value };
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Basic validation: Check if email is filled for at least the first adult (contact)
        if (!formsData[0].email) {
            toast.error("Email obrigatório", { description: "Informe o email do passageiro principal." });
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offer_id: offerId,
                    passengers: formsData,
                    services: selectedServices
                })
            });

            const data = await res.json();

            if (data.error) {
                let errorMsg = data.error;
                if (typeof errorMsg === 'string' && (errorMsg.toLowerCase().includes('offer') || errorMsg.toLowerCase().includes('expired'))) {
                    errorMsg = "Esta oferta expirou ou o preço mudou. Por favor, faça uma nova busca para atualizar.";
                }
                toast.error("Erro ao criar reserva", { description: errorMsg });
            } else {
                toast.success("Reserva criada com sucesso!");
                router.push(`/booking/confirmation/${data.data.id}`);
            }
        } catch (error) {
            toast.error("Erro de conexão", { description: "Tente novamente mais tarde." });
        } finally {
            setIsLoading(false);
        }
    };

    const getPassengerLabel = (type: string, index: number) => {
        let label = `Passageiro ${index + 1}`;
        if (type === 'adult') label += ' (Adulto)';
        if (type === 'child') label += ' (Criança)';
        if (type === 'infant_without_seat') label += ' (Bebê)';
        return label;
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-zinc-100 mt-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plane className="w-5 h-5 text-rose-600" />
                Dados dos Passageiros
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {formsData.map((data, index) => (
                    <div key={data.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 relative">
                        <div className="absolute -top-3 left-4 bg-white px-3 py-1 rounded-full text-xs font-bold text-rose-600 border border-zinc-100 shadow-sm flex items-center gap-1">
                            {data.type === 'infant_without_seat' ? <Baby className="w-3 h-3" /> : <User className="w-3 h-3" />}
                            {getPassengerLabel(data.type, index)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            {/* First Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Nome</label>
                                <input
                                    name="given_name"
                                    required
                                    placeholder="Como no passaporte"
                                    className="bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold"
                                    value={data.given_name}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Sobrenome</label>
                                <input
                                    name="family_name"
                                    required
                                    placeholder="Como no passaporte"
                                    className="bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold"
                                    value={data.family_name}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* Date of Birth */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Data Nasc.</label>
                                <input
                                    type="date"
                                    name="born_on"
                                    required
                                    className="bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold text-zinc-600"
                                    value={data.born_on}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </div>

                            {/* Gender */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Gênero</label>
                                <select
                                    name="gender"
                                    className="bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold text-zinc-600"
                                    value={data.gender}
                                    onChange={(e) => handleChange(index, e)}
                                >
                                    <option value="m">Masculino</option>
                                    <option value="f">Feminino</option>
                                </select>
                            </div>

                            {/* Phone (Only for Adult/Primary) */}
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Celular</label>
                                <input
                                    name="phone_number"
                                    placeholder="+55..."
                                    className="bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold"
                                    value={data.phone_number}
                                    onChange={(e) => handleChange(index, e)}
                                />
                            </div>
                        </div>

                        {/* Email (Only for keys, but we ask for all for simplicity or just first) */}
                        <div className="flex flex-col gap-1 mt-4">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Email (Obrigatório)</label>
                            <input
                                type="email"
                                name="email"
                                required={index === 0} // Only required for main passenger usually
                                placeholder="para receber o bilhete"
                                className="bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 transition-all font-semibold"
                                value={data.email}
                                onChange={(e) => handleChange(index, e)}
                            />
                        </div>
                    </div>
                ))}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 w-full bg-gradient-to-r from-rose-600 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-200 hover:opacity-90 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Processando...
                        </>
                    ) : (
                        <>
                            Reservar {passengers.length} passageiro(s) por {Number(totalAmount).toLocaleString('pt-BR', { style: 'currency', currency: currency })}
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-zinc-400 mt-2">
                    Ao clicar, você concorda com os termos da All Trip.
                    <br />Esta é uma reserva não paga (Hold).
                </p>
            </form>
        </div>
    );
}
