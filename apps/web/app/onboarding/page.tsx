import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] relative overflow-hidden flex items-center justify-center py-20">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 w-full">
        <OnboardingFlow />
      </div>
    </main>
  );
}