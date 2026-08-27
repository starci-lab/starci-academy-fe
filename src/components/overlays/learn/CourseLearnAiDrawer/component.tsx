import type { ComponentType } from "react"
import { DrawerBranch, type DrawerBranchPlacement } from "@/components/branches/DrawerBranch"
import { defineContractProjection } from "@/components/contracts/props"

/** Pure course-context AI drawer mechanics. */
export type CourseLearnAiDrawerBaseProps = {
    readonly isOpen: boolean
    readonly placement: DrawerBranchPlacement
    readonly title: string
    readonly onDismiss: () => void
    readonly chat: ComponentType
}

/** Draw the Learn assistant without importing or rendering the Global Chat owner. */
export const CourseLearnAiDrawerBase = (input: CourseLearnAiDrawerBaseProps) => {
    const Chat = input.chat
    return (
        <DrawerBranch
            isOpen={input.isOpen}
            placement={input.placement}
            title={input.title}
            onDismiss={input.onDismiss}
            contract="starci-ai-chat-stack"
            render={defineContractProjection("starci-ai-chat-stack", () => <Chat />)}
        />
    )
}

/** Pure overlay ownership marker. */
export const meta = { shape: "overlay", world: "pure", domain: "learn" } as const
