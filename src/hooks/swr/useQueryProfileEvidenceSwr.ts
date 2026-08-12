"use client"

import useSWR from "swr"
import { queryProfileEvidence } from "@/modules/api/graphql/queries/query-profile-evidence"
import type { ProfileEvidenceKind } from "@/modules/api/graphql/queries/types/profile-evidence"

/** Fetch one evidence family; a missing profile id leaves the owner idle. */
export const useQueryProfileEvidenceSwr = <T>(kind: ProfileEvidenceKind, profileId?: string | null, extra: Readonly<Record<string, unknown>> = {}) => {
    const request = kind === "activity" || kind.endsWith("detail") ? { request: { userId: profileId, ...extra } } : { userId: profileId, ...extra }
    return useSWR<T>(profileId ? ["QUERY_PROFILE_EVIDENCE", kind, profileId, JSON.stringify(extra)] : null, () => queryProfileEvidence(kind, request) as Promise<T>)
}
