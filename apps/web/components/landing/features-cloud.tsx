import { 
  PlusIcon, 
  Brain, 
  CloudUpload, 
  Feather, 
  Zap, 
  Mic, 
  Image as ImageIcon, 
  RotateCcw, 
  Baby 
} from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

type Feature = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "AI Coaching",
    description: "Real-time guidance on sensory detail and voice."
  },
  {
    icon: CloudUpload,
    title: "Publishing",
    description: "Share finished stories with the marketplace."
  },
  {
    icon: Feather,
    title: "Crafting",
    description: "Master 'Show-Don't-Tell' and plot arc."
  },
  {
    icon: Zap,
    title: "Adaptive Flow",
    description: "Sessions that adjust to your skill level."
  },
  {
    icon: Mic,
    title: "Voice Sessions",
    description: "Talk to your coach via Gemini Live API."
  },
  {
    icon: ImageIcon,
    title: "AI Illustrator",
    description: "Instant visuals for every page you write."
  },
  {
    icon: RotateCcw,
    title: "Gibbs Feedback",
    description: "Scientific reflection at the end of every chapter."
  },
  {
    icon: Baby,
    title: "Age Tiers",
    description: "Personalized journeys for ages 3 to 11."
  }
];

type FeatureCloudProps = React.ComponentProps<"div">;

export function FeatureCloud({ className, ...props }: FeatureCloudProps) {
  return (
    <div id="features" className={cn("max-w-4xl mx-auto mt-12", className)} {...props}>
      <h2 className="mb-8 text-center font-medium text-sm text-muted-foreground uppercase tracking-widest">
        Everything you need to <span className="font-semibold text-primary">Master Storytelling</span>
      </h2>
      <div
        className={cn(
          "relative grid grid-cols-2 border-x md:grid-cols-4 border-y",
          ""
        )}
      >
        {FEATURES.map((feature, index) => {
          const isSecondary = [0, 2, 5, 7].includes(index); // Pattern for alternating background
          const hasRightPlus = [0, 2, 4, 6].includes(index); // Edges for plus signs
          
          return (
            <FeatureCard
              key={feature.title}
              className={cn(
                "relative border-r border-b",
                isSecondary ? "bg-secondary/30" : "bg-background"
              )}
              feature={feature}
            >
              {hasRightPlus && (
                <PlusIcon
                  className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6 text-border"
                  strokeWidth={1}
                />
              )}
            </FeatureCard>
          );
        })}
      </div>
    </div>
  );
}

type FeatureCardProps = React.ComponentProps<"div"> & {
  feature: Feature;
};

function FeatureCard({ feature, className, children, ...props }: FeatureCardProps) {
  const Icon = feature.icon;
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background px-4 py-8 md:p-8 min-h-[160px]",
        className
      )}
      {...props}
    >
      <div className="flex flex-col items-center text-center gap-3 group">
        <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:scale-110 transition-transform">
          <Icon className="size-6 md:size-8" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-tighter text-primary">
            {feature.title}
          </h3>
          <p className="text-[10px] leading-tight text-muted-foreground max-w-[120px] mx-auto opacity-70">
            {feature.description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
