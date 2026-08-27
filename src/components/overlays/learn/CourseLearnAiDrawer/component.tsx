import type { ComponentType } from "react"
import { DrawerBranch, type DrawerBranchPlacement } from "@/components/branches/DrawerBranch"

/** Pure course-context AI drawer mechanics. */
export type CourseLearnAiDrawerProps = {
    readonly isOpen: boolean
    readonly placement: DrawerBranchPlacement
    readonly title: string
    readonly onDismiss: () => void
    readonly chat: ComponentType
}

/** Draw the Learn assistant without importing or rendering the Global Chat owner. */
export const CourseLearnAiDrawerBase = (props: CourseLearnAiDrawerProps) => {
    const Chat = props.chat
    return (
        <DrawerBranch
            isOpen={props.isOpen}
            placement={props.placement}
            title={props.title}
            onDismiss={props.onDismiss}
        ><Chat /></DrawerBranch>
    )
}
