import type { Metadata } from "next";
import { Oxanium, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getLanguageFromCookies } from "@/server/i18n";

const headingFont = Oxanium({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"],
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cloudsting",
  description: "Professional Minecraft server hosting platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getLanguageFromCookies();

  return (
    <html lang={lang}>
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <LanguageProvider initialLang={lang}>
          <div className="relative min-h-dvh kx-animated-bg">
            <div className="kx-noise" />
            <Navbar />
            <div className="relative">{children}</div>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
