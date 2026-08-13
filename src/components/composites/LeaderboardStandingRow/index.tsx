import { Tree } from "@/components/branches/Tree"
import { Badge } from "@/components/leaves/Badge"
import { RankMark } from "@/components/leaves/RankMark"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"

/** Resolved viewer-standing summary. */
export type LeaderboardStandingRowData = {
    readonly rank?: number
    readonly rankLabel?: string
    readonly title?: string
    readonly subtitle?: string
    readonly fact?: string
}

/** Draw the viewer standing above a ranked list. */
export const LeaderboardStandingRow = ({ props, isLoading = false }: CompositeProps<LeaderboardStandingRowData>) => (
    <Tree contract="leaderboard-standing-row" render={defineContractComponent("leaderboard-standing-row", {
        mark: defineLeafComponent("rank-mark", { placement: "standing" }, () => (
            <RankMark
                props={{ rank: props.rank, placement: "standing", accessibleLabel: props.rankLabel }}
                isLoading={isLoading}
            />
        )),
        body: defineContractComponent("evidence-title-over-subtitle", {
            title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />
            )),
            subtitle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: props.subtitle, size: "xs", tone: "muted" }} isLoading={isLoading} />
            )),
        }),
        ...(props.fact === undefined ? {} : {
            fact: defineLeafComponent("badge", {}, () => <Badge props={{ content: props.fact, tone: "warning" }} />),
        }),
    })} />
)

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
