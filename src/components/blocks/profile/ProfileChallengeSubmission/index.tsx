"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import { ProfileChallengeSubmissionBase, type ChallengeDetail } from "./component"

/** Resolve one public challenge submission and own its loading/error state. */
export const ProfileChallengeSubmission = () => {
    const params = useParams<{ username?: string; courseId?: string; submissionId?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const courseId = String(params.courseId ?? "")
    const profile = useQueryUserProfileSwr(username)
    const query = useQueryProfileEvidenceSwr<ChallengeDetail>("challenge-detail", profile.data?.id, { submissionId: params.submissionId })
    return <ProfileChallengeSubmissionBase
        state={query.error ? "error" : query.isLoading || profile.isLoading ? "pending" : "ready"}
        detail={query.data}
        onBack={() => router.push(`/profile/${username}/challenges/${courseId}`)}
    />
}

export { ProfileChallengeSubmissionBase } from "./component"
/** Source-level ownership marker for the connected submission block. */
export const meta = { world: "connected", domain: "profile" } as const
