import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { LeaderboardStandingRow, type LeaderboardStandingRowData } from "@/components/composites/LeaderboardStandingRow"
import { RankedUserRow, type RankedUserRowData } from "@/components/composites/RankedUserRow"
import { CONTRACTS } from "@/components/contracts"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    type LeafProps,
} from "@/components/contracts/props"

/** Resolved weekly standing and cohort rows. */
export type LeagueCardData = {
    readonly label: string
    readonly seeMoreLabel?: string
    readonly standing: LeaderboardStandingRowData
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly emptyMessage?: string
    readonly errorMessage?: string
    readonly retryLabel?: string
}

/** Retry, leaderboard and profile actions. */
export type LeagueCardActions = {
    readonly [key: string]: (() => void) | undefined
}

/** Situation-discriminated weekly-league props. */
export type LeagueCardProps = {
    readonly state: "pending" | "empty" | "failed" | "ready"
    readonly props: LeagueCardData
    readonly on?: LeagueCardActions
}

type LeagueListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<RankedUserRowData>
}

type LeagueListActions = {
    readonly [key: string]: (() => void) | undefined
}

const ROW_COUNT = CONTRACTS["ranked-user-list"].children.user.restingCount

const LeagueListContentView = ({ props, on, isLoading = false }: LeafProps<LeagueListData, LeagueListActions>) => (
    <Tree contract="ranked-user-list" render={defineContractComponent("ranked-user-list", {
        user: props.rows.map((row) => defineCompositeComponent("ranked-user-row", {}, () => (
            <RankedUserRow
                props={row}
                on={{ open: on?.[`open:${row.id}`] }}
                isLoading={isLoading}
            />
        ))),
    })} />
)

const LeagueListContent = defineContractComponent("ranked-user-list", LeagueListContentView)

/** Draw weekly league standing and local request outcomes. */
export const LeagueCardBase = (input: LeagueCardProps) => {
    if (input.state === "empty" || input.state === "failed") {
        const message = input.state === "empty" ? input.props.emptyMessage : input.props.errorMessage
        return (
            <SurfaceCard
                props={{ label: input.props.label }}
                contract="empty-notice-card"
                render={defineContractComponent("empty-notice-card", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "league",
                                message: message ?? "",
                                actionLabel: input.state === "failed" ? input.props.retryLabel : undefined,
                            }}
                            on={{ act: input.on?.retry }}
                        />
                    )),
                })}
            />
        )
    }

    const isLoading = input.state === "pending"
    const rows: ReadonlyArray<RankedUserRowData> = isLoading
        ? Array.from({ length: ROW_COUNT }, (_unused, index) => ({
            id: `resting-${index + 1}`,
            movementLabel: "",
        }))
        : input.props.rows
    const list = defineContractProjection("ranked-user-list", () => (
        <SurfaceListCard
            contract="ranked-user-list"
            render={LeagueListContent}
            props={{
                label: input.props.label,
                rows,
                isNested: true,
                isLabelHidden: true,
                // Derived, not asserted: a hand-passed flag outlives the data that justified it,
                // and the list would then keep square corners for bands nobody is drawing.
                isVerdict: rows.some((row) => row.verdict !== undefined),
            }}
            on={input.on}
            isLoading={isLoading}
        />
    ))
    return (
        <SurfaceCard
            props={{ label: input.props.label, seeMoreLabel: input.props.seeMoreLabel }}
            on={{ seeMore: input.on?.seeMore }}
            contract="leaderboard-card"
            render={defineContractComponent("leaderboard-card", {
                standing: defineCompositeComponent("leaderboard-standing-row", {}, () => (
                    <LeaderboardStandingRow props={input.props.standing} isLoading={isLoading} />
                )),
                list,
            })}
            isLoading={isLoading}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "community" } as const
