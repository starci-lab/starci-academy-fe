"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfileCodingProblemPageBase, type CodingDetail } from "./component"

/** Resolve the dedicated coding-proof route; other detail routes own dedicated pages. */
export const ProfileDetailPage = () => {
    const params = useParams<{ username?: string, slug?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const query = useQueryProfileEvidenceSwr<CodingDetail | null>("coding-detail", profile.data?.id, { slug: params.slug })
    return <ProfileCodingProblemPageBase state={query.error ? "error" : query.isLoading || profile.isLoading ? "pending" : "ready"} detail={query.data} on={{ back: () => router.push(`/profile/${username}/skills`), retry: () => { void query.mutate() } }} />
}

export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
