import NextLink from "next/link"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { PersonalProjectHistoryDrawer } from "@/components/overlays/learn/PersonalProjectHistoryDrawer"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    personalProjectResultActionsClassName,
    personalProjectResultClassName,
    personalProjectResultEvidenceClassName,
    personalProjectResultFeedbackItemClassName,
    personalProjectResultFeedbackOrdinalClassName,
    personalProjectResultFeedbackListClassName,
    personalProjectResultBackLinkClassName,
    personalProjectResultActionLinkClassName,
    personalProjectResultHeaderClassName,
    personalProjectResultPrimaryLinkClassName,
    personalProjectResultScoreClassName,
    personalProjectResultStatusClassName,
} from "./classNames"

/** One structured grading finding attached to the selected attempt. */
export type CoursePersonalProjectResultFeedback = { readonly id: string; readonly message: string; readonly location?: string; readonly suggestion?: string }
/** One immutable grading attempt available for selection in result history. */
export type CoursePersonalProjectResultAttempt = { readonly id: string; readonly attemptNumber: number; readonly score: number; readonly passed: boolean; readonly processedAt?: string; readonly servedModel?: string; readonly servedProvider?: string }
/** Localized result-page words and score/history formatters. */
export type CoursePersonalProjectResultLabels = {
    readonly back: string; readonly attempt: (number: number) => string; readonly score: (score: number, maximum: number) => string
    readonly passed: string; readonly needsWork: string; readonly feedback: string; readonly history: string; readonly historySummary: (count: number) => string
    readonly selectAttempt: (number: number, score: number) => string; readonly previous: string; readonly next: string; readonly nextTask: string; readonly retryTask: string
    readonly reviewStatus: string; readonly refresh: string; readonly actions: string
}

/** Result states, content and actions consumed by the pure result renderer. */
export type PersonalProjectResultProps = {
    readonly state: "pending" | "queued" | "processing" | "ready" | "partial" | "empty" | "failed"
    readonly props: { readonly title: string; readonly resultState?: "pending" | "queued" | "processing" | "ready" | "empty" | "failed"; readonly feedbackState?: "pending" | "ready" | "failed"; readonly description: string; readonly maximumScore: number; readonly selectedAttempt?: CoursePersonalProjectResultAttempt; readonly feedbacks: ReadonlyArray<CoursePersonalProjectResultFeedback>; readonly notice?: string; readonly backHref?: string; readonly retryTaskHref?: string; readonly nextTaskHref?: string; readonly labels: CoursePersonalProjectResultLabels }
    readonly courseId?: string; readonly taskId: string; readonly historyOpen: boolean; readonly selectedAttemptId?: string
    readonly on?: { readonly back?: () => void; readonly nextTask?: () => void; readonly retryTask?: () => void; readonly refresh?: () => void; readonly openHistory?: () => void; readonly dismissHistory?: () => void; readonly selectHistory?: (attempt: CoursePersonalProjectResultAttempt) => void }
}

