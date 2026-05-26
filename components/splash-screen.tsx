"use client";

import React, { useContext, useEffect } from "react";
import { LanguageContext } from "../app/i18n/language-provider";

export default function SplashScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useContext(LanguageContext);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoading]);

  return (
    <>
      {children}

      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-black" />
      )}
    </>
  );
}