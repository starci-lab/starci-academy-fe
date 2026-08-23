"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { ProfileCapstone } from "@/modules/api/graphql/queries/types/profile-evidence"
import { ProfileProjectRoadmapBase } from "./component"

/** Resolve the route-selected public capstone and own its state. */
export const ProfileProjectRoadmap = () => {
    const params = useParams<{ username?: string; courseId?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const query = useQueryProfileEvidenceSwr<ReadonlyArray<ProfileCapstone>>("capstones", profile.data?.id)
    const project = query.data?.find((item) => item.courseGlobalId === params.courseId)
    return <ProfileProjectRoadmapBase state={query.error ? "error" : query.isLoading || profile.isLoading ? "pending" : "ready"} project={project} onBack={() => router.push(`/profile/${username}/projects`)} />
}

export { ProfileProjectRoadmapBase } from "./component"
/** Source-level ownership marker for the connected roadmap block. */
export const meta = { world: "connected", domain: "profile" } as const
