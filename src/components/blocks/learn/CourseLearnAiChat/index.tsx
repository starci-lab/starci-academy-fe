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
import {
    buildContentAiQuestion,
    parseContentAiQuestion,
    type ContentAiSelectionContext,
} from "@/modules/ai/content-ai-selection-context"
import { parseCourseAdvisorResponse } from "@/modules/ai/course-advisor-response"
import {
    CourseLearnAiChatBase,
} from "./component"
import {
    STARCI_AI_CHAT_STATES,
    type StarCiAiChatState,
    type StarCiAiMode,
    type StarCiAiTurn,
} from "@/components/blocks/ai/StarCiAiChat/component"

/** Stable course aggregate and current Challenge evidence supplied by the Learn route. */
export type CourseLearnAiChatProps = {
    readonly displayId: string
    readonly courseId?: string
    readonly challengeId: string
    readonly challengeTitle: string
    readonly selection?: ContentAiSelectionContext
    readonly initialPrompt?: string
    readonly onClearSelection?: () => void
}

type CourseLearnAiStateInput = {
    readonly mode: StarCiAiMode
    readonly terminalState?: StarCiAiChatState
    readonly hasAnchor: boolean
    readonly sessionsLoading: boolean
    readonly sessionsFailed: boolean
    readonly sessionCount: number
    readonly isStreaming: boolean
    readonly hasActiveSession: boolean
    readonly quotaLoading: boolean
    readonly hasWeeklyCredits: boolean
}

const resolveCourseLearnAiState = (input: CourseLearnAiStateInput): StarCiAiChatState => {
    if (input.mode === "history") {
        if (input.sessionsLoading) return "historyPending"
        if (input.sessionsFailed) return "historyFailed"
        return input.sessionCount === 0 ? "searchEmpty" : "historyReady"
    }
    if (input.terminalState !== undefined) return input.terminalState
    if (!input.hasAnchor || input.sessionsLoading) return "sessionsPending"
    if (input.sessionsFailed) return "sessionsFailed"
    if (input.isStreaming) return "streaming"
    if (!input.hasActiveSession) return "noSession"
    if (input.quotaLoading) return "quotaPending"
    return input.hasWeeklyCredits ? "ready" : "zeroPaidCredits"
}

