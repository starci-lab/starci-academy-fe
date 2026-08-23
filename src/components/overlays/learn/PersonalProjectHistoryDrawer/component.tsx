import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { PersonalProjectHistory, type PersonalProjectHistoryAttempt } from "@/components/blocks/learn/PersonalProjectHistory"
import { defineContractProjection } from "@/components/contracts/props"

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
export const PersonalProjectHistoryDrawerBase = (input: PersonalProjectHistoryDrawerProps) => (
    <DrawerBranch
        isOpen={input.isOpen}
        title={input.title}
        onDismiss={input.onDismiss}
        contract="personal-project-attempt-history-drawer"
        render={defineContractProjection("personal-project-attempt-history-drawer", () => (
            <PersonalProjectHistory
                courseId={input.courseId}
                taskId={input.taskId}
                selectedAttemptId={input.selectedAttemptId}
                onSelect={input.onSelect}
            />
        ))}
    />
)

/** Source-level ownership marker for the pure drawer shell. */
export const meta = { shape: "overlay", world: "pure", domain: "learn" } as const
