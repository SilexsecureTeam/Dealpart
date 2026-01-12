// src/app/layout.tsx
import './globals.css';
import { Lato } from 'next/font/google';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lato.className} antialiased bg-white text-secondary`}>
        {children}
      </body>
    </html>
  );
}