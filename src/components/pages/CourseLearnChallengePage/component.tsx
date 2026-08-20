import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { SurfaceAccordionCard } from "@/components/branches/SurfaceAccordionCard"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import {
    courseContentMapPanel,
    type CourseContentMapBaseProps,
} from "@/components/blocks/learn/CourseContentMap/component"
import { Field } from "@/components/composites/Field"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"

/** One authored challenge deliverable and its current repository input. */
export type CourseLearnChallengeDeliverable = {
    readonly id: string
    readonly title: string
    readonly description?: string
    readonly score: number
    readonly url?: string
}

/** The finite challenge states approved for the content-reader route. */
export type CourseLearnChallengePageState = "pending" | "ready" | "submitting" | "passed" | "failed"

/** All reader-facing challenge words, resolved by the connected locale owner. */
export type CourseLearnChallengeLabels = {
    readonly backToLesson: string
    readonly openCourseMap: string
    readonly closeCourseMap: string
    readonly brief: string
    readonly deliverables: string
    readonly score: string
    readonly repositoryPlaceholder: string
    readonly saved: string
    readonly submit: string
    readonly submitting: string
    readonly retry: string
    readonly result: string
    readonly points: (score: number) => string
    readonly scoreValue: (earned: number, maximum: number) => string
    readonly passing: (score: number) => string
    readonly scoreCaption: string
}

/** Pure challenge facts, labels and actions. */
export type CourseLearnChallengePageProps = {
    readonly state: CourseLearnChallengePageState
    readonly props: {
        readonly title: string
        readonly description: string
        readonly difficultyLabel: string
        readonly statusLabel: string
        readonly hint?: string
        readonly earnedScore: number
        readonly maximumScore: number
        readonly deliverables: ReadonlyArray<CourseLearnChallengeDeliverable>
        readonly expandedRequirementIds: ReadonlyArray<string>
        readonly activeSubmissionId?: string
        readonly failedSubmissionId?: string
        readonly notice?: string
        readonly isCourseMapOpen: boolean
        readonly courseMap: CourseContentMapBaseProps
        readonly labels: CourseLearnChallengeLabels
    }
    readonly on?: {
        readonly back?: () => void
        readonly openCourseMap?: () => void
        readonly closeCourseMap?: () => void
        readonly searchCourseMap?: (query: string) => void
        readonly openCourseMapItem?: (id: string) => void
        readonly toggleRequirement?: (id: string, isOpen: boolean) => void
        readonly changeUrl?: (id: string, value: string) => void
        readonly submit?: (id: string) => void
        readonly retry?: (id?: string) => void
        readonly openResult?: (id: string) => void
    }
}

const restingDeliverables: ReadonlyArray<CourseLearnChallengeDeliverable> = [0, 1].map((index) => ({
    id: `resting-deliverable-${index}`,
    title: "",
    score: 0,
}))

