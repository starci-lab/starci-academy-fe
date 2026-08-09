import { Avatar } from "@/components/atoms/Avatar"
import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import { EmptyState } from "@/components/composites/feedback/EmptyState"
import { LabeledCard } from "@/components/blocks/cards/LabeledCard"
import { EntityToken } from "@/components/blocks/entity/EntityToken"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `ActivityFeed`: what the people a reader follows have been doing, newest first.
 *
 * PORTED FROM THE LIVE PRODUCT, which split this into a presentational half and a connected
 * half for a good reason: the roll-up of consecutive milestone passes, the bucketing into
 * relative days, and the interpolation of every sentence are all decisions that need a clock, a
 * locale and a translation catalogue. None of that belongs in a block, and none of it is here.
 * The rows arrive grouped, ordered and worded.
 *
 * WHAT DID NOT CROSS. The original mapped nine activity types onto nine glyphs and badged each
 * avatar with one. The icon vocabulary in this tree is a closed union of fourteen MEANINGS, and
 * it has names for none of those nine - so the badge is left out rather than reached around,
 * and the sentence carries the whole of what happened. That is the closed union doing its job:
 * it is meant to be hard to add to.
 *
 * THE REACTION BAR DID NOT CROSS EITHER, and for a different reason - it is a mutation, and
 * there is no reaction transport in this repository. Porting the control without the request
 * behind it would put a button on screen that silently does nothing, which is worse than the
 * feature being absent.
 *
 * A DAY IS A LABELLED REGION, NOT A CARD. The original drew each day as a bordered surface with
 * its label outside it, which is exactly `LabeledCard`, so that is what it uses - one
 * description of "a named region of rows" rather than a second one spelled out here.
 */

/** One already-worded row of the feed. */
export interface ActivityFeedRow {
    /** Stable identity of the row, and its key in the day. */
    id: string
    /** The actor's already-resolved display name. */
    actorName: string
    /** The actor's picture. Absent, the avatar falls back to their initials. */
    actorAvatarSrc?: string
    /**
     * The already-localized, already-interpolated sentence - who did what to which thing. The
     * whole sentence, because a block that assembled it from parts would be doing the one job
     * a translation catalogue exists to do.
     */
    message: string
    /** The already-localized relative time - "3 hours ago". */
    relativeLabel: string
    /** Where the thing the sentence is about lives, already resolved. */
    href?: string
    /** The already-resolved name of the thing the sentence is about. */
    entityLabel?: string
}

/** One day of the feed, already bucketed and labelled. */
export interface ActivityFeedDayGroup {
    /** Stable identity of the day, and its key in the run. */
    id: string
    /** The already-localized day header - "Today", "Yesterday", a date. */
    label: string
    /** The day's rows, newest first. */
    rows: ReadonlyArray<ActivityFeedRow>
}

/** Props for {@link ActivityFeed}. */
export interface ActivityFeedProps {
    /** The days, newest first. */
    dayGroups: ReadonlyArray<ActivityFeedDayGroup>
    /** What a reader is told when the feed settles with nothing in it. */
    emptyTitle: string
    /** The way out of an empty feed - somebody to follow, something to do. */
    emptyAction: ContractSlot
    /** Nothing to show YET - the feed rests as itself. Never a settled nothing. */
    isLoading?: boolean
}

/** How many resting rows are drawn, so the resting feed has the height of a real one. */
const RESTING_ROWS: ReadonlyArray<number> = [0, 1, 2]

/**
 * Draw the feed.
 *
 * @param props - {@link ActivityFeedProps}
 */
export const ActivityFeed = ({ dayGroups, emptyTitle, emptyAction, isLoading = false }: ActivityFeedProps) => {
    /** One row: who it was, what they did and when, and the thing it was about. */
    const Row = ({ row, isLoading: resting }: ActivityFeedRowProps) => {
        const Actor = ({ isLoading: actorResting }: ContractSlotProps) => (
            <Avatar name={row.actorName} src={row.actorAvatarSrc} size="sm" isLoading={actorResting} />
        )
        const When = ({ isLoading: whenResting }: ContractSlotProps) => (
            <Text tone="muted" size="sm" isLoading={whenResting}>{row.relativeLabel}</Text>
        )
        const What = ({ isLoading: whatResting }: ContractSlotProps) => (
            <Text size="sm" isLoading={whatResting}>{row.message}</Text>
        )
        const Sentence = ({ isLoading: sentenceResting }: ContractSlotProps) => (
            <Tree contract="key-value-row" isLoading={sentenceResting} slots={{ heading: What, meta: When }} />
        )
        const Subject = () => {
            if (row.entityLabel === undefined || resting === true) return null
            return <EntityToken label={row.entityLabel} href={row.href} />
        }
        return <Tree contract="list-row" isLoading={resting} slots={{ media: Actor, body: Sentence, action: Subject }} />
    }

    /** One day of rows, under the day's own name. */
    const Day = ({ group, isLoading: resting }: ActivityFeedDayProps) => {
        const Rows = ({ isLoading: rowsResting }: ContractSlotProps) => (
            <>
                {group.rows.map((row) => <Row key={row.id} row={row} isLoading={rowsResting} />)}
            </>
        )
        const Body = ({ isLoading: bodyResting }: ContractSlotProps) => (
            <Tree contract="stack" isLoading={bodyResting} slots={{ body: Rows }} />
        )
        return <LabeledCard label={group.label} body={Body} level={3} isLoading={resting} />
    }

    /** The resting feed: one unnamed day of rows, at the shape a real day loads into. */
    const RESTING_GROUP: ActivityFeedDayGroup = {
        id: "resting",
        label: emptyTitle,
        rows: RESTING_ROWS.map((index) => ({
            id: String(index),
            actorName: emptyTitle,
            message: emptyTitle,
            relativeLabel: emptyTitle,
        })),
    }

    /** Every day in the feed, held at one seam. */
    const Days = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {resting === true
                ? <Day group={RESTING_GROUP} isLoading />
                : dayGroups.map((group) => <Day key={group.id} group={group} />)}
        </>
    )

    /** What stands where the feed would be when nothing has happened. */
    const Empty = () => <EmptyState icon="brand" title={emptyTitle} action={emptyAction} />

    /** The days, held at one seam. */
    const Feed = ({ isLoading: resting }: ContractSlotProps) => (
        <Tree contract="stack" isLoading={resting} slots={{ body: Days }} />
    )

    // A feed still RESTING has no days because none have arrived, which is a wait rather than an
    // answer - so the empty state is only reachable once the feed has settled. Read the other way
    // round, a reader on a slow connection would be told nothing has happened.
    if (!isLoading && dayGroups.length === 0) return <Empty />
    return <Feed isLoading={isLoading} />
}

/** Props for the private row renderer of {@link ActivityFeed}. */
interface ActivityFeedRowProps extends ContractSlotProps {
    /** The row being drawn. */
    row: ActivityFeedRow
}

/** Props for the private day renderer of {@link ActivityFeed}. */
interface ActivityFeedDayProps extends ContractSlotProps {
    /** The day being drawn. */
    group: ActivityFeedDayGroup
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "ActivityFeed" } as const
