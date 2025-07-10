import React from "react";
import { Rocket, Zap, Star } from "lucide-react";
import { useTranslation } from "@/app/i18n/use-translation";

export default function QuickQuestions({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect: (q: string) => void;
}) {
  const { translation } = useTranslation();
  return (
    <div className="p-4 md:p-6 animate-fade-in flex-shrink-0">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-lg md:text-xl font-semibold text-white mb-6 flex items-center">
          <Rocket className="w-6 h-6 mr-3 text-purple-400" />
          {translation("quick_questions_title")}
          <Zap className="w-5 h-5 ml-2 text-yellow-400" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSelect(question)}
              className="group relative p-4 text-left bg-gradient-to-r from-white/5 to-white/10 hover:from-purple-500/20 hover:to-cyan-500/20 border border-white/20 rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-500"></div>
              <div className="relative flex items-start space-x-3">
                <Star className="w-5 h-5 text-purple-400 group-hover:text-cyan-400 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 group-hover:text-white text-sm md:text-base transition-colors duration-300">
                  {question}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
