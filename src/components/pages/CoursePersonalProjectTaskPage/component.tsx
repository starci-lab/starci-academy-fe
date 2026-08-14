import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

/** Pure state and actions for one personal-project task submission surface. */
export type CoursePersonalProjectTaskPageProps = {
    readonly state: "pending" | "ready" | "submitting" | "failed"
    readonly props: {
        readonly title: string
        readonly description: string
        readonly scoreLabel?: string
        readonly notice?: string
        readonly submitLabel: string
        readonly retryLabel: string
    }
    readonly on?: {
        readonly submit?: () => void
        readonly retry?: () => void
    }
}

/** Draws task loading, submission and recovery states without fetching data. */
export const _CoursePersonalProjectTaskPage = (input: CoursePersonalProjectTaskPageProps) => {
    const loading = input.state === "pending"
    const failed = input.state === "failed"
    const controls = failed
        ? [
            defineLeafComponent("text", {}, () => (
                <Text props={{ content: input.props.notice, live: "assertive" }} />
            )),
            defineLeafComponent("button", {}, () => (
                <Button props={{ label: input.props.retryLabel }} on={{ press: input.on?.retry }} />
            )),
        ]
        : [
            defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text
                    props={{ content: input.props.scoreLabel, size: "sm", tone: "muted" }}
                    isLoading={loading}
                />
            )),
            defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: input.props.submitLabel,
                        variant: "primary",
                        isPending: input.state === "submitting",
                    }}
                    on={{ press: input.on?.submit }}
                    isLoading={loading}
                />
            )),
        ]

    return (
        <Tree
            contract="course-personal-project-task-page"
            render={defineContractComponent("course-personal-project-task-page", {
                header: defineContractComponent("centred-title-pair", {
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                    )),
                    description: defineLeafComponent("text", { size: "sm" }, () => (
                        <Text props={{ content: input.props.description, size: "sm" }} isLoading={loading} />
                    )),
                }),
                controls: defineContractComponent("stacked-peer-controls", { control: controls }),
            })}
        />
    )
}

/** Architectural identity for the pure task page twin. */
export const meta = { world: "pure", domain: "learn" } as const
