import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "MailBoard",
  description: "A personal inbox dashboard with advanced search, saved filters, and analytics — built on the Gmail API.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf6e3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1729" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Apply the stored theme BEFORE React hydrates to avoid the flash of wrong theme.
  // First visit defaults to light; no OS fallback.
  const themeScript = `
    (function(){
      try {
        var t = localStorage.getItem('theme');
        var useDark = t === 'dark';
        if (useDark) document.documentElement.classList.add('dark');
      } catch(e){}
    })();
  `;
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
