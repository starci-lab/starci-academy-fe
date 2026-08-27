import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import type { JoinedListContractKey } from "@/components/contracts"
import { SurfaceListCard as GrammarSurfaceListCard } from "@starci/grammar/core"
import type {
    ContractRenderComponent,
    DataValue,
    LeafProps,
} from "@/components/contracts/props"

/** Copy and optional outcome drawn around a joined list surface. */
export type SurfaceListCardData = {
    readonly [key: string]: DataValue
    readonly label: string
    /** A supporting status or figure at the end of the list label line. */
    readonly fact?: string
    readonly description?: string
    readonly actionLabel?: string
    /** A list bounded inside another surface uses an outline, never a second elevation. */
    readonly isNested?: boolean
    /** The enclosing surface already names this list; keep the name as data without drawing it twice. */
    readonly isLabelHidden?: boolean
    /**
     * The rows of THIS list carry data verdict bands on their leading edge.
     *
     * It owns the body's corner treatment and nothing else. A rounded body clips its first and
     * last rows, so a straight two-pixel band at the top of the list gets shaved into a curve by
     * the surface above it - and the list, not the row, is the only thing that can stop that.
     *
     * It cannot square the ROW. That radius lives on the row's own contract, and a branch reaching
     * down to restyle a child would make this card the row's second owner.
     */
    readonly isVerdict?: boolean
}

/** The optional whole-list action reported below the joined surface. */
export type SurfaceListCardActions = {
    readonly [key: string]: ((...args: Array<never>) => void) | undefined
    readonly act?: () => void
}

/** Contract-bound props for the joined-list surface branch. */
export type SurfaceListCardProps<
    K extends JoinedListContractKey,
    D extends SurfaceListCardData,
    A extends SurfaceListCardActions = SurfaceListCardActions,
> = {
    readonly contract: K
    readonly render: ContractRenderComponent<NoInfer<K>, LeafProps<D, A>>
    readonly props: D
    readonly on?: A
    readonly isLoading?: boolean
}

/**
 * Draw a labelled, joined list. The list contract owns the admitted row identity and count;
 * this branch owns only the label above it and the whole-list outcome below it.
 */
export const SurfaceListCard = <
    const K extends JoinedListContractKey,
    D extends SurfaceListCardData,
    A extends SurfaceListCardActions = SurfaceListCardActions,
>(input: SurfaceListCardProps<K, D, A>) => {
    const { props: surfaceProps, on, render, isLoading = false } = input
    const footer = surfaceProps.actionLabel !== undefined && (isLoading || on?.act !== undefined) ? (
        <Button props={{ label: surfaceProps.actionLabel, size: "sm", variant: "primary" }} on={{ press: on?.act }} isLoading={isLoading} />
    ) : surfaceProps.description === undefined ? undefined : (
        <Text props={{ content: surfaceProps.description, size: "xs", tone: "muted" }} isLoading={isLoading} />
    )

    return (
        <GrammarSurfaceListCard
            label={surfaceProps.label}
            fact={surfaceProps.fact}
            labelHidden={surfaceProps.isLabelHidden === true}
            footer={footer}
            depth={surfaceProps.isNested === true ? "nested" : "top"}
            isLoading={isLoading}
            isVerdict={surfaceProps.isVerdict === true}
            render={render}
            props={{ props: surfaceProps, on, isLoading }}
        />
    )
}

/** Source-level tier marker for the joined-list branch. */
export const meta = { shape: "branch", world: "pure" } as const
