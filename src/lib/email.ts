import { Resend } from 'resend';
import { generateTicketPDF } from './ticket-pdf';

// Initialize Resend with env var (fallback to prevent build crash)
const resend = new Resend(process.env.RESEND_API_KEY || 're_123_build_bypass');

export const sendTicketEmail = async (to: string, orderDetails: any) => {
    try {
        console.log(`Sending Ticket Email to: ${to}`);

        // Generate PDF
        const pdfBuffer = generateTicketPDF(orderDetails, orderDetails.booking_reference);

        const { origin, destination, departure_date, booking_reference, amount, currency } = orderDetails;

        const subject = `✈️ Sua passagem para ${destination} está confirmada! (Ref: ${booking_reference})`;

        const htmlContent = `
            <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #e11d48; margin: 0;">All Trip</h1>
                    <p style="color: #666; font-size: 14px;">Flight Deal Finder Premium</p>
                </div>

                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #059669; margin-top: 0;">Pagamento Confirmado!</h2>
                    <p style="font-size: 18px; margin: 10px 0;">Reserva: <strong>${booking_reference}</strong></p>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Detalhes do Voo</h3>
                    <p><strong>De:</strong> ${origin}</p>
                    <p><strong>Para:</strong> ${destination}</p>
                    <p><strong>Data:</strong> ${new Date(departure_date).toLocaleDateString('pt-BR')}</p>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Pagamento</h3>
                    <p><strong>Total:</strong> ${Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: currency || 'BRL' })}</p>
                    <p style="color: #666; font-size: 12px;">*Inclui taxas e encargos.</p>
                </div>

                <div style="text-align: center; color: #999; font-size: 12px; margin-top: 40px;">
                    <p>Este é um recibo automático da sua viagem.</p>
                    <p>© 2025 All Trip / Flight Deal Finder</p>
                </div>
            </div>
        `;

        const response = await resend.emails.send({
            from: 'All Trip <onboarding@resend.dev>', // Free tier default, change to custom domain later
            to: [to],
            subject: subject,
            html: htmlContent,
            attachments: [
                {
                    filename: `Ticket-${booking_reference}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        if (response.error) {
            console.error("Resend Error:", response.error);
            return { success: false, error: response.error };
        }

        console.log("Email Sent ID:", response.data?.id);
        return { success: true, id: response.data?.id };

    } catch (error) {
        console.error("Failed to send email:", error);
        return { success: false, error };
    }
};
