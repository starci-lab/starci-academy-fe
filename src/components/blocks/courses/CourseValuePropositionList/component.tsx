import { SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { TaskProgressRow } from "@/components/composites/TaskProgressRow"

/** Resolved course promises plus the frame words SurfaceListCard owns. */
export type CourseValuePropositionListData = SurfaceListCardData & {
    readonly promises: ReadonlyArray<string>
}
/** Traditional state and data lanes for the promise list. */
export type CourseValuePropositionListProps = {
    readonly props: CourseValuePropositionListData
    readonly isLoading?: boolean
}

/**
 * Draw the shared ticked promise list used by catalog cards and course detail.
 *
 * `marked-row-list` owns the joined run and `TaskProgressRow` owns the completion mark. Keeping
 * both consumers on this component prevents a page-specific checklist from only resembling the
 * catalog reference while drifting in row anatomy, icon role or loading behavior.
 */
export const CourseValuePropositionList = (props: CourseValuePropositionListProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    return (
        <ul>
            {data.promises.map((promise, index) => (
                <li key={`promise-${index}`}>
                    <TaskProgressRow
                        props={{ id: `promise-${index}`, title: promise, isComplete: true }}
                        isLoading={isLoading}
                    />
                </li>
            ))}
        </ul>
    )
}
