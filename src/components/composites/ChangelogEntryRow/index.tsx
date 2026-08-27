import { Badge, type BadgeTone } from "@/components/leaves/Badge"
import { Text } from "@/components/leaves/Text"
import { TextLink } from "@/components/leaves/TextLink"

/** One dated product update rendered inside a joined changelog list. */
export type ChangelogEntryRowData = {
    readonly id: string
    readonly dateLabel?: string
    readonly categoryLabel?: string
    readonly categoryTone?: BadgeTone
    readonly title?: string
    readonly body?: string
    readonly isAction?: boolean
}

/** What the changelog row reports when its title opens an update. */
export type ChangelogEntryRowActions = {
    readonly open?: () => void
}

/** Props for {@link ChangelogEntryRow}. */
export type ChangelogEntryRowProps = { readonly props: ChangelogEntryRowData; readonly on?: ChangelogEntryRowActions; readonly isLoading?: boolean }

/** Draw one changelog entry without owning the list surface or navigation. */
export const ChangelogEntryRow = (props: ChangelogEntryRowProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    return <div><div><Text props={{ content: data.dateLabel, size: "xs", tone: "muted" }} isLoading={isLoading} />{data.categoryLabel === undefined ? null : <Badge props={{ content: data.categoryLabel, tone: data.categoryTone }} isLoading={isLoading} />}</div>{data.isAction === true && on?.open !== undefined ? <TextLink props={{ label: data.title ?? "", size: "sm" }} on={{ press: on.open }} /> : <Text props={{ content: data.title, size: "sm", weight: "medium" }} isLoading={isLoading} />}{data.body === undefined && !isLoading ? null : <Text props={{ content: data.body, size: "xs", tone: "muted" }} isLoading={isLoading} />}</div>
}
