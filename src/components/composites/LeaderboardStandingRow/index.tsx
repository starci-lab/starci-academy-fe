import { Tree } from "@/components/branches/Tree"
import { Badge } from "@/components/leaves/Badge"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"
/** Resolved viewer-standing summary. */
export type LeaderboardStandingRowData = { readonly title?: string; readonly subtitle?: string; readonly fact?: string }
/** Draw the viewer standing above a ranked list. */
export const LeaderboardStandingRow = ({ props, isLoading = false }: CompositeProps<LeaderboardStandingRowData>) => <Tree contract="leaderboard-standing-row" render={defineContractComponent("leaderboard-standing-row", {
    mark: defineLeafComponent("icon-tile", {}, () => <IconTile props={{ icon: "league", tone: "warning", size: "md" }} isLoading={isLoading} />),
    body: defineContractComponent("evidence-title-over-subtitle", {
        title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        subtitle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.subtitle, size: "xs", tone: "muted" }} isLoading={isLoading} />),
    }),
    ...(props.fact === undefined ? {} : { fact: defineLeafComponent("badge", {}, () => <Badge props={{ content: props.fact, tone: "warning" }} />) }),
})} />
/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
