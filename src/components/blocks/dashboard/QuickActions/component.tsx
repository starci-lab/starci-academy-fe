import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { QuickActionsList } from "@/components/leaves/QuickActionsList"
import type { QuickActionItem } from "@/components/leaves/QuickActionsList"

/** Resolved quick-action data for the pure block half. */
export type QuickActionsData = {
    readonly label: string
    readonly items: ReadonlyArray<QuickActionItem>
}

/** Actions reported by the pure quick-action block half. */
export type QuickActionsActions = {
    readonly activate?: (id: string) => void
}

/** Props for the pure quick-action block half. */
export type QuickActionsProps = {
    readonly props: QuickActionsData
    readonly on?: QuickActionsActions
}

/** Render the quick-action rail from resolved copy and destinations. */
export const QuickActionsBase = (props: QuickActionsProps) => (
    <SurfaceCard props={{ label: props.props.label, isFrameless: true }}><QuickActionsList
        props={{ label: props.props.label, items: props.props.items }}
        on={props.on}
    /></SurfaceCard>
)
