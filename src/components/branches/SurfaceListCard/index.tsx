import { Card } from "@heroui/react"
import { ContractContent } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import { contractNodeProps, type ContractKey } from "@/components/contracts"
import type { ContractBranchProps } from "@/components/contracts/props"

/** Copy and optional outcome drawn around a joined list surface. */
export type SurfaceListCardData = {
    readonly label: string
    readonly description?: string
    readonly actionLabel?: string
}

/** The optional whole-list action reported below the joined surface. */
export type SurfaceListCardActions = {
    readonly act?: () => void
}

/** Contract-bound props for the joined-list surface branch. */
export type SurfaceListCardProps<K extends ContractKey> = ContractBranchProps<K> & {
    readonly props: SurfaceListCardData
    readonly on?: SurfaceListCardActions
}

/**
 * Draw a labelled, joined list. The list contract owns the admitted row identity and count;
 * this branch owns only the label above it and the whole-list outcome below it.
 */
export const SurfaceListCard = <const K extends ContractKey>({
    props,
    on,
    contract,
    render,
    isLoading = false,
}: SurfaceListCardProps<K>) => {
    const listNodeProps = contractNodeProps(contract)

    return (
        <div data-component="SurfaceListCard" className="flex flex-col gap-3">
            <Heading props={{ content: props.label, level: 3 }} />
            <Card data-component="SurfaceListCardSurface">
                <Card.Content {...listNodeProps} data-component="SurfaceListCardBody">
                    <ContractContent contract={contract} render={render} />
                </Card.Content>
            </Card>
            {props.actionLabel !== undefined && on?.act !== undefined ? (
                <Button props={{ label: props.actionLabel, size: "sm", variant: "primary" }} on={{ press: on.act }} />
            ) : props.description === undefined ? null : (
                <Text props={{ content: props.description, size: "sm", tone: "muted" }} isLoading={isLoading} />
            )}
        </div>
    )
}

/** Source-level tier marker for the joined-list branch. */
export const meta = { shape: "branch", world: "pure" } as const
