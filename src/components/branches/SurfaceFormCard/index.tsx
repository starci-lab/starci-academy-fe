import { Card } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import type { ContractKey } from "@/components/contracts"
import { STARCI_ACADEMY_GRAMMAR_CONTRACTS } from "@/components/contracts/grammar"
import { treatmentFor } from "@starci/grammar/core"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type ContractBranchProps,
} from "@/components/contracts/props"

/** Props for a card whose complete content is one typed form-oriented contract. */
export type SurfaceFormCardProps<K extends ContractKey> = ContractBranchProps<K> & {
    readonly props?: { readonly label?: string }
}

/**
 * Draw one bounded form surface without adding a title or another layout node around its content.
 *
 * THE ENTRY'S NODE IS RENDERED, NOT IMITATED. Spreading `contractNodeProps` onto the vendor card
 * copied an entry's classes and markers onto an element the entry never named, and silently threw
 * away its `host`: a key declaring `host: "form"` came out a `div`, so the thing that exists in
 * order to submit stopped being one, while the markers went on claiming the contract was kept.
 * Nothing could report that - not the compiler, not a rule, not a screenshot. So the frame draws
 * the key, and the vendor body is emptied of its own inset because the entry owns the inset.
 *
 * @param input - {@link SurfaceFormCardProps}
 */
export const SurfaceFormCard = <const K extends ContractKey>({
    props = {},
    contract,
    render,
}: SurfaceFormCardProps<K>) => {
    const treatment = treatmentFor("neutral")
    const surface = (
        <Card
            className="starci-core-surface p-0"
            data-component="SurfaceFormCard"
            data-grammar-frame="bounded"
            data-grammar-state="neutral"
            data-grammar-surface="true"
            data-grammar-surface-depth="top"
            data-grammar-treatment={treatment.tone}
        >
            <Card.Content className="starci-core-surface-content p-0" data-component="SurfaceFormCardBody" data-grammar-surface-content="true">
                <Tree contract={contract} render={render} />
            </Card.Content>
        </Card>
    )
    if (props.label === undefined) return (
        <div className="starci-core-surface-card" data-grammar-contract={STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceCard.key} data-grammar-frame="bounded" data-grammar-surface-card="true">
            {surface}
        </div>
    )
    return (
        <div className="starci-core-surface-card" data-grammar-contract={STARCI_ACADEMY_GRAMMAR_CONTRACTS.surfaceCard.key} data-grammar-frame="bounded" data-grammar-surface-card="true">
            <Tree contract="label-row-over-card" render={defineContractComponent("label-row-over-card", {
                label: defineContractProjection("title-with-end-action", () => (
                    <div className="starci-core-surface-label" data-grammar-surface-label="true">
                        <Tree contract="title-with-end-action" render={defineContractComponent("title-with-end-action", {
                            title: defineLeafComponent("heading", {}, () => (
                                <Heading props={{ content: props.label, level: 3 }} />
                            )),
                        })} />
                    </div>
                )),
                body: defineContractProjection(contract, () => surface),
            })} />
        </div>
    )
}

/** Source-level tier marker for the form surface branch. */
export const meta = { shape: "branch", world: "pure" } as const
