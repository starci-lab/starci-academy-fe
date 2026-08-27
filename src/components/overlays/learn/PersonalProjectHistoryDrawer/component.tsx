import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { PersonalProjectHistory, type PersonalProjectHistoryAttempt } from "@/components/blocks/learn/PersonalProjectHistory"

/** Controlled overlay mechanics and the identity its connected history block needs. */
export type PersonalProjectHistoryDrawerProps = {
    readonly isOpen: boolean
    readonly title: string
    readonly courseId?: string
    readonly taskId: string
    readonly selectedAttemptId?: string
    readonly onDismiss: () => void
    readonly onSelect?: (attempt: PersonalProjectHistoryAttempt) => void
}

/** Draw overlay mechanics and directly compose the connected history block. */
export const PersonalProjectHistoryDrawerBase = (props: PersonalProjectHistoryDrawerProps) => (
    <DrawerBranch
        isOpen={props.isOpen}
        title={props.title}
        onDismiss={props.onDismiss}
    >
        <PersonalProjectHistory
            courseId={props.courseId}
            taskId={props.taskId}
            selectedAttemptId={props.selectedAttemptId}
            onSelect={props.onSelect}
        />
    </DrawerBranch>
)
