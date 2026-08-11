import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import { contractNodeProps, type ContractKey } from "@/components/contracts"
import { defineContractComponent, defineLeafComponent, type ContractBranchProps } from "@/components/contracts/props"

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
    const sectionNodeProps = contractNodeProps("label-over-list-and-caption")
    const label = defineContractComponent("title-with-end-action", {
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: props.label, level: 3 }} />
        )),
    })

    return (
        <div data-component="SurfaceListCard" {...sectionNodeProps}>
            <Tree contract="title-with-end-action" render={label} />
            <Tree contract={contract} render={render} />
            {props.actionLabel !== undefined && on?.act !== undefined ? (
                <Button props={{ label: props.actionLabel, size: "sm", variant: "primary" }} on={{ press: on.act }} />
            ) : props.description === undefined ? null : (
                <Text props={{ content: props.description, size: "sm", tone: "muted" }} isLoading={isLoading} />
            )}
        </div>
    )
}

/** Source-level tier marker for the joined-list branch. */
export const meta = { shape: "branch", contract: "label-over-list-and-caption", world: "pure" } as const
