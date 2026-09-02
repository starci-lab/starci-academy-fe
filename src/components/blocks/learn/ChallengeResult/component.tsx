import { Button } from "@starci/grammar/common"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
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
            <Text weight={"semibold"} live={"polite"}>{unavailable ? props.props.unavailableTitle : props.props.evaluationTitle}</Text>
            <div className={stackedControlsClassName}><Text size={"sm"} tone={"muted"}>{unavailable ? props.props.unavailableDetail : props.props.evaluationDetail}</Text>{props.props.realtimeStatus === undefined ? null : <Text size={"sm"} tone={"muted"} live={"polite"}>{props.props.realtimeStatus}</Text>}</div>
            <Button variant={unavailable ? "primary" : "outline"} isPending={!unavailable} onPress={props.on?.reload}>{props.props.reloadLabel}</Button>
        </div></section>
    }
    return (
        <>
            <section className={challengeResultDocumentClassName}>{breadcrumb}<div className={challengeResultWorkspaceClassName}>
                <section className={challengeResultSummaryClassName}>
                    <div className={titlePairClassName}><Heading level={1} isSkeleton={loading}>{props.props.title}</Heading><Text size={"sm"} isSkeleton={loading}>{props.props.description}</Text></div>
                    <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.scoreLine}</Text>
                    <div className={stackedControlsClassName}>{props.blockState === "failed" ? <Text live={"assertive"}>{props.props.notice}</Text> : <>{props.props.shortFeedback === undefined ? null : <Text>{props.props.shortFeedback}</Text>}{props.props.outcomeLabel === undefined ? null : <Text weight={"semibold"}>{props.props.outcomeLabel}</Text>}{props.props.confidenceLine === undefined ? null : <Text size={"sm"} tone={"muted"}>{props.props.confidenceLine}</Text>}</>}</div>
                </section>
                {props.blockState === "failed" ? null : <div className={challengeFeedbackClassName}>{props.props.feedbacks.map((feedback) => <div key={feedback.id} className={challengeFeedbackItemClassName}><Text weight={"semibold"}>{feedback.message}</Text><Text size={"sm"} tone={"muted"}>{feedback.severity}</Text>{feedback.detail === undefined ? null : <Text>{feedback.detail}</Text>}{feedback.location === undefined ? null : <Text size={"sm"}>{feedback.location}</Text>}{feedback.suggestion === undefined ? null : <Text>{feedback.suggestion}</Text>}</div>)}{props.props.uncertainty === undefined && props.props.nextAction === undefined ? null : <div className={challengeFeedbackItemClassName}>{props.props.uncertainty === undefined ? null : <Text size={"sm"} tone={"muted"}>{props.props.uncertainty}</Text>}{props.props.nextAction === undefined ? null : <Text weight={"semibold"}>{props.props.nextAction}</Text>}</div>}</div>}
                <div className={challengeResultActionsClassName}>{props.blockState === "failed" ? <Button onPress={props.on?.reload}>{props.props.reloadLabel}</Button> : <><Button variant="outline" onPress={props.on?.openHistory}>{props.props.historyLabel ?? "History"}</Button><Button onPress={props.on?.retry}>{props.props.retryLabel}</Button><Button variant="primary" onPress={props.on?.next}>{props.props.nextLabel}</Button></>}</div>
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
