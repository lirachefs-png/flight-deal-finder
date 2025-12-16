'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/adminAuth';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !isAdminEmail(session.user.email)) {
                router.push('/'); // Redirect non-admins to home
            } else {
                setLoading(false);
            }
        };
        checkAdmin();
    }, [router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Verifying Access...
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-zinc-900 text-white flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-zinc-800">
                    <h1 className="text-xl font-black tracking-tighter">ALL TRIP <span className="text-rose-500">ADMIN</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-zinc-800 rounded-xl text-white font-bold transition-colors shadow-sm">
                        <LayoutDashboard className="w-5 h-5 text-rose-500" /> Dashboard
                    </Link>
                    {/* Placeholders for future */}
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-bold transition-colors">
                        <Users className="w-5 h-5" /> Users
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl font-bold transition-colors">
                        <Settings className="w-5 h-5" /> Settings
                    </button>
                </nav>

                <div className="p-4 border-t border-zinc-800">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" /> Exit Admin
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
