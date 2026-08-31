import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { PersonalProjectGradingSettingsBlock, type PersonalProjectReviewSelection } from "@/components/blocks/learn/PersonalProjectGradingSettingsBlock"
import { personalProjectGradingSettingsDrawerViewportClassName } from "./classNames"

/** Pure drawer mechanics and its settings content. */
export type PersonalProjectGradingSettingsDrawerProps = {
    readonly courseId: string
    readonly taskId: string
    readonly repositoryUrl?: string
    readonly initialLanguage?: string
    readonly initialModelId?: string
    readonly isOpen: boolean
    readonly title?: string
    readonly onDismiss: () => void
    readonly onApplied?: (selection: PersonalProjectReviewSelection) => void
}

/** Pure drawer mechanics; settings data is projected by the connected block owner. */
export const PersonalProjectGradingSettingsDrawerBase = (props: PersonalProjectGradingSettingsDrawerProps) => {
    const { courseId, taskId, repositoryUrl, initialLanguage, initialModelId, isOpen, onDismiss, onApplied } = props
    return (
        <DrawerBranch isOpen={isOpen} size="workspace" title={props.title ?? "Grading settings"} onDismiss={onDismiss}><div className={personalProjectGradingSettingsDrawerViewportClassName}><PersonalProjectGradingSettingsBlock courseId={courseId} taskId={taskId} repositoryUrl={repositoryUrl} initialLanguage={initialLanguage} initialModelId={initialModelId} onApplied={onApplied} /></div></DrawerBranch>
    )
}
