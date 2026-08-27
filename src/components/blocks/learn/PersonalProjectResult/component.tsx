import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { PersonalProjectHistoryDrawer } from "@/components/overlays/learn/PersonalProjectHistoryDrawer"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

/** One structured grading finding attached to the selected attempt. */
export type CoursePersonalProjectResultFeedback = { readonly id: string; readonly message: string; readonly location?: string; readonly suggestion?: string }
/** One immutable grading attempt available for selection in result history. */
export type CoursePersonalProjectResultAttempt = { readonly id: string; readonly attemptNumber: number; readonly score: number; readonly passed: boolean; readonly processedAt?: string; readonly servedModel?: string }
/** Localized result-page words and score/history formatters. */
export type CoursePersonalProjectResultLabels = {
    readonly back: string; readonly attempt: (number: number) => string; readonly score: (score: number, maximum: number) => string
    readonly passed: string; readonly needsWork: string; readonly feedback: string; readonly history: string; readonly historySummary: (count: number) => string
    readonly selectAttempt: (number: number, score: number) => string; readonly previous: string; readonly next: string; readonly nextTask: string; readonly retryTask: string
}

/** Result states, content and actions consumed by the pure result renderer. */
export type PersonalProjectResultProps = {
    readonly state: "pending" | "ready" | "partial" | "empty" | "failed"
    readonly props: { readonly title: string; readonly resultState?: "pending" | "ready" | "empty" | "failed"; readonly feedbackState?: "pending" | "ready" | "failed"; readonly description: string; readonly maximumScore: number; readonly selectedAttempt?: CoursePersonalProjectResultAttempt; readonly feedbacks: ReadonlyArray<CoursePersonalProjectResultFeedback>; readonly notice?: string; readonly labels: CoursePersonalProjectResultLabels }
    readonly courseId?: string; readonly taskId: string; readonly historyOpen: boolean; readonly selectedAttemptId?: string
    readonly on?: { readonly back?: () => void; readonly nextTask?: () => void; readonly retryTask?: () => void; readonly openHistory?: () => void; readonly dismissHistory?: () => void; readonly selectHistory?: (attempt: CoursePersonalProjectResultAttempt) => void }
}

/** Draw selected grading evidence with ordinary semantic React composition. */
export const PersonalProjectResultBase = (props: PersonalProjectResultProps) => {
    const resultState = props.props.resultState ?? props.state
    const feedbackState = props.props.feedbackState ?? (props.state === "partial" ? "failed" : "ready")
    const loading = resultState === "pending"
    const attempt = props.props.selectedAttempt
    return <>
        <main aria-label={props.props.title}>
            <header>
                <Button props={{ label: props.props.labels.back, size: "sm" }} on={{ press: props.on?.back }} />
                <Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} />
                <Text props={{ content: props.props.description }} isLoading={loading} />
            </header>
            {attempt === undefined ? null : <SurfaceCard props={{ label: props.props.labels.attempt(attempt.attemptNumber) }}>
                <Heading props={{ content: props.props.labels.score(attempt.score, props.props.maximumScore), level: 2 }} />
                <Badge props={{ content: attempt.passed ? props.props.labels.passed : props.props.labels.needsWork, tone: attempt.passed ? "success" : "warning" }} />
                <Text props={{ content: [attempt.servedModel, attempt.processedAt].filter(Boolean).join(" · "), size: "xs", tone: "muted" }} />
            </SurfaceCard>}
            {props.props.feedbacks.length === 0 ? null : <SurfaceCard props={{ label: props.props.labels.feedback }}>
                <ul aria-label={props.props.labels.feedback}>{props.props.feedbacks.map((item) => <li key={item.id}>
                    <Text props={{ content: item.message, size: "sm", weight: "semibold" }} />
                    {item.location === undefined ? null : <Text props={{ content: item.location, size: "xs", tone: "muted" }} />}
                    {item.suggestion === undefined ? null : <Text props={{ content: item.suggestion, size: "sm" }} />}
                </li>)}</ul>
            </SurfaceCard>}
            {props.props.notice === undefined ? null : <Text props={{ content: props.props.notice, live: resultState === "failed" || feedbackState === "failed" ? "assertive" : "polite" }} isLoading={loading} />}
            <nav aria-label={props.props.labels.history}>
                <Button props={{ label: props.props.labels.history }} on={{ press: props.on?.openHistory }} isLoading={loading} />
                <Button props={{ label: props.props.labels.retryTask }} on={{ press: props.on?.retryTask }} isLoading={loading} />
                <Button props={{ label: props.props.labels.nextTask, variant: "primary", disabled: attempt?.passed !== true }} on={{ press: props.on?.nextTask }} isLoading={loading} />
            </nav>
        </main>
        <PersonalProjectHistoryDrawer isOpen={props.historyOpen} courseId={props.courseId} taskId={props.taskId} selectedAttemptId={props.selectedAttemptId} onDismiss={props.on?.dismissHistory ?? (() => undefined)} onSelect={props.on?.selectHistory} />
    </>
}
