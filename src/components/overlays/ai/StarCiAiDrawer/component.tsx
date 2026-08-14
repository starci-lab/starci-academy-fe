import type { ComponentType } from "react"
import { DrawerShell, type DrawerShellPlacement } from "@/components/shells/DrawerShell"

export type StarCiAiDrawerState = "closed" | "pending" | "ready" | "failed"

export type StarCiAiDrawerData = {
    readonly isOpen: boolean
    readonly placement: DrawerShellPlacement
    readonly title: string
    readonly description: string
}

export type StarCiAiDrawerProps = {
    readonly state: StarCiAiDrawerState
    readonly props: StarCiAiDrawerData
    readonly on?: { readonly dismiss?: () => void }
    readonly chat: ComponentType
}

/** Compose the global chat inside the shared focus/backdrop mechanics. */
export const _StarCiAiDrawer = (input: StarCiAiDrawerProps) => {
    const Chat = input.chat
    return (
        <DrawerShell
            isOpen={input.props.isOpen}
            placement={input.props.placement}
            title={input.props.title}
            onDismiss={input.on?.dismiss ?? (() => undefined)}
        >
            <Chat />
        </DrawerShell>
    )
}

export const meta = { shape: "overlay", world: "pure", domain: "ai" } as const
