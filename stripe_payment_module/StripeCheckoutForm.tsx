'use client';

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeCheckoutForm({ orderId, onSuccess }: { orderId: string, onSuccess: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/${orderId}`,
            },
            redirect: 'if_required'
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred.");
            toast.error(error.message || "Erro no pagamento");
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                const res = await fetch('/api/orders/pay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        order_id: orderId,
                        payment_intent_id: paymentIntent.id
                    })
                });
                const data = await res.json();
                if (data.success) {
                    onSuccess();
                    toast.success("Pagamento confirmado!");
                } else {
                    toast.error("Pagamento aprovado, mas erro na emissão: " + (data.details || data.error));
                }
            } catch (e) {
                console.error(e);
                toast.error("Erro ao finalizar emissão");
            }
            setIsLoading(false);
        } else {
            toast.info("Processando pagamento...");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}

            <button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pagar Agora'}
            </button>
            <p className="text-xs text-center text-zinc-400 mt-4">
                Pagamento processado de forma segura pelo Stripe.
            </p>
        </form>
    );
}
