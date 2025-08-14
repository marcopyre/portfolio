import { useCallback } from "react";

declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
    dataLayer: any[];
  }
}

interface TrackEventParameters {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter?: string;
  [key: string]: unknown;
}

export const useGoogleAnalytics = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const trackEvent = useCallback(
    (eventName: string, parameters: TrackEventParameters = {}) => {
      if (
        isProduction &&
        typeof window !== "undefined" &&
        "gtag" in window &&
        typeof window.gtag === "function"
      ) {
        try {
          window.gtag("event", eventName, {
            event_category: "Bot_Interaction",
            ...parameters,
          });
        } catch (error) {
          console.error("GA tracking error:", error);
        }
      }
    },
    [isProduction]
  );

  const trackPageView = useCallback(
    (url: string, title?: string) => {
      if (
        isProduction &&
        typeof window !== "undefined" &&
        "gtag" in window &&
        typeof window.gtag === "function"
      ) {
        try {
          window.gtag("config", "G-3CQRTTN3DL", {
            page_path: url,
            page_title: title,
          });
        } catch (error) {
          console.error("GA page view error:", error);
        }
      }
    },
    [isProduction]
  );

  return { trackEvent, trackPageView };
};
