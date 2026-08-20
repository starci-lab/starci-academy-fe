import { Tree } from "@/components/branches/Tree"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { ContentMapRow } from "@/components/leaves/ContentMapRow"
import { Icon } from "@/components/leaves/Icon"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
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
        readonly openLesson?: (id: string) => void
    }
}

const restingModules = Array.from({ length: 4 }, (_, index) => ({
    id: `resting-module-${index}`,
    title: undefined,
    countLabel: undefined,
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
        module: modules.map((module) => defineContractComponent("content-map-module", {
            title: defineContractComponent("content-map-module-summary", {
                title: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: module.title, size: "sm" }} isLoading={isLoading} />
                )),
                fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: module.countLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />
                )),
                caret: defineLeafComponent("icon", { role: "chip" }, () => (
                    <Icon props={{ name: "disclosure", role: "chip" }} />
                )),
            }),
            row: module.lessons.map((lesson) => defineLeafComponent("content-map-row", {}, () => (
                <ContentMapRow
                    props={lesson}
                    on={{ press: () => input.on?.openLesson?.(lesson.id) }}
                />
            ))),
        })),
    })
}

/** Draw progress, course search and the source-backed module/lesson map. */
export const CourseContentMapBase = (input: CourseContentMapBaseProps) => (
    <Tree contract="content-map-panel" render={courseContentMapPanel(input)} />
)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
