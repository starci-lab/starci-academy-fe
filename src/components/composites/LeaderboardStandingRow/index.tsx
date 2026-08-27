import { Badge } from "@/components/leaves/Badge"
import { LeagueTile } from "@/components/leaves/LeagueTile"
import { Text } from "@/components/leaves/Text"

/** Resolved viewer-standing summary. */
export type LeaderboardStandingRowData = {
    readonly rank?: number
    readonly rankLabel?: string
    readonly title?: string
    readonly subtitle?: string
    readonly fact?: string
}

/**
 * Draw the viewer standing above a ranked list.
 *
 * THE SENTENCE SITS AGAINST ITS MEDAL. The node used to distribute three slots with
 * `justify-between`, which reads correctly only while the optional trailing fact is present to
 * hold the far edge. With the fact absent the two survivors sprang apart and the standing line
 * drifted to the opposite margin from the rank it describes. The body now owns the spare width,
 * so the row reads the same whether or not a fact exists.
 */
export type LeaderboardStandingRowProps = { readonly props: LeaderboardStandingRowData; readonly isLoading?: boolean }
/** Draw the viewer's standing summary above a ranked list. */
export const LeaderboardStandingRow = (props: LeaderboardStandingRowProps) => {
    const { props: data, isLoading = false } = props
    return <div><LeagueTile props={{ rank: data.rank, accessibleLabel: data.rankLabel }} isLoading={isLoading} /><div><Text props={{ content: data.title, size: "sm", weight: "semibold" }} isLoading={isLoading} /><Text props={{ content: data.subtitle, size: "xs", tone: "muted" }} isLoading={isLoading} /></div>{data.fact === undefined ? null : <Badge props={{ content: data.fact, tone: "warning" }} />}</div>
}
