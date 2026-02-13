// app/layout.tsx
import './globals.css'; 
import Providers from './providers';
import LayoutShell from './LayoutShell';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}