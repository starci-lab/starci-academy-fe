import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import type { ProfileSolvedChallenge } from "@/modules/api/graphql/queries/types/profile-evidence"
import type { EvidenceState } from "@/components/pages/ProfileProjectsPage/component"

/** Public standing projection returned for a challenge portfolio. */
export type ChallengeStrength = { readonly percentile?: number | null; readonly rank?: number | null; readonly xp?: number | null }
/** Settled challenge evidence and course-navigation outcome. */
export type ProfileChallengesPageProps = {
    readonly strength: { readonly state: "pending" | "ready" | "error"; readonly data?: ChallengeStrength | null }
    readonly submissions: EvidenceState<ProfileSolvedChallenge>
    readonly on: { readonly openCourse: (courseId: string) => void }
}

const formatDate = (value: string) => Number.isNaN(Date.parse(value)) ? value : new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(new Date(value))

/** Challenges parity: headline standing and a flat, recruiter-scannable list of passed proof. */
export const _ProfileChallengesPage = ({ strength, submissions, on }: ProfileChallengesPageProps) => {
    const rows = submissions.state === "pending"
        ? Array.from({ length: 3 }, (_, index): ProfileSolvedChallenge => ({ id: `pending-${index}`, title: "", passedAt: "" }))
        : submissions.data
    const metrics = [
        { id: "passed", figure: String(submissions.data.length), label: "passed" },
        ...(strength.data?.percentile == null ? [] : [{ id: "percentile", figure: `Top ${strength.data.percentile}%`, label: "strength" }]),
        ...(strength.data?.rank == null ? [] : [{ id: "rank", figure: `#${strength.data.rank}`, label: "rank" }]),
        ...(strength.data?.xp == null ? [] : [{ id: "xp", figure: strength.data.xp.toLocaleString(), label: "XP" }]),
    ]
    return (
        <Tree contract="profile-main" render={defineContractComponent("profile-main", {
            section: [
                defineContractProjection("label-row-over-card", () => (
                    <SurfaceCard props={{ label: "Challenge strength" }} contract="profile-proof-metrics" render={defineContractComponent("profile-proof-metrics", {
                        metric: strength.state === "error" ? [defineContractComponent("profile-proof-metric", {
                            figure: defineLeafComponent("text", {}, () => <Text props={{ content: "—", weight: "semibold" }} />),
                            label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "Standing unavailable", size: "xs" }} />),
                        })] : (metrics.length > 0 ? metrics : Array.from({ length: 4 }, (_, index) => ({ id: String(index), figure: "", label: "" }))).map((metric) => defineContractComponent("profile-proof-metric", {
                            figure: defineLeafComponent("text", {}, () => <Text props={{ content: metric.figure, weight: "semibold" }} isLoading={strength.state === "pending"} />),
                            label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: metric.label, size: "xs" }} isLoading={strength.state === "pending"} />),
                        })),
                    })} />
                )),
                defineContractProjection("label-row-over-card", () => (
                    <SurfaceCard props={{ label: "Passed submissions", fact: submissions.state === "ready" ? "Search and filter" : undefined }} contract="profile-evidence-list" render={defineContractComponent("profile-evidence-list", {
                        evidence: rows.length > 0 ? rows.map((submission) => defineCompositeComponent("evidence-row", {}, () => (
                            <EvidenceRow props={{
                                title: submission.title,
                                subtitle: [submission.courseTitle, submission.selectedLang, submission.passedAt ? formatDate(submission.passedAt) : undefined].filter(Boolean).join(" · "),
                                fact: submission.score == null ? undefined : String(submission.score),
                                factTone: "success",
                                isPressable: Boolean(submission.courseGlobalId ?? submission.courseSlug),
                            }} on={{ press: () => on.openCourse(submission.courseGlobalId ?? submission.courseSlug ?? "") }} isLoading={submissions.state === "pending"} />
                        ))) : [defineCompositeComponent("evidence-row", {}, () => (
                            <EvidenceRow props={{ title: submissions.state === "error" ? "Passed submissions couldn't be loaded." : "No challenges passed yet.", subtitle: submissions.state === "error" ? "Try this section again later." : "Passed graded challenges appear here." }} />
                        ))],
                    })} />
                )),
            ],
        })} />
    )
}

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
