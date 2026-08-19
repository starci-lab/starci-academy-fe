import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

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
export type CourseLearnChallengeResultPageProps = {
    readonly state: "pending" | "ready" | "failed"
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
    }
    readonly on?: {
        readonly reload?: () => void
        readonly retry?: () => void
        readonly next?: () => void
    }
}

/** Draws pending, graded and failed challenge-result states without querying. */
export const CourseLearnChallengeResultPageBase = (input: CourseLearnChallengeResultPageProps) => {
    const loading = input.state === "pending"
    const controls = input.state === "failed"
        ? [
            defineLeafComponent("text", {}, () => (
                <Text props={{ content: input.props.notice, live: "assertive" }} />
            )),
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.reloadLabel }} on={{ press: input.on?.reload }} />
            )),
        ]
        : input.state === "pending"
            ? [
                defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.retryLabel }} isLoading />
                )),
                defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.nextLabel, variant: "primary" }} isLoading />
                )),
            ]
            : [
                ...(input.props.shortFeedback === undefined ? [] : [
                    defineLeafComponent("text", {}, () => (
                        <Text props={{ content: input.props.shortFeedback }} isLoading={loading} />
                    )),
                ]),
                ...input.props.feedbacks.flatMap((feedback) => [
                    defineLeafComponent("text", { weight: "semibold" }, () => (
                        <Text props={{ content: feedback.message, weight: "semibold" }} />
                    )),
                    defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: feedback.severity, size: "sm", tone: "muted" }} />
                    )),
                    ...(feedback.detail === undefined ? [] : [
                        defineLeafComponent("text", {}, () => <Text props={{ content: feedback.detail }} />),
                    ]),
                    ...(feedback.location === undefined ? [] : [
                        defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: feedback.location, size: "sm" }} />
                        )),
                    ]),
                    ...(feedback.suggestion === undefined ? [] : [
                        defineLeafComponent("text", {}, () => <Text props={{ content: feedback.suggestion }} />),
                    ]),
                ]),
                defineLeafComponent("button", {}, () => (
                    <Button props={{ label: input.props.retryLabel }} on={{ press: input.on?.retry }} isLoading={loading} />
                )),
                defineLeafComponent("button", {}, () => (
                    <Button
                        props={{ label: input.props.nextLabel, variant: "primary" }}
                        on={{ press: input.on?.next }}
                        isLoading={loading}
                    />
                )),
            ]

    return (
        <Tree
            contract="course-learn-challenge-result-page"
            render={defineContractComponent("course-learn-challenge-result-page", {
                header: defineContractComponent("centred-title-pair", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                    )),
                    description: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: input.props.description, size: "sm" }} isLoading={loading} />
                    )),
                }),
                score: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text
                        props={{ content: input.props.scoreLine, size: "sm", tone: "muted" }}
                        isLoading={loading}
                    />
                )),
                body: defineContractComponent("stacked-peer-controls", { control: controls }),
            })}
        />
    )
}

/** Architectural identity for the pure result twin. */
export const meta = { world: "pure", domain: "learn" } as const
