"use client"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
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
    const t = useTranslations("profile")
    const courseProgressT = useTranslations("courses.progress")
    const searchKindsT = useTranslations("globalSearch.kinds")
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
            labels={{ pinned: t("evidence.pinned-projects.label"), capstones: t("evidence.capstones.label"), milestones: courseProgressT("milestone"), tasks: searchKindsT("milestoneTasks"), courseKind: t("projects.kind.course"), externalKind: t("projects.kind.external"), openProject: t("projects.open"), retry: t("actions.retry"), emptyPinned: t("evidence.pinned-projects.empty"), emptyCapstones: t("evidence.capstones.empty"), error: t("evidence.error") }}
            on={{
                openPinned: (url) => window.open(url, "_blank", "noopener,noreferrer"),
                openCapstone: (id) =>
                    router.push(`/profile/${username}/projects/${id}`),
                retry: () => {
                    void pinned.mutate()
                    void capstones.mutate()
                },
            }}
        />
    )
}
export * from "./component"
