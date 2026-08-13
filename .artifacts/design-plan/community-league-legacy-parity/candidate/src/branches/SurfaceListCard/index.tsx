import { Card } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import type { JoinedListContractKey } from "@/components/contracts"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import type { ContractRenderComponent, DataValue, LeafProps } from "@/components/contracts/props"

/**
 * TARGET PATH: src/components/branches/SurfaceListCard/index.tsx  (REVISION of the locked file)
 *
 * REVISION 1.2 — `isVerdict`.
 *
 * WHAT IT IS. A statement that the rows of THIS list carry data verdict bands on their leading
 * edge. The legacy render says the same thing by pairing `<SurfaceListCard bordered>` with
 * `<SurfaceListCardItem withVerdict>`: one border belongs to the list, and the band belongs to the
 * row inside it.
 *
 * WHAT IT OWNS. The body's own corner treatment. A rounded body clips its first and last rows, so
 * a straight 2px band at the top of the list gets shaved into a curve by the surface above it —
 * the list, not the row, is the only thing that can stop that.
 *
 * WHAT IT DOES NOT OWN, AND WHY. It cannot remove the radius on the ROW. `rounded-2xl` sits on the
 * row's own contract node, and a branch reaching down to restyle a child would make this card the
 * row's second owner — the exact thing the contract grammar exists to prevent. So the band's
 * squareness is settled where it lives: by dropping `rounded-2xl` from the two verdict row
 * contracts. `isVerdict` and that contract change are two halves of one repair, not alternatives.
 *
 * WHERE THE OUTER STACK COMES FROM. The column that holds label, surface and outcome is the
 * registry node `label-row-over-card` - the same key `SurfaceCard` declares in its own `meta`,
 * because it is the same anatomy: the name is held OUTSIDE the surface it names, one gap-3 seam
 * apart, so a list whose rows are themselves bounded never draws a card inside a card. It is drawn
 * through `Tree`, so the classes and the reason come off the entry rather than out of a literal
 * class string written here, and the interior arrives as a branch-owned projection because the
 * wrapper mechanics below the label - a vendor card whose body carries the surface context and the
 * verdict flag - are exactly what a contract cannot express.
 */

/** Copy and optional outcome drawn around a joined list surface. */
export type SurfaceListCardData = {
    readonly [key: string]: DataValue
    readonly label: string
    readonly fact?: string
    readonly description?: string
    readonly actionLabel?: string
    readonly isNested?: boolean
    readonly isLabelHidden?: boolean
    /**
     * This list's rows carry data verdict bands, so the body keeps square corners and the band
     * reads as one straight edge inside the list's single border.
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

/** Draw a labelled, joined list. */
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
        <Tree
            contract="label-row-over-card"
            render={defineContractProjection("label-row-over-card", () => (
                <>
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
                </>
            ))}
        />
    )
}

/** Source-level tier marker for the joined-list branch. */
export const meta = { shape: "branch", world: "pure" } as const
