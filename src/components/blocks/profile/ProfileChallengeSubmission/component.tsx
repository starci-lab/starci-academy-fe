import { SurfaceListCard } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { Button } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { Link } from "@starci/grammar/common"

/** Public challenge detail and submission data. */
export type ChallengeDetail = { readonly id?: string; readonly title?: string; readonly submissionUrl?: string | null; readonly selectedLang?: string | null; readonly difficulty?: string | null; readonly score?: number | null; readonly courseTitle?: string | null; readonly passedAt?: string | null; readonly feedbacks?: ReadonlyArray<{ readonly message?: string; readonly detail?: string; readonly severity?: string; readonly suggestion?: string }>; readonly attempts?: ReadonlyArray<{ readonly attemptNumber?: number; readonly score?: number | null; readonly submissionUrl?: string | null; readonly shortFeedback?: string | null; readonly processedAt?: string | null }> }
/** Traditional submission detail props. */
export type ProfileChallengeSubmissionProps = { readonly state: "pending" | "ready" | "error"; readonly detail?: ChallengeDetail | null; readonly onBack: () => void; readonly onRetry?: () => void }
/** Draw submission summary, proof link, attempts and feedback. */
export const ProfileChallengeSubmissionBase = (props: ProfileChallengeSubmissionProps) => {
    const detail = props.detail
    const loading = props.state === "pending"
    const attempts = detail?.attempts ?? []
    const feedbacks = detail?.feedbacks ?? []
    const attemptRows: ReadonlyArray<NonNullable<ChallengeDetail["attempts"]>[number]> = loading ? Array.from({ length: 3 }, (_, index) => ({ attemptNumber: index + 1 })) : attempts
    const feedbackRows: ReadonlyArray<NonNullable<ChallengeDetail["feedbacks"]>[number]> = loading ? Array.from({ length: 3 }, () => ({})) : feedbacks
    return <div><Button variant="ghost" size="sm" onPress={props.onBack}>{`← ${detail?.courseTitle ?? "Challenges"}`}</Button><Heading level={2} isSkeleton={loading}>{props.state === "error" ? "Challenge proof couldn't be loaded" : !detail ? "Challenge proof not found" : detail.title}</Heading>{props.state === "error" ? <Button variant="secondary" size="sm" onPress={props.onRetry}>{"Try again"}</Button> : null}<Text size={"sm"} tone={"muted"} isSkeleton={loading}>{!detail ? "This submission is not public." : [detail.difficulty, detail.selectedLang, detail.score == null ? undefined : `score ${detail.score}`, detail.passedAt].filter(Boolean).join(" · ")}</Text>{detail?.submissionUrl || loading ? <SurfaceListCard label={"Submitted proof"} isLoading={loading}><Link href={detail?.submissionUrl ?? ""} isSkeleton={loading}>{detail?.submissionUrl ?? "Loading proof"}</Link></SurfaceListCard> : null}<SurfaceListCard label={"Attempts"} isLoading={loading}>{attemptRows.length ? attemptRows.map((attempt, index) => <EvidenceRow key={attempt.attemptNumber ?? index} props={{ title: `Attempt ${attempt.attemptNumber ?? index + 1}`, subtitle: [attempt.processedAt, attempt.shortFeedback].filter(Boolean).join(" · "), fact: attempt.score == null ? undefined : String(attempt.score), factTone: (attempt.score ?? 0) >= 80 ? "success" : "neutral" }} isLoading={loading} />) : <EmptyNotice message={"No public attempts were found."} iconSource={iconSourceFor("practice", "leading")} />}</SurfaceListCard><SurfaceListCard label={"Structured feedback"} isLoading={loading}>{feedbackRows.length ? feedbackRows.map((feedback, index) => <EvidenceRow key={index} props={{ title: feedback.message ?? `Feedback ${index + 1}`, subtitle: feedback.detail ?? feedback.suggestion, fact: feedback.severity, factTone: feedback.severity?.toLowerCase().includes("strong") ? "success" : "warning" }} isLoading={loading} />) : <EmptyNotice message={"No structured feedback was published."} iconSource={iconSourceFor("review", "leading")} />}</SurfaceListCard></div>
}
