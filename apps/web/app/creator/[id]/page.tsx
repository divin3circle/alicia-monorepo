"use client"

import { useParams } from "next/navigation"
import { RestrictedAccessGuard } from "@/components/auth/restricted-access-guard"
import { ProjectEditor } from "@/components/creator/project-editor"

export default function CreatorProjectPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <RestrictedAccessGuard areaLabel="Creator Studio">
      <ProjectEditor projectId={id} />
    </RestrictedAccessGuard>
  )
}
