import { ContractContent } from "~candidate/components/branches/Tree"
import { contractNodeProps, type ContractKey } from "~candidate/components/contracts"
import type { ContractComponent } from "~candidate/components/contracts/props"

/** Props for a contract-owned row whose native host is a button. */
export type PressableTreeProps<K extends ContractKey> = {
    readonly contract: K
    readonly render: ContractComponent<NoInfer<K>>
    readonly label: string
    readonly press?: () => void
    /** Prevent activation while a route is unavailable or already resolving. */
    readonly disabled?: boolean
}

/**
 * BRANCH - draw validated contract content on one native button host.
 *
 * Tree owns the normal div host; this branch owns the one semantic difference needed by a closed
 * pressable composition. Layout still comes only from the contract registry.
 */
export const PressableTree = <const K extends ContractKey>({
    contract,
    render,
    label,
    press,
    disabled = false,
}: PressableTreeProps<K>) => (
        <button type="button" aria-label={label} onClick={press} disabled={disabled} aria-busy={disabled || undefined} {...contractNodeProps(contract)}>
            <ContractContent contract={contract} render={render} />
        </button>
    )

/** Source-level tier marker for the contract-owned native button host. */
export const meta = { shape: "branch", world: "pure" } as const
