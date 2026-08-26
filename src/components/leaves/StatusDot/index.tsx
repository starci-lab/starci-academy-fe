import { skeletonVariants } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

/** Semantic states represented by a compact legend mark. */
export type StatusDotTone = "neutral" | "accent" | "success" | "warning" | "danger"
/** Meaning and accessible name for one status mark. */
export type StatusDotData = { readonly tone: StatusDotTone; readonly label: string }
/** Closed leaf props for a status mark. */
export type StatusDotProps = LeafProps<StatusDotData>

const TONES = {
    neutral: "bg-default",
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
} as const
const RESTING = skeletonVariants({ animationType: "shimmer" }).base()

/** Draw one semantic legend mark; the adjacent visible label carries its wording. */
export const StatusDot = ({ props, isLoading = false }: StatusDotProps) => (
    <span
        data-tier="leaf"
        data-component="StatusDot"
        data-tone={props.tone}
        aria-label={isLoading ? undefined : props.label}
        aria-hidden={isLoading || undefined}
        className={`size-2.5 shrink-0 rounded-full ${isLoading ? RESTING : TONES[props.tone]}`}
    />
)

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
