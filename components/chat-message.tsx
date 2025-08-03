import React from "react";
import Image from "next/image";
import MarkdownRenderer from "./markdown-renderer";

export default function ChatMessage({
  message,
}: {
  message: {
    index: number;
    tWelcome: string;
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
    isWelcome?: boolean;
    images?: string[];
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
        className={`flex-1 max-w-[85%] ${
          message.role === "user" ? "text-right" : ""
        }`}
      >
        <div
          className={`inline-block p-4 md:p-5 rounded-2xl relative overflow-hidden ${
            message.role === "user"
              ? "bg-[#434343] text-[#EEF0F2] shadow-lg"
              : ""
          }`}
        >
          <div className="relative z-10">
            {message.role === "user" ? (
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <>
                <MarkdownRenderer
                  content={
                    message.isWelcome ? message.tWelcome : message.content
                  }
                />
                {Array.isArray(message.images) && message.images.length > 0 && (
                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {message.images.map((img: string, idx: number) => (
                      <Image
                        key={img + idx}
                        src={img}
                        alt={`Image ${idx + 1}`}
                        style={{
                          maxWidth: "100%",
                          borderRadius: 8,
                          boxShadow: "0 2px 12px #0004",
                        }}
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
