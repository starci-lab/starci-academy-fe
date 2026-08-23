import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { defineContractProjection } from "@/components/contracts/props"
import { PersonalProjectGradingSettingsBlock } from "@/components/blocks/learn/PersonalProjectGradingSettingsBlock"

/** Pure drawer mechanics and its projected settings content. */
export type PersonalProjectGradingSettingsDrawerBaseProps = {
    readonly courseId: string
    readonly taskId: string
    readonly isOpen: boolean
    readonly onDismiss: () => void
}

/** Pure drawer mechanics; settings data is projected by the connected block owner. */
export const PersonalProjectGradingSettingsDrawerBase = ({ courseId, taskId, isOpen, onDismiss }: PersonalProjectGradingSettingsDrawerBaseProps) => (
    <DrawerBranch isOpen={isOpen} title="Grading settings" onDismiss={onDismiss} contract="personal-project-grading-settings-drawer" render={defineContractProjection("personal-project-grading-settings-drawer", () => <PersonalProjectGradingSettingsBlock courseId={courseId} taskId={taskId} />)} />
)

/** Pure ownership marker for the drawer shell. */
export const meta = { world: "pure", domain: "learn" } as const
