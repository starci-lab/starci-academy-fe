import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** One ordered task destination on the personal-project dashboard. */
export type CoursePersonalProjectTaskRow = {
    readonly id: string
    readonly label: string
    readonly isCurrent?: boolean
}

/** Pure dashboard states, progress facts and navigation actions. */
export type CoursePersonalProjectPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly description: string
        readonly progressLabel: string
        readonly progressText?: string
        readonly completionPercent?: number
        readonly tasks: ReadonlyArray<CoursePersonalProjectTaskRow>
        readonly notice?: string
        readonly retryLabel: string
    }
    readonly on?: { readonly openTask?: (id: string) => void; readonly retry?: () => void }
}

/** Draws the personal-project overview without owning transport or routing. */
export const CoursePersonalProjectPageBase = (input: CoursePersonalProjectPageProps) => {
    const loading = input.state === "pending"
    const tasks: ReadonlyArray<CoursePersonalProjectTaskRow> = loading && input.props.tasks.length === 0
        ? Array.from({ length: 4 }, (_, index) => ({ id: `pending-${index}`, label: "", isCurrent: false }))
        : input.props.tasks
    return (
        <Tree
            contract="course-personal-project-page"
            render={defineContractComponent("course-personal-project-page", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={loading} />
                )),
                description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.description, size: "sm", tone: "muted" }} isLoading={loading} />
                )),
                progress: defineLeafComponent("progress", {}, () => (
                    <Progress props={{ value: input.props.completionPercent, label: input.props.progressLabel }} isLoading={loading} />
                )),
                fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.progressText, size: "sm", tone: "muted" }} isLoading={loading} />
                )),
                task: tasks.map((task) => defineLeafComponent("nav-link", { kind: "section" }, () => (
                    <NavLink
                        props={{ label: task.label, kind: "section", isCurrent: task.isCurrent }}
                        on={{ press: () => input.on?.openTask?.(task.id) }}
                        isLoading={loading}
                    />
                ))),
                ...(input.props.notice === undefined ? {} : {
                    notice: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: input.props.notice, size: "sm", tone: "muted" }} />
                    )),
                }),
                ...(input.state !== "failed" ? {} : {
                    retry: defineLeafComponent("button", {}, () => (
                        <Button props={{ label: input.props.retryLabel }} on={{ press: input.on?.retry }} />
                    )),
                }),
            })}
        />
    )
}

/** Architectural identity for the pure personal-project dashboard twin. */
export const meta = { world: "pure", domain: "learn" } as const
