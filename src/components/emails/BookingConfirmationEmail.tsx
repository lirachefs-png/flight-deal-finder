import * as React from "react";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Hr,
    Row,
    Column,
} from "@react-email/components";

interface BookingConfirmationEmailProps {
    customerName: string;
    bookingReference: string; // PNR or Duffel ID
    flightDetails: {
        origin: string;
        destination: string;
        departingAt: string;
        airline: string;
    }[];
    totalAmount: string;
}

export const BookingConfirmationEmail = ({
    customerName,
    bookingReference,
    flightDetails,
    totalAmount,
}: BookingConfirmationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Sua reserva está confirmada! Ref: {bookingReference}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={h1}>All Trip</Heading>
                    <Text style={heroText}>Reserva Garantida (Hold)</Text>

                    <Text style={text}>Olá, <strong>{customerName}</strong>!</Text>
                    <Text style={text}>
                        Sua reserva foi realizada com sucesso. Este é o seu comprovante de pré-reserva (Hold).
                    </Text>

                    <Section style={codeBox}>
                        <Text style={codeLabel}>CÓDIGO DA RESERVA</Text>
                        <Heading style={code}>{bookingReference}</Heading>
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Heading style={h2}>Itinerário</Heading>
                        {flightDetails.map((flight, index) => (
                            <Row key={index} style={flightRow}>
                                <Column>
                                    <Text style={flightText}>
                                        <strong>{flight.airline}</strong><br />
                                        {flight.origin} ➔ {flight.destination}<br />
                                        <span style={subText}>{flight.departingAt}</span>
                                    </Text>
                                </Column>
                            </Row>
                        ))}
                    </Section>

                    <Hr style={hr} />

                    <Section>
                        <Text style={priceLabel}>Valor Total Garantido</Text>
                        <Heading style={price}>{totalAmount}</Heading>
                    </Section>

                    <Text style={footerText}>
                        *Esta reserva é válida por tempo limitado. Para emitir o bilhete final, entre em contato.
                    </Text>

                    <Link href={`https://wa.me/5511999999999?text=Quero emitir reserva ${bookingReference}`} style={button}>
                        Falar com Atendente
                    </Link>

                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: "#ffffff",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

const h1 = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#e11d48", // Rose-600
    textAlign: "center" as const,
};

const heroText = {
    fontSize: "16px",
    color: "#4a4a4a",
    textAlign: "center" as const,
    marginBottom: "30px",
};

const text = {
    fontSize: "16px",
    color: "#484848",
    lineHeight: "26px",
};

const codeBox = {
    backgroundColor: "#f4f4f5",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center" as const,
    margin: "30px 0",
};

const codeLabel = {
    color: "#71717a",
    fontSize: "12px",
    letterSpacing: "1px",
    margin: "0 0 8px",
};

const code = {
    color: "#18181b", // Zinc-900
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0",
    letterSpacing: "4px",
};

const h2 = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#18181b",
};

const flightRow = {
    marginBottom: "16px",
};

const flightText = {
    fontSize: "16px",
    color: "#18181b",
    lineHeight: "24px",
};

const subText = {
    fontSize: "14px",
    color: "#71717a",
};

const hr = {
    borderColor: "#e4e4e7",
    margin: "20px 0",
};

const priceLabel = {
    color: "#71717a",
    fontSize: "14px",
    marginBottom: "4px",
};

const price = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#18181b",
    margin: "0",
};

const footerText = {
    fontSize: "12px",
    color: "#a1a1aa",
    marginTop: "30px",
    textAlign: "center" as const,
};

const button = {
    display: "block",
    backgroundColor: "#e11d48",
    color: "#fff",
    padding: "16px",
    borderRadius: "8px",
    textAlign: "center" as const,
    fontWeight: "bold",
    marginTop: "30px",
    textDecoration: "none",
};

export default BookingConfirmationEmail;
