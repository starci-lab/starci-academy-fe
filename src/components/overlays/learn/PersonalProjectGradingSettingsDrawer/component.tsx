import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { PersonalProjectGradingSettingsBlock } from "@/components/blocks/learn/PersonalProjectGradingSettingsBlock"

/** Pure drawer mechanics and its settings content. */
export type PersonalProjectGradingSettingsDrawerProps = {
    readonly courseId: string
    readonly taskId: string
    readonly repositoryUrl?: string
    readonly isOpen: boolean
    readonly title?: string
    readonly onDismiss: () => void
}

/** Pure drawer mechanics; settings data is projected by the connected block owner. */
export const PersonalProjectGradingSettingsDrawerBase = (props: PersonalProjectGradingSettingsDrawerProps) => {
    const { courseId, taskId, repositoryUrl, isOpen, onDismiss } = props
    return (
        <DrawerBranch isOpen={isOpen} title={props.title ?? "Grading settings"} onDismiss={onDismiss}><PersonalProjectGradingSettingsBlock courseId={courseId} taskId={taskId} repositoryUrl={repositoryUrl} /></DrawerBranch>
    )
}
