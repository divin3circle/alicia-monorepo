"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Plus, Trash2, ChevronRight, ChevronLeft, Loader2, Sparkles, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createProject, type Character } from "@/lib/firestore";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface FormData {
  title: string;
  characters: Character[];
  objective: string;
  setting: string;
}

// ──────────────────────────────────────────────
// Tiny helper components
// ──────────────────────────────────────────────
function InfoPopover({ title, body }: { title: string; body: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="More information"
          className="inline-flex items-center justify-center rounded-full text-slate-400 hover:text-amber-500 transition-colors"
        >
          <Info className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="max-w-xs">
        <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</p>
        <p className="text-slate-500 leading-relaxed">{body}</p>
      </PopoverContent>
    </Popover>
  );
}

function FieldLabel({
  label,
  htmlFor,
  popoverTitle,
  popoverBody,
}: {
  label: string;
  htmlFor?: string;
  popoverTitle: string;
  popoverBody: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <InfoPopover title={popoverTitle} body={popoverBody} />
    </div>
  );
}

// ──────────────────────────────────────────────
// Step definitions
// ──────────────────────────────────────────────
const STEPS = [
  { id: "title", label: "Story Title" },
  { id: "characters", label: "Characters" },
  { id: "objective", label: "Objective" },
  { id: "setting", label: "Setting" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

// ──────────────────────────────────────────────
// Per-step content
// ──────────────────────────────────────────────
function StepTitle({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel
          htmlFor="story-title"
          label="Story Title"
          popoverTitle="What's your story called?"
          popoverBody="Pick a catchy name that hints at the adventure inside. Example: 'Zara and the Rainbow Kingdom' or 'The Robot Who Loved Pancakes'."
        />
        <input
          id="story-title"
          type="text"
          value={data.title}
          maxLength={80}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Leo and the Lost Star"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {data.title.length}/80
        </p>
      </div>
    </div>
  );
}

function StepCharacters({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  const updateCharacter = (index: number, patch: Partial<Character>) => {
    const next = data.characters.map((c, i) =>
      i === index ? { ...c, ...patch } : c
    );
    onChange({ characters: next });
  };

  const addCharacter = () => {
    onChange({ characters: [...data.characters, { name: "", description: "" }] });
  };

  const removeCharacter = (index: number) => {
    onChange({ characters: data.characters.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-col gap-5">
      {data.characters.map((char, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3 bg-slate-50 dark:bg-slate-800/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Character {i + 1}
            </span>
            {data.characters.length > 1 && (
              <button
                type="button"
                onClick={() => removeCharacter(i)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove character"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>

          <div>
            <FieldLabel
              htmlFor={`char-name-${i}`}
              label="Name"
              popoverTitle="Character Name"
              popoverBody="What is this character called? Make it memorable! Example: 'Zara', 'Max the Penguin', 'Captain Biscuit'."
            />
            <input
              id={`char-name-${i}`}
              type="text"
              value={char.name}
              maxLength={40}
              onChange={(e) => updateCharacter(i, { name: e.target.value })}
              placeholder="e.g. Luna the brave girl"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          <div>
            <FieldLabel
              htmlFor={`char-desc-${i}`}
              label="About them"
              popoverTitle="Character Description"
              popoverBody="Describe who this character is in 1–2 sentences. What do they care about? What makes them special or funny? Example: 'Luna is 8 years old and loves science, but is scared of insects.'"
            />
            <textarea
              id={`char-desc-${i}`}
              rows={2}
              value={char.description}
              maxLength={200}
              onChange={(e) => updateCharacter(i, { description: e.target.value })}
              placeholder="e.g. A curious 7-year-old who talks to animals and collects shiny rocks."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
            />
          </div>
        </div>
      ))}

      {data.characters.length < 5 && (
        <button
          type="button"
          onClick={addCharacter}
          className="flex items-center gap-2 self-start rounded-xl border border-dashed border-slate-300 dark:border-slate-600 px-4 py-2 text-xs font-semibold text-slate-500 hover:border-amber-400 hover:text-amber-500 transition-colors"
        >
          <Plus className="size-3.5" />
          Add character
        </button>
      )}
    </div>
  );
}

function StepObjective({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel
          htmlFor="story-objective"
          label="Story Objective"
          popoverTitle="Who wants what — and why?"
          popoverBody="Write one sentence that captures the heart of the story. Format: '[Character] wants to [goal] because [reason].' Example: 'Leo wants to find his lost sister because he promised their dad he'd keep her safe.'"
        />
        <textarea
          id="story-objective"
          rows={4}
          value={data.objective}
          maxLength={300}
          onChange={(e) => onChange({ objective: e.target.value })}
          placeholder="e.g. Zara wants to reach the Cloud Palace before sunset because that's the only way to save the sleeping dragons."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
        />

        {/* Example chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "[Hero] wants to [goal] because [reason].",
            "Who? → What? → Why?",
          ].map((tip) => (
            <span
              key={tip}
              className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1 text-xs text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            >
              {tip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSetting({
  data,
  onChange,
}: {
  data: FormData;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel
          htmlFor="story-setting"
          label="Story Setting"
          popoverTitle="Where does this story happen?"
          popoverBody="Paint a picture of the world. Where does it take place? What does it look, smell, and feel like? Is it cosy or dangerous? Example: 'A floating island above the clouds, filled with glowing mushrooms and friendly storm elephants.'"
        />
        <textarea
          id="story-setting"
          rows={5}
          value={data.setting}
          maxLength={400}
          onChange={(e) => onChange({ setting: e.target.value })}
          placeholder="e.g. A hidden underwater city lit by bioluminescent coral, where mermaids and dolphins run a nightly market selling moon-pearls and starfish sandwiches."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {data.setting.length}/400
        </p>
      </div>

      {/* Setting prompt helpers */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
        <p className="font-semibold text-amber-600 dark:text-amber-400 mb-2">💡 Think about…</p>
        <p>📍 <strong>Where?</strong> Forest, city, space, underwater, another dimension?</p>
        <p>🎨 <strong>Look &amp; feel?</strong> Colours, textures, sounds?</p>
        <p>⚡ <strong>Mood?</strong> Cosy, mysterious, dangerous, magical?</p>
        <p>🌟 <strong>Special rules?</strong> Does magic exist? What's surprising?</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Validation per step
// ──────────────────────────────────────────────
function isStepValid(step: StepId, data: FormData): boolean {
  if (step === "title") return data.title.trim().length > 0;
  if (step === "characters")
    return data.characters.every(
      (c) => c.name.trim().length > 0 && c.description.trim().length > 0
    );
  if (step === "objective") return data.objective.trim().length > 0;
  if (step === "setting") return data.setting.trim().length > 0;
  return false;
}

// ──────────────────────────────────────────────
// Main wizard
// ──────────────────────────────────────────────
export function NewProjectForm() {
  const { user } = useAuth();
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<FormData>({
    title: "",
    characters: [{ name: "", description: "" }],
    objective: "",
    setting: "",
  });

  const currentStep = STEPS[stepIndex]!;
  const isLast = stepIndex === STEPS.length - 1;

  const patch = (partial: Partial<FormData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const goNext = () => {
    if (!isStepValid(currentStep.id, data)) return;
    setDirection(1);
    setStepIndex((i) => i + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStepIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createProject({
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        title: data.title.trim(),
        characters: data.characters,
        objective: data.objective.trim(),
        setting: data.setting.trim(),
      });
      router.push(`/creator?created=${id}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  // ── Slide animation variants
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress bar + step indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={step.id} className="flex items-center gap-2 flex-1 last:flex-none">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    done
                      ? "border-amber-500 bg-amber-500 text-white"
                      : active
                      ? "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                      : "border-slate-200 dark:border-slate-700 text-slate-400"
                  }`}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${
                    active ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                      i < stepIndex
                        ? "bg-amber-400"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 p-6 lg:p-8 shadow-sm overflow-hidden relative min-h-[360px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            {/* Step heading */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="size-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Step {stepIndex + 1} of {STEPS.length}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {currentStep.label}
              </h2>
            </div>

            {/* Render current step */}
            {currentStep.id === "title" && (
              <StepTitle data={data} onChange={patch} />
            )}
            {currentStep.id === "characters" && (
              <StepCharacters data={data} onChange={patch} />
            )}
            {currentStep.id === "objective" && (
              <StepObjective data={data} onChange={patch} />
            )}
            {currentStep.id === "setting" && (
              <StepSetting data={data} onChange={patch} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-500 font-medium">{error}</p>
      )}

      {/* Navigation controls */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="size-4" />
          Back
        </Button>

        {isLast ? (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep.id, data) || saving}
            className="gap-2 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Create Story
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!isStepValid(currentStep.id, data)}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-6 py-4"
          >
            Continue
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
