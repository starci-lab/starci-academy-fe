import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Link } from "@/components/leaves/Link"
import { Text } from "@/components/leaves/Text"
/** Public challenge detail and submission data. */
export type ChallengeDetail = { readonly id?: string; readonly title?: string; readonly submissionUrl?: string | null; readonly selectedLang?: string | null; readonly difficulty?: string | null; readonly score?: number | null; readonly courseTitle?: string | null; readonly passedAt?: string | null; readonly feedbacks?: ReadonlyArray<{ readonly message?: string; readonly detail?: string; readonly severity?: string; readonly suggestion?: string }>; readonly attempts?: ReadonlyArray<{ readonly attemptNumber?: number; readonly score?: number | null; readonly submissionUrl?: string | null; readonly shortFeedback?: string | null; readonly processedAt?: string | null }> }
/** Traditional submission detail props. */
export type ProfileChallengeSubmissionProps = { readonly state: "pending" | "ready" | "error"; readonly detail?: ChallengeDetail | null; readonly onBack: () => void }
/** Draw submission summary, proof link, attempts and feedback. */
export const ProfileChallengeSubmissionBase = (props: ProfileChallengeSubmissionProps) => {
    const detail = props.detail
    const loading = props.state === "pending"
    const attempts = detail?.attempts ?? []
    const feedbacks = detail?.feedbacks ?? []
    const attemptRows: ReadonlyArray<NonNullable<ChallengeDetail["attempts"]>[number]> = loading ? Array.from({ length: 3 }, (_, index) => ({ attemptNumber: index + 1 })) : attempts
    const feedbackRows: ReadonlyArray<NonNullable<ChallengeDetail["feedbacks"]>[number]> = loading ? Array.from({ length: 3 }, () => ({})) : feedbacks
    return <div><Button props={{ label: `← ${detail?.courseTitle ?? "Challenges"}`, variant: "ghost", size: "sm" }} on={{ press: props.onBack }} /><Heading props={{ content: props.state === "error" ? "Challenge proof couldn't be loaded" : !detail ? "Challenge proof not found" : detail.title, level: 2 }} isLoading={loading} /><Text props={{ content: !detail ? "This submission is not public." : [detail.difficulty, detail.selectedLang, detail.score == null ? undefined : `score ${detail.score}`, detail.passedAt].filter(Boolean).join(" · "), size: "sm", tone: "muted" }} isLoading={loading} />{detail?.submissionUrl || loading ? <SurfaceCard props={{ label: "Submitted proof" }}><Link props={{ label: detail?.submissionUrl ?? "Loading proof", externalHref: detail?.submissionUrl ?? undefined }} isLoading={loading} /></SurfaceCard> : null}<SurfaceCard props={{ label: "Attempts" }}>{attemptRows.length ? attemptRows.map((attempt, index) => <EvidenceRow key={attempt.attemptNumber ?? index} props={{ title: `Attempt ${attempt.attemptNumber ?? index + 1}`, subtitle: [attempt.processedAt, attempt.shortFeedback].filter(Boolean).join(" · "), fact: attempt.score == null ? undefined : String(attempt.score), factTone: (attempt.score ?? 0) >= 80 ? "success" : "neutral" }} isLoading={loading} />) : <EvidenceRow props={{ title: "No public attempts were found." }} />}</SurfaceCard><SurfaceCard props={{ label: "Structured feedback" }}>{feedbackRows.length ? feedbackRows.map((feedback, index) => <EvidenceRow key={index} props={{ title: feedback.message ?? `Feedback ${index + 1}`, subtitle: feedback.detail ?? feedback.suggestion, fact: feedback.severity, factTone: feedback.severity?.toLowerCase().includes("strong") ? "success" : "warning" }} isLoading={loading} />) : <EvidenceRow props={{ title: "No structured feedback was published." }} />}</SurfaceCard></div>
}
