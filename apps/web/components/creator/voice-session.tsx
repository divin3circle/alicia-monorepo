"use client"

import {
  type AudioConversationController,
  getAI,
  getLiveGenerativeModel,
  GoogleAIBackend,
  ResponseModality,
  startAudioConversation,
  VertexAIBackend,
} from "firebase/ai"
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Mic, MicOff, PhoneOff } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import genAILogo from "@/images/genai.avif"
import app from "@/lib/firebase"
import { buildLiveSystemInstruction } from "@/lib/ai/live-prompts"

interface VoiceSessionProps {
  pageNumber: number
  storyContext?: {
    title?: string
    objective?: string
    setting?: string
    characters?: Array<{ name: string; description: string }>
    pages?: Array<{ pageNumber: number; content: string }>
    recentFeedback?: Array<{
      pageNumber: number
      whatWentGreat: string
      tryNextTime: string
    }>
  }
  onEnd: () => void
}

type VoiceState = "listening" | "speaking" | "idle"

type TranscriptLine = {
  speaker: "Alicia" | "You"
  text: string
}

type LiveSession = Awaited<
  ReturnType<ReturnType<typeof getLiveGenerativeModel>["connect"]>
>

type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: Event) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type BrowserWindowWithSpeech = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition
}

export function VoiceSessionModal({
  pageNumber,
  storyContext,
  onEnd,
}: VoiceSessionProps) {
  const FIREBASE_AI_LOGIC_CONSOLE_URL =
    "https://console.firebase.google.com/project/_/ailogic"

  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [muted, setMuted] = useState(true)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [liveStatus, setLiveStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  )
  const [liveErrorMessage, setLiveErrorMessage] = useState<string | null>(null)
  const [micStatus, setMicStatus] = useState<
    "idle" | "starting" | "active" | "denied" | "unavailable"
  >("idle")

  const scrollRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const sessionRef = useRef<LiveSession | null>(null)
  const conversationControllerRef = useRef<AudioConversationController | null>(
    null
  )
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null)

  const appendTranscript = useCallback((line: TranscriptLine) => {
    setTranscript((prev) => {
      const last = prev[prev.length - 1]
      if (last?.speaker === line.speaker && last?.text === line.text) {
        return prev
      }
      return [...prev, line]
    })
  }, [])

  const getLiveErrorMessage = useCallback((error: unknown) => {
    const raw = error instanceof Error ? error.message : String(error ?? "")
    const lower = raw.toLowerCase()

    if (
      lower.includes("firebase ai logic api has not been used") ||
      lower.includes("firebasevertexai.googleapis.com") ||
      lower.includes("api has not been used") ||
      lower.includes("it is disabled")
    ) {
      return "Firebase AI Logic API is disabled for this project. Enable it, then retry connection."
    }

    return raw || "Failed to connect live voice."
  }, [])

  const stopSpeechRecognition = useCallback(() => {
    speechRecognitionRef.current?.stop()
    speechRecognitionRef.current = null
  }, [])

  const startSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return

    const speechWindow = window as BrowserWindowWithSpeech
    const SpeechCtor =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!SpeechCtor) {
      return
    }

    const recognition = new SpeechCtor()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const speechEvent = event as unknown as {
        results?: ArrayLike<{
          isFinal?: boolean
          0?: { transcript?: string }
          item?: (index: number) => { transcript?: string }
        }>
      }

      if (!speechEvent.results) return

      for (let i = 0; i < speechEvent.results.length; i += 1) {
        const result = speechEvent.results[i]
        if (!result?.isFinal) continue
        const chunk = result[0]?.transcript ?? result.item?.(0)?.transcript
        const text = chunk?.trim()
        if (text) {
          appendTranscript({ speaker: "You", text })
        }
      }
    }

    recognition.onerror = (event) => {
      console.warn("[voice/live] browser speech recognition error", event)
    }

    recognition.onend = () => {
      if (!conversationControllerRef.current) return
      try {
        recognition.start()
      } catch {
        // no-op
      }
    }

    speechRecognitionRef.current = recognition
    recognition.start()
  }, [appendTranscript])

  const stopStreaming = useCallback(() => {
    if (conversationControllerRef.current) {
      void conversationControllerRef.current.stop()
      conversationControllerRef.current = null
    }

    stopSpeechRecognition()

    if (sessionRef.current) {
      void sessionRef.current.close()
      sessionRef.current = null
    }
    setVoiceState("idle")
    setMicStatus("idle")
    setMuted(true)
  }, [stopSpeechRecognition])

  const connectLiveSession = useCallback(async () => {
    setLiveErrorMessage(null)

    if (sessionRef.current) {
      await sessionRef.current.close()
      sessionRef.current = null
    }

    const provider =
      process.env.NEXT_PUBLIC_FIREBASE_AI_PROVIDER?.toLowerCase() === "vertex"
        ? "vertex"
        : "google"

    const ai =
      provider === "vertex"
        ? getAI(app, {
            backend: new VertexAIBackend(
              process.env.NEXT_PUBLIC_FIREBASE_VERTEX_LOCATION || "us-central1"
            ),
          })
        : getAI(app, { backend: new GoogleAIBackend() })

    const model = getLiveGenerativeModel(ai, {
      model:
        provider === "vertex"
          ? "gemini-live-2.5-flash-native-audio"
          : "gemini-2.5-flash-native-audio-preview-12-2025",
      systemInstruction: buildLiveSystemInstruction({
        pageNumber,
        ...storyContext,
      }),
      generationConfig: {
        responseModalities: [ResponseModality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    })

    const session = await model.connect()
    sessionRef.current = session
    console.info("[voice/live] session established")
    setLiveStatus("ready")
  }, [pageNumber, storyContext])

  const retryLiveConnection = useCallback(async () => {
    setLiveStatus("loading")
    try {
      await connectLiveSession()
    } catch (error) {
      setLiveStatus("error")
      setLiveErrorMessage(getLiveErrorMessage(error))
      console.error("[voice/live] retry connection failed", error)
    }
  }, [connectLiveSession, getLiveErrorMessage])

  const startConversation = useCallback(async () => {
    if (!sessionRef.current) return

    setMicStatus("starting")

    try {
      const controller = await startAudioConversation(sessionRef.current)
      conversationControllerRef.current = controller
      setMuted(false)
      setMicStatus("active")
      setVoiceState("listening")
      startSpeechRecognition()
      appendTranscript({
        speaker: "Alicia",
        text: "I can hear you now. Tell me what you want to improve on this page.",
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setMicStatus("denied")
      } else {
        setMicStatus("unavailable")
      }
      console.error("[voice/live] start audio conversation failed", error)
      setVoiceState("idle")
    }
  }, [appendTranscript, startSpeechRecognition])

  const handleMuteToggle = useCallback(async () => {
    if (muted) {
      await startConversation()
      return
    }

    if (conversationControllerRef.current) {
      await conversationControllerRef.current.stop()
      conversationControllerRef.current = null
    }

    stopSpeechRecognition()

    setMuted(true)
    setMicStatus("idle")
    setVoiceState("idle")
  }, [muted, startConversation, stopSpeechRecognition])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let active = true

    const initLive = async () => {
      setLiveStatus("loading")

      try {
        if (!active) return

        await connectLiveSession()
      } catch (error) {
        if (active) {
          setLiveStatus("error")
          setLiveErrorMessage(getLiveErrorMessage(error))
          console.error("[voice/live] init failed", error)
        }
      }
    }

    void initLive()

    return () => {
      active = false
      stopStreaming()
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [connectLiveSession, getLiveErrorMessage, stopStreaming])

  useEffect(() => {
    const iv = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" })
  }, [transcript])

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`

  return (
    <div className="fixed inset-0 z-50 flex animate-in flex-col items-center justify-between bg-background/95 px-6 py-8 backdrop-blur-lg fade-in">
      <div className="flex w-full max-w-md flex-col items-center gap-2">
        <p className="text-xs font-semibold tracking-wider uppercase">
          Voice Session — Page {pageNumber}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatTime(elapsedSeconds)}
        </p>
        <p className="text-xs text-muted-foreground">
          {liveStatus === "loading" && "Connecting live voice..."}
          {liveStatus === "ready" && "Live voice connected"}
          {liveStatus === "error" &&
            (liveErrorMessage || "Live voice unavailable")}
        </p>
        {liveStatus === "error" && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void retryLiveConnection()
              }}
            >
              Retry Connection
            </Button>
            <a
              href={FIREBASE_AI_LOGIC_CONSOLE_URL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-foreground underline underline-offset-2"
            >
              Open AI Logic Setup
            </a>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {micStatus === "idle" && "Press Start Voice to begin"}
          {micStatus === "starting" && "Requesting microphone access..."}
          {micStatus === "active" && "Microphone active"}
          {micStatus === "denied" &&
            "Microphone access denied — allow mic to use live voice"}
          {micStatus === "unavailable" &&
            "Microphone not available in this browser/context"}
        </p>
        {(liveStatus === "ready" || liveStatus === "loading") &&
          micStatus !== "active" && (
            <Button
              size="sm"
              variant="outline"
              onClick={startConversation}
              disabled={micStatus === "starting" || liveStatus !== "ready"}
            >
              {liveStatus === "loading"
                ? "Connecting..."
                : micStatus === "starting"
                  ? "Starting..."
                  : "Start Voice"}
            </Button>
          )}
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

        <div className="flex h-14 items-end gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 rounded-full transition-all",
                voiceState === "speaking"
                  ? "animate-pulse bg-primary"
                  : voiceState === "listening"
                    ? "animate-pulse bg-emerald-400"
                    : "bg-muted-foreground/30"
              )}
              style={{
                height:
                  voiceState !== "idle" ? `${16 + ((i * 11) % 34)}px` : "8px",
                animationDelay: `${i * 60}ms`,
              }}
            />
          ))}
        </div>

        <p className="text-sm text-muted-foreground capitalize">
          {voiceState === "idle" ? "Ready" : voiceState}…
        </p>
      </div>

      <ScrollArea className="h-40 w-full max-w-md rounded-xl bg-muted/20 px-4 py-3">
        <div ref={scrollRef} className="flex flex-col gap-2">
          {transcript.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Start speaking and Alicia will reply here.
            </p>
          )}
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
          onClick={() => {
            void handleMuteToggle()
          }}
          className={cn(
            "gap-2",
            muted && "border-destructive text-destructive"
          )}
          disabled={liveStatus !== "ready"}
        >
          {muted ? <Mic className="size-4" /> : <MicOff className="size-4" />}
          {muted ? "Start Mic" : "Mute"}
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={() => {
            stopStreaming()
            onEnd()
          }}
          className="gap-2"
        >
          <PhoneOff className="size-4" />
          End Call
        </Button>
      </div>
    </div>
  )
}
