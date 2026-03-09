"use client";

import { useState } from "react";
import { Sparkles, Crown, Check, ArrowRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function PricingSection() {
  const [explorerFast, setExplorerFast] = useState(false);
  const [proPriority, setProPriority] = useState(true);

  const CheckIcon = ({ className = "" }: { className?: string }) => (
    <div className={cn("rounded-full p-0.5 bg-primary/10 text-primary", className)}>
      <Check className="size-3" strokeWidth={3} />
    </div>
  );

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    isDark = false,
  }: {
    enabled: boolean;
    onChange: (v: boolean) => void;
    label: string;
    isDark?: boolean;
  }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ring-1 ring-inset",
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
            "inline-block h-3.5 w-3.5 transform rounded-full transition-transform shadow-sm",
            enabled ? "translate-x-5.5" : "translate-x-1",
            isDark ? (enabled ? "bg-neutral-900" : "bg-neutral-500") : "bg-white"
          )}
        />
      </button>
      <span className={cn("text-[10px] font-medium uppercase tracking-wider", isDark ? "text-neutral-400" : "text-neutral-500")}>
        {label}
      </span>
    </div>
  );

  const explorerFeatures = [
    "1 Active Story Project",
    "Basic AI Illustration",
    "Text-based Coaching",
    "Community Marketplace",
    "Ages 3-11 Tiering",
  ];

  const proFeatures = [
    "Unlimited Story Projects",
    "Premium AI Art (Imagen 3)",
    "Live Voice Coaching (Gemini Live)",
    "Gibbs Feedback Summaries",
    "PDF & Kindle Exports",
    "Custom Character Bible",
  ];

  return (
    <section id="pricing" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary">
            Simple plans for <span className="text-amber-500 italic">every</span> storyteller.
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Choose the path that fits your child's creative journey. Upgrade anytime to unlock real-time voice coaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[900px] mx-auto">
          <div className="rounded-3xl p-2 bg-white/65 backdrop-blur-md border border-neutral-200/70 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.1) dark:bg-white/5">
            <div className="rounded-2xl p-8 mb-2 bg-white/80 backdrop-blur-sm border border-neutral-200/80 ring-1 ring-inset ring-neutral-900/5 dark:bg-neutral-950/40">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="size-4 text-amber-500" />
                    <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Explorer</h3>
                  </div>
                  <p className="text-neutral-500 text-sm leading-relaxed">
                    Perfect for starting your first adventure.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600 backdrop-blur">
                  Free
                </span>
              </div>

              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-bold tracking-tighter text-neutral-900 dark:text-white">$0</span>
                <span className="text-neutral-400 text-lg ml-1">/mo</span>
              </div>

              <Link href="/onboarding" className="w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl font-bold gap-2">
                  Start Writing Free
                </Button>
              </Link>
            </div>

            <div className="px-6 pb-6 pt-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-200/70 dark:bg-neutral-900/20">
              <div className="grid grid-cols-1 gap-y-3">
                {explorerFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <CheckIcon className="size-4 shrink-0" />
                    <span className="text-neutral-700 text-xs font-medium dark:text-neutral-300">{feature}</span>
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
          <div className="rounded-3xl p-2 bg-neutral-900/60 backdrop-blur-md border border-neutral-800 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/5">
            <div className="rounded-2xl p-8 mb-2 bg-neutral-900/70 backdrop-blur-sm border border-neutral-800 ring-1 ring-inset ring-white/10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="size-4 text-amber-400" />
                    <h3 className="text-2xl font-bold tracking-tight text-white">Author Pro</h3>
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    The ultimate toolkit for young authors.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur">
                  Best Value
                </span>
              </div>

              <div className="flex items-baseline mb-8">
                <span className="text-5xl font-bold tracking-tighter text-white">$12</span>
                <span className="text-neutral-500 text-lg ml-1">/mo</span>
              </div>

              <Link href="/onboarding" className="w-full">
                <Button variant="default" className="w-full h-12 rounded-xl font-bold gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 border-none shadow-[0_8px_16px_-4px_rgba(245,158,11,0.4)]">
                  Go Pro Now <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>

            <div className="px-6 pb-6 pt-4 bg-neutral-950/40 backdrop-blur-sm rounded-2xl border border-neutral-800 ring-1 ring-inset ring-white/5">
              <div className="grid grid-cols-1 gap-y-3">
                {proFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <div className="rounded-full p-0.5 bg-amber-400/10 text-amber-400">
                      <Check className="size-3" strokeWidth={3} />
                    </div>
                    <span className="text-neutral-300 text-xs font-medium">{feature}</span>
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

        <p className="mt-12 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-50">
          Secure Payments with Stripe · Pause or Cancel Anytime
        </p>
      </div>
    </section>
  );
}
