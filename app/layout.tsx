import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashScreen from "../components/splash-screen";
import { LanguageProvider } from "./i18n/language-provider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N3WL2KF8');
          `}
        </Script>
      </head>
      {/* <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-XXXXXXXXXX');
        `}
      </Script> */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N3WL2KF8" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
            `,
          }}
        />
        <LanguageProvider>
          <SplashScreen>{children}</SplashScreen>
        </LanguageProvider>
      </body>
    </html>
  );
}
