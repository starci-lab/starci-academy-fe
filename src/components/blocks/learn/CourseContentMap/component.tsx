import { Tree } from "@/components/branches/Tree"
import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Progress } from "@/components/leaves/Progress"
import { SearchBox } from "@/components/leaves/SearchBox"
import { SelectionList } from "@/components/leaves/SelectionList"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

/** One resolved lesson row in the course map. */
export type CourseContentMapLesson = {
    readonly id: string
    readonly title: string
    readonly meta: string
    readonly isComplete: boolean
    readonly isCurrent: boolean
}

/** One resolved module and the lesson rows currently visible under it. */
export type CourseContentMapModule = {
    readonly id: string
    readonly title: string
    readonly countLabel: string
    readonly progressLabel: string
    readonly completionPercent: number
    readonly isOpen: boolean
    readonly lessons: ReadonlyArray<CourseContentMapLesson>
}

/** Resolved reader-facing copy for the course map. */
export type CourseContentMapLabels = {
    readonly progress: string
    readonly searchPlaceholder: string
    readonly searchLabel: string
    readonly searchClearLabel: string
    readonly failed: string
}

/** Source-backed situations and data accepted by the pure course-map twin. */
export type CourseContentMapBaseProps = {
    readonly state: "pending" | "ready" | "empty" | "failed" | "partial"
    readonly props: {
        readonly labels: CourseContentMapLabels
        readonly completionPercent?: number
        readonly progressFact?: string
        readonly modules?: ReadonlyArray<CourseContentMapModule>
    }
    readonly on?: {
        readonly search?: (query: string) => void
        readonly toggleModule?: (id: string, isOpen: boolean) => void
        readonly openLesson?: (id: string) => void
    }
}

const restingModules = Array.from({ length: 4 }, (_, index) => ({
    id: `resting-module-${index}`,
    title: undefined,
    countLabel: undefined,
    progressLabel: "",
    completionPercent: 0,
    isOpen: false,
    lessons: [] as ReadonlyArray<CourseContentMapLesson>,
}))

/**
 * Bind the course-map data to its exact contract without drawing a second frame around it.
 *
 * The content reader and the challenge page need the same map in different mechanics: a sticky
 * desktop rail and, for the challenge, a narrow-screen drawer. Returning the bound contract keeps
 * both surfaces on one renderer instead of copying the map tree into each page owner.
 */
export const courseContentMapPanel = (input: CourseContentMapBaseProps) => {
    const isLoading = input.state === "pending"
    const modules = isLoading ? restingModules : input.props.modules ?? []
    const progressTitle = input.state === "failed" ? input.props.labels.failed : input.props.labels.progress

    return defineContractComponent("content-map-panel", {
        progress: defineCompositeComponent("labelled-progress-row", {}, () => (
            <LabelledProgressRow
                props={{
                    id: "course-outline-progress",
                    title: progressTitle,
                    percent: input.props.completionPercent,
                    percentText: input.props.progressFact,
                }}
                isLoading={isLoading}
            />
        )),
        search: defineLeafComponent("search-box", {}, () => (
            <SearchBox
                props={{
                    placeholder: input.props.labels.searchPlaceholder,
                    label: input.props.labels.searchLabel,
                    clearLabel: input.props.labels.searchClearLabel,
                }}
                on={{ search: input.on?.search }}
            />
        )),
        modules: defineContractProjection("content-map-module-list", () => (
            <ScrollViewport
                boundary="content-map-modules"
                render={defineContractComponent("content-map-module-list", {
                    module: modules.map((module) => defineContractProjection("content-map-module", () => (
                        <SurfaceAccordionCard
                            isOpen={module.isOpen}
                            renderSummary={(summary) => <Tree contract="content-map-module-summary" render={summary} />}
                            summaryRender={defineContractComponent("content-map-module-summary", {
                                copy: defineContractComponent("content-map-module-summary-copy", {
                                    title: defineLeafComponent("text", { size: "md", weight: "medium" }, () => (
                                        <Text
                                            props={{ content: module.title, size: "md", weight: "medium" }}
                                            isLoading={isLoading}
                                        />
                                    )),
                                    fact: module.isOpen ? undefined : defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                        <Text
                                            props={{ content: module.countLabel, size: "xs", tone: "muted" }}
                                            isLoading={isLoading}
                                        />
                                    )),
                                    progress: module.isOpen ? defineLeafComponent("progress", {}, () => (
                                        <Progress
                                            props={{ value: module.completionPercent, label: module.progressLabel }}
                                            isLoading={isLoading}
                                        />
                                    )) : undefined,
                                }),
                                caret: defineLeafComponent("disclosure-indicator", {}, () => (
                                    <DisclosureIndicator props={{ isOpen: module.isOpen }} />
                                )),
                            })}
                            renderBody={(body) => <Tree contract="content-map-module-body" render={body} />}
                            bodyRender={defineContractComponent("content-map-module-body", {
                                list: defineLeafComponent("selection-list", { variant: "outline" }, () => (
                                    <SelectionList
                                        props={{
                                            id: `course-outline-${module.id}`,
                                            label: module.title ?? input.props.labels.progress,
                                            variant: "outline",
                                            selectedKey: module.lessons.find((lesson) => lesson.isCurrent)?.id,
                                            items: (module.isOpen ? module.lessons : []).map((lesson) => ({
                                                id: lesson.id,
                                                textValue: lesson.title,
                                                title: lesson.title,
                                                meta: lesson.meta,
                                                icon: lesson.isComplete ? "complete" : "pending",
                                            })),
                                        }}
                                        on={{ activate: (id) => input.on?.openLesson?.(id) }}
                                        isLoading={isLoading}
                                    />
                                )),
                            })}
                            onOpenChange={(isOpen) => input.on?.toggleModule?.(module.id, isOpen)}
                        />
                    ))),
                })}
            />
        )),
    })
}

/** Draw progress, course search and the source-backed module/lesson map. */
export const CourseContentMapBase = (input: CourseContentMapBaseProps) => (
    <Tree contract="content-map-panel" render={courseContentMapPanel(input)} />
)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
