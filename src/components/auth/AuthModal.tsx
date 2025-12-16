"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { X, Mail, Lock, Unlock, Key, Loader2, ArrowRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Auth State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Validation State
    const [passStrength, setPassStrength] = useState(0);
    const isLengthValid = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    useEffect(() => {
        if (isLogin) return;
        let score = 0;
        if (isLengthValid) score++;
        if (hasNumber) score++;
        if (hasSymbol) score++;
        setPassStrength(score);
    }, [password, isLogin, isLengthValid, hasNumber, hasSymbol]);

    if (!isOpen) return null;

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isForgotPassword) {
                // Forgot Password Flow
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                setEmailSent(true);
                toast.success("Email enviado!", { description: "Verifique sua caixa de entrada." });
            } else if (isLogin) {
                // Login Flow
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Bem-vindo de volta!");
                onClose();
            } else {
                // Registration Flow
                if (password !== confirmPassword) {
                    toast.error("Senhas não conferem!");
                    setLoading(false);
                    return;
                }

                if (!isLengthValid || !hasNumber || !hasSymbol) {
                    toast.error("Senha muito fraca!", {
                        description: "Use 8 letras, números e símbolos."
                    });
                    setLoading(false);
                    return;
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success("Conta criada com sucesso!", { description: "Você já pode fazer login." });
                onClose();
            }
        } catch (error: any) {
            toast.error(error.message || "Erro na autenticação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-rose-500 to-orange-500 p-6 flex flex-col justify-end">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-black text-white">
                        {isForgotPassword ? "Recuperar Senha" : isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
                    </h2>
                    <p className="text-white/80 text-sm font-medium">
                        {isForgotPassword ? "Enviaremos um link para seu email." : isLogin ? "Acesse suas viagens e alertas." : "Segurança em primeiro lugar."}
                    </p>
                </div>

                {/* Body */}
                <div className="p-8">
                    {emailSent ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <Mail className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg text-zinc-900 mb-2">Email Enviado!</h3>
                            <p className="text-zinc-500 text-sm mb-6">Verifique sua caixa de entrada (e spam) para redefinir sua senha.</p>
                            <button
                                onClick={() => { setEmailSent(false); setIsForgotPassword(false); setIsLogin(true); }}
                                className="text-rose-600 font-bold hover:underline"
                            >
                                Voltar ao Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleAuth} className="space-y-4">

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-12 pr-4 font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-zinc-400"
                                        required
                                    />
                                </div>
                            </div>

                            {!isForgotPassword && (
                                <>
                                    {/* Password */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Senha</label>
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

                                    {/* Password Strength Meter (Only on Registration) */}
                                    {!isLogin && (
                                        <div className="bg-zinc-50 p-3 rounded-xl space-y-2 border border-zinc-100">
                                            <div className="flex gap-1 h-1 mb-2">
                                                <div className={`flex-1 rounded-full transition-colors ${passStrength >= 1 ? 'bg-red-500' : 'bg-zinc-200'}`}></div>
                                                <div className={`flex-1 rounded-full transition-colors ${passStrength >= 2 ? 'bg-yellow-500' : 'bg-zinc-200'}`}></div>
                                                <div className={`flex-1 rounded-full transition-colors ${passStrength >= 3 ? 'bg-green-500' : 'bg-zinc-200'}`}></div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-xs flex items-center gap-1.5 ${isLengthValid ? 'text-green-600 font-bold' : 'text-zinc-400'}`}>
                                                    {isLengthValid ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                                    Mínimo 8 caracteres
                                                </p>
                                                <p className={`text-xs flex items-center gap-1.5 ${hasNumber ? 'text-green-600 font-bold' : 'text-zinc-400'}`}>
                                                    {hasNumber ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                                    Pelo menos 1 número
                                                </p>
                                                <p className={`text-xs flex items-center gap-1.5 ${hasSymbol ? 'text-green-600 font-bold' : 'text-zinc-400'}`}>
                                                    {hasSymbol ? <Check className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />}
                                                    Pelo menos 1 símbolo (!@#$)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Confirm Password (Only on Registration) */}
                                    {!isLogin && (
                                        <div className="space-y-1 animate-in slide-in-from-top-2 fade-in">
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
                                    )}
                                </>
                            )}

                            {isLogin && !isForgotPassword && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(true)}
                                        className="text-xs font-bold text-zinc-400 hover:text-rose-600 transition-colors"
                                    >
                                        Esqueceu a senha?
                                    </button>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || (!isLogin && password !== confirmPassword)}
                                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-zinc-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isForgotPassword ? "Enviar Link de Recuperação" : isLogin ? "Entrar" : "Criar Conta"}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {!emailSent && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-zinc-500 font-medium">
                                {isForgotPassword ? "Lembrou a senha?" : isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                                <button
                                    onClick={() => {
                                        if (isForgotPassword) {
                                            setIsForgotPassword(false);
                                            setIsLogin(true);
                                        } else {
                                            setIsLogin(!isLogin);
                                            setPassword("");
                                            setConfirmPassword("");
                                        }
                                    }}
                                    className="ml-1 text-rose-600 hover:text-rose-700 font-bold hover:underline"
                                >
                                    {isForgotPassword ? "Voltar ao Login" : isLogin ? "Cadastre-se" : "Faça Login"}
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
