import type { ComponentType } from "react"
import { DrawerBranch, type DrawerBranchPlacement } from "@/components/branches/DrawerBranch"

/** Overlay lifecycle independent from chat transport state. */
export type StarCiAiDrawerState = "closed" | "pending" | "ready" | "failed"

/** Resolved branch geometry and accessible copy for the AI overlay. */
export type StarCiAiDrawerData = {
    readonly isOpen: boolean
    readonly placement: DrawerBranchPlacement
    readonly title: string
    readonly description: string
}

/** Pure drawer input with the connected chat supplied as its typed content. */
export type StarCiAiDrawerProps = {
    readonly state: StarCiAiDrawerState
    readonly props: StarCiAiDrawerData
    readonly on?: { readonly dismiss?: () => void }
    readonly chat: ComponentType
}

/** Compose the global chat inside the shared focus/backdrop mechanics. */
export const StarCiAiDrawerBase = (props: StarCiAiDrawerProps) => {
    const Chat = props.chat
    return (
        <DrawerBranch
            isOpen={props.props.isOpen}
            placement={props.props.placement}
            title={props.props.title}
            onDismiss={props.on?.dismiss ?? (() => undefined)}
        ><Chat /></DrawerBranch>
    )
}
