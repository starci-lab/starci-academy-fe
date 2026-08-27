import { getStatusDotClassName } from "./classNames"

/** Semantic states represented by a compact legend mark. */
export type StatusDotTone = "neutral" | "accent" | "success" | "warning" | "danger"
/** Meaning and accessible name for one status mark. */
export type StatusDotData = { readonly tone: StatusDotTone; readonly label: string }
/** Closed leaf props for a status mark. */
export type StatusDotProps = { readonly props: StatusDotData; readonly isLoading?: boolean }


/** Draw one semantic legend mark; the adjacent visible label carries its wording. */
export const StatusDot = (props: StatusDotProps) => {
    const isLoading = props.isLoading === true
    return (
        <span
            data-tone={props.props.tone}
            aria-label={isLoading ? undefined : props.props.label}
            aria-hidden={isLoading || undefined}
            className={getStatusDotClassName(props.props.tone, isLoading)}
        />
    )
}
