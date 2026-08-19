import type { ComponentType } from "react"
import { DrawerBranch, type DrawerBranchPlacement } from "@/components/branches/DrawerBranch"
import { defineContractProjection } from "@/components/contracts/props"

/** Overlay lifecycle independent from chat transport state. */
export type StarCiAiDrawerState = "closed" | "pending" | "ready" | "failed"

/** Resolved branch geometry and accessible copy for the AI overlay. */
export type StarCiAiDrawerData = {
    readonly isOpen: boolean
    readonly placement: DrawerBranchPlacement
    readonly title: string
    readonly description: string
}

/** Pure drawer input with the connected chat supplied as its typed content projection. */
export type StarCiAiDrawerProps = {
    readonly state: StarCiAiDrawerState
    readonly props: StarCiAiDrawerData
    readonly on?: { readonly dismiss?: () => void }
    readonly chat: ComponentType
}

/** Compose the global chat inside the shared focus/backdrop mechanics. */
export const StarCiAiDrawerBase = (input: StarCiAiDrawerProps) => {
    const Chat = input.chat
    return (
        <DrawerBranch
            isOpen={input.props.isOpen}
            placement={input.props.placement}
            title={input.props.title}
            contract="starci-ai-chat-stack"
            render={defineContractProjection("starci-ai-chat-stack", () => <Chat />)}
            onDismiss={input.on?.dismiss ?? (() => undefined)}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { shape: "overlay", world: "pure", domain: "ai" } as const
