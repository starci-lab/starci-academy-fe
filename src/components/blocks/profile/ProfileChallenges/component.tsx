import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import type { ProfileSolvedChallenge } from "@/modules/api/graphql/queries/types/profile-evidence"

/** Public challenge standing and passed-submission block inputs. */
export type ProfileChallengesBlockProps = { readonly strength: { readonly state: "pending" | "ready" | "error"; readonly data?: { readonly percentile?: number | null; readonly rank?: number | null; readonly xp?: number | null } | null }; readonly submissions: { readonly state: "pending" | "ready" | "error"; readonly data: ReadonlyArray<ProfileSolvedChallenge> }; readonly on: { readonly openCourse: (courseId: string) => void } }
const formatDate = (value: string) => Number.isNaN(Date.parse(value)) ? value : new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(new Date(value))

/** Draw challenge standing and passed submissions inside the routed profile page. */
export const ProfileChallengesBase = ({ strength, submissions, on }: ProfileChallengesBlockProps) => {
    const rows = submissions.state === "pending" ? Array.from({ length: 3 }, (_, index): ProfileSolvedChallenge => ({ id: `pending-${index}`, title: "", passedAt: "" })) : submissions.data
    const metrics = [{ figure: String(submissions.data.length), label: "passed" }, ...(strength.data?.percentile == null ? [] : [{ figure: `Top ${strength.data.percentile}%`, label: "strength" }]), ...(strength.data?.rank == null ? [] : [{ figure: `#${strength.data.rank}`, label: "rank" }]), ...(strength.data?.xp == null ? [] : [{ figure: strength.data.xp.toLocaleString(), label: "XP" }])]
    const strengthMetrics = strength.state === "error"
        ? [defineContractComponent("profile-proof-metric", { figure: defineLeafComponent("text", {}, () => <Text props={{ content: "—", weight: "semibold" }} />), label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: "Standing unavailable", size: "xs" }} />) })]
        : (metrics.length > 0 ? metrics : Array.from({ length: 4 }, (_, index) => ({ figure: "", label: String(index) }))).map((metric) => defineContractComponent("profile-proof-metric", { figure: defineLeafComponent("text", {}, () => <Text props={{ content: metric.figure, weight: "semibold" }} isLoading={strength.state === "pending"} />), label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: metric.label, size: "xs" }} isLoading={strength.state === "pending"} />) }))
    const strengthCard = defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: "Challenge strength" }} contract="profile-proof-metrics" render={defineContractComponent("profile-proof-metrics", { metric: strengthMetrics })} />)
    const evidence = rows.length > 0 ? rows.map((item) => defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: item.title, subtitle: [item.courseTitle, item.selectedLang, item.passedAt ? formatDate(item.passedAt) : undefined].filter(Boolean).join(" · "), fact: item.score == null ? undefined : String(item.score), factTone: "success", isPressable: Boolean(item.courseGlobalId ?? item.courseSlug) }} on={{ press: () => on.openCourse(item.courseGlobalId ?? item.courseSlug ?? "") }} isLoading={submissions.state === "pending"} />)) : [defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: submissions.state === "error" ? "Passed submissions couldn't be loaded." : "No challenges passed yet.", subtitle: submissions.state === "error" ? "Try this section again later." : "Passed graded challenges appear here." }} />)]
    const submissionCard = defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: "Passed submissions", fact: submissions.state === "ready" ? "Search and filter" : undefined }} contract="profile-evidence-list" render={defineContractComponent("profile-evidence-list", { evidence })} />)
    return <Tree contract="profile-main" render={defineContractComponent("profile-main", { section: [strengthCard, submissionCard] })} />
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "profile" } as const
