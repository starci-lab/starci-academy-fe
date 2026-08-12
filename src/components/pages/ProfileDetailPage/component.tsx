import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Public coding problem and accepted-submission payload. */
export type CodingDetail = {
    readonly problem?: { readonly title: string, readonly statement?: string | null, readonly difficulty: string, readonly domain: string, readonly tags: ReadonlyArray<string> } | null
    readonly submission?: { readonly languages: ReadonlyArray<string>, readonly verdict: string, readonly passedCount: number, readonly totalCount: number, readonly firstSolvedAt?: string | null } | null
}
/** Settled coding-proof route input. */
export type ProfileCodingProblemPageProps = { readonly state: "pending" | "ready" | "error", readonly detail?: CodingDetail | null, readonly on: { readonly back: () => void, readonly retry: () => void } }

/** Legacy coding proof: statement and accepted-submission summary; never invent source code absent from the API. */
export const _ProfileCodingProblemPage = ({ state, detail, on }: ProfileCodingProblemPageProps) => {
    const problem = detail?.problem
    const submission = detail?.submission
    const loading = state === "pending"
    const header = defineContractComponent("profile-proof-header", {
        back: defineLeafComponent("button", {}, () => <Button props={{ label: "← Solve history", variant: "ghost", size: "sm" }} on={{ press: on.back }} />),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: problem?.title ?? (state === "error" ? "Coding proof unavailable" : "Coding problem"), level: 2 }} isLoading={loading} />),
        meta: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: problem ? [problem.difficulty, problem.domain].join(" · ") : "", size: "sm", tone: "muted" }} isLoading={loading} />),
    })
    const statement = <SurfaceCard props={{ label: "Problem statement" }} contract="profile-coding-statement" render={defineContractComponent("profile-coding-statement", {
        statement: defineLeafComponent("text", {}, () => <Text props={{ content: state === "error" ? "This proof couldn't be loaded." : problem?.statement ?? "No public coding proof was found." }} isLoading={loading} />),
        ...(problem?.tags.length ? { tags: defineContractComponent("profile-topic-chip-run", { topic: problem.tags.map((tag) => defineLeafComponent("badge", {}, () => <Badge props={{ content: tag }} />)) }) } : {}),
    })} />
    const evidenceRows = loading ? Array.from({ length: 2 }, (_, index) => ({ id: String(index), title: "", subtitle: "", fact: "" })) : submission ? [
        { id: "verdict", title: submission.languages.join(" · "), subtitle: submission.firstSolvedAt ?? undefined, fact: submission.verdict },
        { id: "tests", title: "Test cases", subtitle: "Accepted submission", fact: `${submission.passedCount}/${submission.totalCount}` },
    ] : [{ id: "empty", title: "No accepted submission", subtitle: "This learner has not published solved evidence for this problem.", fact: undefined }]
    const evidence = <SurfaceCard props={{ label: "Submission" }} contract="profile-evidence-list" render={defineContractComponent("profile-evidence-list", {
        evidence: evidenceRows.map((row) => defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: row.title, subtitle: row.subtitle, fact: row.fact, factTone: row.id === "verdict" ? "success" : "neutral" }} isLoading={loading} />)),
    })} />
    return <Tree contract="profile-coding-detail-main" render={defineContractComponent("profile-coding-detail-main", {
        header,
        section: [
            defineContractProjection("label-row-over-card", () => state === "error" ? <SurfaceCard props={{ label: "Problem statement", seeMoreLabel: "Try again" }} on={{ seeMore: on.retry }} contract="profile-coding-statement" render={defineContractComponent("profile-coding-statement", { statement: defineLeafComponent("text", {}, () => <Text props={{ content: "This proof couldn't be loaded." }} />) })} /> : statement),
            defineContractProjection("label-row-over-card", () => evidence),
        ] })} />
}

/** Other details remain delegated while sibling agents port their strict legacy anatomy. */
export type ProfileDetailKind = "project" | "challenge-course" | "challenge-proof"
/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
