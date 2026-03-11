"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Separator } from "@workspace/ui/components/separator";
import studioBanner from "@/images/studio.png";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserProjects, type StoryProject } from "@/lib/firestore";
import { ProjectCard } from "@/components/creator/project-card";

export default function CreatorStudioPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<StoryProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoadingProjects(true);
    getUserProjects(user.uid)
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, [user]);

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
            <span className="text-slate-700 dark:text-slate-300 font-medium">Creator Studio</span>
          </nav>
        </header>

        <div className="flex flex-1 flex-col p-6 lg:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Creator Studio
            </h1>
            <p className="text-sm text-slate-500">
              Manage and edit your storytelling projects.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="min-h-[300px] rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center p-12 text-center">
              <Image src={studioBanner} alt="Creator Studio" className="w-full h-[300px] object-contain" />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Projects
                {!loadingProjects && projects.length > 0 && (
                  <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5">
                    {projects.length}
                  </span>
                )}
              </h2>
              <Link
                href="/creator/new"
                className="p-2 flex items-center gap-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <Plus className="mr-1 h-4 w-4" />
                New Project
              </Link>
            </div>

            {(authLoading || loadingProjects) && (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="size-6 animate-spin mr-2" />
                <span className="text-sm">Loading projects…</span>
              </div>
            )}

            {!authLoading && !loadingProjects && projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-400">
                  You have no projects yet.
                </p>
                <Link href="/creator/new">
                  <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl">
                    <Plus className="size-4" />
                    Create your first story
                  </Button>
                </Link>
              </div>
            )}

            {!authLoading && !loadingProjects && projects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
