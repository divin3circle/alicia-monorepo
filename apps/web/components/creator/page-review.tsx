"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { savePageFeedback } from "@/lib/firestore";

interface PageReviewProps {
  projectId: string;
  pageNumber: number;
  totalPages: number;
  onStartVoice: () => void;
  onContinue: () => void;
}

const STUB_FEEDBACK = {
  whatYouWrote:
    "You wrote a vivid scene where your character discovers something unexpected.",
  whatWentGreat:
    "Your descriptions are so detailed! The reader can really picture the setting. The dialogue felt natural too.",
  tryNextTime:
    "Next time, try adding what your character smells or hears to make the scene even more immersive.",
  skills: ["Vivid detail ⭐", "Dialogue", "Setting description"],
};

export function PageReview({
  projectId,
  pageNumber,
  totalPages,
  onStartVoice,
  onContinue,
}: PageReviewProps) {
  const [saved, setSaved] = useState(false);

  const handleContinue = async () => {
    if (!saved) {
      await savePageFeedback(projectId, {
        pageNumber,
        ...STUB_FEEDBACK,
      });
      setSaved(true);
    }
    onContinue();
  };

  const isLastPage = pageNumber >= totalPages;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg mx-auto bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Page {pageNumber} Complete 🎉
          </p>
          <h2 className="text-xl font-bold">Great work!</h2>
        </div>

        <div className="flex flex-col gap-3">
          <section className="rounded-xl bg-muted/60 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              What you wrote
            </p>
            <p className="text-sm leading-relaxed">{STUB_FEEDBACK.whatYouWrote}</p>
          </section>
          <section className="rounded-xl bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold text-emerald-600 mb-1">
              What went great ✨
            </p>
            <p className="text-sm leading-relaxed">{STUB_FEEDBACK.whatWentGreat}</p>
          </section>
          <section className="rounded-xl bg-amber-500/10 p-4">
            <p className="text-xs font-semibold text-amber-600 mb-1">
              Try next time 🚀
            </p>
            <p className="text-sm leading-relaxed">{STUB_FEEDBACK.tryNextTime}</p>
          </section>
        </div>
        <div className="flex flex-wrap gap-2">
          {STUB_FEEDBACK.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            variant="outline"
            onClick={onStartVoice}
            className="flex-1 gap-2"
          >
            🎙️ Talk to Alicia
          </Button>
          <Button onClick={handleContinue} className="flex-1 font-semibold">
            {isLastPage
              ? "Finish Story 🎊"
              : `Continue to Page ${pageNumber + 1} →`}
          </Button>
        </div>
      </div>
    </div>
  );
}
