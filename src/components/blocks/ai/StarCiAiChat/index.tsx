"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
    useContentAiStream,
    useMutateCreateContentAiSessionSwr,
    useMutateDeleteContentAiSessionSwr,
    useMutateRenameContentAiSessionSwr,
    useMutateSetContentAiSessionArchivedSwr,
    useQueryContentAiHistorySwr,
    useQueryContentAiSessionsSwr,
    useQueryCourseSwr,
    useQueryMyAiQuotaSwr,
} from "@/hooks"
import { useGlobalAiChat } from "@/modules/ai/global-ai-chat-context"
import { CourseAdvisorRecommendationCard } from "@/components/blocks/ai/CourseAdvisorRecommendationCard"
import {
    resolveContentAiAnchorRequest,
    resolveContentAiExperience,
} from "@/modules/ai/content-ai-route-context"
import {
    buildContentAiQuestion,
    formatContentAiContextSummary,
    parseContentAiQuestion,
} from "@/modules/ai/content-ai-selection-context"
import { parseCourseAdvisorResponse } from "@/modules/ai/course-advisor-response"
import {
    StarCiAiChatBase,
    STARCI_AI_CHAT_STATES,
    type StarCiAiChatState,
    type StarCiAiMode,
    type StarCiAiTurn,
} from "./component"

type StarCiAiAttempt = {
    readonly userId: string
    readonly assistantId: string
}
/** Props for the connected chat owner; state is resolved from its hooks. */
type StarCiAiChatProps = Record<never, never>

type StarCiAiGeneralStateInput = {
    readonly hasAnchor: boolean
    readonly isStreaming: boolean
    readonly sessionsLoading: boolean
    readonly sessionsFailed: boolean
    readonly hasActiveSession: boolean
    readonly streamState: string
    readonly quotaLoading: boolean
    readonly remainingWeek?: number
}

const resolveHistoryState = (isLoading: boolean, hasError: boolean, sessionCount: number): StarCiAiChatState => {
    if (isLoading) return "historyPending"
    if (hasError) return "historyFailed"
    return sessionCount === 0 ? "searchEmpty" : "historyReady"
}

const resolveGeneralState = (input: StarCiAiGeneralStateInput): StarCiAiChatState => {
    if (!input.hasAnchor || input.sessionsLoading) return "sessionsPending"
    if (input.isStreaming) return "streaming"
    if (input.sessionsFailed) return "sessionsFailed"
    if (!input.hasActiveSession) return "noSession"
    if (input.streamState === "reconnecting" || input.streamState === "connecting" || input.streamState === "idle") return "reconnecting"
    if (input.streamState === "failed") return "offline"
    if (input.quotaLoading) return "quotaPending"
    return input.remainingWeek === 0 ? "zeroPaidCredits" : "ready"
}

const resolveStreamErrorState = (error: string): StarCiAiChatState => {
    if (error === "ABORTED") return "aborted"
    if (error === "SOCKET_DISCONNECTED") return "reconnecting"
    return /quota|credit/iu.test(error) ? "quotaRejected" : "streamFailed"
}

