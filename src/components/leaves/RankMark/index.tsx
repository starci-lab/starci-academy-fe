import { RankArtwork, type RankArtworkKind } from "@starci/grammar/common"
import { rankArtworkClassName, rankLoadingClassNames, rankPlacementClassNames } from "./classNames"

/** Where the closed rank artwork is being used. */
export type RankMarkPlacement = "standing" | "row"

/** Which ranking meaning the caller needs: a place or the platform cup. */
export type RankMarkArtwork = "rank" | "cup"

/** The semantic artwork that survives after a place is resolved. */
export type RankMarkResolvedArtwork = RankArtworkKind | "number"

/** Resolved rank artwork data. */
export type RankMarkData = {
    /** One-based leaderboard rank. */
    readonly rank?: number
    /** The fixed visual slot occupied by the artwork. */
    readonly placement: RankMarkPlacement
    /** An explicit cup is independent from the viewer's numeric place. */
    readonly artwork?: RankMarkArtwork
    /** Resolved accessible label retaining the numeric rank. */
    readonly accessibleLabel?: string
}

/** Props accepted by the closed rank-artwork leaf. */
export type RankMarkProps = { readonly props: RankMarkData; readonly isLoading?: boolean }

const PLACE_MEDALS: Readonly<Record<number, RankArtworkKind>> = {
    1: "first",
    2: "second",
    3: "third",
}

/** Resolve a place to Grammar artwork, keeping ordinary places as readable numbers. */
export const RankMarkIconId = (
    rank: number | undefined,
    artwork: RankMarkArtwork = "rank",
): RankMarkResolvedArtwork => artwork === "cup" ? "cup" : rank === undefined ? "number" : PLACE_MEDALS[rank] ?? "number"

/** Draw one closed rank artwork mark without exposing Iconify IDs to callers. */
export const RankMark = (props: RankMarkProps) => {
    const placement = props.props.placement
    const artwork = props.props.artwork ?? "rank"
    if (props.isLoading === true || (props.props.rank === undefined && artwork === "rank")) {
        return (
            <span
                data-placement={placement}
                data-loading="true"
                aria-hidden="true"
                className={rankLoadingClassNames[placement]}
            />
        )
    }
    const resolvedArtwork = RankMarkIconId(props.props.rank, artwork)
    const accessibleLabel = props.props.accessibleLabel
    return (
        <span
            data-placement={placement}
            data-loading="false"
            data-icon={resolvedArtwork}
            data-artwork={resolvedArtwork}
            role={accessibleLabel === undefined ? undefined : "img"}
            aria-label={accessibleLabel}
            aria-hidden={accessibleLabel === undefined ? true : undefined}
            className={rankPlacementClassNames[placement]}
        >
            {resolvedArtwork === "number"
                ? <span aria-hidden="true">{props.props.rank}</span>
                : <RankArtwork kind={resolvedArtwork} aria-hidden="true" className={rankArtworkClassName} />}
        </span>
    )
}
