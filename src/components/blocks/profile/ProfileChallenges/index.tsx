"use client"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type { ProfileSolvedChallenge } from "@/modules/api/graphql/queries/types/profile-evidence"
import { ProfileChallengesBase } from "./component"
type ChallengeStrength = {
  readonly percentile?: number | null;
  readonly rank?: number | null;
  readonly xp?: number | null;
};
/** Connected challenge evidence owner. */
/** Props for the connected profile challenges block. */
export type ProfileChallengesProps = Record<never, never>
/** Load and render the connected profile challenges block. */
export const ProfileChallenges = (props: ProfileChallengesProps) => {
    void props
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const strength = useQueryProfileEvidenceSwr<ChallengeStrength>(
        "challenge-strength",
        profile.data?.id,
    )
    const submissions = useQueryProfileEvidenceSwr<
    ReadonlyArray<ProfileSolvedChallenge>
  >("solved-challenges", profile.data?.id)
    const waiting = profile.isLoading
    return (
        <ProfileChallengesBase
            strength={{
                state: strength.error
                    ? "error"
                    : strength.isLoading || waiting
                        ? "pending"
                        : "ready",
                data: strength.data,
            }}
            submissions={{
                state: submissions.error
                    ? "error"
                    : submissions.isLoading || waiting
                        ? "pending"
                        : "ready",
                data: submissions.data ?? [],
            }}
            on={{
                openCourse: (id) =>
                    router.push(`/profile/${username}/challenges/${id}`),
            }}
        />
    )
}
