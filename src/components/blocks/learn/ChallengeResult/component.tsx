import { Button } from "@/components/leaves/Button"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { ChallengeAttemptHistoryDrawer } from "@/components/overlays/learn/ChallengeAttemptHistoryDrawer"
import {
    challengeEvaluationClassName,
    challengeFeedbackClassName,
    challengeFeedbackItemClassName,
    challengeResultActionsClassName,
    challengeResultDocumentClassName,
    challengeResultSummaryClassName,
    challengeResultWorkspaceClassName,
    stackedControlsClassName,
    titlePairClassName,
} from "./classNames"

/** One backend-authored scorer finding shown without client interpretation. */
export type CourseLearnChallengeFeedback = {
    readonly id: string
    readonly message: string
    readonly detail?: string
    readonly severity: "low" | "medium" | "high"
    readonly location?: string
    readonly suggestion?: string
}

/** Pure result facts, finite state and route actions. */
export type ChallengeResultProps = {
    readonly blockState: "pending" | "ready" | "unavailable" | "failed"
    readonly props: {
        readonly title: string
        readonly description: string
        readonly scoreLine?: string
        readonly shortFeedback?: string
        readonly feedbacks: ReadonlyArray<CourseLearnChallengeFeedback>
        readonly notice?: string
        readonly reloadLabel: string
        readonly retryLabel: string
        readonly nextLabel: string
        readonly historyLabel?: string
        readonly courseId?: string
        readonly submissionId?: string
        readonly selectedAttemptId?: string
        readonly isHistoryOpen?: boolean
        readonly evaluationTitle?: string
        readonly evaluationDetail?: string
        readonly realtimeStatus?: string
        readonly unavailableTitle?: string
        readonly unavailableDetail?: string
        readonly outcomeLabel?: string
        readonly confidenceLine?: string
        readonly uncertainty?: string
        readonly nextAction?: string
        readonly breadcrumbLabel?: string
        readonly courseTitle?: string
        readonly moduleTitle?: string
        readonly contentTitle?: string
    }
    readonly on?: {
        readonly reload?: () => void
        readonly retry?: () => void
        readonly next?: () => void
        readonly openHistory?: () => void
        readonly closeHistory?: () => void
        readonly selectHistoryAttempt?: (attemptId: string, attemptGroupId?: string) => void
        readonly openCourse?: () => void
        readonly openModule?: () => void
        readonly openContent?: () => void
    }
}

/** Draws pending, graded and failed challenge-result states without querying. */
export const ChallengeResultBase = (props: ChallengeResultProps) => {
    const loading = props.blockState === "pending"
    const breadcrumb = <Breadcrumbs props={{ label: props.props.breadcrumbLabel ?? "Course challenge path", showFullTrail: true, steps: [{ id: "course", label: props.props.courseTitle ?? "Course" }, { id: "module", label: props.props.moduleTitle ?? "Module" }, { id: "content", label: props.props.contentTitle ?? "Lesson" }, { id: "challenge", label: props.props.title }] }} on={{ course: props.on?.openCourse, module: props.on?.openModule, content: props.on?.openContent }} />
    if (props.blockState === "pending" || props.blockState === "unavailable") {
        const unavailable = props.blockState === "unavailable"
        return <section className={challengeResultDocumentClassName}>{breadcrumb}<div className={challengeEvaluationClassName}>
            <Text props={{ content: unavailable ? props.props.unavailableTitle : props.props.evaluationTitle, weight: "semibold", live: "polite" }} />
            <div className={stackedControlsClassName}><Text props={{ content: unavailable ? props.props.unavailableDetail : props.props.evaluationDetail, size: "sm", tone: "muted" }} />{props.props.realtimeStatus === undefined ? null : <Text props={{ content: props.props.realtimeStatus, size: "sm", tone: "muted", live: "polite" }} />}</div>
            <Button props={{ label: props.props.reloadLabel, variant: unavailable ? "primary" : "outline", isPending: !unavailable }} on={{ press: props.on?.reload }} />
        </div></section>
    }
    return (
        <>
            <section className={challengeResultDocumentClassName}>{breadcrumb}<div className={challengeResultWorkspaceClassName}>
                <section className={challengeResultSummaryClassName}>
                    <div className={titlePairClassName}><Heading props={{ content: props.props.title, level: 1 }} isLoading={loading} /><Text props={{ content: props.props.description, size: "sm" }} isLoading={loading} /></div>
                    <Text props={{ content: props.props.scoreLine, size: "sm", tone: "muted" }} isLoading={loading} />
                    <div className={stackedControlsClassName}>{props.blockState === "failed" ? <Text props={{ content: props.props.notice, live: "assertive" }} /> : <>{props.props.shortFeedback === undefined ? null : <Text props={{ content: props.props.shortFeedback }} />}{props.props.outcomeLabel === undefined ? null : <Text props={{ content: props.props.outcomeLabel, weight: "semibold" }} />}{props.props.confidenceLine === undefined ? null : <Text props={{ content: props.props.confidenceLine, size: "sm", tone: "muted" }} />}</>}</div>
                </section>
                {props.blockState === "failed" ? null : <div className={challengeFeedbackClassName}>{props.props.feedbacks.map((feedback) => <div key={feedback.id} className={challengeFeedbackItemClassName}><Text props={{ content: feedback.message, weight: "semibold" }} /><Text props={{ content: feedback.severity, size: "sm", tone: "muted" }} />{feedback.detail === undefined ? null : <Text props={{ content: feedback.detail }} />}{feedback.location === undefined ? null : <Text props={{ content: feedback.location, size: "sm" }} />}{feedback.suggestion === undefined ? null : <Text props={{ content: feedback.suggestion }} />}</div>)}{props.props.uncertainty === undefined && props.props.nextAction === undefined ? null : <div className={challengeFeedbackItemClassName}>{props.props.uncertainty === undefined ? null : <Text props={{ content: props.props.uncertainty, size: "sm", tone: "muted" }} />}{props.props.nextAction === undefined ? null : <Text props={{ content: props.props.nextAction, weight: "semibold" }} />}</div>}</div>}
                <div className={challengeResultActionsClassName}>{props.blockState === "failed" ? <Button props={{ label: props.props.reloadLabel }} on={{ press: props.on?.reload }} /> : <><Button props={{ label: props.props.historyLabel ?? "History", variant: "outline" }} on={{ press: props.on?.openHistory }} /><Button props={{ label: props.props.retryLabel }} on={{ press: props.on?.retry }} /><Button props={{ label: props.props.nextLabel, variant: "primary" }} on={{ press: props.on?.next }} /></>}</div>
            </div></section>
            {props.props.isHistoryOpen === true ? <ChallengeAttemptHistoryDrawer
                isOpen
                courseId={props.props.courseId}
                submissionId={props.props.submissionId}
                selectedAttemptId={props.props.selectedAttemptId}
                onDismiss={() => props.on?.closeHistory?.()}
                onSelect={(attempt) => props.on?.selectHistoryAttempt?.(attempt.id, attempt.attemptGroupId)}
            /> : null}
        </>
    )
}
