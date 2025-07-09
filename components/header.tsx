import React from "react";
import { Brain, Sparkles } from "lucide-react";
import LanguageSelector from "./language-selector";

export default function Header({
  title,
  subtitle,
  showLanguageSelector = true,
}: {
  title: string;
  subtitle: string;
  showLanguageSelector?: boolean;
}) {
  return (
    <header className="relative z-10 p-4 md:p-6 border-b border-white/10 backdrop-blur-xl bg-black/30 flex-shrink-0">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-md"></div>
              <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-slate-400 text-sm md:text-base flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                {subtitle}
              </p>
            </div>
          </div>
          {showLanguageSelector && <LanguageSelector />}
        </div>
      </div>
    </header>
  );
}
