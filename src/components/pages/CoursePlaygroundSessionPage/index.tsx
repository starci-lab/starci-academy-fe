"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { usePlaygroundSession } from "@/components/layouts/PlaygroundSessionLayout"
import { _CoursePlaygroundSessionPage, type CoursePlaygroundSessionState } from "./component"

/** Course and playground route identities consumed by the live session. */
export type CoursePlaygroundSessionPageProps = { readonly displayId: string; readonly slug: string }

/** Consume the persistent session owner; only `step:verified` changes completed progress. */
export const CoursePlaygroundSessionPage = ({ displayId, slug }: CoursePlaygroundSessionPageProps) => {
    const t = useTranslations("learn.playground")
    const router = useRouter()
    const session = usePlaygroundSession()
    const [selectedOverride, setSelectedOverride] = useState<number | null>(null)
    const steps = session.session?.steps ?? session.playground?.steps ?? []
    const currentStepIndex = Math.min(session.passedStepIndexes.length, Math.max(0, steps.length - 1))
    const selectedStepIndex = selectedOverride ?? currentStepIndex
    const completed = steps.length > 0 && session.passedStepIndexes.includes(steps.length - 1)
    const state: CoursePlaygroundSessionState = session.failed || session.startFailed || session.session === null || session.socketState === "failed"
        ? "failed"
        : completed ? "completed"
            : session.socketState === "reconnecting" ? "reconnecting"
                : session.socketState !== "connected" || !session.agentConnected ? "connecting" : "live"
    const connectionText = state === "live"
        ? t("session.agentConnected")
        : state === "reconnecting"
            ? t("session.reconnecting")
            : state === "completed"
                ? t("session.completed")
                : t("session.waiting")

    return (
        <_CoursePlaygroundSessionPage
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
