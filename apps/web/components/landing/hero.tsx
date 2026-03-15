"use client"

import { useEffect } from "react"
import Link from "next/link"
import { renderCanvas } from "@/lib/canvas"
import {
  ArrowRight,
  BookOpenText,
  Sparkle,
  PencilSimple,
} from "@phosphor-icons/react"
import { Button } from "@workspace/ui/components/button"
import { FeatureCloud } from "./features-cloud"

export function Hero() {
  useEffect(() => {
    renderCanvas()
  }, [])

  return (
    <section id="home" className="relative overflow-hidden">
      <canvas
        className="pointer-events-none absolute inset-0 mx-auto"
        id="hero-canvas"
      />

      <div className="animate-fadeIn relative z-10 mt-20 flex flex-col items-center justify-center px-4 text-center md:mt-20">
        <div className="z-10 mt-10 mb-6 sm:justify-center md:mt-20 md:mb-4">
          <div className="relative flex items-center rounded-full border bg-popover px-3 py-1 text-xs leading-6 whitespace-nowrap text-foreground/60">
            <Sparkle weight="fill" className="mr-1.5 h-4 w-4 text-amber-400" />
            Now in Early Access -
            <Link
              href="/onboarding"
              className="ml-1 flex items-center font-semibold hover:text-foreground"
            >
              <span className="absolute inset-0 flex" aria-hidden="true" />
              Write your first story <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-4 mb-10 md:mt-6">
          <div className="px-2">
            <div className="relative mx-auto h-full max-w-7xl border border-dashed border-border mask-[radial-gradient(800rem_96rem_at_center,white,transparent)] p-6 md:px-12 md:py-20">
              <span className="absolute -top-4 -left-2 text-lg font-bold text-foreground select-none">
                ✚
              </span>
              <span className="absolute -top-4 -right-2 text-lg font-bold text-foreground select-none">
                ✚
              </span>
              <span className="absolute -bottom-3.5 -left-2 text-lg font-bold text-foreground select-none">
                ✚
              </span>
              <span className="absolute -right-2 -bottom-3.5 text-lg font-bold text-foreground select-none">
                ✚
              </span>

              <h1 className="flex flex-col px-3 py-2 text-center text-5xl leading-none font-semibold tracking-tight select-none md:flex-col md:text-8xl lg:flex-row lg:text-8xl">
                Your AI writing&nbsp;coach for little storytellers.
              </h1>

              <div className="mt-4 flex items-center justify-center gap-1.5">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                <p className="text-xs text-green-500">
                  Voice Coaching Available Now
                </p>
              </div>

              <FeatureCloud />
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-2xl font-medium md:text-2xl">
              <BookOpenText
                weight="duotone"
                className="h-7 w-7 text-amber-400"
              />
              <span>
                Where children ages{" "}
                <span className="font-bold text-foreground">3–11</span> write
                their first real book.
              </span>
            </div>
          </div>

          <p className="mx-auto mt-4 mb-16 max-w-2xl px-6 text-sm text-foreground/60 sm:px-6 md:max-w-4xl md:px-20">
            Alicia pairs adaptive AI coaching with Pomodoro-paced sessions to
            guide young writers through creating a fully-illustrated
            children&apos;s storybook — then lets them share it with the world.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/onboarding">
              <Button
                variant="default"
                size="lg"
                className="gap-2 rounded-xl bg-foreground px-8 py-6 text-background transition-all ease-in hover:bg-foreground/90"
              >
                <PencilSimple weight="bold" className="h-4 w-4" />
                Start Your Story
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-xl px-8 py-6"
              >
                See how it works
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 backdrop-blur-sm">
              ✦ Ages 3 - 11
            </span>
            <span className="flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 backdrop-blur-sm">
              ✦ AI-generated illustrations
            </span>
            <span className="flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 backdrop-blur-sm">
              ✦ Live voice coaching sessions
            </span>
            <span className="flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 backdrop-blur-sm">
              ✦ Export your storybook as PDF
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
