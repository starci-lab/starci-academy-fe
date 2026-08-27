import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { ChallengeAttemptHistory, type ChallengeAttemptHistoryItem } from "@/components/blocks/learn/ChallengeAttemptHistory"
import { defineContractProjection } from "@/components/contracts/props"

/** Pure Challenge history drawer mechanics and connected-body identity. */
export type ChallengeAttemptHistoryDrawerBaseProps = {
    readonly isOpen: boolean
    readonly title: string
    readonly courseId?: string
    readonly submissionId?: string
    readonly selectedAttemptId?: string
    readonly onDismiss: () => void
    readonly onSelect?: (attempt: ChallengeAttemptHistoryItem) => void
}

/** Seat the dedicated Challenge history owner inside shared drawer mechanics. */
export const ChallengeAttemptHistoryDrawerBase = (input: ChallengeAttemptHistoryDrawerBaseProps) => (
    <DrawerBranch
        isOpen={input.isOpen}
        placement="right"
        title={input.title}
        onDismiss={input.onDismiss}
        contract="challenge-attempt-history-drawer"
        render={defineContractProjection("challenge-attempt-history-drawer", () => (
            <ChallengeAttemptHistory
                courseId={input.courseId}
                submissionId={input.submissionId}
                selectedAttemptId={input.selectedAttemptId}
                onSelect={input.onSelect}
            />
        ))}
    />
)

/** Pure overlay ownership marker. */
export const meta = { shape: "overlay", world: "pure", domain: "learn" } as const
