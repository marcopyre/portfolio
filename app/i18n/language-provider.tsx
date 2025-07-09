"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "fr";

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  isLoading: boolean;
}>({
  language: "en",
  setLanguage: () => {},
  isLoading: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const browserLang = navigator.language.startsWith("en") ? "fr" : "en";
    setLanguage(browserLang as Language);
    setIsLoading(false);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}
