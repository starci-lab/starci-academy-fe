"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { CourseLearnAiChat } from "@/components/blocks/learn/CourseLearnAiChat"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"
import { CourseLearnAiDrawerBase } from "./component"

/** Controlled Learn AI overlay grounded in one course aggregate and current Challenge. */
export type CourseLearnAiDrawerProps = {
    readonly isOpen: boolean
    readonly displayId: string
    readonly courseId?: string
    readonly challengeId: string
    readonly challengeTitle: string
    readonly selection?: ContentAiSelectionContext
    readonly initialPrompt?: string
    readonly onDismiss: () => void
    readonly onClearSelection?: () => void
}

/** Connect the course-owned conversation while the overlay owns only lifecycle and focus. */
export const CourseLearnAiDrawer = (input: CourseLearnAiDrawerProps) => {
    const t = useTranslations("learn.content")
    const Chat = useCallback(() => (
        <CourseLearnAiChat
            displayId={input.displayId}
            courseId={input.courseId}
            challengeId={input.challengeId}
            challengeTitle={input.challengeTitle}
            selection={input.selection}
            initialPrompt={input.initialPrompt}
            onClearSelection={input.onClearSelection}
        />
    ), [input.challengeId, input.challengeTitle, input.courseId, input.displayId, input.initialPrompt, input.onClearSelection, input.selection])
    return (
        <CourseLearnAiDrawerBase
            isOpen={input.isOpen}
            placement={typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches ? "bottom" : "right"}
            title={t("challengeAiTitle")}
            onDismiss={input.onDismiss}
            chat={Chat}
        />
    )
}

export * from "./component"
/** Connected overlay ownership marker. */
export const meta = { shape: "overlay", world: "connected", domain: "learn" } as const
