/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { savePageFeedback } from "@/lib/firestore"

interface PageReviewProps {
  projectId: string
  pageNumber: number
  totalPages: number
  pageContent: string
  storyTitle: string
  storyObjective: string
  storySetting: string
  onStartVoice: () => void
  onContinue: () => void
}

const STUB_FEEDBACK = {
  whatYouWrote:
    "You wrote a vivid scene where your character discovers something unexpected.",
  whatWentGreat:
    "Your descriptions are so detailed! The reader can really picture the setting. The dialogue felt natural too.",
  tryNextTime:
    "Next time, try adding what your character smells or hears to make the scene even more immersive.",
  skills: ["Vivid detail ⭐", "Dialogue", "Setting description"],
}

export function PageReview({
  projectId,
  pageNumber,
  totalPages,
  pageContent,
  storyTitle,
  storyObjective,
  storySetting,
  onStartVoice,
  onContinue,
}: PageReviewProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(STUB_FEEDBACK)

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/coach/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: storyTitle,
          objective: storyObjective,
          setting: storySetting,
          pageNumber,
          pageContent,
        }),
      })

      if (!response.ok) {
        setFeedback(STUB_FEEDBACK)
        return
      }

      const json = await response.json()
      setFeedback({
        whatYouWrote: json.whatYouWrote ?? STUB_FEEDBACK.whatYouWrote,
        whatWentGreat: json.whatWentGreat ?? STUB_FEEDBACK.whatWentGreat,
        tryNextTime: json.tryNextTime ?? STUB_FEEDBACK.tryNextTime,
        skills:
          Array.isArray(json.skills) && json.skills.length
            ? json.skills
            : STUB_FEEDBACK.skills,
      })
    } catch {
      setFeedback(STUB_FEEDBACK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchFeedback()
  }, [pageContent, pageNumber, storyObjective, storySetting, storyTitle])

  const handleContinue = async () => {
    if (!saved) {
      await savePageFeedback(projectId, {
        pageNumber,
        ...feedback,
      })
      setSaved(true)
    }
    onContinue()
  }

  const isLastPage = pageNumber >= totalPages

  return (
    <div className="fixed inset-0 z-40 flex animate-in items-end justify-center bg-black/60 backdrop-blur-sm fade-in sm:items-center">
      <div className="mx-auto flex w-full max-w-lg animate-in flex-col gap-5 rounded-t-2xl bg-card p-6 shadow-2xl slide-in-from-bottom-4 sm:rounded-2xl sm:p-8 sm:slide-in-from-bottom-0">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold tracking-wider text-foreground uppercase">
            Page {pageNumber} Complete 🎉
          </p>
          <h2 className="text-xl font-bold">Great work!</h2>
        </div>

        <div className="flex flex-col gap-3">
          <section className="rounded-xl bg-muted/60 p-4">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">
              What you wrote
            </p>
            <p className="text-sm leading-relaxed">
              {loading ? "Analyzing your page..." : feedback.whatYouWrote}
            </p>
          </section>
          <section className="rounded-xl bg-emerald-500/10 p-4">
            <p className="mb-1 text-xs font-semibold text-emerald-600">
              What went great ✨
            </p>
            <p className="text-sm leading-relaxed">
              {loading
                ? "Finding your strongest moments..."
                : feedback.whatWentGreat}
            </p>
          </section>
          <section className="rounded-xl bg-amber-500/10 p-4">
            <p className="mb-1 text-xs font-semibold text-amber-600">
              Try next time 🚀
            </p>
            <p className="text-sm leading-relaxed">
              {loading ? "Preparing your next step..." : feedback.tryNextTime}
            </p>
          </section>
        </div>
        <div className="flex flex-wrap gap-2">
          {(loading ? STUB_FEEDBACK.skills : feedback.skills).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row">
          <Button
            variant="outline"
            onClick={onStartVoice}
            className="flex-1 gap-2 py-2 font-semibold"
          >
            🎙️ Talk to Alicia
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1 bg-foreground py-2 font-semibold text-background hover:bg-foreground/20"
          >
            {isLastPage
              ? "Finish Story 🎊"
              : `Continue to Page ${pageNumber + 1} →`}
          </Button>
        </div>
      </div>
    </div>
  )
}
