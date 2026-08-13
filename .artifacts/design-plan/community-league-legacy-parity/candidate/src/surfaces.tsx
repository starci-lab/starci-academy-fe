import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardActions, type SurfaceListCardData } from "./branches/SurfaceListCard"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "./composites/LeaderboardStandingRow"
import { defineCompositeComponent, defineContractComponent, defineContractProjection, type LeafProps } from "@/components/contracts/props"
import { RankedUserRow, type RankedUserRowData } from "./composites/RankedUserRow"
import { StandingHeroCard, type StandingHeroProgress } from "./composites/StandingHeroCard"
import { Podium, type PodiumEntryData } from "./composites/Podium"
// Moved from a flat `src/Tree.tsx` into the tier folder the registry-frame exemption
// names. The rule that lets a frame draw a real host matches `branches/Tree/`, so a frame filed
// anywhere else is - correctly - just a component opening a div with no key.
import { defineContract, TreeCandidate } from "./branches/Tree"
import { Text } from "@/components/leaves/Text"

/**
 * TARGET PATHS
 *   LeaderboardSection -> src/components/blocks/dashboard/LeagueCard/component.tsx
 *                         src/components/blocks/dashboard/TopLearners/component.tsx
 *   LeagueBoard        -> src/components/pages/LeaguePage/component.tsx  (new)
 *
 * Both dashboard blocks already share one shape in the locked target, so the parity revision keeps
 * that and changes only what the legacy render disagrees with.
 */

/** The joined-list surface carries its rows as data, exactly like the locked target's list card. */
type RankedListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly selfRow?: RankedUserRowData
    readonly ellipsisLabel?: string
}

type RankedListActions = SurfaceListCardActions

/** Props for the joined ranked list's content. */
type RankedListViewProps = LeafProps<RankedListData, RankedListActions>

/**
 * One ranked list with an optional truthful gap before a pinned viewer row.
 *
 * @param input - {@link RankedListViewProps}
 */
const RankedListView = (input: RankedListViewProps) => (
    <>
        {input.props.rows.map((row) => (
            <RankedUserRow
                key={row.id}
                props={row}
                on={{ open: input.on?.[`open:${row.id}`], follow: input.on?.[`follow:${row.id}`] }}
                isLoading={input.isLoading ?? false}
            />
        ))}
        {input.props.ellipsisLabel === undefined ? null : (
            <TreeCandidate
                contract="ranked-user-ellipsis-row"
                render={defineContract("ranked-user-ellipsis-row", [
                    <Text
                        key="label"
                        props={{ content: `⋯ ${input.props.ellipsisLabel}`, size: "xs", tone: "muted" }}
                    />,
                ])}
            />
        )}
        {input.props.selfRow === undefined ? null : (
            <RankedUserRow props={input.props.selfRow} isLoading={input.isLoading ?? false} />
        )}
    </>
)

const RankedListContent = defineContractComponent("ranked-user-list", RankedListView)

/**
 * A list carries verdict bands when its own rows say so. Deriving it beats letting a caller assert
 * it: a hand-passed `isVerdict` can outlive the data that justified it, and then the list keeps
 * square corners for bands nobody is drawing.
 */
const carriesVerdict = (
    rows: ReadonlyArray<RankedUserRowData>,
    selfRow?: RankedUserRowData,
) => rows.some((row) => row.verdict !== undefined) || selfRow?.verdict !== undefined

/** Resolved dashboard competition section. */
export type LeaderboardSectionData = {
    readonly label: string
    readonly seeMoreLabel: string
    readonly standing: LeaderboardStandingRowData
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly selfRow?: RankedUserRowData
    readonly ellipsisLabel?: string
}

/**
 * The handlers a competition surface reports.
 *
 * They are keyed rather than named because a row's handler carries that row's id in its own key,
 * which is what lets one list report per-row intent without the surface holding a callback per row.
 */
export type RankedSurfaceActions = Readonly<Record<string, (() => void) | undefined>>

/** Props for {@link LeaderboardSection}. */
export type LeaderboardSectionProps = {
    readonly props: LeaderboardSectionData
    readonly on?: RankedSurfaceActions
    readonly isLoading?: boolean
}

/**
 * Draw one dashboard competition section exactly as the legacy render composes it.
 *
 * @param input - {@link LeaderboardSectionProps}
 */
export const LeaderboardSection = (input: LeaderboardSectionProps) => (
    <SurfaceCard
        props={{ label: input.props.label, seeMoreLabel: input.props.seeMoreLabel }}
        on={{ seeMore: input.on?.seeMore }}
        contract="leaderboard-card"
        render={defineContractComponent("leaderboard-card", {
            standing: defineCompositeComponent("leaderboard-standing-row", {}, () => (
                <LeaderboardStandingRow props={input.props.standing} isLoading={input.isLoading ?? false} />
            )),
            list: defineContractProjection("ranked-user-list", () => (
                <SurfaceListCard
                    contract="ranked-user-list"
                    render={RankedListContent}
                    props={{
                        label: input.props.label,
                        isNested: true,
                        isLabelHidden: true,
                        isVerdict: carriesVerdict(input.props.rows, input.props.selfRow),
                        rows: input.props.rows,
                        selfRow: input.props.selfRow,
                        ellipsisLabel: input.props.ellipsisLabel,
                    }}
                    on={input.on}
                    isLoading={input.isLoading ?? false}
                />
            )),
        })}
        isLoading={input.isLoading ?? false}
    />
)

/** Resolved leaderboard-page board. */
export type LeagueBoardData = {
    readonly standing: LeaderboardStandingRowData
    readonly progress?: StandingHeroProgress
    readonly ctaLabel: string
    readonly progressAccessibleLabel: string
    readonly podium: ReadonlyArray<PodiumEntryData>
    readonly meLabel: string
    readonly anonymousLabel: string
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly selfRow?: RankedUserRowData
    readonly ellipsisLabel?: string
    readonly listLabel: string
}

/** Props for {@link LeagueBoard}. */
export type LeagueBoardProps = {
    readonly props: LeagueBoardData
    readonly on?: RankedSurfaceActions
    readonly isLoading?: boolean
}

/**
 * Draw one full board: standing hero, podium, then rank 4+.
 *
 * @param input - {@link LeagueBoardProps}
 */
export const LeagueBoard = (input: LeagueBoardProps) => (
    <>
        <StandingHeroCard
            props={{
                standing: input.props.standing,
                progress: input.props.progress,
                ctaLabel: input.props.ctaLabel,
                progressAccessibleLabel: input.props.progressAccessibleLabel,
            }}
            on={{ cta: input.on?.climb }}
            isLoading={input.isLoading ?? false}
        />
        <Podium
            props={{
                entries: input.props.podium,
                meLabel: input.props.meLabel,
                anonymousLabel: input.props.anonymousLabel,
            }}
            isLoading={input.isLoading ?? false}
        />
        <SurfaceListCard
            contract="ranked-user-list"
            render={RankedListContent}
            props={{
                label: input.props.listLabel,
                isLabelHidden: true,
                isVerdict: carriesVerdict(input.props.rows, input.props.selfRow),
                rows: input.props.rows,
                selfRow: input.props.selfRow,
                ellipsisLabel: input.props.ellipsisLabel,
            }}
            on={input.on}
            isLoading={input.isLoading ?? false}
        />
    </>
)
