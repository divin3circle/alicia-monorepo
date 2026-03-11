"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { MicOff, PhoneOff } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";
import genAILogo from "@/images/genai.avif"

interface VoiceSessionProps {
  pageNumber: number;
  onEnd: () => void;
}

type VoiceState = "listening" | "speaking" | "idle";

const DEMO_TRANSCRIPT = [
  { speaker: "Alicia", text: "Hello! Tell me, what was your favourite part of what you just wrote?" },
];

export function VoiceSessionModal({ pageNumber, onEnd }: VoiceSessionProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState(DEMO_TRANSCRIPT);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simulate state cycling for demo
  useEffect(() => {
    const cycle = ["idle", "listening", "speaking", "listening"] as VoiceState[];
    let idx = 0;
    const iv = setInterval(() => {
      idx = (idx + 1) % cycle.length;
      setVoiceState(cycle[idx]!);
    }, 2200);
    return () => clearInterval(iv);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const iv = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Scroll transcript to bottom on update
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-background/95 backdrop-blur-lg px-6 py-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 w-full max-w-md">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">
          Voice Session — Page {pageNumber}
        </p>
        <p className="text-sm text-muted-foreground">{formatTime(elapsedSeconds)}</p>
      </div>

      <div className="flex flex-col items-center gap-6">

        <div
          className={cn(
            "relative flex items-center justify-center rounded-full transition-all duration-500",
            voiceState === "speaking"
              ? "ring-4 ring-primary/50 ring-offset-4 ring-offset-background"
              : voiceState === "listening"
              ? "ring-4 ring-emerald-400/50 ring-offset-4 ring-offset-background"
              : "ring-2 ring-border"
          )}
        >
          <Image
            src={genAILogo}
            alt="Alicia"
            width={96}
            height={96}
            className="rounded-full"
          />
        </div>

        <div className="flex items-end gap-1 h-14">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all",
                voiceState === "speaking"
                  ? "bg-primary animate-pulse"
                  : voiceState === "listening"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-muted-foreground/30"
              )}
              style={{
                height:
                  voiceState !== "idle"
                    ? `${20 + Math.sin((i * 3.7 + Date.now() / 200) % Math.PI) * 30}px`
                    : "8px",
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground capitalize">
          {voiceState === "idle" ? "Ready" : voiceState}…
        </p>
      </div>

      <ScrollArea className="w-full max-w-md h-40 rounded-xl bg-muted/20 px-4 py-3">
        <div ref={scrollRef} className="flex flex-col gap-2">
          {transcript.map((line, i) => (
            <p key={i} className="text-sm leading-relaxed">
              <span className="font-semibold">{line.speaker}: </span>
              {line.text}
            </p>
          ))}
        </div>
      </ScrollArea>

      <div className="flex items-center gap-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setMuted((m) => !m)}
          className={cn("gap-2", muted && "border-destructive text-destructive")}
        >
          <MicOff className="size-4" />
          {muted ? "Unmute" : "Mute"}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={onEnd}
          className="gap-2"
        >
          <PhoneOff className="size-4" />
          End Call
        </Button>
      </div>
    </div>
  );
}
