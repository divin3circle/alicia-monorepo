import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@workspace/ui/components/breadcrumb"
import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Sparkles } from "lucide-react"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-3xl bg-amber-500/5 border border-amber-500/10 shadow-sm flex items-center justify-center p-6 text-center">
              <div>
                <Sparkles className="size-8 text-amber-500 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Welcome to Alicia AI</h3>
                <p className="text-sm text-slate-500 mt-1">Start creating magical stories today.</p>
              </div>
            </div>
            <div className="aspect-video rounded-3xl bg-slate-500/5 border border-slate-500/10 shadow-sm" />
            <div className="aspect-video rounded-3xl bg-slate-500/5 border border-slate-500/10 shadow-sm" />
          </div>
          <div className="min-h-screen flex-1 rounded-[2rem] bg-slate-500/5 border border-slate-500/10 shadow-sm md:min-h-min p-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 mb-2">Recent Creations</h2>
              <p className="text-slate-500">Your storyteller's journey begins here.</p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
