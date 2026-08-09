import { Tree } from "@/components/frames/Tree"
import { StatPair } from "@/components/composites/stats/StatPair"
import { SurfaceCard } from "@/components/composites/cards/SurfaceCard"
import type { SemanticVerdict } from "@/components/composites/_semantic-contracts"
import type { IconName } from "@/components/atoms/Icon"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * COMPOSITE - `StatGridCard`: several figures about one thing, on one surface.
 *
 * PORTED FROM THE LIVE PRODUCT, where a region that reports four numbers reports them TOGETHER -
 * a bounded card holding a grid of pairs - rather than as four cards a reader has to gather back
 * up. That is the whole design decision it carries: these figures are about the same subject, so
 * the surface says so before any of them is read.
 *
 * WHY A GRID AND NOT A LIST. The figures are COMPARED with each other, not read in order; a
 * column of them puts three quarters of the comparison off the bottom of a narrow rail. The grid
 * key already states the rest: they fall to one column when a card would be narrower than the
 * sentence inside it.
 *
 * ONE RESTING FLAG FOR THE WHOLE CARD. These figures come from ONE request - that is what makes
 * them one subject - so unlike the identity rail's rows they rest together. A card whose four
 * cells shimmered independently would be describing four requests it does not have.
 */

/** One figure in the card. */
export interface StatGridCardItem {
    /** Stable key, and the name of the figure. */
    label: string
    /** The already-formatted figure. */
    value: string
    /** The meaning drawn before the label. */
    icon?: IconName
    /** What the figure MEANS, when it carries a judgement rather than being a fact. */
    verdict?: SemanticVerdict
}

/** Props for {@link StatGridCard}. */
export interface StatGridCardProps {
    /** The already-resolved title of the region. */
    label: string
    /** A supporting fact on the title's baseline - a period, a total, a unit. */
    meta?: string
    /** A control at the end of the title line. Passed uncalled, so the resting flag reaches it. */
    action?: ContractSlot
    /** The figures, in display order. */
    items: ReadonlyArray<StatGridCardItem>
    /** Nothing to show YET - the first load of the one request behind every figure here. */
    isLoading?: boolean
}

/**
 * Draw several figures about one thing.
 *
 * @param props - {@link StatGridCardProps}
 */
export const StatGridCard = ({ label, meta: metaText, action, items, isLoading = false }: StatGridCardProps) => {
    /** The `body` role of the `grid` key: one pair per figure. */
    const Cells = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {items.map((item) => (
                <StatPair
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                    verdict={item.verdict}
                    isLoading={resting}
                />
            ))}
        </>
    )

    /** The `body` role of the surface: the figures, side by side while there is room. */
    const Body = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="grid" isLoading={resting} slots={{ body: Cells }} />
    )

    return (
        <SurfaceCard label={label} meta={metaText} action={action} body={Body} isLoading={isLoading} />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "composite", name: "StatGridCard" } as const
