"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo, useContext } from "react";
import { Send, Loader2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import LanguageSelector from "@/components/language-selector";
import { LanguageContext } from "./i18n/language-provider";
import { useContentTransition } from "@/components/hooks/content-transition";
import { useGoogleAnalytics } from "@/components/hooks/google-analytics";
import { Toaster } from "react-hot-toast";
import { showActionToast } from "../lib/toast-utils";

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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { language } = useContext(LanguageContext);
  const { trackEvent } = useGoogleAnalytics();

  const isSimulated = false;

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

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (
    e: React.FormEvent | React.MouseEvent
  ) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    trackEvent("user_message_bot", {
      content: input.trim(),
    });

    if (!hasRealMessages) {
      setIsSwitchingToChat(true);

      setTimeout(() => {
        setShowChatArea(true);
        setAnimateComposerIn(true);

        setTimeout(() => {
          setAnimateComposerIn(false);
        }, 700);

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

        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: "Lorem ipsum dolor sit amet.",
          role: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const response = await fetch(getApiUrl(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        if (!response.ok) {
          throw new Error("Erreur réseau");
        }

        const data = await response.json();

        if (
          data.response &&
          typeof data.response === "object" &&
          data.response.action
        ) {
          const { action, params, message } = data.response;

          const assistantMessage: Message = {
            id: Date.now().toString(),
            content: message || translation("action_available"),
            role: "assistant",
            timestamp: new Date(),
            images: data.images || [],
          };

          setMessages((prev) => [...prev, assistantMessage]);

          if (action === "get_resume") {
            showActionToast(
              translation("confirm_download_cv"),
              () => downloadResume(),
              translation("confirm"),
              translation("cancel"),
              translation("action_confirmed")
            );
          }

          if (action === "send_contact_email") {
            showActionToast(
              translation("confirm_send_email"),
              () =>
                openContactEmail(
                  params?.sujet || "",
                  params?.message || ""
                ),
              translation("confirm"),
              translation("cancel"),
              translation("action_confirmed")
            );
          }

          if (action === "get_link") {
            const url = params?.url;

            if (url) {
              showActionToast(
                translation("confirm_open_link"),
                () => openLink(url),
                translation("confirm"),
                translation("cancel"),
                translation("action_confirmed")
              );
            }
          }
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
      console.error(error);

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

  const quickQuestions = useMemo(() => {
    return quickQuestionsKeys.map((key) => translation(key));
  }, [translation]);

  return (
    <div className="h-dvh overflow-hidden bg-[#2b2928] flex flex-col">
      {showChatArea && (
        <>
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="w-full max-w-4xl mx-auto flex-1 min-h-0 flex flex-col">
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4"
              >
                <div className="space-y-4 sm:space-y-6 pb-32">
                  {messages.map((message, index) => (
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
                  ))}

                  {isTyping && <TypingIndicator />}
                </div>
              </div>

              <div className="border-t border-white/10 bg-[#2b2928] p-3 sm:p-6">
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
                    className="text-[#EEF0F2] bg-transparent border-none rounded-xl px-3 sm:px-4 py-3 resize-none w-full pr-16 max-h-[200px] focus:outline-none placeholder-[#EEF0F2]/60"
                    rows={1}
                  />

                  <div className="absolute bottom-2 right-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading || !input.trim()}
                      className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#4c4947] rounded-xl"
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!showChatArea && (
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-10">
            <h1
              className={`text-[#EEF0F2] text-center text-3xl md:text-5xl font-medium ${titleTransition.transitionClasses}`}
            >
              {titleTransition.displayContent}
            </h1>

            <QuickQuestions
              questions={quickQuestions}
              onSelect={handleQuickQuestion}
            />

            <div className="relative p-2 pb-8 rounded-2xl bg-[#4c4947] border border-white/10">
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
                className="text-[#EEF0F2] bg-transparent border-none rounded-xl px-4 py-3 resize-none w-full pr-24 max-h-[200px] focus:outline-none placeholder-[#EEF0F2]/60"
                rows={1}
              />

              <div className="absolute bottom-2 right-2 flex gap-2">
                <LanguageSelector />

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className="bg-[#FCA311] hover:bg-[#FCA311]/90 text-[#EEF0F2] rounded-xl"
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        className={`relative z-10 p-4 sm:p-6 border-t border-[#EEF0F2]/10 backdrop-blur-xl bg-black/30 ${
          showChatArea ? "hidden" : "block"
        }`}
      >
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="flex items-center space-x-2 text-[#747d85]">
            <Code className="w-4 h-4" />

            <span
              className={`text-sm ${footerTransition.transitionClasses}`}
            >
              {footerTransition.displayContent}
            </span>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}