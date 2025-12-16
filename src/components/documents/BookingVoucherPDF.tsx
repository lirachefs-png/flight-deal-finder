import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a nice font if needed, or use standard Helvetica
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf' });

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: 1,
        borderBottomColor: '#E4E4E7', // Zinc-200
        paddingBottom: 20,
    },
    logo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E11D48', // Rose-600
    },
    title: {
        fontSize: 10,
        color: '#71717A', // Zinc-500
        textTransform: 'uppercase',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        fontSize: 10,
        color: '#71717A',
        width: 100,
    },
    value: {
        fontSize: 12,
        color: '#18181B', // Zinc-900
        fontWeight: 'bold',
    },
    pnrContainer: {
        backgroundColor: '#F4F4F5', // Zinc-100
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    pnrLabel: {
        fontSize: 10,
        color: '#71717A',
        marginBottom: 5,
        letterSpacing: 2,
    },
    pnrValue: {
        fontSize: 32,
        fontWeight: 'heavy',
        color: '#18181B',
        letterSpacing: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#A1A1AA',
    },
});

interface BookingVoucherProps {
    booking: any;
}

export const BookingVoucherPDF = ({ booking }: BookingVoucherProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>All Trip</Text>
                <View>
                    <Text style={styles.title}>Comprovante de Reserva</Text>
                    <Text style={{ fontSize: 8, color: '#A1A1AA', textAlign: 'right' }}>{new Date().toLocaleDateString()}</Text>
                </View>
            </View>

            {/* PNR Section */}
            <View style={styles.pnrContainer}>
                <Text style={styles.pnrLabel}>CÓDIGO DA RESERVA (PNR)</Text>
                <Text style={styles.pnrValue}>{booking.booking_reference || booking.id}</Text>
            </View>

            {/* Details */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.label}>Passageiro Principal:</Text>
                    <Text style={styles.value}>
                        {booking.passengers[0].given_name} {booking.passengers[0].family_name}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Total (Garantido):</Text>
                    <Text style={styles.value}>
                        {Number(booking.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: booking.total_currency })}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={{ ...styles.value, color: '#F59E0B' }}>Aguardando Pagamento (Hold)</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Expira em:</Text>
                    <Text style={styles.value}>{booking.expires_at ? new Date(booking.expires_at).toLocaleString() : 'N/A'}</Text>
                </View>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
                Este documento é um comprovante de pré-reserva (Hold). O bilhete aéreo oficial será emitido somente após a confirmação do pagamento.
                All Trip Viagens e Turismo.
            </Text>
        </Page>
    </Document>
);

export default BookingVoucherPDF;
