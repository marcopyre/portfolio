"use client";
import { useTranslation } from "@/app/i18n/use-translation";
import { useContentTransition } from "./hooks/content-transition";

function QuestionButton({
  question,
  index,
  onSelect,
  compact = false,
}: {
  question: string;
  index: number;
  onSelect: (q: string) => void;
  compact?: boolean;
}) {
  const { displayContent, transitionClasses } = useContentTransition(question, {
    type: "swap",
    duration: 400,
    key: `question-${index}`,
  });

  return (
    <button
      onClick={() => onSelect(displayContent)}
      className={
        compact
          ? "group flex items-center px-3 py-2.5 rounded-xl border border-white/20 bg-[#4c4947]/60 w-full text-left hover:bg-[#4c4947]/80 transition-all duration-200"
          : "group relative pl-3 pr-2 min-h-14 w-full text-left border border-white/20 rounded-xl bg-[#4c4947]/60 hover:bg-[#4c4947]/80 transition-all duration-200"
      }
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <span
        className={`text-[#EEF0F2]/60 group-hover:text-[#EEF0F2] ${
          compact ? "text-sm leading-tight" : "text-sm md:text-base"
        } transition-colors duration-300 ${transitionClasses}`}
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
      type: "default",
      duration: 400,
      key: "title-quickquestions",
    }
  );

  return (
    <div className="animate-fade-in flex-shrink-0 w-full px-4 sm:px-0">
      <div className="max-w-6xl mx-auto">
        <h2
          className={`text-base md:text-xl font-semibold text-[#EEF0F2] mb-4 md:mb-6 flex items-center ${titleTransition.transitionClasses}`}
        >
          {titleTransition.displayContent}
        </h2>

        {}
        <div className="md:hidden space-y-3">
          {questions.map((question, index) => (
            <QuestionButton
              key={`m-${index}`}
              question={question}
              index={index}
              onSelect={onSelect}
              compact
            />
          ))}
        </div>

        {}
        <div className="hidden md:grid grid-cols-2 gap-4 w-full">
          {questions.map((question, index) => (
            <QuestionButton
              key={`d-${index}`}
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