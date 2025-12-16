import { Resend } from 'resend';
import BookingConfirmationEmail from '@/components/emails/BookingConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingEmail(to: string, bookingData: any) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY not configured. Email skipped.");
        return null;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'All Trip <onboarding@resend.dev>', // Default Resend testing domain
            to: [to],
            subject: `Reserva Confirmada: ${bookingData.bookingReference}`,
            react: BookingConfirmationEmail({
                customerName: bookingData.customerName,
                bookingReference: bookingData.bookingReference,
                flightDetails: bookingData.flightDetails,
                totalAmount: bookingData.totalAmount,
            }),
        });

        if (error) {
            console.error("Resend Error:", error);
            return null;
        }

        return data;
    } catch (e) {
        console.error("Email Sending Excepton:", e);
        return null;
    }
}
