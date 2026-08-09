import { Tree } from "@/components/frames/Tree"
import { ExtendedTabs, type ExtendedTabsItem } from "@/components/blocks/navigation/ExtendedTabs"
import type { ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `TabsCard`: two runs of choices sharing one row - what is being shown, and how.
 *
 * PORTED FROM THE LIVE PRODUCT, where two hundred and seventy lines answered one question. The
 * original could render each side as tabs or as a dropdown depending on the viewport, in two
 * chrome variants, at two sizes, with a neutral mode for the right-hand group so a toolbar did
 * not carry two accents - and it hand-wrote a `sr-only` panel per tab to satisfy an ARIA
 * relationship the vendor created and never used.
 *
 * ONE OF THOSE DECISIONS WAS REAL, AND IT IS THE ONE THAT CROSSES: the two groups are not
 * equals. The left group decides WHAT is being shown and the right decides HOW - a language, a
 * unit, a density - so only one of them can be the emphasis of the row. That is why the two
 * sides are separate props here rather than an array of groups: an array would let a caller
 * build a row with two primaries, which is the thing the original's `rightTabsNeutral` flag was
 * invented to prevent after the fact.
 *
 * `content-row` IS THE HONEST KEY. The role vocabulary calls a `field` something the reader
 * selects from, which is exactly what a run of choices is, and an `action` is what acts on it.
 * The original's own toolbar pushed the two apart across the full width; that shape is a key
 * this registry does not have yet, and a row that keeps them together is closer to true than a
 * key that means something else.
 */

/** Props for {@link TabsCard}. */
export interface TabsCardProps {
    /** The choices that decide WHAT is being shown. */
    items: ReadonlyArray<ExtendedTabsItem>
    /** Which of them is currently showing. */
    selectedId: string
    /** Reports the choice a reader made about what to show. */
    onSelect?: (id: string) => void
    /**
     * The choices that decide HOW it is shown - a language, a unit. Omitted, the row carries
     * only the primary run.
     */
    aspectItems?: ReadonlyArray<ExtendedTabsItem>
    /** Which of those is currently in force. */
    selectedAspectId?: string
    /** Reports the choice a reader made about how to show it. */
    onSelectAspect?: (id: string) => void
    /** Nothing to show yet - both runs rest at their real width. */
    isLoading?: boolean
}

/**
 * Draw the toolbar of choices.
 *
 * @param props - {@link TabsCardProps}
 */
export const TabsCard = ({
    items,
    selectedId,
    onSelect,
    aspectItems,
    selectedAspectId,
    onSelectAspect,
    isLoading = false,
}: TabsCardProps) => {
    /** The `field` role: what is being shown - the run this row exists for. */
    const Primary = ({ isLoading: resting }: ContractSlotProps) => (
        <ExtendedTabs items={items} selectedId={selectedId} onSelect={onSelect} isLoading={resting} />
    )

    /** The `action` role: how it is shown - the run that acts on the one beside it. */
    const Aspect = ({ isLoading: resting }: ContractSlotProps) => {
        if (aspectItems === undefined || selectedAspectId === undefined) return null
        return (
            <ExtendedTabs
                items={aspectItems}
                selectedId={selectedAspectId}
                onSelect={onSelectAspect}
                isLoading={resting}
            />
        )
    }

    return <Tree contract="content-row" isLoading={isLoading} slots={{ field: Primary, action: Aspect }} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "TabsCard" } as const
