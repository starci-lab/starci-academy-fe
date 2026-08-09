import { Text } from "@/components/atoms/Text"
import { Tree } from "@/components/frames/Tree"
import { EmptyState } from "@/components/composites/feedback/EmptyState"
import { KeyValue } from "@/components/composites/data/KeyValue"
import { SurfaceCard } from "@/components/composites/cards/SurfaceCard"
import { UserCell } from "@/components/composites/lists/UserCell"
import { RankBadge } from "@/components/blocks/dashboard/RankBadge"
import { RankDeltaCaret } from "@/components/blocks/profile/RankDeltaCaret"
import type { ContractSlot, ContractSlotProps } from "@/components/contracts"

/**
 * BLOCK - `LeaderboardListCard`: where the reader stands, over the board they stand on.
 *
 * PORTED FROM THE LIVE PRODUCT, where its own header records the reason it exists at all: the
 * weekly league and the global top-learner card were two identical sections rendered by two
 * different files until somebody noticed. That is the whole justification for the block, and it
 * survives intact - one description of a ranked list, fed by whichever query is behind it.
 *
 * WHAT DID NOT SURVIVE IS THE `bare` FLAG. The original could skip its own frame because a page
 * that already had a header would otherwise show two. That is not a variant; it is two different
 * trees, and here the outer surface is a KEY - so a page that owns its own header renders the
 * rows without reaching for this block's card at all.
 *
 * THE ROW IS BUILT FROM PIECES THAT ALREADY EXIST. The original hand-wrote the whole row inside
 * a `<div className="flex items-center gap-3">`: a medal or a number in a six-unit centred slot,
 * an avatar-and-name pair, a right-aligned tabular value, and a trailing slot. Every one of those
 * four is now something with a name - `RankBadge`, `UserCell`, the cell's own trailing slot, and
 * `RankDeltaCaret` - so the alignment the original kept re-fixing by hand is fixed once, in
 * `list-row`.
 *
 * WHAT THE ROW LOST, AND WHY IT IS RECORDED RATHER THAN FORCED. The original made the identity a
 * link to the learner's profile AND carried the movement caret at the far end. A row holding a
 * signal and a way on at the same time is a third shape, and no key here describes it; rather
 * than smuggle an anchor in under a role that means something else, the row keeps the signal -
 * which is what a leaderboard is read for - and the way on waits for a key.
 */

/** The viewer's own standing, shown above the board. */
export interface LeaderboardStanding {
    /** The already-resolved primary line - "Rank 1, top 20 per cent". */
    primary: string
    /** The already-resolved supporting line - "640 points, resets in a day". */
    secondary: string
}

/** One already-resolved row of the board. */
export interface LeaderboardRow {
    /** Stable identity of the row, and its key in the list. */
    id: string
    /** The one-based place. Read arithmetically, to find the podium. */
    rank: number
    /** The already-formatted place - "1st", "#1". */
    rankLabel: string
    /** The learner's already-resolved display name. */
    name: string
    /** Their handle, when it is not the same as the name. */
    handle?: string
    /** Their picture. Absent, the cell falls back to their initials. */
    avatarSrc?: string
    /** The already-formatted figure the board is ranked by - "640 pts". */
    valueLabel: string
    /**
     * Places gained since the last period, `null` when there is no baseline. Absent entirely
     * on a board that does not measure movement, which is not the same as `null`.
     */
    delta?: number | null
    /** The already-formatted movement - "up 2". Read only when {@link LeaderboardRow.delta} is set. */
    deltaLabel?: string
}

/** Props for {@link LeaderboardListCard}. */
export interface LeaderboardListCardProps {
    /** The already-resolved name of the board. */
    label: string
    /** A control at the end of the title line - the way to the full board. */
    action?: ContractSlot
    /** The viewer's own standing, when they have one. */
    standing?: LeaderboardStanding
    /** The ranked rows, best first. */
    rows: ReadonlyArray<LeaderboardRow>
    /** What a reader is told when the board settles with nobody on it. */
    emptyTitle: string
    /** The way out of an empty board. */
    emptyAction: ContractSlot
    /** Nothing to show YET - the board rests as itself. Never a settled nothing. */
    isLoading?: boolean
}

/** How many resting rows are drawn, so the resting board has the height of a real one. */
const RESTING_ROWS: ReadonlyArray<number> = [0, 1, 2, 3, 4]

/**
 * Draw a ranked board with the viewer's own standing above it.
 *
 * @param props - {@link LeaderboardListCardProps}
 */
export const LeaderboardListCard = ({
    label,
    action,
    standing,
    rows,
    emptyTitle,
    emptyAction,
    isLoading = false,
}: LeaderboardListCardProps) => {
    /** One row: the place, the person with their figure, and how they moved. */
    const Row = ({ row, isLoading: resting }: LeaderboardRowProps) => {
        const Place = ({ isLoading: placeResting }: ContractSlotProps) => (
            <RankBadge rank={row.rank} label={row.rankLabel} isLoading={placeResting} />
        )
        const Value = ({ isLoading: valueResting }: ContractSlotProps) => (
            <Text tone="muted" size="sm" isLoading={valueResting}>{row.valueLabel}</Text>
        )
        const Person = ({ isLoading: personResting }: ContractSlotProps) => (
            <UserCell
                name={row.name}
                handle={row.handle}
                avatarSrc={row.avatarSrc}
                trailing={Value}
                isLoading={personResting}
            />
        )
        const Movement = () => {
            if (row.delta === undefined || resting === true) return null
            return <RankDeltaCaret delta={row.delta} label={row.deltaLabel ?? ""} />
        }
        return <Tree contract="list-row" isLoading={resting} slots={{ media: Place, body: Person, action: Movement }} />
    }

    /** The rows themselves - the same tree resting or loaded, never two of them. */
    const Rows = ({ isLoading: resting }: ContractSlotProps) => (
        <>
            {resting === true
                ? RESTING_ROWS.map((index) => (
                    <Row
                        key={index}
                        row={{ id: String(index), rank: index + 1, rankLabel: label, name: label, valueLabel: label }}
                        isLoading
                    />
                ))
                : rows.map((row) => <Row key={row.id} row={row} />)}
        </>
    )

    /** What stands where the board would be when nobody is on it. */
    const Empty = () => <EmptyState icon="reward" title={emptyTitle} action={emptyAction} />

    /**
     * The board itself: the rows while they are coming, or the reason there are none.
     *
     * A board still RESTING is empty because nobody has arrived yet, not because nobody is on
     * it - so the empty state is only reachable once the region has settled, and the resting
     * rows keep the board at its own height until then.
     */
    const Board = ({ isLoading: resting }: ContractSlotProps) => {
        if (resting !== true && rows.length === 0) return <Empty />
        return <Rows isLoading={resting} />
    }

    /** The `body` role of the surface: the reader's own standing, then the board. */
    const Body = ({ isLoading: resting }: ContractSlotProps) => {
        const Content = () => (
            <>
                {standing === undefined ? null : (
                    <KeyValue
                        label={standing.primary}
                        value={standing.secondary}
                        isStrong
                        isLoading={resting}
                    />
                )}
                <Board isLoading={resting} />
            </>
        )
        return <Tree contract="stack" isLoading={resting} slots={{ body: Content }} />
    }

    return <SurfaceCard label={label} action={action} body={Body} isLoading={isLoading} />
}

/** Props for the private row renderer of {@link LeaderboardListCard}. */
interface LeaderboardRowProps extends ContractSlotProps {
    /** The row being drawn. */
    row: LeaderboardRow
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "LeaderboardListCard" } as const
