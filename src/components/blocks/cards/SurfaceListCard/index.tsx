import { IconTile } from "@/components/atoms/IconTile"
import { Link } from "@/components/atoms/Link"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import type { IconName } from "@/components/atoms/Icon"
import { EmptyState } from "@/components/composites/feedback/EmptyState"
import { SurfaceCard } from "@/components/composites/cards/SurfaceCard"
import { iconTileToneFor, type SemanticVerdict } from "@/components/composites/_semantic-contracts"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `SurfaceListCard`: several rows of the same kind, read as ONE object.
 *
 * PORTED FROM THE LIVE PRODUCT, where this was three exported components and a private anchor
 * helper - a container, a fixed-slot row, a free-form row - carrying between them a `bordered`
 * flag, a `hover` mode, a `selected` flag, a verdict band, a `className` door explicitly
 * documented as debt, and a hand-written `after:absolute after:h-px` separator on every row.
 * Almost all of that was the row deciding its own face, which in this tree is what the `list-row`
 * key already owns: the row's inset lives there BECAUSE the press target has to reach the full
 * width of the list, which is the same reason the original wrote the padding on the row by hand.
 *
 * WHAT CROSSES IS THE DATA SHAPE, NOT THE MARKUP. The original took its rows as `children` and
 * said so itself - "moving them to `items` is a call-site migration outside this pass's scope".
 * The migration happens here, because a children API cannot rest: the card has no way to hand a
 * resting flag to markup a caller already built, so every consumer kept its own placeholder. A
 * row list can, and does.
 *
 * WHAT A ROW LOST, AND WHY IT IS RECORDED RATHER THAN RESTORED. The original row drew a title
 * with a SECOND line tucked under it at zero seam - and its own comment admits it had to write
 * `gap-0` by hand because no frame had a step that tight. No key here has one either, so the
 * supporting line sits at the far end of the row instead, where `key-value-row` puts it: a
 * column of rows then lines its facts up, which is what the list was being scanned for anyway.
 *
 * AN EMPTY LIST IS AN ANSWER. The original rendered nothing at all when it had no rows, which
 * leaves a titled card with a hole in it. A request that settles with nothing gets the designed
 * empty state instead, and never a skeleton - a skeleton for a reader with no enrolments waits
 * forever.
 */

/** Props for {@link SurfaceListCardRow}. */
export interface SurfaceListCardRowProps {
    /** The already-resolved primary line of the row. */
    title: string
    /**
     * The already-resolved supporting fact, at the far end of the row. In the original this was
     * a second line under the title; see the file header for why it moved.
     */
    fact?: string
    /** The glyph that says what kind of thing this row is. */
    icon: IconName
    /** What this row has turned out to be, said as a meaning rather than as a colour. */
    verdict?: SemanticVerdict
    /** Where this row leads. Omitted, the row is a fact rather than a way on. */
    href?: string
    /** The words of the way on. Read only when {@link SurfaceListCardRowProps.href} is set. */
    hrefLabel?: string
    /** Nothing to show for this row yet - the row rests as itself. */
    isLoading?: boolean
}

/**
 * Draw one row of a surface list.
 *
 * @param props - {@link SurfaceListCardRowProps}
 */
export const SurfaceListCardRow = ({
    title,
    fact,
    icon,
    verdict = "neutral",
    href,
    hrefLabel,
    isLoading = false,
}: SurfaceListCardRowProps) => {
    /** The `media` role: what kind of thing this row is, read before its name. */
    const Tile = ({ isLoading: resting }: ContractSlotProps) => (
        <IconTile icon={icon} tone={iconTileToneFor(verdict)} isLoading={resting} />
    )

    /** The `heading` role of the row's own line. */
    const Title = ({ isLoading: resting }: ContractSlotProps) => (
        <Text weight="medium" size="sm" isLoading={resting}>
            {title}
        </Text>
    )

    /** The `meta` role of the row's own line: the fact a column of rows is scanned for. */
    const Fact = ({ isLoading: resting }: ContractSlotProps) => (
        <Text tone="muted" size="sm" isLoading={resting}>
            {fact ?? ""}
        </Text>
    )

    /** The `body` role: the name and the fact, pushed to opposite ends so a column lines up. */
    const Line = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="key-value-row" isLoading={resting} slots={{ heading: Title, meta: Fact }} />
    )

    /**
     * The `action` role: where the row leads.
     *
     * A LINK rather than a pressable row. The original made the whole row a `<button>` that
     * navigated, which is a control a reader cannot open in a new tab, cannot copy and cannot
     * see the destination of before pressing - three things an address gives away for free.
     */
    const Action = () => {
        if (!href) return null
        return (
            <Link href={href} icon="next">
                {hrefLabel ?? title}
            </Link>
        )
    }

    return <Tree contract="list-row" isLoading={isLoading} slots={{ media: Tile, body: Line, action: Action }} />
}

/** One already-resolved row of the list, as the card takes it. */
export interface SurfaceListCardItem extends SurfaceListCardRowProps {
    /** Stable identity of the row, and its key in the list. */
    id: string
}

/** Props for {@link SurfaceListCard}. */
export interface SurfaceListCardProps {
    /** The already-resolved name of the list. */
    label: string
    /** A supporting fact on the name's baseline - usually how many rows there are. */
    meta?: string
    /** The rows, in reading order. */
    rows: ReadonlyArray<SurfaceListCardItem>
    /** What a reader is told when the list settles with nothing in it. */
    emptyTitle: string
    /** The way out of an empty list - passed UNCALLED, like every other slot. */
    emptyAction: ContractSlot
    /** Nothing to show YET - the first load. Never a settled nothing; that is the empty state. */
    isLoading?: boolean
}

/** How many resting rows are drawn, so the resting card has the height of a real one. */
const RESTING_ROWS: ReadonlyArray<number> = [0, 1, 2]

/**
 * Draw a list of rows as one bounded object.
 *
 * @param props - {@link SurfaceListCardProps}
 */
export const SurfaceListCard = ({
    label,
    meta: metaText,
    rows,
    emptyTitle,
    emptyAction,
    isLoading = false,
}: SurfaceListCardProps) => {
    /** The rows themselves - the same tree resting or loaded, never two of them. */
    const Rows = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {resting === true
                ? RESTING_ROWS.map((index) => (
                    <SurfaceListCardRow key={index} title={label} icon="course" isLoading />
                ))
                : rows.map((row) => (
                    <SurfaceListCardRow
                        key={row.id}
                        title={row.title}
                        fact={row.fact}
                        icon={row.icon}
                        verdict={row.verdict}
                        href={row.href}
                        hrefLabel={row.hrefLabel}
                    />
                ))}
        </>
    )

    /** The rows, held at one seam so the run reads as a list rather than as loose cards. */
    const List = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="stack" isLoading={resting} slots={{ body: Rows }} />
    )

    /** What stands where the list would be when there is nothing to put in it. */
    const Empty = () => (
        <EmptyState icon="course" title={emptyTitle} action={emptyAction} />
    )

    /**
     * The `body` role of the surface: the list, or the reason there is none.
     *
     * The order of the branch is the whole of it. A region still RESTING has no rows because
     * none have ARRIVED, which is a wait rather than an answer - so the empty state is only
     * reachable once the region has settled. Read the other way round, a reader on a slow
     * connection would be told they have nothing.
     */
    const Body = ({ isLoading: resting }: ContractSlotProps) => {
        if (resting !== true && rows.length === 0) return <Empty />
        return <List isLoading={resting} />
    }

    return <SurfaceCard label={label} meta={metaText} body={Body} isLoading={isLoading} />
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "SurfaceListCard" } as const
