import type { Metadata } from "next";
import { Oxanium, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { absoluteUrl, createMetadata, siteConfig } from "@/lib/seo";
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
  ...createMetadata({
    description: siteConfig.description,
    keywords: ["minecraft panel", "minecraft infrastructure", "game server hosting"],
  }),
  icons: {
    icon: "/kx-minecraft-mark.svg",
    shortcut: "/kx-minecraft-mark.svg",
    apple: "/kx-minecraft-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getLanguageFromCookies();
  const siteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteConfig.name,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/kx-minecraft-mark.svg"),
        email: siteConfig.supportEmail,
        sameAs: [siteConfig.discordUrl],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: siteConfig.supportEmail,
            availableLanguage: ["English", "Spanish", "French", "German", "Portuguese"],
          },
        ],
      },
      {
        "@type": "WebSite",
        name: siteConfig.name,
        url: absoluteUrl("/"),
        description: siteConfig.description,
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: `${absoluteUrl("/community/search")}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang={lang}>
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
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
