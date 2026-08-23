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

/** One typed summary/body row hosted by the shared accordion surface. */
export type SurfaceAccordionCardItem<SK extends ContractKey, BK extends ContractKey> = {
    readonly id: string
    readonly isOpen: boolean
    /** A row with no disclosure content remains visible without offering a false action. */
    readonly isDisabled?: boolean
    readonly summaryRender: ContractComponent<NoInfer<SK>>
    readonly bodyRender: ContractComponent<NoInfer<BK>>
}

type SurfaceAccordionCardCommonProps<SK extends ContractKey, BK extends ContractKey> = {
    /** Use the vendor surface boundary only when this disclosure is the page-level semantic surface. */
    readonly variant?: "default" | "surface"
    readonly summaryContract: SK
    readonly bodyContract: BK
}

/** Typed disclosure rows hosted by one vendor accordion owner. */
export type SurfaceAccordionCardProps<SK extends ContractKey, BK extends ContractKey> =
    SurfaceAccordionCardCommonProps<SK, BK> & ({
        readonly items: ReadonlyArray<SurfaceAccordionCardItem<SK, BK>>
        readonly onItemOpenChange: (id: string, isOpen: boolean) => void
        readonly isOpen?: never
        readonly summaryRender?: never
        readonly bodyRender?: never
        readonly onOpenChange?: never
    } | {
        readonly items?: never
        readonly onItemOpenChange?: never
        readonly isOpen: boolean
        readonly summaryRender: ContractComponent<NoInfer<SK>>
        readonly bodyRender: ContractComponent<NoInfer<BK>>
        readonly onOpenChange: (isOpen: boolean) => void
    })

type SurfaceAccordionRowsProps<SK extends ContractKey, BK extends ContractKey> = {
    readonly variant?: "default" | "surface"
    readonly summaryContract: SK
    readonly bodyContract: BK
    readonly items: ReadonlyArray<SurfaceAccordionCardItem<SK, BK>>
    readonly onItemOpenChange: (id: string, isOpen: boolean) => void
}

const triggerClassNameOf = (variant: "default" | "surface" | undefined, itemCount: number, index: number) => {
    if (variant !== "surface") return "w-full text-left"
    if (itemCount === 1) return "w-full p-4 text-left hover:!bg-transparent data-[hovered=true]:!bg-transparent"
    if (index === 0) return "w-full p-4 pb-3 text-left hover:!bg-transparent data-[hovered=true]:!bg-transparent"
    if (index === itemCount - 1) return "w-full p-4 pt-3 text-left hover:!bg-transparent data-[hovered=true]:!bg-transparent"
    return "w-full px-4 py-3 text-left hover:!bg-transparent data-[hovered=true]:!bg-transparent"
}

const SurfaceAccordionRows = <const SK extends ContractKey, const BK extends ContractKey>(input: SurfaceAccordionRowsProps<SK, BK>) => {
    const expandedKeys = new Set(input.items.filter((item) => item.isOpen).map((item) => item.id))

    return (
        <Accordion
            variant={input.variant}
            hideSeparator={input.items.length < 2}
            className={input.variant === "surface" ? "shadow-surface" : undefined}
            allowsMultipleExpanded
            expandedKeys={expandedKeys}
            onExpandedChange={(nextKeys) => {
                for (const item of input.items) {
                    const isOpen = nextKeys.has(item.id)
                    if (isOpen !== expandedKeys.has(item.id)) input.onItemOpenChange(item.id, isOpen)
                }
            }}
            data-component="SurfaceAccordionCard"
        >
            {input.items.map((item, index) => (
                <Accordion.Item
                    key={item.id}
                    id={item.id}
                    isDisabled={item.isDisabled}
                    data-tier="branch"
                    data-component="SurfaceAccordionCardItem"
                >
                    <Accordion.Heading>
                        <Accordion.Trigger className={triggerClassNameOf(input.variant, input.items.length, index)}>
                            <Tree contract={input.summaryContract} render={item.summaryRender} />
                        </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                        <Tree contract={input.bodyContract} render={item.bodyRender} />
                    </Accordion.Panel>
                </Accordion.Item>
            ))}
        </Accordion>
    )
}

/** Draw one joined vendor accordion surface around one or more checked disclosure rows. */
export const SurfaceAccordionCard = <const SK extends ContractKey, const BK extends ContractKey>(
    input: SurfaceAccordionCardProps<SK, BK>,
) => input.items === undefined
        ? (
            <SurfaceAccordionRows
                variant={input.variant}
                summaryContract={input.summaryContract}
                bodyContract={input.bodyContract}
                items={[{
                    id: "surface-accordion-item",
                    isOpen: input.isOpen,
                    summaryRender: input.summaryRender,
                    bodyRender: input.bodyRender,
                }]}
                onItemOpenChange={(_id, isOpen) => input.onOpenChange(isOpen)}
            />
        )
        : (
            <SurfaceAccordionRows
                variant={input.variant}
                summaryContract={input.summaryContract}
                bodyContract={input.bodyContract}
                items={input.items}
                onItemOpenChange={input.onItemOpenChange}
            />
        )

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", mechanics: true, world: "pure" } as const
