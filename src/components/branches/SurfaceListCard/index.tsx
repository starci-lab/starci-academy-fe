import { Card } from "@heroui/react"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import { contractNodeProps, type JoinedListContractKey } from "@/components/contracts"
import type {
    ContractRenderComponent,
    DataValue,
    LeafProps,
} from "@/components/contracts/props"

/** Copy and optional outcome drawn around a joined list surface. */
export type SurfaceListCardData = {
    readonly [key: string]: DataValue
    readonly label: string
    readonly description?: string
    readonly actionLabel?: string
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
    const { props, on, contract, render, isLoading = false } = input
    const listNodeProps = contractNodeProps(contract)
    const Content = render
    const surfaceProps: SurfaceListCardData = props

    return (
        <div data-component="SurfaceListCard" className="flex flex-col gap-3">
            <Heading props={{ content: surfaceProps.label, level: 3 }} />
            <Card data-component="SurfaceListCardSurface">
                <Card.Content {...listNodeProps} data-component="SurfaceListCardBody">
                    <Content props={props} on={on} isLoading={isLoading} />
                </Card.Content>
            </Card>
            {surfaceProps.actionLabel !== undefined && on?.act !== undefined ? (
                <Button props={{ label: surfaceProps.actionLabel, size: "sm", variant: "primary" }} on={{ press: on.act }} />
            ) : surfaceProps.description === undefined ? null : (
                <Text props={{ content: surfaceProps.description, size: "sm", tone: "muted" }} isLoading={isLoading} />
            )}
        </div>
    )
}

/** Source-level tier marker for the joined-list branch. */
export const meta = { shape: "branch", world: "pure" } as const
