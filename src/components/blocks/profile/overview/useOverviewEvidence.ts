"use client"

import { useParams } from "next/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { OverviewEvidenceKind } from "./shared"

/** Resolve the public profile id once per independently cached Overview evidence family. */
export const useOverviewEvidence = <T>(kind: OverviewEvidenceKind, extra: Readonly<Record<string, unknown>> = {}) => {
    const params = useParams<{ username?: string }>()
    const profile = useQueryUserProfileSwr(String(params.username ?? ""))
    const evidence = useQueryProfileEvidenceSwr<T>(kind, profile.data?.id, extra)
    return { ...evidence, isLoading: profile.isLoading || evidence.isLoading }
}
