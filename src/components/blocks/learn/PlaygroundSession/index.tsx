"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { usePlaygroundSession } from "@/components/layouts/PlaygroundSessionLayout"
import { PlaygroundSessionBase, type CoursePlaygroundSessionState } from "./component"

/** Course and playground route identities consumed by the live session. */
export type PlaygroundSessionProps = { readonly displayId: string; readonly slug: string }

/** Consume the persistent session owner; only `step:verified` changes completed progress. */
export const PlaygroundSession = ({ displayId, slug }: PlaygroundSessionProps) => {
    const t = useTranslations("learn.playground")
    const router = useRouter()
    const session = usePlaygroundSession()
    const [selectedOverride, setSelectedOverride] = useState<number | null>(null)
    const steps = session.session?.steps ?? session.playground?.steps ?? []
    const currentStepIndex = Math.min(session.passedStepIndexes.length, Math.max(0, steps.length - 1))
    const selectedStepIndex = selectedOverride ?? currentStepIndex
    const completed = steps.length > 0 && session.passedStepIndexes.includes(steps.length - 1)
    let state: CoursePlaygroundSessionState = "live"
    if (session.failed || session.startFailed || session.session === null || session.socketState === "failed") state = "failed"
    else if (completed) state = "completed"
    else if (session.socketState === "reconnecting") state = "reconnecting"
    else if (session.socketState !== "connected" || !session.agentConnected) state = "connecting"
    const connectionTextByState: Record<CoursePlaygroundSessionState, string> = {
        connecting: t("session.waiting"), live: t("session.agentConnected"), reconnecting: t("session.reconnecting"),
        completed: t("session.completed"), failed: t("session.waiting"),
    }
    const connectionText = connectionTextByState[state]

    return (
        <PlaygroundSessionBase
            // Workspace connection and terminal outcomes belong to the live-session block.
            state={state}
            props={{
                title: session.playground?.title ?? t("title"),
                steps,
                selectedStepIndex,
                passedStepIndexes: session.passedStepIndexes,
                connectionText,
                submitLabel: t("session.verify"),
                leaveLabel: t("session.leave"),
                retryLabel: t("retry"),
                completedTitle: t("session.completedTitle"),
                completedText: t("session.completedText"),
                failedText: t("session.failed"),
                stepLabel: t("session.step"),
                passedLabel: t("session.passed"),
            }}
            on={{
                step: (index) => setSelectedOverride(index),
                submit: () => {
                    setSelectedOverride(null)
                    session.verify()
                },
                leave: () => router.push(`/courses/${displayId}/learn/playground/${slug}`),
                retry: session.retry,
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
