import { Badge, type BadgeTone } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { changelogEntryMetaClassName, changelogEntryRowClassName } from "./classNames"
import { TextAction } from "@starci/grammar/common"


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
    return (
        <div className={changelogEntryRowClassName} data-part="changelog-entry">
            <div className={changelogEntryMetaClassName} data-part="changelog-meta">
                <Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.dateLabel}</Text>
                {data.categoryLabel === undefined ? null : (
                    <Badge tone={data.categoryTone} isSkeleton={isLoading}>{data.categoryLabel}</Badge>
                )}
            </div>
            {data.isAction === true && on?.open !== undefined ? (
                <TextAction size={"sm"} appearance="inline" onPress={on.open}>{data.title ?? ""}</TextAction>
            ) : (
                <Text size={"sm"} weight={"normal"} isSkeleton={isLoading}>{data.title}</Text>
            )}
            {data.body === undefined && !isLoading ? null : (
                <Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.body}</Text>
            )}
        </div>
    )
}
