"use client"

import { useTranslations } from "next-intl"
import type { ChallengeAttemptHistoryItem } from "@/components/blocks/learn/ChallengeAttemptHistory"
import { ChallengeAttemptHistoryDrawerBase } from "./component"

/** Controlled Challenge history overlay input. */
export type ChallengeAttemptHistoryDrawerProps = {
    readonly isOpen: boolean
    readonly courseId?: string
    readonly submissionId?: string
    readonly selectedAttemptId?: string
    readonly onDismiss: () => void
    readonly onSelect?: (attempt: ChallengeAttemptHistoryItem) => void
}

/** Resolve Challenge-specific copy and preserve focus-return lifecycle. */
export const ChallengeAttemptHistoryDrawer = (input: ChallengeAttemptHistoryDrawerProps) => (
    <ChallengeAttemptHistoryDrawerBase
        {...input}
        title={useTranslations("learn.content")("challengeHistoryTitle")}
    />
)

export * from "./component"
/** Connected overlay ownership marker. */
export const meta = { shape: "overlay", world: "connected", domain: "learn" } as const
