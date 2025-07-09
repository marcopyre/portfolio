import { useContext } from "react";
import { LanguageContext } from "./LanguageProvider";
import en from "./en.json";
import fr from "./fr.json";

const resources = { en, fr } as Record<string, Record<string, string>>;

export function useTranslation() {
  const { language } = useContext(LanguageContext);
  const t = (key: string) => {
    return resources[language][key] || key;
  };
  return { t, language };
}
