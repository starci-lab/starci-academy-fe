import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Input } from "@/components/leaves/Input"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import type { ProfileSolvedChallenge } from "@/modules/api/graphql/queries/types/profile-evidence"

/** Course-scoped submissions, filtering state and route outcomes. */
export type ProfileChallengeManagePageProps = { readonly state: "pending" | "ready" | "error"; readonly courseTitle?: string; readonly rows: ReadonlyArray<ProfileSolvedChallenge>; readonly query: string; readonly filterLabel: string; readonly on: { readonly back: () => void; readonly search: (value: string) => void; readonly filter: () => void; readonly select: (id: string) => void } }

/** Draw the course proof header, toolbar and filtered joined submissions. */
export const _ProfileChallengeManagePage = ({ state, courseTitle, rows, query, filterLabel, on }: ProfileChallengeManagePageProps) => {
    const displayed = state === "pending" ? Array.from({ length: 3 }, (_, index): ProfileSolvedChallenge => ({ id: `pending-${index}`, title: "", passedAt: "" })) : rows
    return <Tree contract="profile-main" render={defineContractComponent("profile-main", { section: [
        defineContractProjection("label-row-over-card", () => <Tree contract="profile-proof-summary" render={defineContractComponent("profile-proof-summary", {
            back: defineLeafComponent("button", {}, () => <Button props={{ label: "← Challenges", variant: "ghost", size: "sm" }} on={{ press: on.back }} />),
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: state === "error" ? "Submissions couldn't be loaded" : `${courseTitle ?? "Course"} submissions`, level: 2 }} isLoading={state === "pending"} />),
            meta: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: "Search and filter passed work in this course.", size: "sm", tone: "muted" }} isLoading={state === "pending"} />),
        })} />),
        defineContractProjection("label-row-over-card", () => <Tree contract="profile-detail-toolbar" render={defineContractComponent("profile-detail-toolbar", {
            search: defineLeafComponent("input", {}, () => <Input props={{ id: "challenge-submission-search", name: "challenge-submission-search", placeholder: "Search submissions", defaultValue: query }} on={{ change: on.search }} />),
            filter: defineLeafComponent("button", {}, () => <Button props={{ label: filterLabel, variant: "outline", size: "sm" }} on={{ press: on.filter }} />),
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: `${rows.length} found`, size: "sm", tone: "muted" }} />),
        })} />),
        defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: `${rows.length} passed submissions` }} contract="profile-evidence-list" render={defineContractComponent("profile-evidence-list", {
            evidence: displayed.length > 0 ? displayed.map((submission) => defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: submission.title, subtitle: [submission.selectedLang, submission.difficulty, submission.passedAt].filter(Boolean).join(" · "), fact: submission.score == null ? undefined : String(submission.score), factTone: "success", isPressable: true }} on={{ press: () => on.select(submission.id) }} isLoading={state === "pending"} />)) : [defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: state === "error" ? "Submissions couldn't be loaded." : query ? "No submissions match this search." : "No passed submissions were found." }} />)],
        })} />),
    ] })} />
}
/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
