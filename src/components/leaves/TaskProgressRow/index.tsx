import { skeletonVariants } from "@heroui/react"
import { Text } from "@/components/leaves/Text"
import type { LeafProps } from "@/components/contracts/props"

/** One read-only task row in a joined progress list. */
export type TaskProgressRowData = {
    readonly id: string
    readonly title?: string
    readonly fact?: string
    readonly isComplete?: boolean
}

/** Fixed leaf props for a task progress row. */
export type TaskProgressRowProps = LeafProps<TaskProgressRowData>

const ROOT_CLASSES = "flex min-h-16 w-full flex-row items-center gap-3 px-4 py-3"
const MARK_CLASSES = "size-5 shrink-0 rounded-full border-2"
const TITLE_CLASSES = "min-w-0 grow"
const RESTING_MARK_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "size-5 shrink-0 rounded-full",
})

/** Draw the fixed mark-title-fact row used by a SurfaceListCard task list. */
export const TaskProgressRow = ({ props, isLoading = false }: TaskProgressRowProps) => (
    <div data-tier="leaf" data-component="TaskProgressRow" className={ROOT_CLASSES}>
        <span
            aria-hidden="true"
            data-complete={props.isComplete === true ? "true" : "false"}
            className={isLoading ? RESTING_MARK_CLASSES : MARK_CLASSES}
        />
        <span className={TITLE_CLASSES}>
            <Text props={{ content: props.title }} isLoading={isLoading} />
        </span>
        <Text props={{ content: props.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />
    </div>
)

/** Source-level tier marker for the task row leaf. */
export const meta = { shape: "leaf", world: "pure" } as const
