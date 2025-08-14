import { useCallback } from "react";

declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      parameters?: Record<string, unknown>
    ) => void;
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
      if (isProduction && typeof window !== "undefined" && "gtag" in window) {
        window.gtag("event", eventName, {
          event_category: "Bot_Interaction",
          ...parameters,
        });
      }
    },
    [isProduction]
  );

  return { trackEvent };
};
