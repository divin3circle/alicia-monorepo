"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Sparkles, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Hexagon } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Typewriter ─────────────────────────────────────────────────────────────

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary/60 dark:text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// ─── Google Icon ─────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Auth Form ────────────────────────────────────────────────────────────────

function AuthFormContainer() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      toast.success("Welcome to Alicia!");
      router.push("/onboarding");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      // User closed the popup — don't show an error toast
      if ((err as { code?: string })?.code === "auth/popup-closed-by-user") return;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-[350px] gap-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="p-3 bg-amber-500/10 rounded-2xl">
          <Hexagon className="h-6 w-6 text-amber-500 stroke-[1.5]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Alicia</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Sign in to continue your storytelling journey
        </p>
      </div>

      {/* Sign In Button */}
      <div className="grid gap-3">
        <Button
          variant="outline"
          type="button"
          className="h-12 font-bold gap-3 rounded-xl text-base"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {loading ? "Signing in…" : "Continue with Google"}
        </Button>
      </div>

      {/* Footer */}
      <p className="px-8 text-center text-[9px] uppercase text-muted-foreground leading-relaxed">
        By continuing, you agree to our{" "}
        <a
          href="https://github.com/divin3circle"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="https://github.com/divin3circle"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy
        </a>
        .
      </p>
    </div>
  );
}

// ─── Side Panel Content ───────────────────────────────────────────────────────

interface AuthContentProps {
  image?: { src: string; alt: string };
  quote?: { text: string; author: string };
}

interface AuthUIProps {
  content?: AuthContentProps;
}

const defaultContent: Required<AuthContentProps> = {
  image: {
    src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2073&auto=format&fit=crop",
    alt: "Writing nook with books and a pen",
  },
  quote: {
    text: "Every great book was once just a collection of small ideas.",
    author: "Alicia AI Coach",
  },
};

export function AuthUI({ content = {} }: AuthUIProps) {
  const finalContent = {
    image: { ...defaultContent.image, ...content.image },
    quote: { ...defaultContent.quote, ...content.quote },
  };

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2 bg-background">
      {/* Form panel */}
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0">
        <AuthFormContainer />
      </div>

      {/* Decorative panel */}
      <div
        className="hidden md:block relative overflow-hidden group"
        key={finalContent.image.src}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] group-hover:scale-110"
          style={{ backgroundImage: `url(${finalContent.image.src})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute inset-0 bg-primary/20 backdrop-grayscale-[0.5]" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-12 pb-24">
          <blockquote className="space-y-4 text-center max-w-md">
            <p className="text-3xl font-bold tracking-tight text-white drop-shadow-2xl">
              "
              <Typewriter
                key={finalContent.quote.text}
                text={finalContent.quote.text}
                speed={50}
              />
              "
            </p>
            <footer className="mt-4">
              <cite className="dark:text-amber-400 text-slate-900 text-xs uppercase tracking-[0.3em] font-bold not-italic">
                — {finalContent.quote.author}
              </cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
