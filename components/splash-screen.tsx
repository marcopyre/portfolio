"use client";
import React, { useContext } from "react";
import { LanguageContext } from "../app/i18n/language-provider";

export default function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useContext(LanguageContext);
  if (isLoading) {
    return (
      <div
        style={{
          background: "black",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          inset: 0,
          zIndex: 9999,
        }}
      />
    );
  }
  return <>{children}</>;
}