import { Tree } from "@/components/branches/Tree"
import { Badge } from "@/components/leaves/Badge"
import { RankMark } from "@/components/leaves/RankMark"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"
import { defineContract, TreeCandidate } from "../../branches/Tree"

/**
 * TARGET PATH: src/components/composites/LeaderboardStandingRow/index.tsx
 *
 * REVISION 1.4 — identical to the locked component except that it draws through the merged
 * registry, so the `leaderboard-standing-row` class repair is visible in the candidate. Once that
 * repair lands in `src/components/contracts/index.ts`, this file collapses back to the locked
 * version with `Tree` and nothing else changes: no slot, prop, leaf or reading order moves.
 */

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
    <TreeCandidate
        contract="leaderboard-standing-row"
        render={defineContract("leaderboard-standing-row", [
            <RankMark
                key="mark"
                props={{ rank: props.rank, placement: "standing", accessibleLabel: props.rankLabel }}
                isLoading={isLoading}
            />,
            <Tree
                key="body"
                contract="evidence-title-over-subtitle"
                render={defineContractComponent("evidence-title-over-subtitle", {
                    title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                        <Text props={{ content: props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                    )),
                    subtitle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: props.subtitle, size: "xs", tone: "muted" }} isLoading={isLoading} />
                    )),
                })}
            />,
            ...(props.fact === undefined
                ? []
                : [<Badge key="fact" props={{ content: props.fact, tone: "warning" }} />]),
        ])}
    />
)

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
