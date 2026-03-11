"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import type { StoryProject } from "@/lib/firestore";

interface ProjectCardProps {
  project: StoryProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/creator/${project.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md hover:border-amber-300 dark:hover:border-amber-600 transition-all duration-200"
    >
      {/* Cover image */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {project.bannerUrl ? (
          <Image
            src={project.bannerUrl}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="size-10 text-slate-300" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 text-base">
          {project.title}
        </h3>

        {/* Characters pill */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="size-3.5 shrink-0" />
          <span className="line-clamp-1">
            {project.characters.map((c) => c.name).join(", ") || "No characters yet"}
          </span>
        </div>

        {/* Objective excerpt */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {project.objective}
        </p>
      </div>
    </Link>
  );
}
