import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { HeroStepper } from "@/components/dashboard/hero-stepper"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecentCreations } from "@/components/dashboard/recent-creations"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b border-slate-500/10">
          <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-900" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <nav className="flex items-center gap-1 text-xs text-slate-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Home</span>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <DashboardHeader userName="Creator" storiesSaved={12} />
          <HeroStepper />
          <QuickActions />
          <RecentCreations />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
