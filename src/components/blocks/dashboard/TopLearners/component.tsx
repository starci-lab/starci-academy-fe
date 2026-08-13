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

/** Resolved global standing and ranked rows. */
export type TopLearnersData = {
    readonly label: string
    readonly seeMoreLabel?: string
    readonly standing: LeaderboardStandingRowData
    readonly rows: ReadonlyArray<RankedUserRowData>
    readonly emptyMessage?: string
    readonly errorMessage?: string
    readonly retryLabel?: string
}

/** Retry, navigation and follow actions. */
export type TopLearnersActions = {
    readonly [key: string]: (() => void) | undefined
}

/** Situation-discriminated global-leaderboard props. */
export type TopLearnersProps = {
    readonly state: "pending" | "empty" | "failed" | "ready"
    readonly props: TopLearnersData
    readonly on?: TopLearnersActions
}

type TopLearnersListData = SurfaceListCardData & {
    readonly rows: ReadonlyArray<RankedUserRowData>
}

type TopLearnersListActions = {
    readonly [key: string]: (() => void) | undefined
}

const ROW_COUNT = CONTRACTS["ranked-user-list"].children.user.restingCount

const TopLearnersListContentView = ({ props, on, isLoading = false }: LeafProps<TopLearnersListData, TopLearnersListActions>) => (
    <Tree contract="ranked-user-list" render={defineContractComponent("ranked-user-list", {
        user: props.rows.map((row) => defineCompositeComponent("ranked-user-row", {}, () => (
            <RankedUserRow
                props={row}
                on={{ open: on?.[`open:${row.id}`], follow: on?.[`follow:${row.id}`] }}
                isLoading={isLoading}
            />
        ))),
    })} />
)

const TopLearnersListContent = defineContractComponent("ranked-user-list", TopLearnersListContentView)

/** Draw the global leaderboard and local follow outcomes. */
export const _TopLearners = (input: TopLearnersProps) => {
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
            followLabel: "",
        }))
        : input.props.rows
    const list = defineContractProjection("ranked-user-list", () => (
        <SurfaceListCard
            contract="ranked-user-list"
            render={TopLearnersListContent}
            props={{
                label: input.props.label,
                rows,
                isNested: true,
                isLabelHidden: true,
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
