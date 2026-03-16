import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Library } from "lucide-react"
import { RestrictedAccessGuard } from "@/components/auth/restricted-access-guard"

export default function AssetsPage() {
  return (
    <RestrictedAccessGuard areaLabel="Assets">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "17rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-500/10 px-4">
            <SidebarTrigger className="-ml-1 text-slate-400 hover:text-slate-900" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <nav className="flex items-center gap-1 text-xs text-slate-400">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Assets
              </span>
            </nav>
          </header>

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Assets Library
              </h1>
              <p className="text-sm text-slate-500">
                Your collection of characters, worlds, and media.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="rounded-3xl border border-slate-500/10 bg-slate-500/5 p-8">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
                    <Library className="size-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      Library is Empty
                    </h3>
                    <p className="text-sm text-slate-500">
                      Create your first project to populate your asset library.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl border border-slate-200 bg-slate-200/50 dark:border-slate-800 dark:bg-white/5"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RestrictedAccessGuard>
  )
}
