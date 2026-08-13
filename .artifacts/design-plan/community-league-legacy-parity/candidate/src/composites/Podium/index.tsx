import { Avatar } from "@/components/leaves/Avatar"
import { Text } from "@/components/leaves/Text"
import type { CompositeProps } from "@/components/contracts/props"
import { defineContract, TreeCandidate } from "../../branches/Tree"

/**
 * TARGET PATH: src/components/composites/Podium/index.tsx
 * CONTRACTS: "podium", "podium-place" (both proposed — see contracts/proposed.ts)
 *
 * COMPOSITE - `Podium`: the top three, arranged so the ranking is the picture.
 *
 * WHY NOT A LIST. `ranked-user-list` states that its rows are comparable peers. The first three
 * places are not peers — that is the entire claim a podium makes — so expressing them as three
 * list rows with different numbers would be the wrong sentence in the right grammar.
 *
 * READING ORDER IS NOT VISUAL ORDER (revision 1.3). Places are emitted best-first, so anyone
 * reading in sequence hears first, second, third. The 2-1-3 dais is produced by the `podium`
 * contract's own nth-child ordering, not by shuffling the DOM.
 *
 * The arrangement lives on the NODE rather than on each place deliberately: "champion in the
 * middle" is a fact about the dais, not about whoever happens to be standing on it, so a place
 * carries no knowledge of where it will be placed.
 */

/** One resolved finisher. */
export type PodiumEntryData = {
    readonly rank: number
    readonly username: string | null
    readonly avatar: string | null
    /** Already-translated score, e.g. "480 XP". */
    readonly pointsLabel: string
    /** True when this finisher is the viewer. */
    readonly isMe: boolean
}

/** Resolved podium data. */
export type PodiumData = {
    readonly entries: ReadonlyArray<PodiumEntryData>
    /** Already-translated suffix appended to the viewer's own name, e.g. the word for "you". */
    readonly meLabel: string
    /** Fallback for an entry with no username. */
    readonly anonymousLabel: string
}

/** Props for {@link Podium}. */
export type PodiumProps = CompositeProps<PodiumData>

/** Champion is taller; the two flanking steps are equal so second and third do not compete. */
const STEP_CLASSES = {
    1: "flex h-16 w-20 items-center justify-center rounded-t-2xl bg-surface-secondary text-base font-bold ring-1 ring-accent",
    2: "flex h-11 w-20 items-center justify-center rounded-t-2xl bg-surface-secondary text-base font-bold",
    3: "flex h-8 w-20 items-center justify-center rounded-t-2xl bg-surface-secondary text-base font-bold",
} as const

/** Places are emitted best-first; the `podium` contract turns this into the 2-1-3 dais. */
const RANK_ORDER = [1, 2, 3] as const

/** Draw the top three as a dais. */
export const Podium = ({ props, isLoading = false }: PodiumProps) => {
    const byRank = new Map(props.entries.map((entry) => [entry.rank, entry]))
    const places = RANK_ORDER.flatMap((rank) => {
        const entry = byRank.get(rank)
        if (entry === undefined && !isLoading) return []
        const name = entry === undefined
            ? undefined
            : entry.isMe
                ? `${entry.username ?? props.anonymousLabel} · ${props.meLabel}`
                : entry.username ?? props.anonymousLabel
        return [(
            <TreeCandidate
                key={rank}
                contract="podium-place"
                render={defineContract("podium-place", [
                    <Avatar
                        key="avatar"
                        props={{ name, src: entry?.avatar ?? undefined, size: rank === 1 ? "lg" : "md" }}
                        isLoading={isLoading}
                    />,
                    <Text
                        key="name"
                        props={{
                            content: name,
                            size: "sm",
                            weight: entry?.isMe === true ? "semibold" : undefined,
                            tone: entry?.isMe === true ? "accent" : "default",
                        }}
                        isLoading={isLoading}
                    />,
                    <Text
                        key="points"
                        props={{ content: entry?.pointsLabel, size: "xs", tone: "muted" }}
                        isLoading={isLoading}
                    />,
                    <span key="step" className={STEP_CLASSES[rank]}>{rank}</span>,
                ])}
            />
        )]
    })
    return <TreeCandidate contract="podium" render={defineContract("podium", places)} />
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
