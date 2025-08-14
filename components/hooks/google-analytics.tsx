import { useCallback } from "react";

export const useGoogleAnalytics = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const trackEvent = useCallback(
    (eventName: string, parameters: Record<string, any> = {}) => {
      if (isProduction && typeof window !== "undefined" && "gtag" in window) {
        (window as any).gtag("event", eventName, {
          event_category: "Bot_Interaction",
          ...parameters,
        });
      }
    },
    []
  );

  return { trackEvent };
};