/** Own persisted course-scoped conversations and Challenge grounding without Global Chat data. */
export const CourseLearnAiChat = (props: CourseLearnAiChatProps) => {
    const t = useTranslations("globalAi")
    const challengeText = useTranslations("learn.content")
    const locale = useLocale()
    const anchor = props.courseId === undefined ? null : { scope: "course" as const, courseId: props.courseId }
    const sessions = useQueryContentAiSessionsSwr(anchor)
    const [mode, setMode] = useState<StarCiAiMode>("general")
    const [activeSessionId, setActiveSessionId] = useState<string>()
    const history = useQueryContentAiHistorySwr(activeSessionId)
    const quota = useQueryMyAiQuotaSwr()
    const createSession = useMutateCreateContentAiSessionSwr()
    const stream = useContentAiStream()
    const [draft, setDraft] = useState(props.initialPrompt ?? "")
    const [draftKey, setDraftKey] = useState(0)
    const [localTurns, setLocalTurns] = useState<ReadonlyArray<StarCiAiTurn>>([])
    const [terminalState, setTerminalState] = useState<StarCiAiChatState>()

    useEffect(() => {
        if (activeSessionId === undefined && sessions.data?.sessions[0] !== undefined) {
            setActiveSessionId(sessions.data.sessions[0].id)
        }
    }, [activeSessionId, sessions.data?.sessions])

    useEffect(() => {
        if (props.initialPrompt === undefined) return
        setDraft(props.initialPrompt)
        setDraftKey((key) => key + 1)
    }, [props.initialPrompt])

    const persistedTurns = useMemo<ReadonlyArray<StarCiAiTurn>>(
        () => (history.data?.messages ?? []).map((turn, index) => {
            const parsed = turn.role === "user" ? parseContentAiQuestion(turn.content) : undefined
            const advisor = turn.role === "assistant" ? parseCourseAdvisorResponse(turn.content) : undefined
            return {
                id: `course-persisted-${index}`,
                role: turn.role,
                body: parsed?.question ?? advisor?.body ?? turn.content,
                quote: parsed?.selection?.quote,
                quoteLanguage: parsed?.quoteLanguage,
            }
        }),
        [history.data?.messages],
    )
    const turns = [...persistedTurns, ...localTurns]
    const state = resolveCourseLearnAiState({
        mode,
        terminalState,
        hasAnchor: anchor !== null,
        sessionsLoading: sessions.isLoading,
        sessionsFailed: sessions.error !== undefined,
        sessionCount: sessions.data?.sessions.length ?? 0,
        isStreaming: stream.isStreaming,
        hasActiveSession: activeSessionId !== undefined,
        quotaLoading: quota.isLoading,
        hasWeeklyCredits: quota.data?.credit.remainingWeek !== 0,
    })

    const send = async () => {
        if (anchor === null || draft.trim() === "") return
        setTerminalState(undefined)
        let sessionId = activeSessionId
        if (sessionId === undefined) {
            try {
                const created = await createSession.trigger(anchor)
                sessionId = created.id ?? undefined
                if (sessionId === undefined) {
                    setTerminalState("streamFailed")
                    return
                }
                setActiveSessionId(sessionId)
            } catch {
                setTerminalState("streamFailed")
                return
            }
        }
        const id = crypto.randomUUID()
        const assistantId = `course-assistant-${id}`
        const question = draft.trim()
        setLocalTurns((current) => [
            ...current,
            { id: `course-user-${id}`, role: "user", body: question, quote: props.selection?.quote },
            { id: assistantId, role: "assistant", body: "", isPartial: true },
        ])
        stream.ask({
            sessionId,
            ...anchor,
            experience: "learn_companion",
            question: buildContentAiQuestion(question, props.selection),
            history: turns.map((turn) => ({ role: turn.role, content: turn.body })),
            onDelta: (delta) => setLocalTurns((current) => current.map((turn) => (
                turn.id === assistantId ? { ...turn, body: `${turn.body}${delta}` } : turn
            ))),
            onDone: (error) => {
                if (error !== undefined) {
                    setTerminalState(/quota|credit/iu.test(error) ? "quotaRejected" : "streamFailed")
                    return
                }
                setLocalTurns((current) => current.map((turn) => (
                    turn.id === assistantId
                        ? { ...turn, body: parseCourseAdvisorResponse(turn.body).body, isPartial: false }
                        : turn
                )))
                setDraft("")
                setDraftKey((key) => key + 1)
                props.onClearSelection?.()
                setTerminalState(undefined)
                void Promise.all([history.mutate(), sessions.mutate(), quota.mutate()]).then(() => setLocalTurns([]))
            },
        })
    }
    const labels = {
        eyebrow: t("identity.learningAssistant"),
        subtitle: t("identity.learningAssistantDescription"),
        emptyTitle: t("empty.learningTitle"),
        emptyDescription: t("empty.learningDescription"),
        quickPrompts: [t("prompts.explain"), t("prompts.practice")],
        recommendationList: t("recommendation.listLabel"),
        generalMode: t("modes.general"), historyMode: t("modes.history"),
        composer: t("composer.label"), placeholder: challengeText("challengeAiPlaceholder"), send: t("actions.send"),
        stop: t("actions.stop"), retry: t("actions.retry"), clearContext: t("actions.clearContext"),
        rename: t("actions.rename"), archive: t("actions.archive"), delete: t("actions.delete"),
        confirmDelete: t("actions.confirmDelete"), cancel: t("actions.cancel"), partial: t("partial"),
        states: Object.fromEntries(STARCI_AI_CHAT_STATES.map((name) => [name, t(`states.${name}`)])) as Readonly<Record<StarCiAiChatState, string>>,
    }
    const quotaLabel = quota.data === undefined || quota.data === null
        ? undefined
        : t("quota.remaining", { remaining: quota.data.credit.remainingWeek })

    return (
        <CourseLearnAiChatBase
            state={state}
            props={{
                labels,
                mode,
                contextSummary: challengeText("challengeAiContext", {
                    course: props.displayId,
                    challenge: props.challengeTitle,
                }),
                turns,
                sessions: (sessions.data?.sessions ?? []).map((session) => ({
                    id: session.id,
                    title: session.title ?? t("untitled"),
                    updatedLabel: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(session.updatedAt)),
                })),
                activeSessionId: mode === "history" ? undefined : activeSessionId,
                selection: props.selection,
                draft,
                draftKey,
                quotaLabel,
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
                send: () => { void send() },
                stop: stream.abort,
                retry: () => { void send() },
                clearContext: props.onClearSelection,
            }}
        />
    )
}

export * from "./component"
/** Connected ownership marker for course-context Learn AI. */
