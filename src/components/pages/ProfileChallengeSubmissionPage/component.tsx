import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Link } from "@/components/leaves/Link"
import { Text } from "@/components/leaves/Text"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

/** Public challenge detail projection with immutable proof, attempts and feedback. */
export type ChallengeDetail = { readonly id?: string; readonly title?: string; readonly submissionUrl?: string | null; readonly selectedLang?: string | null; readonly difficulty?: string | null; readonly score?: number | null; readonly courseTitle?: string | null; readonly passedAt?: string | null; readonly feedbacks?: ReadonlyArray<{ readonly message?: string; readonly detail?: string; readonly severity?: string; readonly suggestion?: string }>; readonly attempts?: ReadonlyArray<{ readonly attemptNumber?: number; readonly score?: number | null; readonly submissionUrl?: string | null; readonly shortFeedback?: string | null; readonly processedAt?: string | null }> }
/** One settled proof payload and course-return outcome. */
export type ProfileChallengeSubmissionPageProps = { readonly state: "pending" | "ready" | "error"; readonly detail?: ChallengeDetail | null; readonly onBack: () => void }

/** One immutable public proof: source URL, every attempt, then structured grading feedback. */
export const ProfileChallengeSubmissionPageBase = ({ state, detail, onBack }: ProfileChallengeSubmissionPageProps) => {
    const attempts: NonNullable<ChallengeDetail["attempts"]> = state === "pending" ? Array.from({ length: 3 }, (_, index) => ({ attemptNumber: index + 1 })) : detail?.attempts ?? []
    const feedbacks: NonNullable<ChallengeDetail["feedbacks"]> = state === "pending" ? Array.from({ length: 3 }, () => ({})) : detail?.feedbacks ?? []
    const missing = state === "ready" && !detail
    return <Tree contract="profile-main" render={defineContractComponent("profile-main", { section: [
        defineContractProjection("label-row-over-card", () => <Tree contract="profile-proof-summary" render={defineContractComponent("profile-proof-summary", {
            back: defineLeafComponent("button", {}, () => <Button props={{ label: `← ${detail?.courseTitle ?? "Challenges"}`, variant: "ghost", size: "sm" }} on={{ press: onBack }} />),
            title: defineLeafComponent("heading", {}, () => <Heading props={{ content: state === "error" ? "Challenge proof couldn't be loaded" : missing ? "Challenge proof not found" : detail?.title, level: 2 }} isLoading={state === "pending"} />),
            meta: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => <Text props={{ content: missing ? "This submission is not public." : [detail?.difficulty, detail?.selectedLang, detail?.score == null ? undefined : `score ${detail.score}`, detail?.passedAt].filter(Boolean).join(" · "), size: "sm", tone: "muted" }} isLoading={state === "pending"} />),
        })} />),
        ...(detail?.submissionUrl || state === "pending" ? [defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: "Submitted proof" }} contract="profile-meta-list" render={defineContractComponent("profile-meta-list", {
            item: [defineLeafComponent("link", {}, () => <Link props={{ label: detail?.submissionUrl ?? "Loading proof", externalHref: detail?.submissionUrl ?? undefined }} isLoading={state === "pending"} />)],
        })} />)] : []),
        defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: "Attempts" }} contract="profile-evidence-list" render={defineContractComponent("profile-evidence-list", {
            evidence: attempts.length > 0 ? attempts.map((attempt, index) => defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: `Attempt ${attempt.attemptNumber ?? index + 1}${index === 0 && (attempt.score ?? 0) > 0 ? " · Passed" : ""}`, subtitle: [attempt.processedAt, attempt.shortFeedback].filter(Boolean).join(" · "), fact: attempt.score == null ? undefined : String(attempt.score), factTone: (attempt.score ?? 0) >= 80 ? "success" : "neutral" }} isLoading={state === "pending"} />)) : [defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: "No public attempts were found." }} />)],
        })} />),
        defineContractProjection("label-row-over-card", () => <SurfaceCard props={{ label: "Structured feedback" }} contract="profile-evidence-list" render={defineContractComponent("profile-evidence-list", {
            evidence: feedbacks.length > 0 ? feedbacks.map((feedback, index) => defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: feedback.message ?? `Feedback ${index + 1}`, subtitle: feedback.detail ?? feedback.suggestion, fact: feedback.severity, factTone: feedback.severity?.toLowerCase().includes("strong") ? "success" : "warning" }} isLoading={state === "pending"} />)) : [defineCompositeComponent("evidence-row", {}, () => <EvidenceRow props={{ title: "No structured feedback was published." }} />)],
        })} />),
    ] })} />
}
/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
