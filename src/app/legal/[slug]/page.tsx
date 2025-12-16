import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Shield, Scale, ScrollText, ArrowLeft } from 'lucide-react';

export function generateStaticParams() {
    return [{ slug: 'terms' }, { slug: 'privacy' }, { slug: 'refund' }];
}

// Next.js 15+: params is a Promise
export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const content: Record<string, { title: string; icon: any; text: React.ReactNode }> = {
        'terms': {
            title: "Termos de Uso e Condições Gerais",
            icon: Scale,
            text: (
                <div className="space-y-6 text-zinc-600 leading-relaxed">
                    <p><strong>Última atualização: 14 de Dezembro de 2025.</strong></p>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">1. Objeto e Definições</h3>
                    <p>A <strong>ALL TRIP VIAGENS E TURISMO</strong> ("Plataforma") atua estritamente como <strong>intermediadora de serviços turísticos</strong>, conectando o USUÁRIO às COMPANHIAS AÉREAS ("Fornecedores") através da tecnologia da API Duffel.</p>
                    <p>Ao realizar uma reserva, o Usuário declara ciência de que o contrato de transporte aéreo é firmado direta e exclusivamente com a Companhia Aérea selecionada.</p>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">2. Responsabilidades da Intermediadora</h3>
                    <p>Compete à All Trip:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Emitir o bilhete aéreo (E-Ticket) após a confirmação do pagamento.</li>
                        <li>Repassar os valores pagos à Companhia Aérea e Fornecedores.</li>
                        <li>Prestar suporte inicial para alterações e cancelamentos, sujeitos às regras da tarifa.</li>
                    </ul>
                    <p className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-800 text-sm font-medium mt-4">
                        ⚠️ <strong>Limitação de Responsabilidade:</strong> A All Trip não responde por atrasos, cancelamentos de voos, overbooking ou extravio de bagagem causados exclusivamente pela Companhia Aérea, nos termos do Código de Defesa do Consumidor e da jurisprudência aplicável sobre responsabilidade de agências intermediadoras.
                    </p>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">3. Pagamentos e Taxas</h3>
                    <p>Os pagamentos são processados de forma segura pela <strong>Stripe Payments</strong>. A All Trip não armazena dados completos de cartão de crédito. Reservamo-nos o direito de cancelar reservas em caso de suspeita de fraude ou inconsistência nos dados de pagamento.</p>
                </div>
            )
        },
        'privacy': {
            title: "Política de Privacidade e Proteção de Dados",
            icon: Shield,
            text: (
                <div className="space-y-6 text-zinc-600 leading-relaxed">
                    <p>Em conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018)</strong> e <strong>GDPR</strong>, descrevemos como seus dados são tratados.</p>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">1. Coleta de Dados</h3>
                    <p>Coletamos apenas os dados estritamente necessários para a emissão das passagens aéreas e processamento do pagamento:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Nome completo, Data de Nascimento, Gênero (Exigência IATA/ANAC).</li>
                        <li>Email e Telefone para envio de vouchers e comunicados de voo.</li>
                        <li>Dados de Pagamento (Tokenizados e processados pela Stripe).</li>
                    </ul>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">2. Compartilhamento de Dados</h3>
                    <p>Seus dados são compartilhados exclusivamente com:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Duffel Technology Trading Ltd:</strong> Para reserva global de voos no GDS.</li>
                        <li><strong>Companhias Aéreas:</strong> Para emissão do contrato de transporte.</li>
                        <li><strong>Stripe:</strong> Para processamento financeiro e antifraude.</li>
                    </ul>
                    <p>Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing não autorizado.</p>
                </div>
            )
        },
        'refund': {
            title: "Política de Cancelamento e Reembolso",
            icon: ScrollText,
            text: (
                <div className="space-y-6 text-zinc-600 leading-relaxed">
                    <div className="bg-rose-50 border border-rose-100 p-6 rounded-xl">
                        <h4 className="font-bold text-rose-900 mb-2">Regra de Ouro (ANAC 400 & Art. 49 CDC)</h4>
                        <p className="text-sm text-rose-800">
                            <strong>Direito de Arrependimento (24 horas):</strong> Para compras realizadas com antecedência mínima de 7 dias da data do voo, o consumidor pode desistir da compra em até 24 horas após o recebimento do comprovante, sem ônus (Art. 11, Resolução 400/2016 ANAC).
                        </p>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">1. Regras da Tarifa (Fare Rules)</h3>
                    <p>Passado o prazo legal de 24 horas (ou 7 dias para compras online, dependendo da interpretação judicial aplicável), o cancelamento segue estritamente as <strong>regras da tarifa comprada</strong>. Muitas tarifas promocionais ("Light", "Promo") são <strong>não-reembolsáveis</strong> ou permitem reembolso apenas das taxas de embarque.</p>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">2. Processo de Reembolso</h3>
                    <p>O reembolso, quando devido, será processado no mesmo método de pagamento original. O prazo para o crédito na fatura depende da operadora do cartão, podendo levar de 30 a 90 dias (conforme Lei 14.034/2020 em períodos de exceção, ou 7 dias em tempos normais).</p>

                    <h3 className="text-xl font-bold text-zinc-900 mt-8">3. Alterações Involuntárias</h3>
                    <p>Em caso de cancelamento ou alteração superior a 31 minutos por parte da Companhia Aérea, o passageiro tem direito a reacomodação gratuita ou reembolso integral, conforme escolha do consumidor.</p>
                </div>
            )
        }
    };

    const pageData = content[slug];

    if (!pageData) return notFound();

    const Icon = pageData.icon;

    return (
        <main className="min-h-screen bg-zinc-50 pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 font-bold text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Home
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
                    <div className="bg-zinc-900 text-white p-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-zinc-400 uppercase tracking-wider text-xs">Aviso Legal</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{pageData.title}</h1>
                    </div>

                    <div className="p-10">
                        {pageData.text}

                        <div className="mt-12 pt-8 border-t border-zinc-100">
                            <h4 className="font-bold text-zinc-900 mb-2">Dúvidas Jurídicas?</h4>
                            <p className="text-zinc-500 text-sm">
                                Entre em contato com nosso Encarregado de Dados (DPO) ou Depto. Jurídico:<br />
                                <a href="mailto:legal@alltrip.com" className="text-rose-600 font-bold hover:underline">legal@alltrip.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
