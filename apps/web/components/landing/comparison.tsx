"use client"

import { useState } from "react"
import Image from "next/image"
import { Badge } from "@workspace/ui/components/badge"
import { GripVertical, Sparkles, Ghost } from "lucide-react"

export function ComparisonSection() {
  const [inset, setInset] = useState<number>(50)
  const [onMouseDown, setOnMouseDown] = useState<boolean>(false)

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onMouseDown) return

    const rect = e.currentTarget.getBoundingClientRect()
    let x = 0

    if ("touches" in e && e.touches.length > 0) {
      const touch = e.touches[0]
      if (touch) x = touch.clientX - rect.left
    } else if ("clientX" in e) {
      x = e.clientX - rect.left
    }

    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100)
    setInset(percentage)
  }

  return (
    <section id="comparison" className="w-full bg-secondary/10 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-6 text-center">
          <Badge
            variant="outline"
            className="rounded-full border-primary/20 px-4 py-1 text-foreground"
          >
            The Evolution of Writing
          </Badge>
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Stop <span className="text-amber-500 italic">Staring</span> at
              Blank Screens.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Traditional writing tools are built for productivity. Alicia is
              built for{" "}
              <span className="font-semibold text-amber-500 italic">
                creativity
              </span>
              .
            </p>
          </div>

          <div className="group relative mx-auto w-full max-w-5xl pt-12">
            <div className="pointer-events-none absolute top-4 left-4 z-30 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-lg border border-muted-foreground bg-muted-foreground px-3 py-1.5 text-sm text-[8px] tracking-widest text-neutral-950 uppercase backdrop-blur-sm">
                <Ghost className="size-3" /> The Boring Way
              </span>
            </div>
            <div className="pointer-events-none absolute top-4 right-4 z-30 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-lg border border-amber-600/20 bg-amber-500/90 px-3 py-1.5 text-sm text-[8px] tracking-widest text-neutral-950 uppercase backdrop-blur-sm">
                <Sparkles className="size-3" /> The Alicia Way
              </span>
            </div>

            <div
              className="relative aspect-video h-full w-full overflow-hidden rounded-3xl border border-border shadow-2xl select-none"
              onMouseMove={onMouseMove}
              onMouseUp={() => setOnMouseDown(false)}
              onTouchMove={onMouseMove}
              onTouchEnd={() => setOnMouseDown(false)}
              onMouseLeave={() => setOnMouseDown(false)}
            >
              <div
                className="absolute top-0 z-20 -ml-px h-full w-0.5 bg-white/30 backdrop-blur-sm select-none"
                style={{
                  left: inset + "%",
                }}
              >
                <button
                  className="absolute top-1/2 z-30 -ml-5 flex h-10 w-10 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-4 border-primary bg-white shadow-xl transition-all select-none hover:scale-110"
                  onTouchStart={(e) => {
                    setOnMouseDown(true)
                    onMouseMove(e)
                  }}
                  onMouseDown={(e) => {
                    setOnMouseDown(true)
                    onMouseMove(e)
                  }}
                >
                  <GripVertical className="h-5 w-5 text-foreground select-none" />
                </button>
              </div>

              <Image
                src="https://images.unsplash.com/photo-1525829528215-ffae12a76ac8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Alicia Vibrant AI Experience"
                width={1920}
                height={1080}
                priority
                className="absolute top-0 left-0 z-10 h-full w-full object-cover select-none"
                style={{
                  clipPath: "inset(0 0 0 " + inset + "%)",
                }}
              />

              <Image
                src="https://images.unsplash.com/photo-1727553957752-bca64c93249e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Traditional Boring Writing Tools"
                width={1920}
                height={1080}
                priority
                className="absolute top-0 left-0 h-full w-full object-cover grayscale select-none"
              />
            </div>
          </div>

          <div className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-12 text-left md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Traditional Methods
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground/60">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-border" />
                  Cold, professional interface designed for adults.
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground/60">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-border" />
                  Zero visual feedback or creative stimulation.
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground/60">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-border" />
                  Linear writing without adaptive assistance.
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold tracking-[0.2em] text-amber-500 uppercase">
                The Alicia Way
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <Sparkles className="mt-1 size-3 shrink-0 text-amber-500" />
                  Vibrant, playful workspace that rewards every word.
                </li>
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <Sparkles className="mt-1 size-3 shrink-0 text-amber-500" />
                  Real-time voice coaching and instant illustrations.
                </li>
                <li className="flex items-start gap-3 text-sm text-foreground">
                  <Sparkles className="mt-1 size-3 shrink-0 text-amber-500" />
                  Gamified Pomodoro sessions to keep kids engaged.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
