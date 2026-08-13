import { Card } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import type { JoinedListContractKey } from "@/components/contracts"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
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
    const { props, on, render, isLoading = false } = input
    const Content = render
    const surfaceProps: SurfaceListCardData = props
    const label = surfaceProps.fact === undefined ? (
        <Heading props={{ content: surfaceProps.label, level: 3 }} />
    ) : (
        <Tree
            contract="label-with-muted-fact-row"
            render={defineContractComponent("label-with-muted-fact-row", {
                label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                    <Text props={{ content: surfaceProps.label, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                )),
                fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: surfaceProps.fact, size: "xs", tone: "muted" }} isLoading={isLoading} />
                )),
            })}
        />
    )

    return (
        <div data-component="SurfaceListCard" className="flex flex-col gap-3">
            {surfaceProps.isLabelHidden === true ? null : label}
            <Card
                className="p-0"
                data-component="SurfaceListCardSurface"
                data-surface-context={surfaceProps.isNested === true ? "nested" : "page"}
                data-verdict={surfaceProps.isVerdict === true ? "true" : "false"}
            >
                <Card.Content
                    className={surfaceProps.isVerdict === true ? "rounded-none p-0" : "p-0"}
                    data-component="SurfaceListCardBody"
                >
                    <Content props={props} on={on} isLoading={isLoading} />
                </Card.Content>
            </Card>
            {surfaceProps.actionLabel !== undefined && (isLoading || on?.act !== undefined) ? (
                <Button props={{ label: surfaceProps.actionLabel, size: "sm", variant: "primary" }} on={{ press: on?.act }} isLoading={isLoading} />
            ) : surfaceProps.description === undefined ? null : (
                <Text props={{ content: surfaceProps.description, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )}
        </div>
    )
}

/** Source-level tier marker for the joined-list branch. */
export const meta = { shape: "branch", world: "pure" } as const
