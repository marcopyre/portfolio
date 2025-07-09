"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Loader2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "./i18n/use-translation";
import Header from "../components/header";
import QuickQuestions from "../components/quick-questions";
import ChatMessage from "../components/chat-message";
import TypingIndicator from "../components/typing-indicator";
import { getApiUrl, get_resume, send_contact_email } from "../lib/chat-utils";
import { quickQuestionsKeys } from "../constants/chat";
import ConfirmModal from "../components/confirm-modal";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isWelcome?: boolean;
  images?: string[];
}

interface Particle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

export default function Portfolio() {
  const { translation } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "",
      role: "assistant",
      timestamp: new Date(),
      isWelcome: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    question: string;
    onConfirm: (() => void) | null;
  }>({ open: false, question: "", onConfirm: null });

  useEffect(() => {
    setIsClient(true);
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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
              get_resume();
            },
          });
        }

        if (action === "send_contact_email") {
          setConfirmState({
            open: true,
            question: translation("confirm_send_email"),
            onConfirm: () => {
              send_contact_email(params?.sujet || "", params?.message || "");
            },
          });
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
    scrollAreaRef.current!.scrollTop = scrollAreaRef.current!.scrollHeight;
  }, [messages]);

  const formatTime = (date: Date) =>
    isClient ? date.toLocaleTimeString() : "";

  const quickQuestions = useMemo(() => {
    return quickQuestionsKeys.map((key) => translation(key));
  }, [translation]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent animate-pulse"></div>
      </div>

      {isClient && (
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]"></div>

      <Header
        title={translation("header_title")}
        subtitle={translation("header_subtitle")}
        showLanguageSelector={messages.length === 1}
      />

      <div className="flex-1 flex flex-col relative z-10">
        {messages.length === 1 && (
          <QuickQuestions
            questions={quickQuestions}
            onSelect={handleQuickQuestion}
          />
        )}

        <div className="flex-1 flex flex-col p-4 md:p-6">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex-1 mb-6 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
              <ScrollArea className="h-full">
                <div ref={scrollAreaRef} className="p-4 md:p-6 space-y-6">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={{
                        ...message,
                        index,
                        tWelcome: translation("welcome_assistant"),
                      }}
                      formatTime={formatTime}
                      isClient={isClient}
                    />
                  ))}
                  translation
                  {isTyping && (
                    <TypingIndicator phrase={translation("typing_1")} />
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="relative animate-fade-in flex-shrink-0">
              <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  placeholder={translation("type_message")}
                  disabled={isLoading}
                  className="bg-black/50 text-white border-white/20 rounded-xl px-4 py-3 flex-1"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white rounded-xl px-6 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 p-4 border-t border-white/10 backdrop-blur-xl bg-black/30 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-3 text-slate-400">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4" />
                <span className="text-sm">
                  {translation("footer_powered_by")}
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
      />
    </div>
  );
}
