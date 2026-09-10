import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SMRITI - Beyond Memoria, Belonging',
  description: 'Empathetic & Secure Digital Sanctuary for Alzheimer’s Patients & Families.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#140E10] text-[#FAF5EF] font-sans antialiased selection:bg-[#C46473] selection:text-white">
        {children}
      </body>
    </html>
  );
}
