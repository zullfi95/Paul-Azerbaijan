import type { Metadata } from "next";
import "./globals.css";
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
      <body style={{ fontSmooth: 'antialiased' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
