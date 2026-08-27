"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfileCodingProblemBase, type CodingDetail } from "./component"

/** Resolve the dedicated public coding-proof route and own its recovery state. */
export type ProfileCodingProblemProps = Record<never, never>
/** Load and render the connected coding-proof block. */
export const ProfileCodingProblem = (props: ProfileCodingProblemProps) => {
    void props
    const params = useParams<{ username?: string; slug?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const query = useQueryProfileEvidenceSwr<CodingDetail | null>("coding-detail", profile.data?.id, { slug: params.slug })
    return <ProfileCodingProblemBase state={query.error ? "error" : query.isLoading || profile.isLoading ? "pending" : "ready"} detail={query.data} on={{ back: () => router.push(`/profile/${username}/skills`), retry: () => { void query.mutate() } }} />
}

export { ProfileCodingProblemBase } from "./component"
