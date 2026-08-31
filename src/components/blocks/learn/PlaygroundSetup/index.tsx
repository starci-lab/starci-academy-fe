"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { usePlaygroundSession } from "@/components/layouts/PlaygroundSessionLayout"
import { PlaygroundSetupBase, type CoursePlaygroundSetupState } from "./component"

/** Course and playground route identities consumed by setup. */
export type PlaygroundSetupProps = { readonly displayId: string; readonly slug: string }

/** Bind the setup route to the slug layout's persistent query, mutation and socket owner. */
export const PlaygroundSetup = (props: PlaygroundSetupProps) => {
    const { displayId, slug } = props
    const t = useTranslations("learn.playground")
    const router = useRouter()
    const session = usePlaygroundSession()
    const [copied, setCopied] = useState(false)
    let state: CoursePlaygroundSetupState = "paired"
    if (session.failed || session.startFailed || session.socketState === "failed") state = "failed"
    else if (session.isLoading) state = "loading"
    else if (session.playground === null) state = "not-found"
    else if (session.isStarting) state = "starting"
    else if (session.session === null) state = "unpaired"
    else if (session.agentConnected) state = "ready"

    return (
        <PlaygroundSetupBase state={state} props={{
            playground: session.playground,
            titleFallback: t("setup.titleFallback"),
            preparationTitle: t("setup.preparationTitle"),
            preparationSteps: [t("setup.installCli"), t("setup.createSession"), t("setup.pairMachine")],
            startLabel: t("setup.start"),
            startingLabel: t("setup.starting"),
            pairingLabel: t("setup.pairing"),
            waitingLabel: t("setup.waiting"),
            readyLabel: t("setup.ready"),
            enterLabel: t("setup.enter"),
            retryLabel: t("retry"),
            failedText: t("setup.failed"),
            notFoundText: t("setup.notFound"),
            pairingCode: session.session?.pairingCode,
            catalogLabel: t("setup.backToCatalog"),
            sessionTitle: t("setup.sessionTitle"),
            createDescription: t("setup.createDescription"),
            stageLabels: [t("setup.stageCreate"), t("setup.stagePair"), t("setup.stageEnter")],
            copyLabel: t("setup.copyCode"),
            copiedLabel: t("setup.codeCopied"),
            copied,
        }} on={{
            start: () => { void session.start() },
            enter: () => router.push(`/courses/${displayId}/learn/playground/${slug}/session`),
            retry: session.retry,
            back: () => router.push(`/courses/${displayId}/learn/playground`),
            copy: () => {
                if (session.session?.pairingCode === undefined) return
                void navigator.clipboard.writeText(session.session.pairingCode).then(() => {
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 2_000)
                }).catch(() => setCopied(false))
            },
        }} />
    )
}
