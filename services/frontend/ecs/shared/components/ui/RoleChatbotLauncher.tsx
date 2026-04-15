"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Bot, Send, X, Sparkles, Trash2, Minus, Maximize2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { ScrollArea } from "@/shared/components/ui/ScrollArea";
import ProfileAvatar from "@/shared/components/ui/ProfileAvatar";
import { AuthService, type UserDTO } from "@/shared/lib/auth-service";
import {
  clearChatHistory,
  createBotWelcomeMessage,
  generateBotResponse,
  getRoleChatbotConfig,
  loadChatHistory,
  normalizeRoleForChatbot,
  saveChatHistory,
  type RoleChatbotMessage,
  type RoleChatbotResponse,
} from "@/shared/lib/role-chatbot-service";
import { getContextDataForRole, type RoleContextData } from "@/shared/lib/chatbot-backend-service";

type RoleChatbotLauncherProps = {
  roleSlug?: string;
};

function createUserMessage(text: string): RoleChatbotMessage {
  return {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender: "user",
    text,
    timestamp: new Date().toISOString(),
  };
}

function createBotMessage(response: RoleChatbotResponse): RoleChatbotMessage {
  return {
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sender: "bot",
    text: response.text,
    timestamp: new Date().toISOString(),
    actionUrl: response.actionUrl,
    actionLabel: response.actionLabel,
  };
}

