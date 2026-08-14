import type { ComponentType } from "react"
import { Text } from "@/components/leaves/Text"

/** Data states the persistent playground frame can expose. */
export type PlaygroundSessionFrameState = "pending" | "ready" | "failed"

/** Resolved inputs for the pure persistent playground frame. */
export type PlaygroundSessionLayoutProps = {
    readonly state: PlaygroundSessionFrameState
    readonly surface: ComponentType
    readonly failedLabel: string
}

/** Keep the routed setup or session surface mounted inside one persistent data/socket owner. */
export const _PlaygroundSessionLayout = (input: PlaygroundSessionLayoutProps) => {
    const Surface = input.surface
    if (input.state === "failed") return <Text props={{ content: input.failedLabel, tone: "muted" }} />
    return <Surface />
}

/** Source-level ownership marker. */
export const meta = { shape: "layout", world: "pure", domain: "learn" } as const
