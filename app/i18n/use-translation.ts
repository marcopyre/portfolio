import { useContext } from "react";
import { LanguageContext } from "./language-provider";
import en from "./en.json";
import fr from "./fr.json";

const resources = { en, fr } as Record<string, Record<string, string>>;

export function useTranslation() {
  const { language } = useContext(LanguageContext);
  const translation = (key: string) => {
    return resources[language][key] || key;
  };
  return { translation, language };
}
