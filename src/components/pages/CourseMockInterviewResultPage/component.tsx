import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"

/** Finite situations shown by the result route. */
export type CourseMockInterviewResultState = "grading" | "ready" | "failed"

/** One scored rubric row in the debrief. */
export type CourseMockInterviewScoreRow = {
    readonly id: string
    readonly label: string
    readonly score: number
    readonly max: number
}

/** One backend-authored comparison between a candidate answer and its expected coverage. */
export type CourseMockInterviewQuestionReview = {
    readonly id: string
    readonly title: string
    readonly answer: string
    readonly feedback: string
    readonly scoreLabel: string
}

/** Resolved debrief data consumed by the pure result page. */
export type CourseMockInterviewResultData = {
    readonly title: string
    readonly description: string
    readonly gradingLabel: string
    readonly failedLabel: string
    readonly scoreLabel: string
    readonly score?: number
    readonly verdict?: string
    readonly promptTitle?: string
    readonly phaseTitle: string
    readonly phases: ReadonlyArray<CourseMockInterviewScoreRow>
    readonly strengthsTitle: string
    readonly strengths: ReadonlyArray<string>
    readonly gapsTitle: string
    readonly gaps: ReadonlyArray<string>
    readonly reviewsTitle: string
    readonly reviews: ReadonlyArray<CourseMockInterviewQuestionReview>
    readonly retryLabel: string
    readonly newSessionLabel: string
}

/** User intents emitted by the pure result page. */
export type CourseMockInterviewResultActions = {
    readonly retry?: () => void
    readonly newSession?: () => void
}

/** Public boundary of the presentational result twin. */
export type CourseMockInterviewResultPageProps = {
    readonly state: CourseMockInterviewResultState
    readonly props: CourseMockInterviewResultData
    readonly on?: CourseMockInterviewResultActions
}

/** Presentational debrief for a URL-addressable graded interview attempt. */
export const _CourseMockInterviewResultPage = (input: CourseMockInterviewResultPageProps) => {
    const loading = input.state === "grading"
    const ready = input.state === "ready"
    const action = [
        defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.props.newSessionLabel, variant: "primary" }} on={{ press: input.on?.newSession }} />
        )),
        ...(ready ? [] : [
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.retryLabel, variant: "outline" }} on={{ press: input.on?.retry }} />
            )),
        ]),
    ]

    return (
        <Tree
            contract="course-mock-interview-result-page"
            render={defineContractComponent("course-mock-interview-result-page", {
                header: defineContractComponent("centred-title-pair", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                    )),
                    description: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />
                    )),
                }),
                ...(input.state === "failed" ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{ message: input.props.failedLabel, actionLabel: input.props.retryLabel }}
                            on={{ act: input.on?.retry }}
                        />
                    )),
                } : {}),
                ...(input.state === "grading" ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice props={{ message: input.props.gradingLabel }} />
                    )),
                    grading: defineLeafComponent("progress", {}, () => (
                        <Progress props={{ label: input.props.gradingLabel }} isLoading />
                    )),
                } : {}),
                ...(ready ? {
                    scoreLabel: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: input.props.scoreLabel, size: "xs", tone: "muted" }} />
                    )),
                    score: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: `${input.props.score ?? 0}/100`, level: 1 }} />
                    )),
                    verdict: defineContractComponent("centred-title-pair", {
                        title: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.verdict, level: 2 }} />
                        )),
                        description: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: input.props.promptTitle, size: "sm", tone: "muted" }} />
                        )),
                    }),
                    phaseTitle: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.phaseTitle, level: 2 }} />
                    )),
                    phase: input.props.phases.map((item) => defineCompositeComponent("labelled-progress-row", {}, () => (
                        <LabelledProgressRow
                            props={{
                                id: item.id,
                                title: item.label,
                                percent: item.max === 0 ? 0 : (item.score / item.max) * 100,
                                percentText: `${item.score}/${item.max}`,
                            }}
                        />
                    ))),
                    strengthsTitle: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.strengthsTitle, level: 2 }} />
                    )),
                    strength: input.props.strengths.map((item) => defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: item, size: "sm" }} />
                    ))),
                    gapsTitle: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.gapsTitle, level: 2 }} />
                    )),
                    gap: input.props.gaps.map((item) => defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: item, size: "sm" }} />
                    ))),
                    ...(input.props.reviews.length === 0 ? {} : {
                        reviewsTitle: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.reviewsTitle, level: 2 }} />
                        )),
                        review: input.props.reviews.map((item) => defineCompositeComponent("evidence-row", {}, () => (
                            <EvidenceRow
                                props={{
                                    title: `${item.title}: ${item.answer}`,
                                    subtitle: item.feedback,
                                    fact: item.scoreLabel,
                                }}
                            />
                        ))),
                    }),
                } : {}),
                action,
            })}
        />
    )
}

/** Source-level ownership marker for the pure result twin. */
export const meta = { world: "pure", domain: "learn" } as const
