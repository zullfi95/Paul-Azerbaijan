import Providers from './Providers';
import './globals.css';

export const metadata = {
  title: 'PAUL Azerbaijan',
  description: 'PAUL Azerbaijan',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
