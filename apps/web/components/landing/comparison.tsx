"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@workspace/ui/components/badge";
import { GripVertical, Sparkles, Ghost } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export function ComparisonSection() {
  const [inset, setInset] = useState<number>(50);
  const [onMouseDown, setOnMouseDown] = useState<boolean>(false);

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onMouseDown) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let x = 0;

    if ("touches" in e && e.touches.length > 0) {
      const touch = e.touches[0];
      if (touch) x = touch.clientX - rect.left;
    } else if ("clientX" in e) {
      x = e.clientX - rect.left;
    }
    
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setInset(percentage);
  };

  return (
    <section id="comparison" className="w-full py-24 lg:py-32 bg-secondary/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col gap-6 items-center text-center">
          <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 text-primary">
            The Evolution of Writing
          </Badge>
          <div className="flex gap-4 flex-col max-w-2xl">
            <h2 className="text-4xl md:text-6xl tracking-tight font-bold text-primary">
              Stop <span className="text-amber-500 italic">Staring</span> at Blank Screens.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Traditional writing tools are built for productivity. Alicia is built for <span className="text-amber-500 font-semibold italic">creativity</span>.
            </p>
          </div>

          <div className="pt-12 w-full max-w-5xl mx-auto relative group">
            <div className="absolute top-4 left-4 z-30 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60">
                <span className="bg-neutral-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[8px] md:text-sm uppercase tracking-widest flex items-center gap-2 border border-white/10">
                    <Ghost className="size-3" /> The Boring Way
                </span>
            </div>
            <div className="absolute top-4 right-4 z-30 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60">
                <span className="bg-amber-500/90 backdrop-blur-sm text-neutral-950 px-3 py-1.5 rounded-lg text-[8px] text-sm uppercase tracking-widest flex items-center gap-2 border border-amber-600/20">
                    <Sparkles className="size-3" /> The Alicia Way
                </span>
            </div>

            <div
              className="relative aspect-[16/9] w-full h-full overflow-hidden rounded-3xl select-none border border-border shadow-2xl"
              onMouseMove={onMouseMove}
              onMouseUp={() => setOnMouseDown(false)}
              onTouchMove={onMouseMove}
              onTouchEnd={() => setOnMouseDown(false)}
              onMouseLeave={() => setOnMouseDown(false)}
            >
              <div
                className="bg-white/30 backdrop-blur-sm h-full w-0.5 absolute z-20 top-0 -ml-px select-none"
                style={{
                  left: inset + "%",
                }}
              >
                <button
                  className="bg-white rounded-full shadow-xl hover:scale-110 transition-all w-10 h-10 select-none -translate-y-1/2 absolute top-1/2 -ml-5 z-30 cursor-ew-resize flex justify-center items-center border-4 border-primary"
                  onTouchStart={(e) => {
                    setOnMouseDown(true);
                    onMouseMove(e);
                  }}
                  onMouseDown={(e) => {
                    setOnMouseDown(true);
                    onMouseMove(e);
                  }}
                >
                  <GripVertical className="h-5 w-5 select-none text-primary" />
                </button>
              </div>

              {/* Our Shot (Right Side, Clipped from Left) */}
              <Image
                src="https://images.unsplash.com/photo-1525829528215-ffae12a76ac8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Alicia Vibrant AI Experience"
                width={1920}
                height={1080}
                priority
                className="absolute left-0 top-0 z-10 w-full h-full object-cover select-none"
                style={{
                  clipPath: "inset(0 0 0 " + inset + "%)",
                }}
              />

              {/* Competitive Shot (Underneath) */}
              <Image
                src="https://images.unsplash.com/photo-1727553957752-bca64c93249e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Traditional Boring Writing Tools"
                width={1920}
                height={1080}
                priority
                className="absolute left-0 top-0 w-full h-full object-cover select-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20 text-left w-full max-w-4xl">
              <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Traditional Methods</h4>
                  <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-muted-foreground/60">
                         <span className="mt-1 size-1.5 rounded-full bg-border shrink-0" />
                         Cold, professional interface designed for adults.
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground/60">
                         <span className="mt-1 size-1.5 rounded-full bg-border shrink-0" />
                         Zero visual feedback or creative stimulation.
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground/60">
                         <span className="mt-1 size-1.5 rounded-full bg-border shrink-0" />
                         Linear writing without adaptive assistance.
                      </li>
                  </ul>
              </div>
              <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-[0.2em] text-amber-500 font-bold">The Alicia Way</h4>
                  <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-primary">
                         <Sparkles className="mt-1 size-3 text-amber-500 shrink-0" />
                         Vibrant, playful workspace that rewards every word.
                      </li>
                      <li className="flex items-start gap-3 text-sm text-primary">
                         <Sparkles className="mt-1 size-3 text-amber-500 shrink-0" />
                         Real-time voice coaching and instant illustrations.
                      </li>
                      <li className="flex items-start gap-3 text-sm text-primary">
                         <Sparkles className="mt-1 size-3 text-amber-500 shrink-0" />
                         Gamified Pomodoro sessions to keep kids engaged.
                      </li>
                  </ul>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
