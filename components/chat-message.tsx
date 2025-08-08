import React, { useEffect, useRef, useState } from "react";
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

    if (messageRef.current) {
      observer.observe(messageRef.current);
    }

    return () => {
      if (messageRef.current) {
        observer.unobserve(messageRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={messageRef}
      className={`flex items-start space-x-4 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
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
                <MarkdownRenderer content={message.content} />
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
                        width={1000}
                        height={600}
                        style={{
                          maxWidth: "100%",
                          height: "auto",
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
