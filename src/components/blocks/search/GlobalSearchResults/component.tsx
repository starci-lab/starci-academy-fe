import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { SelectionList, type SelectionListItem } from "@/components/leaves/SelectionList"

/** Existing list and empty-state data owned by the middle Global Search region. */
export type GlobalSearchResultsData = SurfaceListCardData & {
    readonly items: ReadonlyArray<SelectionListItem>
    readonly selectedKey?: string
    readonly emptyMessage: string
    readonly emptyDescription?: string
    readonly emptyActionLabel?: string
}

/** Selection, activation and empty recovery outcomes reported to the overlay owner. */
export type GlobalSearchResultsActions = SurfaceListCardActions & {
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
export const GlobalSearchResultsBase = (props: GlobalSearchResultsProps) => (
    <>
        {props.props.items.length === 0 ? null : (
            <SurfaceListCard
                props={{ ...props.props, isNested: true, isLabelHidden: true }}
                on={props.on}
                isLoading={props.isLoading}
            ><ResultsListView props={{ ...props.props, isNested: true, isLabelHidden: true }} on={props.on} isLoading={props.isLoading} /></SurfaceListCard>
        )}
        {props.props.items.length > 0 ? null : (
            <EmptyNotice
                props={{
                    icon: "search",
                    message: props.props.emptyMessage,
                    description: props.props.emptyDescription,
                    actionLabel: props.props.emptyActionLabel,
                }}
                on={{ act: props.on?.recover }}
            />
        )}
    </>
)
