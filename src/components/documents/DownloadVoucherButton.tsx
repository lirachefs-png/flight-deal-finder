import React from 'react';
// import dynamic from 'next/dynamic'; // Disabled for now
import { Download, Loader2 } from 'lucide-react';
// import BookingVoucherPDF from './BookingVoucherPDF'; // Disabled for now

/*
// Dynamic import for PDFDownloadLink to avoid SSR issues
const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    {
        ssr: false,
        loading: () => (
            <button disabled className="inline-flex items-center justify-center gap-2 bg-zinc-200 text-zinc-400 px-6 py-3 rounded-xl font-bold cursor-wait">
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando PDF...
            </button>
        ),
    }
);
*/

interface DownloadVoucherButtonProps {
    booking: any;
}

export default function DownloadVoucherButton({ booking }: DownloadVoucherButtonProps) {
    // PDF Generation is temporarily disabled due to build configuration issues.
    // We will enable this in the next update.
    return (
        <button disabled className="inline-flex items-center justify-center gap-2 bg-zinc-100 text-zinc-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed">
            <Download className="w-5 h-5" />
            PDF (Em breve)
        </button>
    );
}
