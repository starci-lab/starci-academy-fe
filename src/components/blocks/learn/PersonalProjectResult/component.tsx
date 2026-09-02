import NextLink from "next/link"
import { SurfaceCard } from "@starci/grammar/common"
import { PersonalProjectHistoryDrawer } from "@/components/overlays/learn/PersonalProjectHistoryDrawer"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
                    ? <Button size="sm" onPress={props.on?.back}>{props.props.labels.back}</Button>
                    : <NextLink href={props.props.backHref} className={personalProjectResultBackLinkClassName}>{props.props.labels.back}</NextLink>}
                <Heading level={1} isSkeleton={loading}>{props.props.title}</Heading>
                <Text isSkeleton={loading}>{props.props.description}</Text>
            </header>
            {attempt === undefined ? <SurfaceCard label={props.props.labels.reviewStatus} composition="single"><div className={personalProjectResultStatusClassName}>
                {resultState === "failed" || feedbackState === "failed" ? <Badge tone={"warning"}>{props.props.labels.needsWork}</Badge> : null}
                {props.props.notice === undefined ? null : <Text live={resultState === "failed" || feedbackState === "failed" ? "assertive" : "polite"} isSkeleton={loading}>{props.props.notice}</Text>}
                {resultState === "queued" || resultState === "processing" ? <Button variant="outline" size="sm" onPress={props.on?.refresh}>{props.props.labels.refresh}</Button> : null}
            </div></SurfaceCard> : <div className={personalProjectResultEvidenceClassName}>
                <SurfaceCard label={props.props.labels.attempt(attempt.attemptNumber)} composition="single"><div className={personalProjectResultScoreClassName}>
                    <Heading level={2}>{props.props.labels.score(attempt.score, props.props.maximumScore)}</Heading>
                    <Badge tone={attempt.passed ? "success" : "warning"}>{attempt.passed ? props.props.labels.passed : props.props.labels.needsWork}</Badge>
                    <Text size={"xs"} tone={"muted"}>{[attempt.servedProvider, attempt.servedModel, attempt.processedAt].filter(Boolean).join(" · ")}</Text>
                </div></SurfaceCard>
                {props.props.feedbacks.length === 0 ? null : <SurfaceCard label={props.props.labels.feedback} composition="single">
                    <ul aria-label={props.props.labels.feedback} className={personalProjectResultFeedbackListClassName}>{props.props.feedbacks.map((item, index) => <li key={item.id} className={personalProjectResultFeedbackItemClassName}>
                        <span aria-hidden className={personalProjectResultFeedbackOrdinalClassName}>{String(index + 1).padStart(2, "0")}</span>
                        <div><Text size={"sm"} weight={"semibold"}>{item.message}</Text>
                            {item.location === undefined ? null : <Text size={"xs"} tone={"muted"}>{item.location}</Text>}
                            {item.suggestion === undefined ? null : <Text size={"sm"}>{item.suggestion}</Text>}
                        </div>
                    </li>)}</ul>
                </SurfaceCard>}
            </div>}
            {attempt === undefined || props.props.notice === undefined ? null : <Text live={resultState === "failed" || feedbackState === "failed" ? "assertive" : "polite"}>{props.props.notice}</Text>}
            <nav aria-label={props.props.labels.actions} className={personalProjectResultActionsClassName}>
                {attempt === undefined ? null : <Button variant={"outline"} isSkeleton={loading} onPress={({ press: props.on?.openHistory })?.press}>{props.props.labels.history}</Button>}
                {props.props.retryTaskHref === undefined
                    ? <Button isSkeleton={loading} onPress={({ press: props.on?.retryTask })?.press}>{props.props.labels.retryTask}</Button>
                    : <NextLink href={props.props.retryTaskHref} className={attempt === undefined || !attempt.passed ? personalProjectResultPrimaryLinkClassName : personalProjectResultActionLinkClassName}>{props.props.labels.retryTask}</NextLink>}
                {attempt === undefined ? null : attempt.passed && props.props.nextTaskHref !== undefined
                    ? <NextLink href={props.props.nextTaskHref} className={personalProjectResultPrimaryLinkClassName}>{props.props.labels.nextTask}</NextLink>
                    : <Button isDisabled={true} isSkeleton={loading}>{props.props.labels.nextTask}</Button>}
            </nav>
        </main>
        <PersonalProjectHistoryDrawer isOpen={props.historyOpen} courseId={props.courseId} taskId={props.taskId} selectedAttemptId={props.selectedAttemptId} onDismiss={props.on?.dismissHistory ?? (() => undefined)} onSelect={props.on?.selectHistory} />
    </>
}
