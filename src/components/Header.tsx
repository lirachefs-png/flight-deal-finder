"use client";

import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Sparkles, LayoutDashboard, Globe, Coins } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminEmail } from '@/lib/adminAuth';
import { useSettings } from '@/context/SettingsContext';
import AuthModal from './auth/AuthModal';

function GlobalSettings() {
    const { currency, setCurrency, language, setLanguage } = useSettings();
    const [openMenu, setOpenMenu] = useState<'lang' | 'curr' | null>(null);

    // Close when clicking outside
    useEffect(() => {
        const close = () => setOpenMenu(null);
        if (openMenu) document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, [openMenu]);

    const toggle = (menu: 'lang' | 'curr', e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent immediate close
        setOpenMenu(openMenu === menu ? null : menu);
    };

    return (
        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-full px-2 py-1 shadow-sm relative z-50">
            {/* Language */}
            <div className="relative">
                <button
                    onClick={(e) => toggle('lang', e)}
                    className={`flex items-center gap-1 px-2 py-1 font-bold text-xs transition-colors rounded-md ${openMenu === 'lang' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                    <Globe className="w-3.5 h-3.5" />
                    {language.split('-')[0].toUpperCase()}
                </button>

                {/* Dropdown */}
                {openMenu === 'lang' && (
                    <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-zinc-100 p-1 animate-in fade-in slide-in-from-top-2 z-[60]" onClick={(e) => e.stopPropagation()}>
                        {[
                            { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
                            { code: 'en-US', label: 'English', flag: '🇺🇸' },
                            { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => { setLanguage(lang.code as any); setOpenMenu(null); }}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-bold rounded-lg transition-colors ${language === lang.code ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50'}`}
                            >
                                <span>{lang.flag}</span> {lang.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="w-px h-4 bg-zinc-200"></div>

            {/* Currency */}
            <div className="relative">
                <button
                    onClick={(e) => toggle('curr', e)}
                    className={`flex items-center gap-1 px-2 py-1 font-bold text-xs transition-colors rounded-md ${openMenu === 'curr' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-600 hover:text-zinc-900'}`}
                >
                    <Coins className="w-3.5 h-3.5" />
                    {currency}
                </button>

                {/* Dropdown */}
                {openMenu === 'curr' && (
                    <div className="absolute top-full right-0 mt-2 w-24 bg-white rounded-xl shadow-xl border border-zinc-100 p-1 animate-in fade-in slide-in-from-top-2 z-[60]" onClick={(e) => e.stopPropagation()}>
                        {['BRL', 'EUR', 'USD'].map((curr) => (
                            <button
                                key={curr}
                                onClick={() => { setCurrency(curr as any); setOpenMenu(null); }}
                                className={`flex items-center justify-center w-full px-3 py-2 text-xs font-bold rounded-lg transition-colors ${currency === curr ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-50'}`}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Header() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useSettings();

    // Helper for active styling
    const getLinkClass = (path: string) => {
        const isActive = pathname === path;
        return isActive
            ? "text-rose-600 font-bold text-sm bg-white px-4 py-1.5 rounded-full shadow-sm transition-all"
            : "text-zinc-600 font-bold text-sm hover:text-rose-600 transition-colors px-4 py-1.5";
    };

    // Mobile helper
    const getMobileLinkClass = (path: string) => {
        const isActive = pathname === path;
        return isActive
            ? "text-rose-600 font-bold text-lg py-2 border-b border-rose-100 bg-rose-50 px-4 rounded-xl"
            : "text-zinc-600 font-bold text-lg py-2 border-b border-zinc-50 px-4 hover:bg-zinc-50 rounded-xl";
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        {/* Logo Image */}
                        <div className="relative w-12 h-12">
                            <Image
                                src="/logo.png"
                                alt="All Trip Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-2xl tracking-tighter text-zinc-900 leading-none group-hover:text-rose-600 transition-colors">
                                ALL TRIP<span className="text-rose-600">.</span>
                            </span>
                        </div>
                    </Link>

                    {/* DESKTOP MENU */}
                    <div className="hidden md:flex items-center gap-2 bg-zinc-100/50 px-2 py-1.5 rounded-full border border-zinc-200/50">
                        {/* <Link href="/stays" className={getLinkClass('/stays')}>{t('header.stays')}</Link> */}
                        <Link href="/" className={getLinkClass('/')}>{t('header.flights')}</Link>
                        <Link href="/ai-planner" className={`${getLinkClass('/ai-planner')} flex items-center gap-1`}>
                            <Sparkles className={`w-3 h-3 ${pathname === '/ai-planner' ? 'text-rose-500' : 'text-purple-500'}`} /> Maya AI
                        </Link>
                        <Link href="/experiences" className={getLinkClass('/experiences')}>{t('header.experiences')}</Link>
                    </div>

                    {/* SIGN IN / USER BUTTON (DESKTOP) */}
                    <div className="hidden md:block">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {/* ADMIN LINK */}
                                {isAdminEmail(user.email) && (
                                    <button
                                        onClick={() => router.push('/admin')}
                                        className="px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-700 transition-colors shadow-sm"
                                    >
                                        ADMIN
                                    </button>
                                )}

                                <button
                                    onClick={() => router.push('/account')}
                                    className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors border border-zinc-200"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                        {user.email?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-zinc-700 max-w-[100px] truncate">
                                        {t('header.account')}
                                    </span>
                                </button>

                                {/* GLOBAL SETTINGS (Desktop) */}
                                <div className="h-6 w-px bg-zinc-200 mx-2"></div>
                                <GlobalSettings />
                                <div className="h-6 w-px bg-zinc-200 mx-2"></div>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                                    title={t('header.logout')}
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <GlobalSettings />
                                <button
                                    onClick={() => setIsAuthOpen(true)}
                                    className="bg-zinc-900 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 hover:shadow-xl"
                                >
                                    {t('header.signin')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* MOBILE HAMBURGER */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-zinc-800 hover:bg-zinc-100 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* MOBILE MENU DROPDOWN */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-zinc-100 bg-white px-6 py-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
                        {/* <Link href="/stays" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/stays')}>{t('header.stays')}</Link> */}
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/')}>{t('header.flights')}</Link>
                        <Link href="/ai-planner" onClick={() => setIsMobileMenuOpen(false)} className={`${getMobileLinkClass('/ai-planner')} flex items-center gap-2`}>
                            <Sparkles className="w-4 h-4 text-purple-500" /> Maya AI
                        </Link>
                        <Link href="/experiences" onClick={() => setIsMobileMenuOpen(false)} className={getMobileLinkClass('/experiences')}>{t('header.experiences')}</Link>

                        {/* Mobile Global Settings */}
                        <div className="flex justify-center py-2">
                            <GlobalSettings />
                        </div>

                        <div className="pt-2">
                            {user ? (
                                <div className="flex flex-col gap-3">
                                    {isAdminEmail(user.email) && (
                                        <button
                                            onClick={() => { router.push('/admin'); setIsMobileMenuOpen(false); }}
                                            className="flex items-center justify-center gap-2 w-full p-2 bg-zinc-900 text-white rounded-xl font-bold"
                                        >
                                            <LayoutDashboard className="w-4 h-4" /> Painel Admin
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { router.push('/account'); setIsMobileMenuOpen(false); }}
                                        className="flex items-center gap-3 w-full p-2 bg-zinc-50 rounded-xl"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {user.email?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-zinc-700">Minha Conta</span>
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="text-center w-full py-3 text-red-500 font-bold bg-red-50 rounded-xl"
                                    >
                                        Sair da Conta
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }}
                                    className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
                                >
                                    Entrar / Cadastrar
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}
