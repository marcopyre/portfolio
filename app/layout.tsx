import type { Metadata } from "next";
import "./globals.css";
import SplashScreen from "../components/splash-screen";
import { LanguageProvider } from "./i18n/language-provider";
import GoogleAnalytics from "../components/google-analytics";

export const metadata: Metadata = {
  title: "Marco Pyré",
  description: "Portfolio of Marco Pyré",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="rzAe778nIs8FbIlJquuTddWn-Rv2-xbfGYWRg3uGTXw"
        />
      </head>
      <body className="antialiased">
        <GoogleAnalytics />
        <LanguageProvider>
          <SplashScreen>{children}</SplashScreen>
        </LanguageProvider>
      </body>
    </html>
  );
}
