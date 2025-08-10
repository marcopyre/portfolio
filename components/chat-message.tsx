"use client";

import { useEffect, useRef, useState } from "react";
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
    images?: string[];
  };
  isClient: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "20px",
      }
    );

    const current = messageRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, []);

  return (
    <div
      ref={messageRef}
      className={`flex items-start transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${
        message.role === "user"
          ? "flex-row-reverse space-x-reverse space-x-2 sm:space-x-4"
          : "space-x-2 sm:space-x-4"
      }`}
    >
      <div
        className={`flex-1 ${
          message.role === "user"
            ? "text-right max-w-[90%] sm:max-w-[85%]"
            : "max-w-[90%] sm:max-w-[85%]"
        }`}
      >
        <div
          className={`inline-block p-3 sm:p-4 md:p-5 rounded-2xl relative ${
            message.role === "user"
              ? "bg-[#434343] text-[#EEF0F2] shadow-lg"
              : ""
          }`}
        >
          <div className="relative z-10">
            {message.role === "user" ? (
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <>
                <MarkdownRenderer content={message.content} />
                {Array.isArray(message.images) && message.images.length > 0 && (
                  <div className="mt-3 sm:mt-4 flex flex-col gap-3">
                    {message.images.map((img: string, idx: number) => (
                      <Image
                        key={img + idx}
                        src={img || "/placeholder.svg"}
                        alt={`Image ${idx + 1}`}
                        width={1000}
                        height={600}
                        className="max-w-full h-auto rounded-lg shadow-md"
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