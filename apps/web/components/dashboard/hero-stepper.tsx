"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, Sparkles, Search, BookOpen, Star } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const steps = [
  {
    id: 1,
    title: "Create Project",
    description: "Start by setting up your story world and characters.",
    icon: Sparkles,
    visual: {
      heading: "Build your story universe",
      subheading: "Define your world, characters, and narrative arc in minutes with AI assistance.",
      cta: "Create Project",
    },
  },
  {
    id: 2,
    title: "Find Story Ideas with AI",
    description: "Let Alicia surface great plot ideas and narrative hooks for you.",
    icon: Search,
    visual: {
      heading: "AI-powered story discovery",
      subheading: "Alicia analyzes trends and your profile to suggest story ideas your audience will love.",
      cta: "Find Ideas",
    },
  },
  {
    id: 3,
    title: "Generate Story with AI",
    description: "Turn your ideas into fully-formed, personalized stories instantly.",
    icon: BookOpen,
    visual: {
      heading: "From idea to story in seconds",
      subheading: "Our AI crafts age-appropriate, engaging content based on the child's interests and reading level.",
      cta: "Generate Story",
    },
  },
  {
    id: 4,
    title: "Review & Publish",
    description: "Polish your story and share it with families worldwide.",
    icon: Star,
    visual: {
      heading: "Ready for young readers",
      subheading: "Review, customize, and publish your story to families who can enjoy it forever.",
      cta: "Start Review",
    },
  },
]

export function HeroStepper() {
  const [activeStep, setActiveStep] = useState(0)

  const step = steps[activeStep]

  return (
    <div className="rounded-3xl border border-slate-500/10 bg-white dark:bg-slate-900 shadow-sm mb-8 overflow-hidden">
      <div className="grid md:grid-cols-[1fr_1.4fr]">
        {/* Left: Steps */}
        <div className="p-6 border-r border-slate-500/10">
          <div className="space-y-1">
            {steps.map((s, i) => {
              const isCompleted = i < activeStep
              const isActive = i === activeStep
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all",
                    isActive ? "bg-amber-500/10" : "hover:bg-slate-500/5"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-5 text-amber-500 shrink-0" />
                  ) : (
                    <div className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold",
                      isActive ? "border-amber-500 text-amber-500" : "border-slate-300 text-slate-400"
                    )}>
                      {s.id}
                    </div>
                  )}
                  <div>
                    <p className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-amber-600 dark:text-amber-400" : isCompleted ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
                    )}>
                      {s.title}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Visual */}
        <div className="relative p-8 flex flex-col justify-between bg-gradient-to-br from-amber-500/5 to-purple-500/5 min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="size-12 rounded-2xl bg-amber-500/15 flex items-center justify-center mb-4">
                <step.icon className="size-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">
                {step.visual.heading}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                {step.visual.subheading}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center gap-3">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20 font-bold">
              {step.visual.cta}
            </Button>
            {activeStep < steps.length - 1 && (
              <Button
                variant="ghost"
                className="text-slate-500"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                Next step →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
