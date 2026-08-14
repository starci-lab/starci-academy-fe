import { SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { TaskProgressRow } from "@/components/composites/TaskProgressRow"
import {
    defineCompositeComponent,
    defineContractComponent,
    type LeafProps,
} from "@/components/contracts/props"

/** Resolved course promises plus the frame words SurfaceListCard owns. */
export type CourseValuePropositionListData = SurfaceListCardData & {
    readonly promises: ReadonlyArray<string>
}

/**
 * Draw the shared ticked promise list used by catalog cards and course detail.
 *
 * `marked-row-list` owns the joined run and `TaskProgressRow` owns the completion mark. Keeping
 * both consumers on this component prevents a page-specific checklist from only resembling the
 * catalog reference while drifting in row anatomy, icon role or loading behavior.
 */
const CourseValuePropositionListView = ({
    props,
    isLoading = false,
}: LeafProps<CourseValuePropositionListData>) => (
    <Tree
        contract="marked-row-list"
        render={defineContractComponent("marked-row-list", {
            row: props.promises.map((promise, index) => defineCompositeComponent("task-progress-row", {}, () => (
                <TaskProgressRow
                    props={{ id: `promise-${index}`, title: promise, isComplete: true }}
                    isLoading={isLoading}
                />
            ))),
        })}
    />
)

/** Stable component type branded for the exact shared list contract. */
export const CourseValuePropositionList = defineContractComponent("marked-row-list", CourseValuePropositionListView)

/** Source-level ownership marker. */
export const meta = { shape: "block", world: "pure" } as const
