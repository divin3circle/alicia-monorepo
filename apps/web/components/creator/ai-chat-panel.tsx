"use client";

import { useRef, useState } from "react";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { addChatMessage, type AiMessage } from "@/lib/firestore";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";
import genAILogo from "@/images/genai.avif"

interface AiChatPanelProps {
  projectId: string;
  pageNumber: number;
  /** Pre-loaded history filtered to this page (or all history). */
  history: AiMessage[];
  onNewMessages: (msgs: AiMessage[]) => void;
}

export function AiChatPanel({
  projectId,
  pageNumber,
  history,
  onNewMessages,
}: AiChatPanelProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    endRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: AiMessage = {
      role: "user",
      content: text,
      pageContext: pageNumber,
      createdAt: null,
    };

    // Optimistic update
    onNewMessages([...history, userMsg]);
    setTimeout(scrollToBottom, 50);

    await addChatMessage(projectId, {
      role: "user",
      content: text,
      pageContext: pageNumber,
    });

    // --- Stub AI response (replace with real API call later) ---
    const aiText =
      "Great question! Keep going — you're doing an amazing job. Try adding more detail about how your character feels right now. 🌟";
    const aiMsg: AiMessage = {
      role: "assistant",
      content: aiText,
      pageContext: pageNumber,
      createdAt: null,
    };
    await addChatMessage(projectId, {
      role: "assistant",
      content: aiText,
      pageContext: pageNumber,
    });
    onNewMessages([...history, userMsg, aiMsg]);
    setLoading(false);
    setTimeout(scrollToBottom, 50);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
        <Image
          src={genAILogo}
          alt="Alicia"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="font-semibold text-sm">Alicia — Writing Coach</span>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="flex flex-col gap-3">
          {history.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-4">
              Hi! I&apos;m Alicia 👋 Ask me anything about your story.
            </p>
          )}
          {history.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto bg-muted text-foreground"
              )}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="mr-auto bg-muted rounded-xl px-3 py-2 text-sm text-muted-foreground animate-pulse">
              Alicia is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-border/50">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask Alicia…"
          className="flex-1"
          disabled={loading}
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
