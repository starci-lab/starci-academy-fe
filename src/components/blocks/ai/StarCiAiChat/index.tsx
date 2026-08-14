"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    useContentAiStream,
    useMutateCreateContentAiSessionSwr,
    useQueryContentAiHistorySwr,
    useQueryContentAiSessionsSwr,
    useQueryMyAiQuotaSwr,
} from "@/hooks"
import { useGlobalAiChat } from "@/components/layouts/GlobalAiChatLayout/context"
import { buildContentAiQuestion, formatContentAiContextSummary } from "@/modules/ai/content-ai-selection-context"
import {
    _StarCiAiChat,
    STARCI_AI_CHAT_STATES,
    type StarCiAiChatState,
    type StarCiAiMode,
    type StarCiAiTurn,
} from "./component"

/** Resolve persisted conversations, advisory credits and one authenticated stream into the pure chat. */
export const StarCiAiChat = () => {
    const t = useTranslations("globalAi")
    const locale = useLocale()
    const owner = useGlobalAiChat()
    const [mode, setMode] = useState<StarCiAiMode>(owner.codeContext === undefined ? "general" : "code")
    const [activeSessionId, setActiveSessionId] = useState<string>()
    const [draft, setDraft] = useState("")
    const [draftKey, setDraftKey] = useState(0)
    const [localTurns, setLocalTurns] = useState<ReadonlyArray<StarCiAiTurn>>([])
    const [terminalState, setTerminalState] = useState<StarCiAiChatState>()
    const sessions = useQueryContentAiSessionsSwr()
    const history = useQueryContentAiHistorySwr(activeSessionId)
    const quota = useQueryMyAiQuotaSwr()
    const createSession = useMutateCreateContentAiSessionSwr()
    const stream = useContentAiStream()

    useEffect(() => {
        if (activeSessionId === undefined && sessions.data?.sessions[0] !== undefined) {
            setActiveSessionId(sessions.data.sessions[0].id)
        }
    }, [activeSessionId, sessions.data?.sessions])

    useEffect(() => {
        if (owner.codeContext !== undefined) setMode("code")
    }, [owner.codeContext])

    const persistedTurns = useMemo<ReadonlyArray<StarCiAiTurn>>(
        () => (history.data?.messages ?? []).map((turn, index) => ({
            id: `persisted-${index}`,
            role: turn.role,
            body: turn.content,
        })),
        [history.data?.messages],
    )
    const turns = [...persistedTurns, ...localTurns]
    const historyMode = mode === "history"
    const state: StarCiAiChatState = historyMode
        ? sessions.isLoading ? "historyPending" : sessions.error !== undefined ? "historyFailed" : (sessions.data?.sessions.length ?? 0) === 0 ? "searchEmpty" : "historyReady"
        : terminalState ?? (stream.isStreaming
            ? "streaming"
            : sessions.isLoading
                ? "sessionsPending"
                : sessions.error !== undefined
                    ? "sessionsFailed"
                    : activeSessionId === undefined
                        ? "noSession"
                        : stream.state === "reconnecting" || stream.state === "connecting"
                            ? "reconnecting"
                            : stream.state === "failed" || stream.state === "idle"
                                ? "offline"
                                : quota.isLoading
                                    ? "quotaPending"
                                    : quota.data?.credit.remainingWeek === 0 ? "zeroPaidCredits" : "ready")

    const anchorRequest = owner.anchor.scope === "global" || owner.anchor.id === undefined
        ? { scope: "global" as const }
        : { scope: owner.anchor.scope, [`${owner.anchor.scope}Id`]: owner.anchor.id }

    const send = async () => {
        if (draft.trim() === "") return
        setTerminalState(undefined)
        let sessionId = activeSessionId
        if (sessionId === undefined) {
            try {
                const created = await createSession.trigger(anchorRequest)
                sessionId = created.id ?? undefined
                if (sessionId === undefined) { setTerminalState("streamFailed"); return }
                setActiveSessionId(sessionId)
            } catch { setTerminalState("streamFailed"); return }
        }
        const userTurn: StarCiAiTurn = {
            id: `user-${Date.now()}`,
            role: "user",
            body: draft.trim(),
            quote: owner.codeContext?.quote,
            quoteLanguage: owner.codeContext?.path?.split(".").pop(),
        }
        const assistantId = `assistant-${Date.now()}`
        setLocalTurns((current) => [...current, userTurn, { id: assistantId, role: "assistant", body: "", isPartial: true }])
        stream.ask({
            sessionId,
            ...anchorRequest,
            question: buildContentAiQuestion(draft, owner.codeContext),
            history: turns.map((turn) => ({ role: turn.role, content: turn.body })),
            onDelta: (delta) => setLocalTurns((current) => current.map((turn) => turn.id === assistantId ? { ...turn, body: `${turn.body}${delta}` } : turn)),
            onDone: (error) => {
                if (error !== undefined) {
                    const next = error === "ABORTED"
                        ? "aborted"
                        : error === "SOCKET_DISCONNECTED"
                            ? "reconnecting"
                            : /quota|credit/iu.test(error) ? "quotaRejected" : "streamFailed"
                    setTerminalState(next)
                    return
                }
                setLocalTurns((current) => current.map((turn) => turn.id === assistantId ? { ...turn, isPartial: false } : turn))
                setDraft("")
                setDraftKey((key) => key + 1)
                owner.clearCodeContext()
                setTerminalState("contextCleared")
                void quota.mutate()
                void history.mutate()
                void sessions.mutate()
            },
        })
    }

    const labels = {
        generalMode: t("modes.general"), codeMode: t("modes.code"), historyMode: t("modes.history"),
        composer: t("composer.label"), placeholder: t("composer.placeholder"), send: t("actions.send"),
        stop: t("actions.stop"), retry: t("actions.retry"), clearContext: t("actions.clearContext"),
        rename: t("actions.rename"), archive: t("actions.archive"), delete: t("actions.delete"),
        confirmDelete: t("actions.confirmDelete"), cancel: t("actions.cancel"), partial: t("partial"),
        states: Object.fromEntries(STARCI_AI_CHAT_STATES.map((name) => [name, t(`states.${name}`)])) as Readonly<Record<StarCiAiChatState, string>>,
    }

    return (
        <_StarCiAiChat
            state={state}
            props={{
                labels,
                mode,
                contextSummary: formatContentAiContextSummary(owner.anchor, owner.codeContext),
                turns,
                sessions: (sessions.data?.sessions ?? []).map((session) => ({
                    id: session.id,
                    title: session.title ?? t("untitled"),
                    updatedLabel: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(session.updatedAt)),
                })),
                activeSessionId,
                selection: owner.codeContext,
                draft,
                draftKey,
                quotaLabel: quota.isLoading
                    ? undefined
                    : quota.data === null || quota.data === undefined
                        ? t("quota.unavailable")
                        : t("quota.remaining", { remaining: quota.data.credit.remainingWeek }),
            }}
            on={{
                selectMode: setMode,
                selectSession: setActiveSessionId,
                changeDraft: setDraft,
                send: () => void send(),
                stop: stream.abort,
                retry: () => void send(),
                clearContext: owner.clearCodeContext,
            }}
        />
    )
}

export * from "./component"
export const meta = { world: "connected", domain: "ai" } as const
