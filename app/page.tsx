"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Brain,
  Code,
  Rocket,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Particle {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
}

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
      );

    // gras
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-white">$1</strong>'
    );

    // italique
    formatted = formatted.replace(
      /\*(.*?)\*/g,
      '<em class="italic text-slate-200">$1</em>'
    );

    // liens
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-purple-400 hover:text-purple-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // listes à puces
    formatted = formatted.replace(
      /^\s*[\-\*\+]\s+(.*$)/gm,
      '<li class="ml-4 mb-1 text-slate-200">• $1</li>'
    );
    formatted = formatted.replace(/(<li.*<\/li>)/s, '<ul class="my-2">$1</ul>');

    // listes numérotées
    formatted = formatted.replace(
      /^\s*\d+\.\s+(.*$)/gm,
      '<li class="ml-4 mb-1 text-slate-200">$1</li>'
    );
    formatted = formatted.replace(
      /(<li.*<\/li>)/s,
      '<ol class="my-2 list-decimal list-inside">$1</ol>'
    );

    // citations
    formatted = formatted.replace(
      /^>\s+(.*$)/gm,
      '<blockquote class="border-l-4 border-purple-500 pl-4 ml-4 my-2 text-slate-300 italic">$1</blockquote>'
    );

    // splitter horizontaux
    formatted = formatted.replace(
      /^---$/gm,
      '<hr class="border-white/20 my-4" />'
    );

    // sauts de ligne
    formatted = formatted.replace(
      /\n\n/g,
      '</p><p class="mb-2 text-slate-200">'
    );
    formatted = formatted.replace(/\n/g, "<br />");

    if (
      !formatted.includes("<h1>") &&
      !formatted.includes("<h2>") &&
      !formatted.includes("<h3>") &&
      !formatted.includes("<ul>") &&
      !formatted.includes("<ol>") &&
      !formatted.includes("<pre>")
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

export default function Portfolio() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Bonjour ! Je suis l'assistant IA de ce portfolio. Je peux vous renseigner sur les compétences, projets, expérience et formation. Que souhaitez-vous savoir ?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const typingPhrases = [
    "Je connecte mes neurones virtuels...",
    "Je remue les octets de mes pensées...",
    "Je frotte ma lampe d'IA magique...",
    "Je brasse mes idées comme un shaker d'infos...",
    "J'analyse votre question...",
    "Je réfléchis...",
    "Je traite votre demande...",
    "Je fouille mes connaissances...",
    "Je traite votre requête...",
    "Un instant, je prépare une réponse...",
    "Je formule une réponse...",
    "Je connecte les neurones...",
    "Analyse en cours...",
    "hmmmmm...",
  ];

  const randomTypingPhrase = useMemo(() => {
    return typingPhrases[Math.floor(Math.random() * typingPhrases.length)];
  }, [isTyping, typingPhrases]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 5,
          duration: 2 + Math.random() * 3,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, [isClient]);

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Erreur réseau");
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur:", error);
      setTimeout(() => {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (date: Date): string => {
    if (!isClient) return "";
    return date.toLocaleTimeString();
  };

  const quickQuestions = [
    "Quelles sont tes compétences techniques ?",
    "Peux-tu me parler de tes projets ?",
    "Quelle est ton expérience professionnelle ?",
    "Quelles technologies maîtrises-tu ?",
  ];

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

      <header className="relative z-10 p-4 md:p-6 border-b border-white/10 backdrop-blur-xl bg-black/30 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-md"></div>
                <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Ask about Marco Pyré
                </h1>
                <p className="text-slate-400 text-sm md:text-base flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Assistant intelligent • Knowledge Base
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative z-10">
        {messages.length === 1 && (
          <div className="p-4 md:p-6 animate-fade-in flex-shrink-0">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-lg md:text-xl font-semibold text-white mb-6 flex items-center">
                <Rocket className="w-6 h-6 mr-3 text-purple-400" />
                Questions rapides
                <Zap className="w-5 h-5 ml-2 text-yellow-400" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="group relative p-4 text-left bg-gradient-to-r from-white/5 to-white/10 hover:from-purple-500/20 hover:to-cyan-500/20 border border-white/20 rounded-xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-cyan-500/0 group-hover:from-purple-500/10 group-hover:to-cyan-500/10 rounded-xl transition-all duration-500"></div>
                    <div className="relative flex items-start space-x-3">
                      <Star className="w-5 h-5 text-purple-400 group-hover:text-cyan-400 transition-colors duration-300 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 group-hover:text-white text-sm md:text-base transition-colors duration-300">
                        {question}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col p-4 md:p-6">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            <div className="flex-1 mb-6 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
              <ScrollArea className="h-full">
                <div ref={scrollAreaRef} className="p-4 md:p-6 space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-4 animate-slide-up ${
                        message.role === "user"
                          ? "flex-row-reverse space-x-reverse"
                          : ""
                      }`}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
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
                              <MarkdownRenderer content={message.content} />
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
                  ))}

                  {isTyping && (
                    <div className="flex items-start space-x-4 animate-fade-in">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <Bot className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                          <span className="text-slate-300 text-sm">
                            {randomTypingPhrase}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="relative animate-fade-in flex-shrink-0">
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-sm"></div>
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                    placeholder="Posez votre question sur le portfolio..."
                    disabled={isLoading}
                    className="relative bg-black/50 backdrop-blur-xl border-white/30 text-white placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 rounded-xl h-12 md:h-14 px-4 md:px-6 text-sm md:text-base transition-all duration-300 shadow-lg"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className="relative bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-xl h-12 md:h-14 px-6 md:px-8 transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl"></div>
                  <div className="relative flex items-center space-x-2">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    <span className="hidden md:inline">Envoyer</span>
                  </div>
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
                <span className="text-sm">Alimenté par Google Gemma</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
