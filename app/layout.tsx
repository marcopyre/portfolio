import type { Metadata } from "next";
import "./globals.css";
import SplashScreen from "../components/splash-screen";
import { LanguageProvider } from "./i18n/language-provider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Marco Pyré",
  description: "Portfolio of Marco Pyré",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return (
      <html lang="en">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3CQRTTN3DL"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3CQRTTN3DL');
        `}
        </Script>
        <body className="antialiased">
          <LanguageProvider>
            <SplashScreen>{children}</SplashScreen>
          </LanguageProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          <SplashScreen>{children}</SplashScreen>
        </LanguageProvider>
      </body>
    </html>
  );
}
