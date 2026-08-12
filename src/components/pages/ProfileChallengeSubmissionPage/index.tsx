"use client"
import { useParams, useRouter } from "next/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { _ProfileChallengeSubmissionPage, type ChallengeDetail } from "./component"

/** Resolve one route-selected public challenge submission. */
export const ProfileChallengeSubmissionPage = () => {
    const params = useParams<{ username?: string; courseId?: string; submissionId?: string }>(); const router = useRouter(); const username = String(params.username ?? ""); const courseId = String(params.courseId ?? "")
    const profile = useQueryUserProfileSwr(username); const query = useQueryProfileEvidenceSwr<ChallengeDetail>("challenge-detail", profile.data?.id, { submissionId: params.submissionId })
    return <_ProfileChallengeSubmissionPage state={query.error ? "error" : query.isLoading || profile.isLoading ? "pending" : "ready"} detail={query.data} onBack={() => router.push(`/profile/${username}/challenges/${courseId}`)} />
}
export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