/** Resolve persisted conversations, advisory credits and one authenticated stream into the pure chat. */
/** Resolve persisted conversations, credits and streaming state for the authenticated AI chat. */
export const StarCiAiChat = (props: StarCiAiChatProps) => {
    void props
    const t = useTranslations("globalAi")
    const locale = useLocale()
    const owner = useGlobalAiChat()
    const [mode, setMode] = useState<StarCiAiMode>("general")
    const [activeSessionId, setActiveSessionId] = useState<string>()
    const [draft, setDraft] = useState("")
    const [draftKey, setDraftKey] = useState(0)
    const [localTurns, setLocalTurns] = useState<ReadonlyArray<StarCiAiTurn>>([])
    const [terminalState, setTerminalState] = useState<StarCiAiChatState>()
    const handledTangentVersion = useRef(owner.tangentVersion)
    const failedAttempt = useRef<StarCiAiAttempt | undefined>(undefined)
    const course = useQueryCourseSwr({ displayId: owner.anchor.scope === "course" ? owner.anchor.id : undefined })
    const anchorRequest = useMemo(
        () => resolveContentAiAnchorRequest(owner.anchor, course.data?.id),
        [course.data?.id, owner.anchor],
    )
    const experience = resolveContentAiExperience(owner.anchor)
    const sessions = useQueryContentAiSessionsSwr(anchorRequest)
    const history = useQueryContentAiHistorySwr(activeSessionId)
    const quota = useQueryMyAiQuotaSwr()
    const createSession = useMutateCreateContentAiSessionSwr()
    const renameSession = useMutateRenameContentAiSessionSwr()
    const archiveSession = useMutateSetContentAiSessionArchivedSwr()
    const deleteSession = useMutateDeleteContentAiSessionSwr()
    const stream = useContentAiStream()
    useEffect(() => {
        if (activeSessionId === undefined && sessions.data?.sessions[0] !== undefined) {
            setActiveSessionId(sessions.data.sessions[0].id)
        }
    }, [activeSessionId, sessions.data?.sessions])

    useEffect(() => {
        if (owner.tangentVersion === handledTangentVersion.current) return
        handledTangentVersion.current = owner.tangentVersion
        if (anchorRequest === null) return
        let isCurrent = true
        void createSession.trigger({ ...anchorRequest, archived: true }).then((created) => {
            if (!isCurrent || created.id === null || created.id === undefined) return
            setActiveSessionId(created.id)
            setLocalTurns([])
            setMode("general")
            setTerminalState("tangentReady")
            void sessions.mutate()
        }).catch(() => {
            if (isCurrent) setTerminalState("streamFailed")
        })
        return () => { isCurrent = false }
    }, [owner.tangentVersion])

    const persistedTurns = useMemo<ReadonlyArray<StarCiAiTurn>>(
        () => (history.data?.messages ?? []).map((turn, index) => {
            const parsed = turn.role === "user" ? parseContentAiQuestion(turn.content) : undefined
            const advisor = turn.role === "assistant" ? parseCourseAdvisorResponse(turn.content) : undefined
            return {
                id: `persisted-${index}`,
                role: turn.role,
                body: parsed?.question ?? advisor?.body ?? turn.content,
                quote: parsed?.selection?.quote,
                quoteLanguage: parsed?.quoteLanguage,
                courseAdvisor: advisor?.courseAdvisor,
            }
        }),
        [history.data?.messages],
    )
    const turns = [...persistedTurns, ...localTurns]
    const historyMode = mode === "history"
    const historyOwnsTerminal = terminalState === "renaming" || terminalState === "archiving" || terminalState === "deleteConfirm" || terminalState === "historyFailed"
    const state: StarCiAiChatState = historyMode
        ? historyOwnsTerminal ? terminalState : resolveHistoryState(sessions.isLoading, sessions.error !== undefined, sessions.data?.sessions.length ?? 0)
        : terminalState ?? resolveGeneralState({
            hasAnchor: anchorRequest !== null,
            isStreaming: stream.isStreaming,
            sessionsLoading: sessions.isLoading,
            sessionsFailed: sessions.error !== undefined,
            hasActiveSession: activeSessionId !== undefined,
            streamState: stream.state,
            quotaLoading: quota.isLoading,
            remainingWeek: quota.data?.credit.remainingWeek,
        })

    const refreshSessions = async () => {
        await sessions.mutate()
        setTerminalState(undefined)
    }

    const renameActiveSession = async () => {
        if (activeSessionId === undefined) return
        const current = sessions.data?.sessions.find((session) => session.id === activeSessionId)
        const title = window.prompt(t("actions.renamePrompt"), current?.title ?? "")
        if (title === null) return
        setTerminalState("renaming")
        try {
            await renameSession.trigger({ sessionId: activeSessionId, title: title.trim() })
            await refreshSessions()
        } catch {
            setTerminalState("historyFailed")
        }
    }

    const archiveActiveSession = async () => {
        if (activeSessionId === undefined) return
        setTerminalState("archiving")
        try {
            await archiveSession.trigger({ sessionId: activeSessionId, archived: true })
            setActiveSessionId(undefined)
            await refreshSessions()
        } catch {
            setTerminalState("historyFailed")
        }
    }

    const deleteActiveSession = async () => {
        if (activeSessionId === undefined) return
        try {
            await deleteSession.trigger({ sessionId: activeSessionId })
            setActiveSessionId(undefined)
            await refreshSessions()
        } catch {
            setTerminalState("historyFailed")
        }
    }

    const send = async (discardedAttempt?: StarCiAiAttempt) => {
        if (draft.trim() === "" || anchorRequest === null) return
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
        const attempt = crypto.randomUUID()
        const userTurn: StarCiAiTurn = {
            id: `user-${attempt}`,
            role: "user",
            body: draft.trim(),
            quote: owner.codeContext?.quote,
            quoteLanguage: owner.codeContext?.path?.split(".").pop(),
        }
        const assistantId = `assistant-${attempt}`
        const discardedIds = new Set(discardedAttempt === undefined
            ? []
            : [discardedAttempt.userId, discardedAttempt.assistantId])
        failedAttempt.current = undefined
        setLocalTurns((current) => [
            ...current.filter((turn) => !discardedIds.has(turn.id)),
            userTurn,
            { id: assistantId, role: "assistant", body: "", isPartial: true },
        ])
        stream.ask({
            sessionId,
            ...anchorRequest,
            experience,
            question: buildContentAiQuestion(draft, owner.codeContext),
            history: turns
                .filter((turn) => !discardedIds.has(turn.id))
                .map((turn) => ({ role: turn.role, content: turn.body })),
            onDelta: (delta) => setLocalTurns((current) => current.map((turn) => turn.id === assistantId ? { ...turn, body: `${turn.body}${delta}` } : turn)),
            onDone: (error, courseAdvisor) => {
                if (error !== undefined) {
                    const next = resolveStreamErrorState(error)
                    failedAttempt.current = { userId: userTurn.id, assistantId }
                    if (next === "quotaRejected") {
                        setLocalTurns((current) => current.filter((turn) => turn.id !== userTurn.id && turn.id !== assistantId))
                    }
                    setTerminalState(next)
                    return
                }
                setLocalTurns((current) => current.map((turn) => turn.id === assistantId ? { ...turn, isPartial: false, courseAdvisor } : turn))
                setDraft("")
                setDraftKey((key) => key + 1)
                owner.clearCodeContext()
                setTerminalState(undefined)
                void quota.mutate()
                void Promise.all([history.mutate(), sessions.mutate()]).then(() => {
                    setLocalTurns([])
                })
            },
        })
    }

    const retry = () => {
        const discarded = failedAttempt.current
        void send(discarded)
    }

    const clearContext = () => {
        owner.clearCodeContext()
        setTerminalState("contextCleared")
    }

    const labels = {
        eyebrow: experience === "course_advisor" ? t("identity.courseAdvisor") : t("identity.learningAssistant"),
        subtitle: experience === "course_advisor" ? t("identity.courseAdvisorDescription") : t("identity.learningAssistantDescription"),
        emptyTitle: experience === "course_advisor" ? t("empty.courseAdvisorTitle") : t("empty.learningTitle"),
        emptyDescription: experience === "course_advisor" ? t("empty.courseAdvisorDescription") : t("empty.learningDescription"),
        quickPrompts: experience === "course_advisor"
            ? [t("prompts.goal"), t("prompts.compare")]
            : [t("prompts.explain"), t("prompts.practice")],
        recommendationList: t("recommendation.listLabel"),
        generalMode: t("modes.general"), historyMode: t("modes.history"),
        composer: t("composer.label"), placeholder: t("composer.placeholder"), send: t("actions.send"),
        stop: t("actions.stop"), retry: t("actions.retry"), clearContext: t("actions.clearContext"),
        rename: t("actions.rename"), archive: t("actions.archive"), delete: t("actions.delete"),
        confirmDelete: t("actions.confirmDelete"), cancel: t("actions.cancel"), partial: t("partial"),
        states: Object.fromEntries(STARCI_AI_CHAT_STATES.map((name) => [name, t(`states.${name}`)])) as Readonly<Record<StarCiAiChatState, string>>,
    }
    let quotaLabel: string | undefined
    if (!quota.isLoading) {
        quotaLabel = quota.data === null || quota.data === undefined
            ? t("quota.unavailable")
            : t("quota.remaining", { remaining: quota.data.credit.remainingWeek })
    }
    const contextSummary = experience === "course_advisor"
        ? owner.anchor.scope === "course"
            ? t("context.course", { title: course.data?.title ?? owner.anchor.id ?? t("context.currentCourse") })
            : t("context.catalog")
        : formatContentAiContextSummary(owner.anchor, owner.codeContext)

    return (
        <StarCiAiChatBase
            state={state}
            props={{
                labels,
                mode,
                contextSummary,
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
                quotaLabel,
                recommendationCard: CourseAdvisorRecommendationCard,
            }}
            on={{
                selectMode: setMode,
                selectSession: (id) => {
                    setActiveSessionId(id)
                    setLocalTurns([])
                    setTerminalState(undefined)
                    setMode("general")
                },
                changeDraft: setDraft,
                usePrompt: (prompt) => {
                    setDraft(prompt)
                    setDraftKey((key) => key + 1)
                },
                send: () => void send(),
                stop: stream.abort,
                retry,
                clearContext,
                rename: () => void renameActiveSession(),
                archive: () => void archiveActiveSession(),
                delete: () => setTerminalState("deleteConfirm"),
                confirmDelete: () => void deleteActiveSession(),
                cancelDelete: () => setTerminalState(undefined),
            }}
        />
    )
}

export * from "./component"
