import type { ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { defineCompositeComponent, defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

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
export const PlaygroundSessionLayoutBase = (input: PlaygroundSessionLayoutProps) => (
    <Tree contract="playground-session-frame" render={defineContractComponent("playground-session-frame", {
        ...(input.state === "failed" ? {} : {
            surface: defineLeafComponent("page", {}, () => <>{input.surface}</>),
        }),
        ...(input.state !== "failed" ? {} : {
            notice: defineCompositeComponent("empty-notice", {}, () => (
                <EmptyNotice
                    props={{ message: input.failedLabel, actionLabel: input.retryLabel }}
                    on={{ act: input.onRetry }}
                />
            )),
        }),
    })} />
)

/** Source-level ownership marker. */
export const meta = { shape: "layout", world: "pure", domain: "learn" } as const
