import type { ReactNode } from "react"
import { EmptyNotice } from "@starci/grammar/common"

/** Data states the persistent playground frame can expose. */
export type PlaygroundSessionFrameState = "pending" | "ready" | "failed"

/** Resolved inputs for the pure persistent playground frame. */
export type PlaygroundSessionLayoutProps = {
    readonly state: PlaygroundSessionFrameState
    readonly surface: ReactNode
    readonly failedLabel: string
    readonly retryLabel: string
    readonly onRetry?: () => void
}

/** Keep the routed setup or session surface mounted inside one persistent data/socket owner. */
export const PlaygroundSessionLayoutBase = (props: PlaygroundSessionLayoutProps) => (
    props.state === "failed" ? (
        <EmptyNotice message={props.failedLabel} actionLabel={props.retryLabel} onAction={({ act: props.onRetry })?.act} />
    ) : <>{props.surface}</>
)
