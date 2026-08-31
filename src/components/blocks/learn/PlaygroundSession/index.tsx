"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { usePlaygroundSession } from "@/components/layouts/PlaygroundSessionLayout"
import { PlaygroundSessionBase, type CoursePlaygroundSessionState } from "./component"

const VERIFY_PENDING_TIMEOUT_MS = 15_000

/** Course and playground route identities consumed by the live session. */
export type PlaygroundSessionProps = { readonly displayId: string; readonly slug: string }

/** Consume the persistent session owner; only `step:verified` changes completed progress. */
export const PlaygroundSession = (props: PlaygroundSessionProps) => {
    const { displayId, slug } = props
    const t = useTranslations("learn.playground")
    const router = useRouter()
    const session = usePlaygroundSession()
    const [selectedOverride, setSelectedOverride] = useState<number | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const steps = session.session?.steps ?? session.playground?.steps ?? []
    const currentStepIndex = Math.min(session.passedStepIndexes.length, Math.max(0, steps.length - 1))
    const selectedStepIndex = selectedOverride ?? currentStepIndex
    const completed = steps.length > 0 && session.passedStepIndexes.includes(steps.length - 1)

    useEffect(() => {
        if (session.isRestoring || session.hasPaired) return
        router.replace(`/courses/${displayId}/learn/playground/${slug}`)
    }, [displayId, router, session.hasPaired, session.isRestoring, slug])

    useEffect(() => {
        setIsVerifying(false)
    }, [session.agentConnected, session.socketState, session.verifiedStepIndex])

    useEffect(() => {
        if (!isVerifying) return undefined
        const timeout = window.setTimeout(() => setIsVerifying(false), VERIFY_PENDING_TIMEOUT_MS)
        return () => window.clearTimeout(timeout)
    }, [isVerifying])

    let state: CoursePlaygroundSessionState = "live"
    if (session.failed || session.startFailed) state = "failed"
    else if (completed) state = "completed"
    else if (session.hasPaired && session.socketState === "failed") state = "recovery-failed"
    else if (session.hasPaired && (session.socketState === "reconnecting" || !session.agentConnected)) state = "reconnecting"
    else if (session.socketState !== "connected" || !session.agentConnected) state = "connecting"
    const connectionTextByState: Record<CoursePlaygroundSessionState, string> = {
        connecting: t("session.waiting"), live: t("session.agentConnected"), reconnecting: t("session.reconnecting"),
        "recovery-failed": t("session.recoveryFailed"), completed: t("session.completed"), failed: t("session.failedStatus"),
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
                scratchpadTitle: t("session.scratchpadTitle"),
                scratchpadDescription: t("session.scratchpadDescription"),
                outputTitle: t("session.outputTitle"),
                outputWaiting: t("session.outputWaiting"),
                verifyingLabel: t("session.verifying"),
                isVerifying,
                progressLabel: t("session.progressLabel"),
                progressText: t("session.progressText", { passed: session.passedStepIndexes.length, total: steps.length }),
                stepsTitle: t("session.stepsTitle"),
                reconnectText: t("session.reconnectText"),
                recoveryFailedTitle: t("session.recoveryFailedTitle"),
                recoveryFailedText: t("session.recoveryFailedText"),
                exitLabel: t("session.exitToCatalog"),
                currentStepLabel: t("session.currentStep"),
                lockedLabel: t("session.locked"),
            }}
            on={{
                step: (index) => setSelectedOverride(index),
                submit: () => {
                    setSelectedOverride(null)
                    setIsVerifying(true)
                    session.verify()
                },
                leave: () => router.push(`/courses/${displayId}/learn/playground/${slug}`),
                retry: session.retry,
                exit: () => router.push(`/courses/${displayId}/learn/playground`),
            }}
        />
    )
}
