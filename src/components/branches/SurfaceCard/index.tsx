import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import type { BranchProps } from "@/components/contracts/props"

/**
 * BRANCH - `SurfaceCard`: a named section, and the surface its content sits on.
 *
 * THE NAME IS HELD OUTSIDE THE SURFACE, which is the one decision the whole shape turns on. A
 * section whose content is ITSELF a set of cards - resume tiles, course rows - would otherwise draw
 * a card inside a card, and two nested insets read as a mistake rather than as a hierarchy. Holding
 * the label above means `frameless` can drop the inner surface without the label going with it.
 *
 * THIS IS WHY BRANCHES EXIST. `Tree` draws ONE node; a section is three - the column, the label
 * line, the surface - and nothing in the registry stacks nodes. Assembly is a branch's whole job.
 *
 * WHAT IT MAY CONTAIN, AND NOTHING ELSE: `Tree`, leaves, other branches. No markup of its own, no
 * class of its own. Every class on screen comes from a registry entry. That single sentence is
 * what stops a branch quietly becoming a second registry.
 *
 * THE END OF THE LABEL LINE HOLDS ONE THING OR NOTHING, and an action outranks a fact when both are
 * passed. They compete for the same place on purpose: a fact and a control that look alike, sitting
 * where each other would, is how a reader presses the count.
 *
 * `level` IS DECIDED HERE, ONCE. Three blocks each choosing a heading level by hand is how one of
 * them ends up different; the branch is the single place, now that contracts hold only classes.
 */

/** What this branch draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type SurfaceCardData = {
    /** The already-resolved name of the section. Copy, so it never rests. */
    readonly label: string
    /**
     * A supporting fact at the end of the label line - a count, a record, a unit. Never an action:
     * it reads as part of the label sentence, and a control there gets pressed by somebody who
     * meant to read it. Dropped when {@link SurfaceCardData.seeMoreLabel} claims the same place.
     */
    readonly fact?: string
    /**
     * The already-resolved words of the way out of this section, drawn at the end of the label
     * line. Present only when `on.seeMore` is - a link that leads nowhere is worse than no link.
     */
    readonly seeMoreLabel?: string
    /**
     * Drop the inner surface and let the content sit straight under the label - for a section whose
     * content is ALREADY a set of surfaces. The label stays either way.
     */
    readonly isFrameless?: boolean
}

/** What the section reports. */
export type SurfaceCardActions = {
    /** Called when the reader follows the way out at the end of the label line. */
    readonly seeMore?: () => void
}

/** Props for {@link SurfaceCard}. Fixed slots plus what it assembles - see {@link BranchProps}. */
export type SurfaceCardProps = BranchProps<SurfaceCardData, SurfaceCardActions>

/**
 * Draw a named section.
 *
 * @param input - {@link SurfaceCardProps}
 */
export const SurfaceCard = ({ props, on, children, isLoading = false }: SurfaceCardProps) => {
    // One place at the end of the line: the way out wins it, the fact takes it only if free.
    const end = props.seeMoreLabel !== undefined && on?.seeMore !== undefined
        ? <SeeMoreLink props={{ label: props.seeMoreLabel }} on={{ press: on.seeMore }} />
        : props.fact === undefined
            ? null
            : <Text props={{ content: props.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />

    return (
        <Tree contract="label-row-over-card">
            <Tree contract="title-with-end-action">
                <Heading props={{ content: props.label, level: 3 }} />
                {end}
            </Tree>
            {props.isFrameless === true ? children : (
                <Tree contract="bounded-content-card">{children}</Tree>
            )}
        </Tree>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", contract: "label-row-over-card", world: "pure" } as const
