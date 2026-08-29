import { StaticStateRow } from "@starci/grammar/core"

/** One read-only task row in a progress list. */
export type TaskProgressRowData = { readonly id: string; readonly title?: string; readonly fact?: string; readonly isComplete?: boolean }
/** Public inputs for a task progress row. */
export type TaskProgressRowProps = { readonly props: TaskProgressRowData; readonly isLoading?: boolean }

/** Draw the mark-title-fact task row. */
export const TaskProgressRow = (props: TaskProgressRowProps) => <StaticStateRow item={{
    id: props.props.id,
    label: props.props.title ?? "",
    description: props.props.fact,
    state: props.isLoading === true ? "pending" : props.props.isComplete === true ? "affirmative" : "neutral",
}} />
