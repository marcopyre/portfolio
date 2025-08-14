"use client";
import Script from "next/script";
import { useEffect } from "react";
import { GtagDataLayerItem } from "./hooks/google-analytics";

const GA_TRACKING_ID = "G-3CQRTTN3DL";

export default function GoogleAnalytics() {
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isProduction && typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];

      function gtag(command: string, ...args: unknown[]): void {
        window.dataLayer.push([command, ...args] as GtagDataLayerItem);
      }

      window.gtag = gtag;
      gtag("js", new Date());
      gtag("config", GA_TRACKING_ID, {
        debug_mode: isDevelopment,
        send_page_view: isProduction,
      });
    }
  }, [isProduction, isDevelopment]);

  if (!isProduction) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}
