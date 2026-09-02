import { Button, SurfaceListCard, Text } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { SelectionList, type SelectionListItem } from "@/components/leaves/SelectionList"

/** Existing list and empty-state data owned by the middle Global Search region. */
export type GlobalSearchResultsData = {
    readonly label: string
    readonly fact?: string
    readonly description?: string
    readonly actionLabel?: string
    readonly isVerdict?: boolean
    readonly isScrollable?: boolean
    readonly items: ReadonlyArray<SelectionListItem>
    readonly selectedKey?: string
    readonly emptyMessage: string
    readonly emptyDescription?: string
    readonly emptyActionLabel?: string
}

/** Selection, activation and empty recovery outcomes reported to the overlay owner. */
export type GlobalSearchResultsActions = {
    readonly act?: () => void
    readonly select?: (key: string) => void
    readonly recover?: () => void
}

/** Pure state for the reusable middle region. */
export type GlobalSearchResultsProps = {
    readonly props: GlobalSearchResultsData
    readonly on?: GlobalSearchResultsActions
    readonly isLoading?: boolean
}

const ResultsListView = ({ props, on, isLoading = false }: GlobalSearchResultsProps) => (
    <SelectionList
        props={{
            label: props.label,
            variant: "results",
            selectedKey: props.selectedKey,
            items: props.items,
        }}
        isLoading={isLoading}
        on={{ select: on?.select }}
    />
)

/** Draw a label-less nested list surface, or replace the whole middle region with EmptyNotice. */
export const GlobalSearchResultsBase = (props: GlobalSearchResultsProps) => {
    const isLoading = props.isLoading === true
    const footer = props.props.actionLabel !== undefined && (isLoading || props.on?.act !== undefined)
        ? <Button variant="primary" size="sm" isSkeleton={isLoading} onPress={props.on?.act}>{props.props.actionLabel}</Button>
        : props.props.description === undefined ? undefined : <Text size="xs" tone="muted" isSkeleton={isLoading}>{props.props.description}</Text>
    return <>
        {props.props.items.length === 0 ? null : (
            <SurfaceListCard
                label={props.props.label}
                fact={props.props.fact}
                labelHidden
                depth="nested"
                footer={footer}
                isLoading={isLoading}
                isVerdict={props.props.isVerdict}
                isScrollable={props.props.isScrollable}
            ><ResultsListView props={props.props} on={props.on} isLoading={props.isLoading} /></SurfaceListCard>
        )}
        {props.props.items.length > 0 ? null : (
            <EmptyNotice message={props.props.emptyMessage} description={props.props.emptyDescription} actionLabel={props.props.emptyActionLabel} iconSource={iconSourceFor("search", "leading")} onAction={({ act: props.on?.recover })?.act} />
        )}
    </>
}
