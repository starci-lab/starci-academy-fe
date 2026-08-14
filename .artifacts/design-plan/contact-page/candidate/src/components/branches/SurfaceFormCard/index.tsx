import { Card } from "@heroui/react"
import { Tree } from "~candidate/components/branches/Tree"
import type { ContractKey } from "~candidate/components/contracts"
import type { ContractBranchProps } from "~candidate/components/contracts/props"

/** Props for a card whose complete content is one typed form-oriented contract. */
export type SurfaceFormCardProps<K extends ContractKey> = ContractBranchProps<K>

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
    contract,
    render,
}: SurfaceFormCardProps<K>) => (
        <Card className="p-0" data-component="SurfaceFormCard">
            <Card.Content className="p-0" data-component="SurfaceFormCardBody">
                <Tree contract={contract} render={render} />
            </Card.Content>
        </Card>
    )

/** Source-level tier marker for the form surface branch. */
export const meta = { shape: "branch", world: "pure" } as const
