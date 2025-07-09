import React from "react";

const MarkdownRenderer = ({ content }: { content: string }) => {
  const formatMarkdown = (text: string) => {
    let formatted = text
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-lg font-semibold text-white mb-2 mt-4">$1</h3>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl font-semibold text-white mb-3 mt-4">$1</h2>'
      )
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-2xl font-bold text-white mb-4 mt-4">$1</h1>'
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-white">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      .replace(
        /^\s*[\-\*\+]\s+(.*$)/gm,
        '<li class="ml-4 mb-1 text-slate-200">• $1</li>'
      )
      .replace(/(<li.*<\/li>)/s, '<ul class="my-2">$1</ul>')
      .replace(
        /^\s*\d+\.\s+(.*$)/gm,
        '<li class="ml-4 mb-1 text-slate-200">$1</li>'
      )
      .replace(
        /(<li.*<\/li>)/s,
        '<ol class="my-2 list-decimal list-inside">$1</ol>'
      )
      .replace(
        /^>\s+(.*$)/gm,
        '<blockquote class="border-l-4 border-purple-500 pl-4 ml-4 my-2 text-slate-300 italic">$1</blockquote>'
      )
      .replace(/^---$/gm, '<hr class="border-white/20 my-4" />')
      .replace(/\n\n/g, '</p><p class="mb-2 text-slate-200">')
      .replace(/\n/g, "<br />");

    if (
      !formatted.includes("<h") &&
      !formatted.includes("<ul>") &&
      !formatted.includes("<ol>")
    ) {
      formatted = `<p class="mb-2 text-slate-200">${formatted}</p>`;
    }

    return formatted;
  };

  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
