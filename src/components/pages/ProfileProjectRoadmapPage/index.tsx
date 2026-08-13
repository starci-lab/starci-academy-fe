"use client"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { ProfileCapstone } from "@/modules/api/graphql/queries/types/profile-evidence"
import { _ProfileProjectRoadmapPage } from "./component"

/** Resolve the route-selected capstone without dropping persistent profile chrome. */
export const ProfileProjectRoadmapPage = () => {
    const params = useParams<{ username?: string; courseId?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const query = useQueryProfileEvidenceSwr<ReadonlyArray<ProfileCapstone>>("capstones", profile.data?.id)
    const project = query.data?.find((item) => item.courseGlobalId === params.courseId)
    return <_ProfileProjectRoadmapPage state={query.error ? "error" : query.isLoading || profile.isLoading ? "pending" : "ready"} project={project} onBack={() => router.push(`/profile/${username}/projects`)} />
}
export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
