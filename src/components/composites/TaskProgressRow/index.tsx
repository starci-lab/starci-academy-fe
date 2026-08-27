import { Text } from "@/components/leaves/Text"
import { Icon } from "@/components/leaves/Icon"

/** One read-only task row in a progress list. */
export type TaskProgressRowData = { readonly id: string; readonly title?: string; readonly fact?: string; readonly isComplete?: boolean }
/** Public inputs for a task progress row. */
export type TaskProgressRowProps = { readonly props: TaskProgressRowData; readonly isLoading?: boolean }

/** Draw the mark-title-fact task row. */
export const TaskProgressRow = (props: TaskProgressRowProps) => <div>
    <Icon props={{ name: props.props.isComplete === true ? "complete" : "pending", role: "leading" }} isLoading={props.isLoading ?? false} />
    <Text props={{ content: props.props.title, size: "sm" }} isLoading={props.isLoading ?? false} />
    <Text props={{ content: props.props.fact, size: "xs" }} isLoading={props.isLoading ?? false} />
</div>
