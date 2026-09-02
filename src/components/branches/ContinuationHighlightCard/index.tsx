import { SurfaceCard } from "@starci/grammar/common"
import type { ReactNode } from "react"

/** The singular persisted-work highlight used by the mock-interview green room. */
export type ContinuationHighlightCardProps = {
    readonly children: ReactNode
}

/**
 * Draw one accent-soft destination for work that can be resumed.
 * The supplied content owns the internal inset and action alignment; this branch owns only the
 * highlighted surface boundary so callers cannot accidentally create a second emphasized card.
 */
export const ContinuationHighlightCard = (props: ContinuationHighlightCardProps) => {
    const { children } = props
    return (
        <SurfaceCard composition="joined">{children}</SurfaceCard>
    )
}
