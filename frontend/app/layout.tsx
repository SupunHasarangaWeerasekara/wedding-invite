import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sanjaya & Gagani (සංජය සහ ගගනි) - Wedding Invitation',
  description: 'We warmly invite you to celebrate our wedding ceremony.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A0406] text-[#FFF1F2] antialiased">
        {children}
      </body>
    </html>
  );
}
