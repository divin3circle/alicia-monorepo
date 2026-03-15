"use client"

import { useState } from "react"
import { Sparkles, Crown, Check, ArrowRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export function PricingSection() {
  const [explorerFast, setExplorerFast] = useState(false)
  const [proPriority, setProPriority] = useState(true)

  const CheckIcon = ({ className = "" }: { className?: string }) => (
    <div
      className={cn(
        "rounded-full bg-primary/10 p-0.5 text-foreground",
        className
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </div>
  )

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    isDark = false,
  }: {
    enabled: boolean
    onChange: (v: boolean) => void
    label: string
    isDark?: boolean
  }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-5 w-10 items-center rounded-full ring-1 transition-colors ring-inset focus:outline-none",
          enabled
            ? isDark
              ? "bg-amber-400 ring-amber-500"
              : "bg-primary ring-primary"
            : isDark
              ? "bg-neutral-800 ring-neutral-700"
              : "bg-neutral-200 ring-neutral-300"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full shadow-sm transition-transform",
            enabled ? "translate-x-5.5" : "translate-x-1",
            isDark
              ? enabled
                ? "bg-neutral-900"
                : "bg-neutral-500"
              : "bg-white"
          )}
        />
      </button>
      <span
        className={cn(
          "text-[10px] font-medium tracking-wider uppercase",
          isDark ? "text-neutral-400" : "text-neutral-500"
        )}
      >
        {label}
      </span>
    </div>
  )

  const explorerFeatures = [
    "1 Active Story Project",
    "Basic AI Illustration",
    "Text-based Coaching",
    "Community Marketplace",
    "Ages 3-11 Tiering",
  ]

  const proFeatures = [
    "Unlimited Story Projects",
    "Premium AI Art (Imagen 3)",
    "Live Voice Coaching (Gemini Live)",
    "Gibbs Feedback Summaries",
    "PDF & Kindle Exports",
    "Custom Character Bible",
  ]

  return (
    <section id="pricing" className="relative overflow-hidden px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 space-y-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Simple plans for{" "}
            <span className="text-amber-500 italic">every</span> storyteller.
          </h2>
          <p className="mx-auto max-w-lg text-sm text-muted-foreground md:text-base">
            Choose the path that fits your child's creative journey. Upgrade
            anytime to unlock real-time voice coaching.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 gap-8 md:grid-cols-2">
          <div className="shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1) rounded-3xl border border-neutral-200/70 bg-white/65 p-2 backdrop-blur-md dark:bg-white/5">
            <div className="mb-2 rounded-2xl border border-neutral-200/80 bg-white/80 p-8 ring-1 ring-neutral-900/5 backdrop-blur-sm ring-inset dark:bg-neutral-950/40">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-500" />
                    <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      Explorer
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    Perfect for starting your first adventure.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white/70 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-neutral-600 uppercase backdrop-blur">
                  Free
                </span>
              </div>

              <div className="mb-8 flex items-baseline">
                <span className="text-5xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                  $0
                </span>
                <span className="ml-1 text-lg text-neutral-400">/mo</span>
              </div>

              <Link href="/onboarding" className="w-full">
                <Button
                  variant="outline"
                  className="h-12 w-full gap-2 rounded-xl font-bold"
                >
                  Start Writing Free
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-neutral-200/70 bg-white/50 px-6 pt-4 pb-6 backdrop-blur-sm dark:bg-neutral-900/20">
              <div className="grid grid-cols-1 gap-y-3">
                {explorerFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <CheckIcon className="size-4 shrink-0" />
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <ToggleSwitch
                  enabled={explorerFast}
                  onChange={setExplorerFast}
                  label="Community Support"
                />
              </div>
            </div>
          </div>

          {/* Paid Tier: Author Pro */}
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-2 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.4)] ring-1 ring-white/5 backdrop-blur-md ring-inset">
            <div className="mb-2 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-8 ring-1 ring-white/10 backdrop-blur-sm ring-inset">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Crown className="size-4 text-amber-400" />
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                      Author Pro
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    The ultimate toolkit for young authors.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-400 uppercase backdrop-blur">
                  Best Value
                </span>
              </div>

              <div className="mb-8 flex items-baseline">
                <span className="text-5xl font-bold tracking-tighter text-white">
                  $12
                </span>
                <span className="ml-1 text-lg text-neutral-500">/mo</span>
              </div>

              <Link href="/onboarding" className="w-full">
                <Button
                  variant="default"
                  className="h-12 w-full gap-2 rounded-xl border-none bg-amber-500 font-bold text-neutral-950 shadow-[0_8px_16px_-4px_rgba(245,158,11,0.4)] hover:bg-amber-600"
                >
                  Go Pro Now <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 px-6 pt-4 pb-6 ring-1 ring-white/5 backdrop-blur-sm ring-inset">
              <div className="grid grid-cols-1 gap-y-3">
                {proFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <div className="rounded-full bg-amber-400/10 p-0.5 text-amber-400">
                      <Check className="size-3" strokeWidth={3} />
                    </div>
                    <span className="text-xs font-medium text-neutral-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <ToggleSwitch
                  enabled={proPriority}
                  onChange={setProPriority}
                  label="Priority AI Queue"
                  isDark
                />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase opacity-50">
          Secure Payments with Stripe · Pause or Cancel Anytime
        </p>
      </div>
    </section>
  )
}
