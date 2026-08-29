import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Text } from "@/components/leaves/Text"
import type { ProfileSolvedChallenge } from "@/modules/api/graphql/queries/types/profile-evidence"
import { profileEvidenceListClassName, profileMainClassName, profileProofMetricClassName, profileProofMetricsClassName } from "./classNames"
/** Public challenge standing and passed submissions. */
export type ProfileChallengesProps = { readonly strength: { readonly state: "pending" | "ready" | "error"; readonly data?: { readonly percentile?: number | null; readonly rank?: number | null; readonly xp?: number | null } | null }; readonly submissions: { readonly state: "pending" | "ready" | "error"; readonly data: ReadonlyArray<ProfileSolvedChallenge> }; readonly on: { readonly openCourse: (courseId: string) => void } }
const formatDate = (value: string) => Number.isNaN(Date.parse(value)) ? value : new Intl.DateTimeFormat("en", { month: "short", day: "2-digit" }).format(new Date(value))
/** Draw challenge standing and passed submissions. */
export const ProfileChallengesBase = (props: ProfileChallengesProps) => {
    const metrics = [{ figure: String(props.submissions.data.length), label: "passed" }, ...(props.strength.data?.percentile == null ? [] : [{ figure: `Top ${props.strength.data.percentile}%`, label: "strength" }]), ...(props.strength.data?.rank == null ? [] : [{ figure: `#${props.strength.data.rank}`, label: "rank" }]), ...(props.strength.data?.xp == null ? [] : [{ figure: props.strength.data.xp.toLocaleString(), label: "XP" }])]
    const rows = props.submissions.state === "pending" ? [] : props.submissions.data
    return <div className={profileMainClassName}>
        <SurfaceCard props={{ label: "Challenge strength" }}><div className={profileProofMetricsClassName}>{props.strength.state === "error" ? <div className={profileProofMetricClassName}><Text props={{ content: "—", weight: "semibold" }} /><Text props={{ content: "Standing unavailable", size: "xs", tone: "muted" }} /></div> : metrics.map((metric) => <div className={profileProofMetricClassName} key={metric.label}><Text props={{ content: metric.figure, weight: "semibold" }} isLoading={props.strength.state === "pending"} /><Text props={{ content: metric.label, size: "xs", tone: "muted" }} /></div>)}</div></SurfaceCard>
        <SurfaceCard props={{ label: "Passed submissions" }}><div className={profileEvidenceListClassName}>{rows.length === 0 ? <EvidenceRow props={{ title: props.submissions.state === "error" ? "Passed submissions couldn't be loaded." : "No challenges passed yet.", subtitle: props.submissions.state === "error" ? "Try this section again later." : "Passed graded challenges appear here." }} /> : rows.map((item) => <EvidenceRow key={item.id} props={{ title: item.title, subtitle: [item.courseTitle, item.selectedLang, item.passedAt ? formatDate(item.passedAt) : undefined].filter(Boolean).join(" · "), fact: item.score == null ? undefined : String(item.score), factTone: "success", isPressable: Boolean(item.courseGlobalId ?? item.courseSlug) }} on={{ press: () => props.on.openCourse(item.courseGlobalId ?? item.courseSlug ?? "") }} isLoading={props.submissions.state === "pending"} />)}</div></SurfaceCard>
    </div>
}
