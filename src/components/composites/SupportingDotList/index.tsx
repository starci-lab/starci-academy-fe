import { Text } from "@starci/grammar/common"
import { supportingDotListClassName, supportingDotListRowClassName } from "./classNames"

/** One stable supporting statement. */
export type SupportingDotListEntry = { readonly id: string; readonly content: string }
/** Entries rendered by the dot list. */
export type SupportingDotListData = { readonly entries: ReadonlyArray<SupportingDotListEntry> }
/** Public inputs for the dot list. */
export type SupportingDotListProps = { readonly props: SupportingDotListData; readonly isLoading?: boolean }

/** Draw non-interactive supporting statements with accessible dot markers. */
export const SupportingDotList = (props: SupportingDotListProps) => {
    const { props: data, isLoading = false } = props
    return (
        <ul className={supportingDotListClassName}>{data.entries.map((entry) => <li className={supportingDotListRowClassName} key={entry.id}><Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{"•"}</Text><Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{entry.content}</Text></li>)}</ul>
    )
}