export default function RoleChatbotLauncher({ roleSlug }: RoleChatbotLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scrollbarCompensation, setScrollbarCompensation] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<RoleChatbotMessage[]>([]);
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [contextData, setContextData] = useState<RoleContextData | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const computeCompensation = () => {
      const body = document.body;
      const computed = window.getComputedStyle(body);
      const isBodyScrollLocked =
        body.style.overflow === "hidden" ||
        body.style.overflowY === "hidden" ||
        computed.overflow === "hidden" ||
        computed.overflowY === "hidden" ||
        body.classList.contains("modal-open");

      if (!isBodyScrollLocked) {
        setScrollbarCompensation(0);
        return;
      }

      const width = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      const cssVar = Number.parseFloat(
        getComputedStyle(body).getPropertyValue("--modal-scrollbar-compensation") || "0",
      );
      setScrollbarCompensation(Number.isFinite(cssVar) ? Math.max(width, cssVar) : width);
    };

    computeCompensation();
    const observer = new MutationObserver(computeCompensation);
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    window.addEventListener("resize", computeCompensation);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", computeCompensation);
    };
  }, []);

  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("ecs:open-role-chatbot", handleOpenChatbot);
    return () => window.removeEventListener("ecs:open-role-chatbot", handleOpenChatbot);
  }, []);

  useEffect(() => {
    const nextUser = AuthService.getUser();
    setUser(nextUser);

    const handleUserUpdated = () => {
      setUser(AuthService.getUser());
    };

    window.addEventListener("ecs:user-updated", handleUserUpdated);
    return () => {
      window.removeEventListener("ecs:user-updated", handleUserUpdated);
    };
  }, []);

  const role = useMemo(() => {
    const fromRoute = normalizeRoleForChatbot(roleSlug);
    if (fromRoute !== "unknown") return fromRoute;
    return normalizeRoleForChatbot(user?.role);
  }, [roleSlug, user?.role]);

  const config = useMemo(() => getRoleChatbotConfig(role), [role]);
  const userDisplayName = useMemo(() => {
    if (!user) return "";
    const full = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return full || user.username || user.email;
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const restored = loadChatHistory(user.id, role);
    
    // If no history, create personalized welcome message with first name
    if (restored.length === 0 || (restored.length === 1 && restored[0].sender === 'bot')) {
      setMessages([createBotWelcomeMessage(role, user.first_name)]);
    } else {
      setMessages(restored);
    }
  }, [user?.id, role, user?.first_name]);

  useEffect(() => {
    if (!user?.id || messages.length === 0) return;
    saveChatHistory(user.id, role, messages);
  }, [user?.id, role, messages]);

  useEffect(() => {
    if (!isOpen) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    const fetchContext = async () => {
      setIsLoadingContext(true);
      try {
        const data = await getContextDataForRole(role);
        setContextData(data);
      } catch (error) {
        console.error("Failed to load chatbot context:", error);
      } finally {
        setIsLoadingContext(false);
      }
    };

    fetchContext();
  }, [isOpen, role, user?.id]);

  if (!user?.id) {
    return null;
  }

  if (!isMounted) {
    return null;
  }

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = createUserMessage(trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const response = generateBotResponse(role, trimmed, contextData || undefined);

    window.setTimeout(() => {
      setMessages((prev) => [...prev, createBotMessage(response)]);
      setIsTyping(false);
    }, 400);
  };

  const clearConversation = () => {
    clearChatHistory(user.id);
    setMessages([createBotWelcomeMessage(role, user?.first_name)]);
  };

  if (isOpen && isMinimized) {
    return createPortal(
      <section
        className="chatbot-launcher-panel fixed bottom-4 right-4 z-[45] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        style={{ right: `calc(1rem + ${scrollbarCompensation}px)` }}
      >
        <header className="px-4 py-3 bg-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-[#BA0021] text-white inline-flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 font-semibold leading-tight truncate">{config.title}</p>
                <p className="text-slate-600 text-xs truncate">{userDisplayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => setIsMinimized(false)}
                aria-label="Restore assistant"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>
      </section>,
      document.body,
    );
  }

  return createPortal(
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        aria-label="Open assistant"
        className="chatbot-launcher-fab fixed bottom-5 right-5 z-[40] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#BA0021] text-white shadow-lg transition hover:bg-[#98001b] focus:outline-none focus:ring-2 focus:ring-[#BA0021] focus:ring-offset-2"
        style={{ right: `calc(1.25rem + ${scrollbarCompensation}px)` }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isOpen && (
        <section
          className="chatbot-launcher-panel fixed bottom-22 right-4 z-[45] w-[calc(100vw-2rem)] sm:w-[430px] h-[min(78vh,680px)] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col"
          style={{ right: `calc(1rem + ${scrollbarCompensation}px)` }}
        >
          <header className="px-4 py-3 border-b border-slate-200 shrink-0 bg-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#BA0021] text-white inline-flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-slate-900 font-semibold leading-tight">{config.title}</p>
                  <p className="text-slate-600 text-xs">{userDisplayName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ProfileAvatar
                  imageUrl={user.avatar_url}
                  firstName={user.first_name}
                  lastName={user.last_name}
                  fullName={userDisplayName}
                  className="h-8 w-8"
                  textClassName="text-[10px]"
                />
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setIsMinimized(true)}
                  aria-label="Minimize assistant"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 px-4 py-3 bg-slate-50/60">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "bot" && (
                      <div className="h-7 w-7 rounded-full bg-[#BA0021]/10 text-[#BA0021] inline-flex items-center justify-center shrink-0 mt-1">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        message.sender === "user"
                          ? "bg-[#BA0021] text-white"
                          : "bg-white border border-slate-200 text-slate-800"
                      }`}
                    >
                      <p>{message.text}</p>
                      {message.sender === "bot" && message.actionUrl && (
                        <a
                          href={message.actionUrl || "#"}
                          className="mt-2 inline-flex items-center rounded-md border border-[#BA0021]/30 bg-[#BA0021]/10 px-2.5 py-1 text-xs font-medium text-[#8f001a] hover:bg-[#BA0021]/15"
                          onClick={e => {
                            e.preventDefault();
                            // Persist sidebar as compacted
                            if (message.actionUrl) {
                              document.cookie = "sidebar_state=false; path=/; max-age=604800";
                              window.location.href = message.actionUrl;
                            }
                          }}
                        >
                          {message.actionLabel || "Go to page"}
                        </a>
                      )}
                    </div>
                    {message.sender === "user" && (
                      <ProfileAvatar
                        imageUrl={user.avatar_url}
                        firstName={user.first_name}
                        lastName={user.last_name}
                        fullName={userDisplayName}
                        className="h-7 w-7 mt-1"
                        textClassName="text-[9px]"
                      />
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 items-center text-xs text-slate-500">
                    <div className="h-7 w-7 rounded-full bg-[#BA0021]/10 text-[#BA0021] inline-flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    Assistant is scanning your question...
                  </div>
                )}

                {isLoadingContext && (
                  <div className="text-xs text-slate-500">Syncing latest workflow data...</div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200 p-3 bg-white shrink-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Sparkles className="h-3.5 w-3.5 text-[#BA0021]" />
                  Guide
                </div>
                <button
                  type="button"
                  onClick={clearConversation}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
              </div>

              <div className="space-y-1">
                {config.askGuides.slice(0, 2).map((guide) => (
                  <p key={guide} className="text-[11px] leading-snug text-slate-500">
                    {guide}
                  </p>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {config.quickPrompts.slice(0, 3).map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                    onClick={() => send(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send(inputValue);
                    }
                  }}
                  placeholder="Type your workflow question..."
                  className="bg-white"
                />
                <Button
                  type="button"
                  onClick={() => send(inputValue)}
                  className="bg-[#BA0021] hover:bg-[#98001b]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  , document.body);
}
