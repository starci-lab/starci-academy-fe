import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { SelectionList, type SelectionListItem } from "@/components/leaves/SelectionList"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

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

const ResultsListView = ({ props, on, isLoading = false }: LeafProps<GlobalSearchResultsData, GlobalSearchResultsActions>) => (
    <Tree
        contract="global-search-surface-list"
        render={defineContractComponent("global-search-surface-list", {
            list: [defineLeafComponent("selection-list", {}, () => (
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
            ))],
        })}
    />
)

const ResultsList = defineContractComponent("global-search-surface-list", ResultsListView)

/** Draw a label-less nested list surface, or replace the whole middle region with EmptyNotice. */
export const _GlobalSearchResults = (input: GlobalSearchResultsProps) => (
    <Tree
        contract="global-search-result-region"
        render={defineContractComponent("global-search-result-region", {
            list: input.props.items.length === 0 ? undefined : defineContractProjection("global-search-surface-list", () => (
                <SurfaceListCard
                    contract="global-search-surface-list"
                    render={ResultsList}
                    props={{ ...input.props, isNested: true, isLabelHidden: true }}
                    on={input.on}
                    isLoading={input.isLoading}
                />
            )),
            notice: input.props.items.length > 0 ? undefined : defineCompositeComponent("empty-notice", {}, () => (
                <EmptyNotice
                    props={{
                        icon: "search",
                        message: input.props.emptyMessage,
                        description: input.props.emptyDescription,
                        actionLabel: input.props.emptyActionLabel,
                    }}
                    on={{ act: input.on?.recover }}
                />
            )),
        })}
    />
)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "search" } as const
