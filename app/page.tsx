"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { Send, Loader2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "./i18n/use-translation";
import QuickQuestions from "../components/quick-questions";
import ChatMessage from "../components/chat-message";
import TypingIndicator from "../components/typing-indicator";
import {
  getApiUrl,
  downloadResume,
  openContactEmail,
  openLink,
} from "../lib/chat-utils";
import { quickQuestionsKeys } from "../constants/chat";
import ConfirmModal from "../components/confirm-modal";
import LanguageSelector from "@/components/language-selector";
import { LanguageContext } from "./i18n/language-provider";
import { useContentTransition } from "@/components/hooks/content-transition";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isWelcome?: boolean;
  images?: string[];
}

export default function Portfolio() {
  const { translation } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showChatArea, setShowChatArea] = useState(false);
  const [isSwitchingToChat, setIsSwitchingToChat] = useState(false);
  const [animateComposerIn, setAnimateComposerIn] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    question: string;
    onConfirm: (() => void) | null;
    link?: string;
  }>({ open: false, question: "", onConfirm: null });

  const { language } = useContext(LanguageContext);

  const isSimulated = true;

  const titleTransition = useContentTransition(translation("chat_title"), {
    type: "swap",
    duration: 400,
    key: "title",
  });

  const placeholderTransition = useContentTransition(
    translation("type_message"),
    {
      type: "quick",
      duration: 400,
      key: "placeholder",
    }
  );

  const footerTransition = useContentTransition(
    translation("footer_powered_by"),
    {
      type: "default",
      duration: 400,
      key: "footer",
    }
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasRealMessages = useMemo(() => {
    return messages.some((msg) => !msg.isWelcome);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!hasRealMessages) {
      setIsSwitchingToChat(true);
      setTimeout(() => {
        setShowChatArea(true);
        setAnimateComposerIn(true);
        setTimeout(() => setAnimateComposerIn(false), 700);
        setIsSwitchingToChat(false);
      }, 600);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      if (isSimulated) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const data = {
          response:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
          images: [],
        };
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: data.response,
          role: "assistant",
          timestamp: new Date(),
          images: data.images || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const response = await fetch(getApiUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.isWelcome
                ? translation("welcome_assistant")
                : msg.content,
            })),
            useRAG: true,
          }),
        });

        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();

        if (
          data.response &&
          typeof data.response === "object" &&
          data.response.action
        ) {
          const { action, params } = data.response;

          if (action === "get_resume") {
            setConfirmState({
              open: true,
              question: translation("confirm_download_cv"),
              onConfirm: () => {
                downloadResume();
              },
            });
          }

          if (action === "send_contact_email") {
            setConfirmState({
              open: true,
              question: translation("confirm_send_email"),
              onConfirm: () => {
                openContactEmail(params?.sujet || "", params?.message || "");
              },
            });
          }

          if (action === "get_link") {
            const url = params?.url;
            if (url) {
              setConfirmState({
                open: true,
                question: translation("confirm_open_link"),
                onConfirm: () => {
                  openLink(url);
                },
                link: url,
              });
            }
          }

          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              content: translation("action_in_progress"),
              role: "assistant",
              timestamp: new Date(),
            },
          ]);
        } else {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            content: data.response,
            role: "assistant",
            timestamp: new Date(),
            images: data.images || [],
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: translation("error_generic"),
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current!.scrollTop = scrollAreaRef.current!.scrollHeight;
    }
  }, [messages]);

  const quickQuestions = useMemo(() => {
    return quickQuestionsKeys.map((key) => translation(key));
  }, [translation]);

  return (
    <div className="min-h-screen bg-[#2b2928] relative overflow-hidden flex flex-col">
      {showChatArea && (
        <>
          <div className="flex-1 p-4 sm:p-6 animate-[slideUp_0.6s_ease-out_forwards] pb-28 sm:pb-0">
            <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
              <div className="flex-1 mb-4 sm:mb-6 rounded-2xl overflow-hidden">
                <ScrollArea className="h-full">
                  <div
                    ref={scrollAreaRef}
                    className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-6"
                  >
                    {messages.map((message, index) => {
                      return (
                        <ChatMessage
                          key={message.id}
                          message={{
                            ...message,
                            content: message.content,
                            index,
                            tWelcome: translation("welcome_assistant"),
                          }}
                          isClient={isClient}
                        />
                      );
                    })}
                    {isTyping && (
                      <TypingIndicator phrase={translation("typing_1")} />
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <div
            className="fixed sm:sticky bottom-0 left-0 right-0 w-full bg-[#2b2928] p-3 sm:p-6 pt-3 sm:pt-4 z-50 border-t sm:border-t-0 border-[#EEF0F2]/10 sm:border-transparent"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            }}
          >
            <div className="w-full max-w-4xl mx-auto">
              <div
                className={`p-2 pb-8 sm:pb-10 gap-4 w-full rounded-2xl bg-[#4c4947] relative border border-white/10 shadow-lg ${
                  animateComposerIn
                    ? "animate-[inputSlideUp_0.6s_ease-out]"
                    : ""
                }`}
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={translation("type_message")}
                  disabled={isLoading}
                  className="text-[#EEF0F2] bg-transparent border-none rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex-1 min-h-[44px] sm:min-h-[56px] resize-none w-full pr-12 sm:pr-16 max-h-[120px] sm:max-h-[200px] focus:outline-none focus:ring-0 focus:border-transparent placeholder-[#EEF0F2]/60 text-sm sm:text-base"
                  rows={1}
                  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                />
                <div className="absolute bottom-2 right-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !input.trim()}
                    className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#4c4947] rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    size="sm"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!showChatArea && (
        <div className="flex-1 flex items-center justify-center animate-[fadeIn_0.6s_ease-out] px-4 sm:px-6">
          <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex flex-col  md:space-y-12 -translate-y-[60px] sm:-translate-y-[100px]">
            <div
              className={`order-1 transition-transform duration-500 ease-out ${
                language === "en"
                  ? "translate-y-0 sm:translate-y-6 md:translate-y-10"
                  : "translate-y-0"
              }`}
            >
              <h1
                className={`text-[#EEF0F2] h-[72px] sm:h-[96px] text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium leading-tight ${titleTransition.transitionClasses}`}
              >
                {titleTransition.displayContent}
              </h1>
            </div>

            <div className="flex-1 flex flex-col relative z-10 w-full order-2 sm:order-3 mt-0 sm:mt-12">
              <div
                className={`transition-all duration-500 ease-out ${
                  messages.length === 0 ? "opacity-100" : "opacity-0"
                }`}
              >
                <QuickQuestions
                  questions={quickQuestions}
                  onSelect={handleQuickQuestion}
                />
              </div>
            </div>

            <div className="w-full order-3 md:order-2 mt-[68px] md:mt-[2px]">
              <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                <div
                  className={`p-2 pb-8 sm:pb-10 gap-4 w-full rounded-2xl bg-[#4c4947] relative border border-white/10 shadow-2xl ${
                    isSwitchingToChat
                      ? "animate-[inputFadeOut_0.6s_ease-in-out_forwards]"
                      : ""
                  }`}
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={placeholderTransition.displayContent}
                    disabled={isLoading}
                    className={`text-[#EEF0F2] bg-transparent border-none rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex-1 min-h-[44px] sm:min-h-[48px] md:min-h-[56px] resize-none w-full pr-20 sm:pr-24 max-h-[200px] focus:outline-none focus:ring-0 focus:border-transparent placeholder-[#EEF0F2]/60 text-sm sm:text-base ${placeholderTransition.transitionClasses}`}
                    rows={1}
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2 sm:gap-4">
                    <div className="flex justify-end">
                      <LanguageSelector />
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || !input.trim()}
                      className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#EEF0F2] rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`relative z-10 p-4 sm:p-6 border-t border-[#EEF0F2]/10 backdrop-blur-xl bg-black/30 flex-shrink-0 ${showChatArea ? "hidden" : "block"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3 text-[#747d85]">
              <div className="flex items-center space-x-2">
                <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                <span
                  className={`text-xs sm:text-sm ${footerTransition.transitionClasses}`}
                >
                  {footerTransition.displayContent}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ConfirmModal
        open={confirmState.open}
        question={confirmState.question}
        onConfirm={() => {
          if (confirmState.onConfirm) confirmState.onConfirm();
          setConfirmState({ ...confirmState, open: false });
        }}
        onCancel={() => setConfirmState({ ...confirmState, open: false })}
        yesLabel={translation("confirm")}
        noLabel={translation("cancel") || "Annuler"}
        link={confirmState.link}
      />

      <style jsx>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes inputFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes inputSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @supports (padding: env(safe-area-inset-bottom)) {
          .mobile-input-safe {
            padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
}
