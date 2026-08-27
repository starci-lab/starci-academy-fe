import { Text } from "@/components/leaves/Text"

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
        <ul>{data.entries.map((entry) => <li key={entry.id}><Text props={{ content: "•", size: "sm", tone: "muted" }} isLoading={isLoading} /><Text props={{ content: entry.content, size: "sm", tone: "muted" }} isLoading={isLoading} /></li>)}</ul>
    )
}
