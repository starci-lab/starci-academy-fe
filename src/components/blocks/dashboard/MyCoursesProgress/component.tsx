import { CONTRACTS } from "@/components/contracts"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { CourseProgressRow, type CourseProgressRowData } from "@/components/composites/CourseProgressRow"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { defineCompositeComponent, defineContractComponent, type LeafProps } from "@/components/contracts/props"

/** Resolved frame and rows for enrolled-course progress. */
export type MyCoursesProgressData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<CourseProgressRowData>
    readonly emptyMessage?: string
    readonly errorMessage?: string
    readonly retryLabel?: string
}
/** Retry and per-course navigation actions. */
export type MyCoursesProgressActions = { readonly [key: string]: (() => void) | undefined }
/** Situation-discriminated props for enrolled-course progress. */
export type MyCoursesProgressProps = {
    readonly state: "pending" | "empty" | "failed" | "ready"
    readonly props: MyCoursesProgressData
    readonly on?: MyCoursesProgressActions
}

const COUNT = CONTRACTS["course-progress-list"].children.course.restingCount
const CourseListView = ({ props, on, isLoading = false }: LeafProps<MyCoursesProgressData, MyCoursesProgressActions>) => {
    const rows = isLoading ? Array.from({ length: COUNT }, (_, index): CourseProgressRowData => ({
        id: `resting-${index}`,
        dimensions: [
            { id: "content", label: "", completed: 0, total: 0, percent: 0, tone: "accent" },
            { id: "challenge", label: "", completed: 0, total: 0, percent: 0, tone: "success" },
            { id: "milestone", label: "", completed: 0, total: 0, percent: 0, tone: "warning" },
        ],
    })) : props.rows
    return <Tree contract="course-progress-list" render={defineContractComponent("course-progress-list", {
        course: rows.map((row) => defineCompositeComponent("course-progress-row", {}, () => (
            <CourseProgressRow props={row} on={{ open: on?.[`open:${row.id}`] }} isLoading={isLoading} />
        ))),
    })} />
}
const CourseList = defineContractComponent("course-progress-list", CourseListView)

/** Draw enrolled-course progress, keeping every request outcome local to the block. */
export const MyCoursesProgressBase = (input: MyCoursesProgressProps) => {
    if (input.state === "empty" || input.state === "failed") {
        const message = input.state === "empty" ? input.props.emptyMessage : input.props.errorMessage
        return <SurfaceCard props={{ label: input.props.label }} contract="empty-notice-card" render={defineContractComponent("empty-notice-card", {
            notice: defineCompositeComponent("empty-notice", {}, () => <EmptyNotice
                props={{ icon: "course", message: message ?? "", actionLabel: input.props.retryLabel }}
                on={{ act: input.on?.retry }}
            />),
        })} />
    }
    return <SurfaceListCard
        contract="course-progress-list"
        render={CourseList}
        props={input.props}
        on={input.on}
        isLoading={input.state === "pending"}
    />
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
