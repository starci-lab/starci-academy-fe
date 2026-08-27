import { rankDeltaCaretClassNames, rankDeltaCaretLoadingClassName } from "./classNames"

/**
 * TARGET PATH: src/components/leaves/RankDeltaCaret/index.tsx
 *
 * LEAF - `RankDeltaCaret`: how far a learner moved since last week, as a caret and a magnitude.
 *
 * WHY THIS IS NOT A BADGE. The target currently renders movement as a Badge carrying a whole
 * sentence - the localized phrase for "climbed one place". That sentence is a different width on
 * every row, so the XP column stops being comparable down the list, which is the one thing a
 * leaderboard column is for. The legacy render uses a fixed-width caret for exactly that reason.
 *
 * THE SIGN IS THE MEANING. `delta` is `lastWeekRank - rank`, so positive means CLIMBED. Null is not
 * zero: null is "no baseline last week", zero is "played and did not move". Both draw the neutral
 * placeholder, because neither is a movement - but only null is unknown, and the accessible label
 * keeps them apart.
 */

/** What this leaf draws. */
export type RankDeltaCaretData = {
    /** Signed rank movement; positive climbed, negative dropped, zero unchanged, null no baseline. */
    readonly delta?: number | null
    /** Resolved accessible sentence; the caret itself is never read aloud. */
    readonly accessibleLabel?: string
}

/** Props for {@link RankDeltaCaret}. */
export type RankDeltaCaretProps = { readonly props: RankDeltaCaretData; readonly isLoading?: boolean }

/** The three movement readings this leaf can draw; internal, so the export surface is unchanged. */
type RankDeltaDirection = "up" | "down" | "flat"

/**
 * One complete class string per direction, written out rather than assembled.
 *
 * A shared base plus an interpolated tone reads shorter, and it is exactly what the registry rule
 * refuses: the string a direction actually renders would then exist only while this component runs,
 * so nothing - no reader, no test, no tool that parses this file as text - can read it back. Each
 * entry therefore restates the fixed width, alignment and numerals that keep the column to its left
 * comparable row to row, and differs only in the tone that carries the sign. This mirrors
 * `PLACEMENT_CLASSES` in the locked `RankMark` leaf, where the same duplication is the point.
 */

/** The glyph that states the sign; magnitude follows it, and neutral movement carries none. */
const DIRECTION_GLYPHS = {
    up: "▴",
    down: "▾",
    flat: "—",
} as const


/**
 * Read one signed movement as a direction.
 *
 * @param delta - Signed rank movement, already resolved to a number by the caller.
 */
const directionOf = (delta: number): RankDeltaDirection => {
    if (delta > 0) return "up"
    if (delta < 0) return "down"
    return "flat"
}

/** Draw one signed rank movement. */
export const RankDeltaCaret = (props: RankDeltaCaretProps) => {
    const isLoading = props.isLoading === true
    if (isLoading) {
        return (
            <span
                data-loading="true"
                aria-hidden="true"
                className={rankDeltaCaretLoadingClassName}
            />
        )
    }
    const delta = props.props.delta ?? 0
    const direction = directionOf(delta)
    const magnitude = delta === 0 ? "" : String(Math.abs(delta))
    return (
        <span
            data-loading="false"
            data-direction={direction}
            aria-label={props.props.accessibleLabel}
            className={rankDeltaCaretClassNames[direction]}
        >
            {DIRECTION_GLYPHS[direction]}{magnitude}
        </span>
    )
}
