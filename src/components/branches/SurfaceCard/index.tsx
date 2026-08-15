import { Card, ScrollShadow } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import type { ContractKey } from "@/components/contracts"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type ContractBranchProps,
} from "@/components/contracts/props"

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
 * WHAT IT MAY CONTAIN, AND NOTHING ELSE: `Tree`, leaves, other branches. Every class that decides
 * a SHAPE comes from a registry entry; the only class written here is the zero inset that empties
 * the vendor body, which cannot vary by caller and decides nothing about what is inside. That
 * single sentence is what stops a branch quietly becoming a second registry.
 *
 * THE ENTRY'S NODE IS RENDERED, NOT IMITATED. Spreading `contractNodeProps` onto `Card.Content`
 * copied an entry's classes and markers onto a vendor element and dropped the one thing that
 * element could not carry: the `host`. An entry declaring `host: "ol"` came out a `div`, so the
 * list left the accessibility tree while every marker still claimed the contract was honoured -
 * and nothing reported it, because the classes and the `data-node` all looked right. The frame is
 * the only thing that turns a key into an element, so the frame draws it, inside a vendor body
 * emptied of its own inset. The entry owns the inset now, the way a joined list already did.
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
    /**
     * The already-resolved name of the section. Copy, so it never rests.
     *
     * ABSENT MEANS THE OBJECT SAYS WHAT IT IS. A course card, a project tile, an achievement: their
     * own contents name them, and a heading above each one in a grid of them is a title repeated
     * until it stops being read. Without a label this draws the ground and nothing else - no label
     * line, no section node - which is the whole of what a second, label-less surface branch would
     * have been. One component with one optional name, rather than two components differing by a
     * line each.
     */
    readonly label?: string
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
    /** Let a tall pricing rail scroll inside an 80%-viewport shadow without a native scrollbar. */
    readonly scrollShadow?: "pricing-rail"
}

/** What the section reports. */
export type SurfaceCardActions = {
    /** Called when the reader follows the way out at the end of the label line. */
    readonly seeMore?: () => void
}

/** Props for {@link SurfaceCard}. Fixed slots plus what it assembles - see {@link BranchProps}. */
export type SurfaceCardProps<K extends ContractKey> = ContractBranchProps<K> & {
    /** Absent altogether when the object names itself: then this draws the ground and nothing else. */
    readonly props?: SurfaceCardData
    readonly on?: SurfaceCardActions
}

/**
 * Draw a named section.
 *
 * @param input - {@link SurfaceCardProps}
 */
export const SurfaceCard = <const K extends ContractKey>({
    props = {},
    on,
    contract,
    render,
    isLoading = false,
}: SurfaceCardProps<K>) => {
    // One place at the end of the line: the way out wins it, the fact takes it only if free.
    const hasSeeMore = props.seeMoreLabel !== undefined && on?.seeMore !== undefined
    const end = hasSeeMore
        ? <SeeMoreLink props={{ label: props.seeMoreLabel }} on={{ press: on.seeMore }} />
        : props.fact === undefined
            ? null
            : <Text props={{ content: props.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />

    const labelContract = !hasSeeMore && props.fact !== undefined
        ? "title-with-baseline-fact"
        : "title-with-end-action"
    const title = defineLeafComponent("heading", {}, () => (
        <Heading props={{ content: props.label, level: 3 }} />
    ))
    const labelRow = labelContract === "title-with-baseline-fact"
        ? defineContractComponent("title-with-baseline-fact", {
            title,
            fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => end),
        })
        : defineContractComponent("title-with-end-action", {
            title,
            ...(hasSeeMore ? {
                end: defineLeafComponent("see-more-link", {}, () => end),
            } : {}),
        })
    const plainSurface = props.isFrameless === true ? (
        <Tree contract={contract} render={render} />
    ) : (
        /*
         * THE MARKER IS WHAT ZEROES THE VENDOR INSET, not the class beside it.
         *
         * The house forces `.card { padding: 16px !important }` in `globals.css`, so a `p-0` on the
         * same element loses: the card kept its own 16px while the entry's node added its own
         * inside, and every migrated card grew by one whole inset. `SurfaceListCard` already had the
         * answer - it names its card, and one attribute rule zeroes exactly that card. This does the
         * same rather than inventing a second escape.
         */
        <Card className="p-0" data-component="SurfaceCardSurface">
            <Card.Content className="p-0" data-component="SurfaceCardBody">
                <Tree contract={contract} render={render} />
            </Card.Content>
        </Card>
    )
    const surface = props.scrollShadow === "pricing-rail" ? (
        <ScrollShadow
            data-component="CoursePricingRailScroll"
            hideScrollBar
            orientation="vertical"
            className="max-h-pricing-rail"
        >
            {plainSurface}
        </ScrollShadow>
    ) : plainSurface

    // No name, no section: the column and the label line exist to hold a label, so an object that
    // names itself gets the ground alone rather than an empty row above it.
    if (props.label === undefined) return surface

    return (
        <Tree
            contract="label-row-over-card"
            render={defineContractComponent("label-row-over-card", {
                label: labelRow,
                /*
                 * The surface is ALREADY a whole node - vendor card, body and the caller's own
                 * contract inside it - so it enters the section as a projection. Handing the
                 * caller's key back as slots would open a second node around a node that is
                 * already drawn, which is the duplicate wrapper this branch was inset twice by.
                 */
                body: defineContractProjection(contract, () => surface),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", contract: "label-row-over-card", world: "pure" } as const
