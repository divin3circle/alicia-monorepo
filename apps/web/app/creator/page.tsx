"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import studioBanner from "@/images/studio.png"
import Image from "next/image"
import { Button } from "@workspace/ui/components/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getUserProjects, type StoryProject } from "@/lib/firestore"
import { ProjectCard } from "@/components/creator/project-card"
import { RestrictedAccessGuard } from "@/components/auth/restricted-access-guard"

export default function CreatorStudioPage() {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<StoryProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoadingProjects(true)
    getUserProjects(user.uid)
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoadingProjects(false))
  }, [user])

  return (
    <RestrictedAccessGuard areaLabel="Creator Studio">
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
                Creator Studio
              </span>
            </nav>
          </header>

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-1">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Creator Studio
              </h1>
              <p className="text-sm text-slate-500">
                Manage and edit your storytelling projects.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex min-h-[300px] items-center justify-center rounded-[2rem] border border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                <Image
                  src={studioBanner}
                  alt="Creator Studio"
                  className="h-[300px] w-full object-contain"
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Projects
                  {!loadingProjects && projects.length > 0 && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      {projects.length}
                    </span>
                  )}
                </h2>
                <Link
                  href="/creator/new"
                  className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-xs font-semibold transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  New Project
                </Link>
              </div>

              {(authLoading || loadingProjects) && (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="mr-2 size-6 animate-spin" />
                  <span className="text-sm">Loading projects…</span>
                </div>
              )}

              {!authLoading && !loadingProjects && projects.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 py-16 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-400">
                    You have no projects yet.
                  </p>
                  <Link href="/creator/new">
                    <Button className="gap-2 rounded-xl bg-amber-500 font-bold text-white hover:bg-amber-600">
                      <Plus className="size-4" />
                      Create your first story
                    </Button>
                  </Link>
                </div>
              )}

              {!authLoading && !loadingProjects && projects.length > 0 && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RestrictedAccessGuard>
  )
}
