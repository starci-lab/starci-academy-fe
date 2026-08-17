import { Tree } from "@/components/branches/Tree"
import type { ContractKey } from "@/components/contracts"
import type { ContractComponent } from "@/components/contracts/props"

/** Typed summary and body nodes hosted by one native disclosure control. */
export type DisclosureBranchProps<SK extends ContractKey, BK extends ContractKey> = {
    readonly isOpen: boolean
    readonly summaryContract: SK
    readonly summaryRender: ContractComponent<NoInfer<SK>>
    readonly bodyContract: BK
    readonly bodyRender: ContractComponent<NoInfer<BK>>
    readonly onOpenChange: (isOpen: boolean) => void
}

/**
 * Host two checked contract nodes in the browser's native disclosure mechanics.
 *
 * The fixed classes belong to the mechanics: the details stack separates its summary from its
 * body, while summary removes the browser inset and marker because the typed summary contract
 * carries the house indicator. Callers cannot vary either decision.
 */
export const DisclosureBranch = <const SK extends ContractKey, const BK extends ContractKey>(
    input: DisclosureBranchProps<SK, BK>,
) => (
        <details
            data-component="DisclosureBranch"
            className="flex w-full flex-col gap-3"
            open={input.isOpen}
        >
            <summary
                role="button"
                aria-expanded={input.isOpen}
                className="w-full cursor-pointer list-none p-0 marker:content-none"
                onClick={(event) => {
                    event.preventDefault()
                    input.onOpenChange(!input.isOpen)
                }}
            >
                <Tree contract={input.summaryContract} render={input.summaryRender} />
            </summary>
            <Tree contract={input.bodyContract} render={input.bodyRender} />
        </details>
    )

/** Source-level tier marker. */
export const meta = { shape: "branch", mechanics: true, world: "pure" } as const