/** Draw selected grading evidence with ordinary semantic React composition. */
export const PersonalProjectResultBase = (props: PersonalProjectResultProps) => {
    const resultState = props.props.resultState ?? props.state
    const feedbackState = props.props.feedbackState ?? (props.state === "partial" ? "failed" : "ready")
    const loading = resultState === "pending"
    const attempt = props.props.selectedAttempt
    return <>
        <main aria-label={props.props.title} className={personalProjectResultClassName}>
            <header className={personalProjectResultHeaderClassName}>
                {props.props.backHref === undefined
                    ? <Button props={{ label: props.props.labels.back, size: "sm" }} on={{ press: props.on?.back }} />
                    : <NextLink href={props.props.backHref} className={personalProjectResultBackLinkClassName}>{props.props.labels.back}</NextLink>}
                <Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} />
                <Text props={{ content: props.props.description }} isLoading={loading} />
            </header>
            {attempt === undefined ? <SurfaceCard props={{ label: props.props.labels.reviewStatus, inset: "compact" }}><div className={personalProjectResultStatusClassName}>
                {resultState === "failed" || feedbackState === "failed" ? <Badge props={{ content: props.props.labels.needsWork, tone: "warning" }} /> : null}
                {props.props.notice === undefined ? null : <Text props={{ content: props.props.notice, live: resultState === "failed" || feedbackState === "failed" ? "assertive" : "polite" }} isLoading={loading} />}
                {resultState === "queued" || resultState === "processing" ? <Button props={{ label: props.props.labels.refresh, size: "sm", variant: "outline" }} on={{ press: props.on?.refresh }} /> : null}
            </div></SurfaceCard> : <div className={personalProjectResultEvidenceClassName}>
                <SurfaceCard props={{ label: props.props.labels.attempt(attempt.attemptNumber), inset: "compact" }}><div className={personalProjectResultScoreClassName}>
                    <Heading props={{ content: props.props.labels.score(attempt.score, props.props.maximumScore), level: 2 }} />
                    <Badge props={{ content: attempt.passed ? props.props.labels.passed : props.props.labels.needsWork, tone: attempt.passed ? "success" : "warning" }} />
                    <Text props={{ content: [attempt.servedProvider, attempt.servedModel, attempt.processedAt].filter(Boolean).join(" · "), size: "xs", tone: "muted" }} />
                </div></SurfaceCard>
                {props.props.feedbacks.length === 0 ? null : <SurfaceCard props={{ label: props.props.labels.feedback, inset: "compact" }}>
                    <ul aria-label={props.props.labels.feedback} className={personalProjectResultFeedbackListClassName}>{props.props.feedbacks.map((item, index) => <li key={item.id} className={personalProjectResultFeedbackItemClassName}>
                        <span aria-hidden className={personalProjectResultFeedbackOrdinalClassName}>{String(index + 1).padStart(2, "0")}</span>
                        <div><Text props={{ content: item.message, size: "sm", weight: "semibold" }} />
                            {item.location === undefined ? null : <Text props={{ content: item.location, size: "xs", tone: "muted" }} />}
                            {item.suggestion === undefined ? null : <Text props={{ content: item.suggestion, size: "sm" }} />}
                        </div>
                    </li>)}</ul>
                </SurfaceCard>}
            </div>}
            {attempt === undefined || props.props.notice === undefined ? null : <Text props={{ content: props.props.notice, live: resultState === "failed" || feedbackState === "failed" ? "assertive" : "polite" }} />}
            <nav aria-label={props.props.labels.actions} className={personalProjectResultActionsClassName}>
                {attempt === undefined ? null : <Button props={{ label: props.props.labels.history, variant: "outline" }} on={{ press: props.on?.openHistory }} isLoading={loading} />}
                {props.props.retryTaskHref === undefined
                    ? <Button props={{ label: props.props.labels.retryTask }} on={{ press: props.on?.retryTask }} isLoading={loading} />
                    : <NextLink href={props.props.retryTaskHref} className={attempt === undefined || !attempt.passed ? personalProjectResultPrimaryLinkClassName : personalProjectResultActionLinkClassName}>{props.props.labels.retryTask}</NextLink>}
                {attempt === undefined ? null : attempt.passed && props.props.nextTaskHref !== undefined
                    ? <NextLink href={props.props.nextTaskHref} className={personalProjectResultPrimaryLinkClassName}>{props.props.labels.nextTask}</NextLink>
                    : <Button props={{ label: props.props.labels.nextTask, disabled: true }} isLoading={loading} />}
            </nav>
        </main>
        <PersonalProjectHistoryDrawer isOpen={props.historyOpen} courseId={props.courseId} taskId={props.taskId} selectedAttemptId={props.selectedAttemptId} onDismiss={props.on?.dismissHistory ?? (() => undefined)} onSelect={props.on?.selectHistory} />
    </>
}
