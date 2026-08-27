"use client"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useQueryProfileEvidenceSwr } from "@/hooks/swr/useQueryProfileEvidenceSwr"
import { useQueryUserProfileSwr } from "@/hooks/swr/useQueryUserProfileSwr"
import type {
    ProfileCapstone,
    ProfilePinnedProject,
} from "@/modules/api/graphql/queries/types/profile-evidence"
import { ProfileProjectsBase, type EvidenceState } from "./component"
type EvidenceQuery<T> = {
  readonly data?: ReadonlyArray<T>;
  readonly error?: unknown;
  readonly isLoading: boolean;
};
const stateOf = <T,>(
    query: EvidenceQuery<T>,
    waiting: boolean,
): EvidenceState<T> => ({
        state: query.error
            ? "error"
            : query.isLoading || waiting
                ? "pending"
                : "ready",
        data: query.data ?? [],
    })
/** Connected projects block; owns profile evidence queries and navigation. */
export type ProfileProjectsProps = Record<never, never>
/** Load and render the connected profile projects block. */
export const ProfileProjects = (props: ProfileProjectsProps) => {
    void props
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = String(params.username ?? "")
    const profile = useQueryUserProfileSwr(username)
    const pinned = useQueryProfileEvidenceSwr<
    ReadonlyArray<ProfilePinnedProject>
  >("pinned-projects", profile.data?.id)
    const capstones = useQueryProfileEvidenceSwr<ReadonlyArray<ProfileCapstone>>(
        "capstones",
        profile.data?.id,
    )
    return (
        <ProfileProjectsBase
            pinned={stateOf(pinned, profile.isLoading)}
            capstones={stateOf(capstones, profile.isLoading)}
            on={{
                openPinned: (url) => window.open(url, "_blank", "noopener,noreferrer"),
                openCapstone: (id) =>
                    router.push(`/profile/${username}/projects/${id}`),
            }}
        />
    )
}
export * from "./component"
