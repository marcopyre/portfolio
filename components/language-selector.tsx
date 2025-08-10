"use client";
import { useContext, useState, useRef, useEffect } from "react";
import { LanguageContext, type Language } from "../app/i18n/language-provider";

export default function LanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: Language[] = ["fr", "en"];

  const currentLanguage = languages.find((lang) => lang === language);

  const handleLanguageSelect = (langCode: "fr" | "en") => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-10 sm:min-w-12 px-2 sm:px-3 py-2 text-white text-xs sm:text-sm hover:bg-white/10 rounded-lg transition-colors duration-200"
        aria-label="Sélectionner la langue"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1 sm:gap-1.5">
          <span className="font-medium">{currentLanguage?.toUpperCase()}</span>
        </div>
        <span
          className={`text-xs transition-transform duration-200 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full md:bottom-auto md:top-full mb-1 md:mb-0 md:mt-1 bg-[#4c4947] border border-white/20 rounded-xl shadow-lg z-50 overflow-hidden min-w-[60px] sm:w-fit">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageSelect(lang)}
              className={`flex items-center justify-center sm:justify-start gap-2 w-full px-3 py-2.5 text-xs sm:text-sm transition-colors duration-200 hover:bg-[#121110] ${
                language === lang
                  ? "bg-[#2b2928] text-[#EEF0F2]"
                  : "bg-transparent text-[#EEF0F2]/60"
              }`}
              aria-label={`Changer la langue vers ${lang}`}
            >
              <span className="font-medium">{lang.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}