"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Loader2, Check, AlertCircle, Eye, EyeOff, Key, Unlock } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Check if we have a session (hash fragment or code)
    useEffect(() => {
        // Supabase sends the token in the hash or query params
        // We just need to check if Supabase client can detect the session
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "PASSWORD_RECOVERY") {
                // User is in recovery mode, allow them to set a new password
            }
        });
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("As senhas não conferem");
            return;
        }

        if (password.length < 8) {
            toast.error("A senha deve ter pelo menos 8 caracteres");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success("Senha atualizada com sucesso!", {
                description: "Você será redirecionado para a página inicial."
            });

            setTimeout(() => {
                router.push("/");
            }, 2000);

        } catch (error: any) {
            toast.error("Erro ao atualizar senha", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-8 text-white">
                    <h1 className="text-2xl font-bold mb-2">Redefinir Senha</h1>
                    <p className="opacity-90 text-sm">Crie uma nova senha segura para sua conta.</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleReset} className="space-y-6">

                        {/* New Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nova Senha</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-12 pr-12 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-zinc-400"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500 transition-colors z-10"
                                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirmar Senha</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full bg-zinc-50 border rounded-xl py-3 pl-12 pr-12 font-medium text-zinc-900 focus:outline-none focus:ring-2 transition-all placeholder:text-zinc-400 ${confirmPassword && password !== confirmPassword
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-zinc-200 focus:border-rose-500 focus:ring-rose-500/20'
                                        }`}
                                    required
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> As senhas não conferem
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-zinc-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Atualizar Senha"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
