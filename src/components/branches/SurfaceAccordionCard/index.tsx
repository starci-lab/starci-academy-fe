import { Accordion } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import type { ContractKey } from "@/components/contracts"
import type { ContractComponent } from "@/components/contracts/props"

/**
 * BRANCH - `SurfaceAccordionCard`: the vendor's disclosure mechanics around two typed contracts.
 *
 * `Accordion.Item` owns the expand/collapse state, keyboard and focus handling that native
 * `<details>`/`<summary>` were hand-rolling before. Its summary and body are not anonymous markup
 * holes: one contract key fixes each node and one typed render proves the content satisfies it.
 */

/** Typed summary and body nodes hosted by one vendor disclosure control. */
export type SurfaceAccordionCardProps<SK extends ContractKey, BK extends ContractKey> = {
    readonly isOpen: boolean
    readonly summaryContract: SK
    readonly summaryRender: ContractComponent<NoInfer<SK>>
    readonly bodyContract: BK
    readonly bodyRender: ContractComponent<NoInfer<BK>>
    readonly onOpenChange: (isOpen: boolean) => void
}

/** Draw the vendor accordion mechanics around two checked content contracts. */
export const SurfaceAccordionCard = <const SK extends ContractKey, const BK extends ContractKey>(
    input: SurfaceAccordionCardProps<SK, BK>,
) => (
        <Accordion.Item
            isExpanded={input.isOpen}
            onExpandedChange={input.onOpenChange}
            data-tier="branch"
            data-component="SurfaceAccordionCard"
        >
            <Accordion.Heading>
                <Accordion.Trigger className="w-full justify-start text-left">
                    <Tree contract={input.summaryContract} render={input.summaryRender} />
                </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
                <Tree contract={input.bodyContract} render={input.bodyRender} />
            </Accordion.Panel>
        </Accordion.Item>
    )

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", mechanics: true, world: "pure" } as const
