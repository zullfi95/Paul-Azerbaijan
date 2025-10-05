import type { Metadata } from "next";
import "./globals.css";
import "../styles/paul-fonts.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "PAUL Azərbaycan - Fransız çörəkçi və konfiteriya",
  description: "Bakıda fransız çörəkçi və konfiteriya PAUL. Təzə çörək, zərif desertlər və xüsusi tədbirləriniz üçün elegant katerinq.",
  keywords: "PAUL, çörəkçi, konfiteriya, katerinq, Bakı, Azərbaycan, fransız mətbəxi, çörək, desertlər",
  authors: [{ name: "PAUL Azərbaycan" }],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: "PAUL Azərbaycan - Fransız çörəkçi və konfiteriya",
    description: "Bakıda fransız çörəkçi və konfiteriya PAUL. Təzə çörək, zərif desertlər və elegant katerinq.",
    type: "website",
    locale: "az_AZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body style={{ fontSmooth: 'antialiased' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
