import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { SurfaceAccordionCard } from "@starci/grammar/core"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { DisclosureIndicator } from "@/components/leaves/DisclosureIndicator"
import { Progress } from "@/components/leaves/Progress"
import { SearchBox } from "@/components/leaves/SearchBox"
import { SelectionList } from "@/components/leaves/SelectionList"
import { Text } from "@/components/leaves/Text"
import {
    contentMapModuleBodyClassName,
    contentMapModuleListClassName,
    contentMapModuleSummaryClassName,
    contentMapModuleSummaryCopyClassName,
    contentMapPanelClassName,
} from "./classNames"

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
export type CourseContentMapProps = {
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
 * Bind the course-map data without drawing a second frame around it.
 *
 * The content reader and the challenge page need the same map in different mechanics: a sticky
 * desktop rail and, for the challenge, a narrow-screen drawer. Returning the bound panel keeps
 * both surfaces on one renderer instead of copying the map tree into each page owner.
 */
/** Public panel presentation shared by sticky and drawer contexts. */
export type CourseContentMapPanelProps = CourseContentMapProps
/** Render the course outline panel used by both rail and drawer layouts. */
export const CourseContentMapPanel = (props: CourseContentMapPanelProps) => {
    const isLoading = props.state === "pending"
    const modules = isLoading ? restingModules : props.props.modules ?? []
    const progressTitle = props.state === "failed" ? props.props.labels.failed : props.props.labels.progress
    return <nav className={contentMapPanelClassName} aria-label={props.props.labels.progress}>
        <LabelledProgressRow props={{ id: "course-outline-progress", title: progressTitle, percent: props.props.completionPercent, percentText: props.props.progressFact }} isLoading={isLoading} />
        <SearchBox props={{ placeholder: props.props.labels.searchPlaceholder, label: props.props.labels.searchLabel, clearLabel: props.props.labels.searchClearLabel }} on={{ search: props.on?.search }} />
        <ScrollViewport boundary="content-map-modules">
            <div className={contentMapModuleListClassName}>{modules.map((module) => (
                <SurfaceAccordionCard
                    key={module.id}
                    isOpen={module.isOpen}
                    summaryRender={<div className={contentMapModuleSummaryClassName}><div className={contentMapModuleSummaryCopyClassName}>
                        <Text props={{ content: module.title, size: "md", weight: "medium" }} isLoading={isLoading} />
                        {module.isOpen ? <Progress props={{ value: module.completionPercent, label: module.progressLabel }} isLoading={isLoading} /> : <Text props={{ content: module.countLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />}
                    </div><DisclosureIndicator props={{ isOpen: module.isOpen }} /></div>}
                    bodyRender={<div className={contentMapModuleBodyClassName}><SelectionList props={{ id: `course-outline-${module.id}`, label: module.title ?? props.props.labels.progress, variant: "outline", selectedKey: module.lessons.find((lesson) => lesson.isCurrent)?.id, items: (module.isOpen ? module.lessons : []).map((lesson) => ({ id: lesson.id, textValue: lesson.title, title: lesson.title, meta: lesson.meta, icon: lesson.isComplete ? "complete" : "pending" })) }} on={{ activate: (id) => props.on?.openLesson?.(id) }} isLoading={isLoading} /></div>}
                    renderSummary={(summary) => summary}
                    renderBody={(body) => body}
                    onOpenChange={(isOpen) => props.on?.toggleModule?.(module.id, isOpen)}
                />
            ))}</div>
        </ScrollViewport>
    </nav>
}

/** Draw progress, course search and the source-backed module/lesson map. */
export const CourseContentMapBase = (props: CourseContentMapProps) => <CourseContentMapPanel {...props} />
