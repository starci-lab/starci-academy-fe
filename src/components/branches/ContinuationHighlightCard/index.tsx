import { SurfaceCard } from "@/components/branches/SurfaceCard"
import type { ContractComponent } from "@/components/contracts/props"

/** The singular persisted-work highlight used by the mock-interview green room. */
export type ContinuationHighlightCardProps = {
    readonly render: ContractComponent<"mock-interview-resume-panel">
}

/**
 * Draw one accent-soft destination for work that can be resumed.
 * The supplied contract owns the internal inset and action alignment; this branch owns only the
 * highlighted surface boundary so callers cannot accidentally create a second emphasized card.
 */
export const ContinuationHighlightCard = ({ render }: ContinuationHighlightCardProps) => (
    <SurfaceCard contract="mock-interview-resume-panel" render={render} />
)

/** Source-level tier marker for the continuation surface branch. */
export const meta = { shape: "branch", world: "pure" } as const
