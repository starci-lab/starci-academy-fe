"use client"

import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { ProfileSolvedChallenge } from "@/modules/api/graphql/queries/types/profile-evidence"
import { ProfileChallengesPageBase, type ChallengeStrength } from "./component"

/** Resolve challenge standing and submissions for the public route. */
export const ProfileChallengesPage = () => {
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const strength = useQueryProfileEvidenceSwr<ChallengeStrength>("challenge-strength", profile.data?.id)
    const submissions = useQueryProfileEvidenceSwr<ReadonlyArray<ProfileSolvedChallenge>>("solved-challenges", profile.data?.id)
    const waiting = profile.isLoading
    return <ProfileChallengesPageBase
        strength={{ state: strength.error ? "error" : strength.isLoading || waiting ? "pending" : "ready", data: strength.data }}
        submissions={{ state: submissions.error ? "error" : submissions.isLoading || waiting ? "pending" : "ready", data: submissions.data ?? [] }}
        on={{ openCourse: (courseId) => router.push(`/profile/${username}/challenges/${courseId}`) }}
    />
}

export * from "./component"
/** Source-level tier marker. */
export const meta = { world: "connected", domain: "profile" } as const
