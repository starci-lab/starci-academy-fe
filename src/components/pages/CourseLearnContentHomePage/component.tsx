import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { CONTRACTS } from "@/components/contracts"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { NavLink } from "@/components/leaves/NavLink"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"

/** One lesson destination inside the module currently carrying the resume target. */
export type CourseContentHomeLesson = {
    readonly id: string
    readonly moduleId: string
    readonly title: string
    readonly fact?: string
    readonly isCurrent?: boolean
}

/** One current module and the ordered lesson path shown on the overview. */
export type CourseContentHomeModule = {
    readonly title: string
    readonly lessons: ReadonlyArray<CourseContentHomeLesson>
}

/** Resolved course identity, progress evidence and recovery copy for the pure overview page. */
export type CourseLearnContentHomeData = {
    readonly title: string
    readonly breadcrumbLabel: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly metaFacts: ReadonlyArray<string>
    readonly gateMessages: ReadonlyArray<string>
    readonly resumeEyebrow: string
    readonly resumeTarget: string
    readonly resumeAction?: string
    readonly progressLabel: string
    readonly completionPercent?: number
    readonly progressFact: string
    readonly currentModule?: CourseContentHomeModule
    readonly emptyMessage: string
    readonly failedMessage: string
    readonly retryLabel: string
}

/** Navigation and recovery events reported by the pure content-home overview. */
export type CourseLearnContentHomeActions = {
    readonly course?: () => void
    readonly resume?: () => void
    readonly lesson?: (moduleId: string, lessonId: string) => void
    readonly retry?: () => void
}

/** Complete source-backed states for the course content-home overview. */
export type CourseLearnContentHomeProps = BlockProps<
    "pending" | "ready" | "empty" | "failed" | "partial",
    CourseLearnContentHomeData
> & { readonly on?: CourseLearnContentHomeActions }

/** Draw course identity, continuation evidence and the current module path without owning transport. */
export const CourseLearnContentHomePageBase = (input: CourseLearnContentHomeProps) => {
    const isLoading = input.state === "pending"
    const lessons: ReadonlyArray<CourseContentHomeLesson> = isLoading && input.props.currentModule === undefined
        ? Array.from(
            { length: CONTRACTS["course-content-current-module-path"].children.lesson.restingCount },
            (_unused, index) => ({ id: `resting-${index + 1}`, moduleId: "", title: "" }),
        )
        : input.props.currentModule?.lessons ?? []
    const notice = input.state === "failed" || input.state === "empty"
        ? defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    icon: "course",
                    message: input.state === "failed" ? input.props.failedMessage : input.props.emptyMessage,
                    actionLabel: input.state === "failed" ? input.props.retryLabel : undefined,
                }}
                on={{ act: input.on?.retry }}
            />
        ))
        : undefined

    return (
        <Tree contract="course-content-home-overview-page" render={defineContractComponent("course-content-home-overview-page", {
            header: defineContractComponent("page-header-stack", {
                trail: defineLeafComponent("breadcrumbs", {}, () => (
                    <Breadcrumbs
                        props={{ steps: input.props.trail, label: input.props.breadcrumbLabel }}
                        on={isLoading ? undefined : { course: input.on?.course }}
                        isLoading={isLoading}
                    />
                )),
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />
                )),
            }),
            meta: input.props.metaFacts.length === 0 ? undefined : defineContractComponent("course-content-meta-row", {
                fact: input.props.metaFacts.map((fact) => defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: fact, size: "sm", tone: "muted" }} isLoading={isLoading} />
                ))),
            }),
            gates: input.props.gateMessages.length === 0 ? undefined : defineContractComponent("course-content-gate-run", {
                gate: input.props.gateMessages.map((message) => defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: message, size: "sm" }} />
                ))),
            }),
            resume: defineContractComponent("course-content-resume-progress", {
                eyebrow: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: input.props.resumeEyebrow, size: "xs", tone: "muted" }} isLoading={isLoading} />
                )),
                target: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.resumeTarget, level: 2 }} isLoading={isLoading} />
                )),
                action: input.props.resumeAction === undefined ? undefined : defineLeafComponent("button", {}, () => (
                    <Button
                        props={{ label: input.props.resumeAction ?? "", variant: "primary", size: "md", icon: "next", iconPlacement: "trailing" }}
                        on={isLoading ? undefined : { press: input.on?.resume }}
                        isLoading={isLoading}
                    />
                )),
                progress: defineLeafComponent("progress", {}, () => (
                    <Progress props={{ value: input.props.completionPercent, label: input.props.progressLabel }} isLoading={isLoading} />
                )),
                fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: input.props.progressFact, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
            }),
            module: input.state === "failed" || lessons.length === 0 ? undefined : defineContractComponent("course-content-current-module-path", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.currentModule?.title ?? "", level: 2 }} isLoading={isLoading} />
                )),
                lesson: lessons.map((lesson) => defineContractComponent("course-content-lesson-row", {
                    lesson: defineLeafComponent("nav-link", { kind: "section" }, () => (
                        <NavLink
                            props={{ label: lesson.title, kind: "section", isCurrent: lesson.isCurrent }}
                            on={isLoading ? undefined : { press: () => input.on?.lesson?.(lesson.moduleId, lesson.id) }}
                            isLoading={isLoading}
                        />
                    )),
                    fact: lesson.fact === undefined ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: lesson.fact ?? "", size: "xs", tone: "muted" }} />
                    )),
                })),
            }),
            notice,
        })} />
    )
}

/** Purity and ownership metadata for the course content-home overview twin. */
export const meta = { world: "pure", domain: "learn" } as const
