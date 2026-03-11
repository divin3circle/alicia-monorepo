"use client";

import { useParams } from "next/navigation";
import { ProfileGuard } from "@/components/auth/profile-guard";
import { ProjectEditor } from "@/components/creator/project-editor";

export default function CreatorProjectPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <ProfileGuard>
      <ProjectEditor projectId={id} />
    </ProfileGuard>
  );
}
