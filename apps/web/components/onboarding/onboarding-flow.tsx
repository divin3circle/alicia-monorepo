"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  Book, 
  Tv, 
  Heart,
  Baby,
  User,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";
import { FluidDropdown, DropdownItem } from "@/components/ui/fluid-dropdown";
import { useAuth } from "@/lib/auth-context";
import { saveUserProfile } from "@/lib/firestore";

const STEPS = [
  { id: "basics", title: "The Basics", description: "Who is the young author?" },
  { id: "interests", title: "Interests", description: "What makes your heart skip a beat?" },
  { id: "media", title: "Inspirations", description: "Your favorite stories and shows" },
];

const INTEREST_OPTIONS = [
  "Painting & Drawing", "Dinosaurs", "Space & Planets", "Magic & Wizards",
  "Cooking", "Animals & Nature", "Sports", "Music", "Video Games",
  "Robots", "Superheroes", "Fairy Tales", "Environment", "Exploring"
].map(name => ({ id: name, label: name, icon: Heart, color: "#f43f5e" }));

const SHOW_OPTIONS: DropdownItem[] = [
  "Bluey", "Cocomelon", "Paw Patrol", "The Dragon Prince", "She-Ra",
  "Steven Universe", "Peppa Pig", "Nature Documentaries", "Science Max"
].map(name => ({ id: name, label: name, icon: Tv, color: "#8b5cf6" }));

const BOOK_OPTIONS: DropdownItem[] = [
  "Harry Potter", "The Very Hungry Caterpillar", "Where the Wild Things Are",
  "Chronicles of Narnia", "Percy Jackson", "Wonder", "The BFG"
].map(name => ({ id: name, label: name, icon: Book, color: "#f59e0b" }));

interface OnboardingData {
  username: string;
  age: string;
  interests: string[];
  favoriteShow: string;
  favoriteBook: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function OnboardingFlow() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    username: "",
    age: "",
    interests: [],
    favoriteShow: "",
    favoriteBook: "",
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setData((prev) => {
      const interests = [...prev.interests];
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter((i) => i !== interest) };
      } else {
        if (interests.length >= 5) {
          toast.error("Max 5 interests allowed");
          return prev;
        }
        return { ...prev, interests: [...interests, interest] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Not signed in. Please log in again.");
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        username: data.username,
        age: data.age,
        interests: data.interests,
        favoriteShow: data.favoriteShow,
        favoriteBook: data.favoriteBook,
      });
      toast.success("Profile completed! Welcome to Alicia 🎉");
      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Onboarding save failed:", err);
      toast.error("Couldn't save your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return data.username.trim() !== "" && data.age !== "";
      case 1: return data.interests.length >= 3;
      case 2: return data.favoriteShow !== "" && data.favoriteBook !== "";
      default: return true;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-6">
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex justify-between items-center relative gap-4">
          <div className="absolute top-1/3 left-0 w-full h-[1px] bg-border -z-10" />
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center px-2">
              <motion.div
                className={cn(
                  "size-10 rounded-2xl flex items-center bg-background justify-center border-2 transition-all duration-500",
                  index < currentStep ? "bg-amber-500/80 border-amber-500/20 text-white" :
                  index === currentStep ? "bg-background border-amber-500/40 text-amber-600 dark:text-amber-400" :
                  "bg-background border-border text-muted-foreground"
                )}
                animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {index < currentStep ? <Check className="size-5" strokeWidth={3} /> : (index + 1)}
              </motion.div>
              <span className={cn(
                "text-[10px] mt-2 font-bold uppercase tracking-widest",
                index === currentStep ? "text-amber-600" : "text-muted-foreground opacity-50"
              )}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-none shadow-xl bg-background/40 backdrop-blur-xl rounded-[2.5rem]">
            <CardHeader className="pt-10 px-10">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl font-black tracking-tight">{STEPS[currentStep]?.title}</CardTitle>
              </div>
              <CardDescription className="text-lg font-medium opacity-80">{STEPS[currentStep]?.description}</CardDescription>
            </CardHeader>

            <CardContent className="px-10 pb-10">
              {currentStep === 0 && (
                <div className="space-y-6">
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-3">
                    <Label className="text-base font-bold flex items-center gap-2">
                      <User className="size-4 text-amber-500" /> What shall we call you?
                    </Label>
                    <Input
                      placeholder="e.g. Captain Storyteller"
                      value={data.username}
                      onChange={(e) => updateData("username", e.target.value)}
                      className="h-14 rounded-2xl bg-white/5 border-2 border-white/10 focus:border-amber-500/50 text-lg font-medium px-6"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="space-y-3">
                    <Label className="text-base font-bold flex items-center gap-2">
                      <Baby className="size-4 text-amber-500" /> How old are you?
                    </Label>
                    <Select value={data.age} onValueChange={(val: string) => updateData("age", val)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-2 border-white/10">
                        <SelectValue placeholder="Select your age" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 9 }, (_, i) => i + 3).map(age => (
                          <SelectItem key={age} value={age.toString()}>{age} Years Old</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <Label className="text-base font-bold flex items-center gap-2 mb-4">
                    Select 3-5 things you love:
                  </Label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {INTEREST_OPTIONS.map((option) => {
                      const isSelected = data.interests.includes(option.id);
                      return (
                        <motion.button
                          key={option.id}
                          type="button"
                          onClick={() => toggleInterest(option.id)}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                            isSelected ? "bg-amber-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400" :
                            "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={cn("p-1.5 rounded-lg", isSelected ? "bg-amber-500/20" : "bg-white/10")}>
                            <Heart className={cn("size-4", isSelected ? "fill-current" : "")} />
                          </div>
                          <span className="font-bold text-sm tracking-tight">{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {data.interests.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 flex flex-wrap gap-2 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20"
                      >
                        <span className="w-full text-[10px] font-black uppercase tracking-widest text-amber-600/60 mb-1">Your Selection:</span>
                        {data.interests.map((interest) => (
                          <motion.div
                            key={interest}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold"
                          >
                            <Heart className="size-3 fill-current" />
                            {interest}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-base font-bold flex items-center gap-2">
                      Favorite kid&apos;s show?
                    </Label>
                    <FluidDropdown 
                      items={SHOW_OPTIONS} 
                      onSelect={(item) => updateData("favoriteShow", item.id)}
                      placeholder="Pick a show..."
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-base font-bold flex items-center gap-2">
                      Favorite book?
                    </Label>
                    <FluidDropdown 
                      items={BOOK_OPTIONS} 
                      onSelect={(item) => updateData("favoriteBook", item.id)}
                      placeholder="Pick a book..."
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="px-10 pb-10 flex justify-between gap-4">
              <Button
                variant="ghost"
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="h-14 px-8 rounded-2xl font-bold opacity-60 hover:opacity-100"
              >
                <ChevronLeft className="size-5 mr-2" /> Back
              </Button>

              <Button
                type="button"
                onClick={currentStep === STEPS.length - 1 ? handleSubmit : nextStep}
                disabled={!isStepValid() || isSubmitting}
                className={cn(
                  "h-14 flex-1 rounded-2xl border-amber-500 font-black text-lg transition-all duration-300 shadow-lg",
                  isStepValid() ? "bg-amber-500/90 text-white hover:bg-amber-500 hover:shadow-amber-500/10" : ""
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <>
                    {currentStep === STEPS.length - 1 ? "Finish Journey" : "Next Adventure"}
                    <ChevronRight className="size-5 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          Step {currentStep + 1} of {STEPS.length} — Magical Onboarding
        </p>
      </div>
    </div>
  );
}
