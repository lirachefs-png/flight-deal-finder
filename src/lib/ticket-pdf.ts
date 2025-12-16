import { jsPDF } from "jspdf";

export const generateTicketPDF = (order: any, bookingReference: string): Buffer => {
    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(225, 29, 72); // Rose-600
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("All Trip", 20, 25);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Flight Deal Finder", 20, 32);

    doc.text("E-Ticket Receipt", 160, 28);

    // Booking Reference Section
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.text("Booking Reference:", 20, 60);
    doc.setFontSize(22);
    doc.setTextColor(225, 29, 72);
    doc.setFont("courier", "bold");
    doc.text(bookingReference, 20, 72);

    // Flight Details
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);

    // Origin -> Destination
    doc.setFontSize(12);
    doc.text("Flight Details:", 20, 95);
    doc.setLineWidth(0.5);
    doc.line(20, 98, 190, 98);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${order.origin}  -->  ${order.destination}`, 20, 115);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const dateStr = new Date(order.departure_date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(dateStr, 20, 125);

    // Passenger Info
    doc.setFontSize(12);
    doc.text("Passenger(s):", 20, 150);
    doc.line(20, 153, 190, 153);

    let yPos = 165;
    if (order.passengers && Array.isArray(order.passengers)) {
        order.passengers.forEach((p: any) => {
            doc.text(`- ${p.given_name} ${p.family_name}`, 20, yPos);
            yPos += 10;
        });
    } else {
        doc.text("- Traveler", 20, yPos);
    }

    // Payment Info
    doc.setFontSize(12);
    doc.text("Payment Summary:", 20, 220);
    doc.line(20, 223, 190, 223);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 120, 240);
    doc.setTextColor(0, 128, 0); // Green
    doc.text(Number(order.amount).toLocaleString('pt-BR', { style: 'currency', currency: order.currency || 'BRL' }), 150, 240);

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for booking with All Trip.", 20, 280);
    doc.text("For support, contact help@flightdealfinder.com", 20, 285);

    // Output as Buffer
    // jsPDF output('arraybuffer') returns an ArrayBuffer, convert to Buffer for Node.js
    const arrayBuffer = doc.output('arraybuffer');
    return Buffer.from(arrayBuffer);
};
