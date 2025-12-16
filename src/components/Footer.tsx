import Link from 'next/link';
import { ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-zinc-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <span className="font-black text-2xl tracking-tighter text-zinc-900 leading-none">
                            ALL TRIP<span className="text-rose-600">.</span>
                        </span>
                        <p className="text-zinc-500 text-sm mt-4 leading-relaxed">
                            Sua agência de viagens digital. Preços secretos, tecnologia de ponta e segurança total.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-bold text-zinc-900 mb-4">Explorar</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="/" className="hover:text-rose-600 transition-colors">Voos</Link></li>
                            <li><Link href="/stays" className="hover:text-rose-600 transition-colors">Hospedagem</Link></li>
                            <li><Link href="/experiences" className="hover:text-rose-600 transition-colors">Experiências</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-zinc-900 mb-4">Legal & Segurança</h4>
                        <ul className="space-y-2 text-sm text-zinc-500">
                            <li><Link href="/legal/terms" className="hover:text-rose-600 transition-colors">Termos de Uso</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-rose-600 transition-colors">Política de Privacidade</Link></li>
                            <li><Link href="/legal/refund" className="hover:text-rose-600 transition-colors">Reembolsos & Cancelamentos</Link></li>
                            <li>
                                <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-rose-600 transition-colors mt-2 font-bold text-rose-600">
                                    📕 Livro de Reclamações
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Trust Badges */}
                    <div>
                        <h4 className="font-bold text-zinc-900 mb-4">Pagamentos Seguros</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Processado via Stripe™
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                                <Lock className="w-4 h-4 text-blue-500" />
                                Dados Criptografados (SSL)
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-400">
                    <p>© {new Date().getFullYear()} All Trip Viagens e Turismo. Todos os direitos reservados.</p>
                    <p>Powered by Duffel API</p>
                </div>
            </div>
        </footer>
    );
}
