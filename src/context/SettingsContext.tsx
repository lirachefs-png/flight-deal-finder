'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'BRL' | 'EUR' | 'USD';
type Language = 'pt-BR' | 'en-US' | 'es-ES';

const translations = {
    'pt-BR': {
        header: { stays: 'Estadias', flights: 'Voos', experiences: 'Experiências', signin: 'Entrar / Cadastrar', account: 'Minha Conta', logout: 'Sair' },
        search: { from: 'De onde?', to: 'Para onde?', depart: 'Partida', return: 'Volta', search: 'Buscar', passengers: 'Viajantes', class: 'Classe', direct: 'Apenas voos diretos' },
        maya: { greeting: 'Olá! Sou a Maya, sua especialista em viagens. 🌍✨ Para onde sonhamos em ir hoje?', placeholder: 'Converse com a Maya...' }
    },
    'en-US': {
        header: { stays: 'Stays', flights: 'Flights', experiences: 'Experiences', signin: 'Sign In / Join', account: 'My Account', logout: 'Logout' },
        search: { from: 'From where?', to: 'To where?', depart: 'Depart', return: 'Return', search: 'Search', passengers: 'Travelers', class: 'Class', direct: 'Direct flights only' },
        maya: { greeting: 'Hi! I\'m Maya, your travel specialist. 🌍✨ Where are we dreaming of going today?', placeholder: 'Chat with Maya...' }
    },
    'es-ES': {
        header: { stays: 'Alojamientos', flights: 'Vuelos', experiences: 'Experiencias', signin: 'Entrar / Registrarse', account: 'Mi Cuenta', logout: 'Salir' },
        search: { from: '¿De dónde?', to: '¿A dónde?', depart: 'Salida', return: 'Regreso', search: 'Buscar', passengers: 'Viajeros', class: 'Clase', direct: 'Solo vuelos directos' },
        maya: { greeting: '¡Hola! Soy Maya, tu especialista en viajes. 🌍✨ ¿A dónde soñamos ir hoy?', placeholder: 'Habla con Maya...' }
    }
};

interface SettingsContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    language: Language;
    setLanguage: (l: Language) => void;
    t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('EUR');
    const [language, setLanguage] = useState<Language>('pt-BR');

    // ... (rest of useEffects)

    const t = (path: string) => {
        const keys = path.split('.');
        let current: any = translations[language];
        for (const key of keys) {
            if (current[key] === undefined) return path;
            current = current[key];
        }
        return current;
    };

    return (
        <SettingsContext.Provider value={{ currency, setCurrency, language, setLanguage, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
