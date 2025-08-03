import React from "react";
import { useTranslation } from "@/app/i18n/use-translation";
import { useContentTransition } from "./hooks/content-transition";

function QuestionButton({
  question,
  index,
  onSelect,
}: {
  question: string;
  index: number;
  onSelect: (q: string) => void;
}) {
  const { displayContent, transitionClasses } = useContentTransition(question, {
    type: "swap",
    duration: 400,
    key: `question-${index}`,
  });

  return (
    <button
      onClick={() => onSelect(displayContent)}
      className="group relative pl-3 pr-2 min-h-14 w-full text-left border border-white/20 rounded-xl bg-[#4c4947]/60 cursor-pointer"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <span
        className={`text-[#EEF0F2]/60 group-hover:text-[#EEF0F2] text-sm md:text-base transition-colors duration-300 ${transitionClasses}`}
      >
        {displayContent}
      </span>
    </button>
  );
}

export default function QuickQuestions({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect: (q: string) => void;
}) {
  const { translation } = useTranslation();

  const titleTransition = useContentTransition(
    translation("quick_questions_title"),
    {
      type: "swap",
      duration: 400,
      key: "title-quickquestions",
    }
  );

  return (
    <div className="animate-fade-in flex-shrink-0 w-full">
      <div className="max-w-6xl mx-auto">
        <h2
          className={`text-lg md:text-xl font-semibold text-[#EEF0F2] mb-6 flex items-center ${titleTransition.transitionClasses}`}
        >
          {titleTransition.displayContent}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {questions.map((question, index) => (
            <QuestionButton
              key={index}
              question={question}
              index={index}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