/** Draws the challenge brief, deliverables and every approved submission state without fetching. */
export const CourseLearnChallengePageBase = (input: CourseLearnChallengePageProps) => {
    const isLoading = input.state === "pending"
    const deliverables = isLoading ? restingDeliverables : input.props.deliverables
    const threshold = Math.ceil(input.props.maximumScore * 0.8)
    const scorePercent = input.props.maximumScore === 0
        ? 0
        : Math.round((input.props.earnedScore / input.props.maximumScore) * 100)
    const courseMap = courseContentMapPanel({
        ...input.props.courseMap,
        on: {
            search: input.on?.searchCourseMap,
            openLesson: input.on?.openCourseMapItem,
        },
    })

    const requirements = deliverables
        .filter((deliverable) => deliverable.description !== undefined || isLoading)
        .map((deliverable) => defineContractProjection("challenge-requirement-disclosure", () => (
            <SurfaceAccordionCard
                isOpen={input.props.expandedRequirementIds.includes(deliverable.id)}
                summaryContract="challenge-requirement-summary"
                summaryRender={defineContractComponent("challenge-requirement-summary", {
                    title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                        <Text
                            props={{ content: deliverable.title, size: "sm", weight: "semibold" }}
                            isLoading={isLoading}
                        />
                    )),
                    score: defineLeafComponent("badge", {}, () => (
                        <Badge
                            props={{ content: input.props.labels.points(deliverable.score) }}
                            isLoading={isLoading}
                        />
                    )),
                })}
                bodyContract="challenge-requirement-body"
                bodyRender={defineContractComponent("challenge-requirement-body", {
                    description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text
                            props={{ content: deliverable.description, size: "sm", tone: "muted" }}
                            isLoading={isLoading}
                        />
                    )),
                })}
                onOpenChange={(isOpen) => input.on?.toggleRequirement?.(deliverable.id, isOpen)}
            />
        )))

    const brief = defineContractComponent("challenge-brief", {
        overview: defineLeafComponent("text", {}, () => (
            <Text props={{ content: input.props.description }} isLoading={isLoading} />
        )),
        ...(requirements.length === 0 ? {} : { requirement: requirements }),
        ...(input.props.hint === undefined ? {} : {
            hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text
                    props={{ content: input.props.hint, size: "sm", tone: "muted", icon: "review" }}
                    isLoading={isLoading}
                />
            )),
        }),
    })

    const deliverableRows = deliverables.map((deliverable) => {
        const isActive = input.props.activeSubmissionId === deliverable.id
        const hasFailed = input.props.failedSubmissionId === deliverable.id
        const isPassed = input.state === "passed"
        const action = isPassed
            ? defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.labels.result, variant: "secondary", size: "sm" }}
                    on={{ press: () => input.on?.openResult?.(deliverable.id) }}
                    isLoading={isLoading}
                />
            ))
            : hasFailed
                ? defineLeafComponent("button", {}, () => (
                    <Button
                        props={{ label: input.props.labels.retry, variant: "primary", size: "sm", icon: "retry" }}
                        on={{ press: () => input.on?.retry?.(deliverable.id) }}
                    />
                ))
                : defineLeafComponent("button", {}, () => (
                    <Button
                        props={{
                            label: isActive ? input.props.labels.submitting : input.props.labels.submit,
                            variant: "primary",
                            size: "sm",
                            disabled: input.state === "submitting" || deliverable.url?.trim().length === 0,
                            isPending: input.state === "submitting" && isActive,
                        }}
                        on={{ press: () => input.on?.submit?.(deliverable.id) }}
                        isLoading={isLoading}
                    />
                ))

        const status = hasFailed
            ? input.props.notice
            : deliverable.url?.trim().length === 0 || isPassed
                ? undefined
                : input.props.labels.saved

        return defineContractComponent("challenge-deliverable-row", {
            heading: defineContractComponent("challenge-deliverable-heading", {
                title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                    <Text
                        props={{ content: deliverable.title, size: "sm", weight: "semibold" }}
                        isLoading={isLoading}
                    />
                )),
                score: defineLeafComponent("badge", {}, () => (
                    <Badge
                        props={{
                            content: input.props.labels.points(deliverable.score),
                            tone: isPassed ? "success" : "neutral",
                        }}
                        isLoading={isLoading}
                    />
                )),
            }),
            ...(deliverable.description === undefined ? {} : {
                description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text
                        props={{ content: deliverable.description, size: "sm", tone: "muted" }}
                        isLoading={isLoading}
                    />
                )),
            }),
            ...(isPassed ? {} : {
                field: defineCompositeComponent("field", {}, () => (
                    <Field
                        props={{
                            id: `challenge-submission-${deliverable.id}`,
                            name: `challenge-submission-${deliverable.id}`,
                            label: deliverable.title,
                            placeholder: input.props.labels.repositoryPlaceholder,
                            kind: "text",
                            disabled: input.state === "submitting",
                            hint: hasFailed ? input.props.notice : undefined,
                            isInvalid: hasFailed,
                        }}
                        on={{ change: (value) => input.on?.changeUrl?.(deliverable.id, value) }}
                        isLoading={isLoading}
                    />
                )),
            }),
            ...(status === undefined ? {} : {
                status: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text
                        props={{ content: status, size: "xs", tone: "muted", live: hasFailed ? "assertive" : "polite" }}
                    />
                )),
            }),
            actions: defineContractComponent("challenge-deliverable-actions", { action: [action] }),
        })
    })

    const deliverableList = defineContractComponent("challenge-deliverable-list", {
        ...(input.state === "failed" && deliverables.length === 0 ? {
            notice: defineLeafComponent("text", {}, () => (
                <Text props={{ content: input.props.notice, live: "assertive" }} />
            )),
        } : {}),
        ...(deliverableRows.length === 0 ? {} : { deliverable: deliverableRows }),
        ...(input.state === "failed" && deliverables.length === 0 ? {
            recovery: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.labels.retry, variant: "primary", icon: "retry" }}
                    on={{ press: () => input.on?.retry?.() }}
                />
            )),
        } : {}),
    })

    const score = defineContractComponent("challenge-score-card", {
        heading: defineContractComponent("challenge-score-heading", {
            value: defineLeafComponent("heading", {}, () => (
                <Heading
                    props={{
                        content: input.props.labels.scoreValue(input.props.earnedScore, input.props.maximumScore),
                        level: 3,
                    }}
                    isLoading={isLoading}
                />
            )),
            threshold: defineLeafComponent("badge", {}, () => (
                <Badge
                    props={{
                        content: input.props.labels.passing(threshold),
                        tone: input.state === "passed" ? "success" : "neutral",
                    }}
                    isLoading={isLoading}
                />
            )),
        }),
        progress: defineLeafComponent("progress", {}, () => (
            <Progress
                props={{ value: scorePercent, label: input.props.labels.score }}
                isLoading={isLoading}
            />
        )),
        caption: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: input.props.labels.scoreCaption, size: "xs", tone: "muted" }} />
        )),
    })

    const page = defineContractComponent("challenge-page-document", {
        mobileMap: defineContractComponent("challenge-mobile-map-row", {
            action: defineLeafComponent("button", {}, () => (
                <Button
                    props={{ label: input.props.labels.openCourseMap, variant: "outline", size: "sm", icon: "course" }}
                    on={{ press: input.on?.openCourseMap }}
                />
            )),
            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text
                    props={{ content: input.props.courseMap.props.progressFact, size: "xs", tone: "muted" }}
                    isLoading={input.props.courseMap.state === "pending"}
                />
            )),
        }),
        back: defineLeafComponent("button", {}, () => (
            <Button
                props={{ label: input.props.labels.backToLesson, variant: "ghost", size: "sm" }}
                on={{ press: input.on?.back }}
            />
        )),
        header: defineContractComponent("challenge-header", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />
            )),
            description: defineLeafComponent("text", {}, () => (
                <Text props={{ content: input.props.description, tone: "muted" }} isLoading={isLoading} />
            )),
            meta: defineContractComponent("profile-fact-run", {
                fact: [
                    defineLeafComponent("badge", {}, () => (
                        <Badge props={{ content: input.props.difficultyLabel, tone: "warning" }} isLoading={isLoading} />
                    )),
                    defineLeafComponent("badge", {}, () => (
                        <Badge
                            props={{ content: input.props.labels.points(input.props.maximumScore) }}
                            isLoading={isLoading}
                        />
                    )),
                    defineLeafComponent("badge", {}, () => (
                        <Badge
                            props={{ content: input.props.statusLabel, tone: input.state === "passed" ? "success" : "neutral" }}
                            isLoading={isLoading}
                        />
                    )),
                ],
            }),
        }),
        body: defineContractComponent("challenge-workspace", {
            brief: defineContractProjection("challenge-brief", () => (
                <SurfaceCard props={{ label: input.props.labels.brief }} contract="challenge-brief" render={brief} />
            )),
            rail: defineContractComponent("challenge-submission-rail", {
                deliverables: defineContractProjection("challenge-deliverable-list", () => (
                    <SurfaceCard
                        props={{ label: input.props.labels.deliverables }}
                        contract="challenge-deliverable-list"
                        render={deliverableList}
                    />
                )),
                score: defineContractProjection("challenge-score-card", () => (
                    <SurfaceCard props={{ label: input.props.labels.score }} contract="challenge-score-card" render={score} />
                )),
            }),
        }),
    })

    return (
        <>
            <Tree
                contract="course-learn-challenge-page"
                render={defineContractComponent("course-learn-challenge-page", {
                    contents: defineContractComponent("learn-route-context-rail", { panel: courseMap }),
                    page,
                })}
            />
            {input.props.isCourseMapOpen ? (
                <DrawerBranch
                    isOpen
                    placement="left"
                    title={input.props.labels.openCourseMap}
                    onDismiss={() => input.on?.closeCourseMap?.()}
                    contract="content-map-panel"
                    render={courseMap}
                />
            ) : null}
        </>
    )
}

/** Architectural identity for the pure challenge twin. */
export const meta = { world: "pure", domain: "learn" } as const
