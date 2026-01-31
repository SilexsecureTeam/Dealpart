import "./globals.css";
import { Lato } from "next/font/google";
import Providers from "./providers";
import LayoutShell from "./LayoutShell";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lato.className} antialiased bg-white text-secondary min-h-screen flex flex-col`}>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
