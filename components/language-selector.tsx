"use client";
import React, { useContext } from "react";
import { LanguageContext } from "../app/i18n/LanguageProvider";

export default function LanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        onClick={() => setLanguage("fr")}
        style={{
          background: language === "fr" ? "#111" : "transparent",
          color: language === "fr" ? "#fff" : "#aaa",
          border: "1px solid #444",
          borderRadius: 4,
          padding: "2px 10px",
          cursor: "pointer",
        }}
        aria-label="Français"
      >
        FR
      </button>
      <button
        onClick={() => setLanguage("en")}
        style={{
          background: language === "en" ? "#111" : "transparent",
          color: language === "en" ? "#fff" : "#aaa",
          border: "1px solid #444",
          borderRadius: 4,
          padding: "2px 10px",
          cursor: "pointer",
        }}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
}
