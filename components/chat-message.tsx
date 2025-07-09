import React from "react";
import { User, Bot } from "lucide-react";
import MarkdownRenderer from "./markdown-renderer";

export default function ChatMessage({
  message,
  isClient,
  formatTime,
}: {
  message: {
    index: number;
    tWelcome: string;
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    isWelcome?: boolean;
  };
  isClient: boolean;
  formatTime: (date: Date) => string;
}) {
  return (
    <div
      className={`flex items-start space-x-4 animate-slide-up ${
        message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
      }`}
      style={{ animationDelay: `${message.index * 0.1}s` }}
    >
      <div
        className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          message.role === "user"
            ? "bg-gradient-to-r from-blue-500 to-purple-500"
            : "bg-gradient-to-r from-purple-500 to-cyan-500"
        } shadow-lg`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
        {message.role === "user" ? (
          <User className="w-5 h-5 text-white relative z-10" />
        ) : (
          <Bot className="w-5 h-5 text-white relative z-10 animate-pulse" />
        )}
      </div>
      <div
        className={`flex-1 max-w-[85%] ${
          message.role === "user" ? "text-right" : ""
        }`}
      >
        <div
          className={`inline-block p-4 md:p-5 rounded-2xl relative overflow-hidden ${
            message.role === "user"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm text-white border border-white/20 shadow-lg"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
          <div className="relative z-10">
            {message.role === "user" ? (
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <MarkdownRenderer
                content={message.isWelcome ? message.tWelcome : message.content}
              />
            )}
          </div>
        </div>
        {isClient && (
          <p className="text-xs text-slate-400 mt-2 px-2 flex items-center">
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
}
