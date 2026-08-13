"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { ProfileCapstone, ProfilePinnedProject } from "@/modules/api/graphql/queries/types/profile-evidence"
import { _ProfileProjectsPage, type EvidenceState } from "./component"

/** The three things this page reads off any evidence query, whatever it fetched. */
type EvidenceQuery<T> = {
    readonly data?: ReadonlyArray<T>
    readonly error?: unknown
    readonly isLoading: boolean
}

const stateOf = <T,>(query: EvidenceQuery<T>, waiting: boolean): EvidenceState<T> => ({
    state: query.error ? "error" : query.isLoading || waiting ? "pending" : "ready",
    data: query.data ?? [],
})

/** Resolve pinned and capstone evidence independently for the projects route. */
export const ProfileProjectsPage = () => {
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const pinned = useQueryProfileEvidenceSwr<ReadonlyArray<ProfilePinnedProject>>("pinned-projects", profile.data?.id)
    const capstones = useQueryProfileEvidenceSwr<ReadonlyArray<ProfileCapstone>>("capstones", profile.data?.id)
    return <_ProfileProjectsPage pinned={stateOf(pinned, profile.isLoading)} capstones={stateOf(capstones, profile.isLoading)} on={{
        openPinned: (url) => window.open(url, "_blank", "noopener,noreferrer"),
        openCapstone: (id) => router.push(`/profile/${username}/projects/${id}`),
    }} />
}

export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
