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
export const CourseLearnAiDrawer = (props: CourseLearnAiDrawerProps) => {
    const t = useTranslations("learn.content")
    const Chat = useCallback(() => (
        <CourseLearnAiChat
            displayId={props.displayId}
            courseId={props.courseId}
            challengeId={props.challengeId}
            challengeTitle={props.challengeTitle}
            selection={props.selection}
            initialPrompt={props.initialPrompt}
            onClearSelection={props.onClearSelection}
        />
    ), [props.challengeId, props.challengeTitle, props.courseId, props.displayId, props.initialPrompt, props.onClearSelection, props.selection])
    return (
        <CourseLearnAiDrawerBase
            isOpen={props.isOpen}
            placement={typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches ? "bottom" : "right"}
            title={t("challengeAiTitle")}
            onDismiss={props.onDismiss}
            chat={Chat}
        />
    )
}

export * from "./component"
