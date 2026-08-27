"use client"

import { useLocale } from "next-intl"
import type { PersonalProjectHistoryAttempt } from "@/components/blocks/learn/PersonalProjectHistory"
import { PersonalProjectHistoryDrawerBase } from "./component"

/** Controlled overlay input; history data remains owned by the nested connected block. */
export type PersonalProjectHistoryDrawerProps = {
    readonly isOpen: boolean
    readonly courseId?: string
    readonly taskId: string
    readonly selectedAttemptId?: string
    readonly onDismiss: () => void
    readonly onSelect?: (attempt: PersonalProjectHistoryAttempt) => void
}

/** Resolve overlay copy and hand mechanics only stable identity/control props. */
export const PersonalProjectHistoryDrawer = (props: PersonalProjectHistoryDrawerProps) => (
    <PersonalProjectHistoryDrawerBase
        {...props}
        title={useLocale() === "vi" ? "Lịch sử chấm bài" : "Attempt history"} // vn-ok: runtime locale copy.
    />
)

export * from "./component"
