"use client";

export default function ConfirmModal({
  open,
  question,
  onConfirm,
  onCancel,
  yesLabel = "Oui",
  noLabel = "Non",
  link,
}: {
  open: boolean;
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
  yesLabel?: string;
  noLabel?: string;
  link?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4">
      <div className="bg-[#18181b] text-white rounded-xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl">
        <div className="mb-6 text-base sm:text-lg font-medium leading-relaxed">
          {question}
        </div>
        {link && (
          <div className="mb-4 text-xs sm:text-sm text-[#ffd6b9] break-all p-3 bg-[#c8810b] rounded-lg">
            {link}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          <button
            onClick={onCancel}
            className="w-full sm:w-auto bg-[#222] text-white rounded-lg px-5 py-2.5 hover:bg-[#333] transition-colors duration-200 text-sm font-medium"
          >
            {noLabel}
          </button>
          <button
            onClick={onConfirm}
            className="w-full sm:w-auto bg-[#FCA311] text-white rounded-lg px-5 py-2.5 hover:bg-[#FCA311]/90 transition-colors duration-200 text-sm font-medium"
          >
            {yesLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
