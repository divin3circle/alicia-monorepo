"use client";

import { Mic, Volume2, VolumeX, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface VoiceChatProps {
  onStart?: () => void;
  onStop?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onTimeUp?: () => void;
  /** Max duration in seconds. Default 180 (3 minutes). */
  maxDuration?: number;
  className?: string;
  demoMode?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
}

export function VoiceChat({
  onStart,
  onStop,
  onVolumeChange,
  onTimeUp,
  maxDuration = 180,
  className,
  demoMode = false,
}: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>(Array(32).fill(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const animationRef = useRef<number | undefined>(undefined);
  const elapsedRef = useRef(0);

  const remaining = maxDuration - elapsed;
  const pctUsed = elapsed / maxDuration;

  // Generate ambient particles once
  useEffect(() => {
    const ps: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      ps.push({
        id: i,
        x: Math.random() * 400,
        y: Math.random() * 400,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.3 + 0.1,
        velocity: {
          x: (Math.random() - 0.5) * 0.5,
          y: (Math.random() - 0.5) * 0.5,
        },
      });
    }
    setParticles(ps);
  }, []);

  // Animate particles
  useEffect(() => {
    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: (p.x + p.velocity.x + 400) % 400,
          y: (p.y + p.velocity.y + 400) % 400,
          opacity: Math.min(0.4, Math.max(0.05, p.opacity + (Math.random() - 0.5) * 0.02)),
        }))
      );
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Timer & waveform when listening
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);

        if (elapsedRef.current >= maxDuration) {
          setIsListening(false);
          onStop?.(elapsedRef.current);
          onTimeUp?.();
          return;
        }

        setWaveformData(Array(32).fill(0).map(() => Math.random() * 100));
        const v = Math.random() * 100;
        setVolume(v);
        onVolumeChange?.(v);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setWaveformData(Array(32).fill(0));
      setVolume(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isListening, maxDuration, onStop, onTimeUp, onVolumeChange]);

  // Demo loop
  useEffect(() => {
    if (!demoMode) return;
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        setIsListening(true);
        onStart?.();
        await sleep(3000);
        if (cancelled) break;
        setIsListening(false);
        setIsProcessing(true);
        await sleep(1800);
        if (cancelled) break;
        setIsProcessing(false);
        setIsSpeaking(true);
        await sleep(3500);
        if (cancelled) break;
        setIsSpeaking(false);
        await sleep(2000);
      }
    };

    const t = setTimeout(run, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoMode]);

  const handleToggle = () => {
    if (demoMode) return;
    if (isListening) {
      setIsListening(false);
      onStop?.(elapsedRef.current);
    } else {
      elapsedRef.current = 0;
      setElapsed(0);
      setIsListening(true);
      onStart?.();
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const statusText = isListening
    ? "Listening…"
    : isProcessing
      ? "Processing…"
      : isSpeaking
        ? "Speaking…"
        : "Tap to speak";

  const statusColor = isListening
    ? "text-blue-400"
    : isProcessing
      ? "text-yellow-400"
      : isSpeaking
        ? "text-green-400"
        : "text-muted-foreground";

  const borderColor = isListening
    ? "border-blue-500 shadow-blue-500/25"
    : isProcessing
      ? "border-yellow-500 shadow-yellow-500/25"
      : isSpeaking
        ? "border-green-500 shadow-green-500/25"
        : "border-border hover:border-primary/50";

  // Countdown ring: 1 → 0 as time runs out
  const ringDash = 2 * Math.PI * 52; // circumference for r=52
  const ringOffset = ringDash * pctUsed;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-background relative overflow-hidden",
        className
      )}
    >
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{ left: p.x, top: p.y, opacity: p.opacity }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"
          animate={{
            scale: isListening ? [1, 1.2, 1] : [1, 1.05, 1],
            opacity: isListening ? [0.3, 0.6, 0.3] : [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Countdown ring + button */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {/* SVG countdown ring */}
          <svg
            width="140"
            height="140"
            className="absolute -inset-1 -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/20" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="3"
              strokeDasharray={ringDash}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              className={cn(
                "transition-all duration-1000",
                remaining <= 30 ? "stroke-red-500" : remaining <= 60 ? "stroke-yellow-500" : "stroke-blue-500"
              )}
            />
          </svg>

          <motion.button
            onClick={handleToggle}
            className={cn(
              "relative w-28 h-28 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary/20 to-primary/10 border-2 shadow-lg transition-colors duration-300",
              borderColor
            )}
            animate={{
              boxShadow: isListening
                ? [
                    "0 0 0 0 rgba(59,130,246,0.4)",
                    "0 0 0 20px rgba(59,130,246,0)",
                  ]
                : undefined,
            }}
            transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                </motion.div>
              ) : isSpeaking ? (
                <motion.div
                  key="speaking"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Volume2 className="w-10 h-10 text-green-500" />
                </motion.div>
              ) : isListening ? (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Mic className="w-10 h-10 text-blue-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Mic className="w-10 h-10 text-muted-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Pulse rings */}
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500/30"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-blue-500/20"
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 2.1, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Waveform visualizer */}
        <div className="flex items-center justify-center gap-[2px] h-14">
          {waveformData.map((h, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-[3px] rounded-full transition-colors duration-300",
                isListening
                  ? "bg-blue-500"
                  : isProcessing
                    ? "bg-yellow-500"
                    : isSpeaking
                      ? "bg-green-500"
                      : "bg-muted"
              )}
              animate={{
                height: `${Math.max(4, h * 0.56)}px`,
                opacity: isListening || isSpeaking ? 1 : 0.3,
              }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />
          ))}
        </div>

        {/* Status + timer */}
        <div className="text-center space-y-1">
          <motion.p
            className={cn("text-base font-semibold transition-colors", statusColor)}
            animate={{ opacity: isListening || isProcessing || isSpeaking ? [1, 0.7, 1] : 1 }}
            transition={{ duration: 2, repeat: isListening || isProcessing || isSpeaking ? Infinity : 0 }}
          >
            {statusText}
          </motion.p>

          <div className="flex items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground font-mono tabular-nums">
              {formatTime(elapsed)}
            </p>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <p className={cn("text-sm font-mono tabular-nums", remaining <= 30 ? "text-red-500" : "text-muted-foreground")}>
              {formatTime(remaining)}
            </p>
          </div>

          {volume > 0 && (
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500 rounded-full"
                  animate={{ width: `${volume}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
            </motion.div>
          )}
        </div>

        {/* AI indicator */}
        <motion.div
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Alicia Live · 3-min session</span>
        </motion.div>
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
