import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { ChallengeAttemptHistory, type ChallengeAttemptHistoryItem } from "@/components/blocks/learn/ChallengeAttemptHistory"

/** Pure Challenge history drawer mechanics and connected-body identity. */
export type ChallengeAttemptHistoryDrawerProps = {
    readonly isOpen: boolean
    readonly title: string
    readonly courseId?: string
    readonly submissionId?: string
    readonly selectedAttemptId?: string
    readonly onDismiss: () => void
    readonly onSelect?: (attempt: ChallengeAttemptHistoryItem) => void
}

/** Seat the dedicated Challenge history owner inside shared drawer mechanics. */
export const ChallengeAttemptHistoryDrawerBase = (props: ChallengeAttemptHistoryDrawerProps) => (
    <DrawerBranch
        isOpen={props.isOpen}
        placement="right"
        title={props.title}
        onDismiss={props.onDismiss}
    >
        <ChallengeAttemptHistory
            courseId={props.courseId}
            submissionId={props.submissionId}
            selectedAttemptId={props.selectedAttemptId}
            onSelect={props.onSelect}
        />
    </DrawerBranch>
)
