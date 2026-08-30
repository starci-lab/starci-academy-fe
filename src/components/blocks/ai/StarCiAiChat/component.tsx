import type { ComponentType } from "react"
import { Article } from "@/components/branches/Article"
import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Heading } from "@/components/leaves/Heading"
import { StarCiAiTeacher } from "@/components/leaves/StarCiAiTeacher"
import { Text } from "@/components/leaves/Text"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"
import type { CourseAdvisorMetadata, CourseAdvisorRecommendation } from "@/modules/ai/course-advisor-response"
import { aiChatClassNames, getAiChatBubbleClassName } from "./classNames"

/** Every settled state owned by sessions, history, mutations, realtime and quota. */
export type StarCiAiChatState =
    | "sessionsPending" | "sessionsFailed" | "noSession" | "historyPending" | "historyReady"
    | "searchEmpty" | "historyFailed" | "renaming" | "archiving" | "deleteConfirm" | "ready"
    | "streaming" | "quotaPending" | "zeroPaidCredits" | "quotaRejected" | "offline"
    | "reconnecting" | "streamFailed" | "aborted" | "tangentReady" | "contextCleared"

/** User-selectable views inside the advisor surface. */
export type StarCiAiMode = "general" | "history"

/** One transcript entry and any typed advisor evidence attached to it. */
export type StarCiAiTurn = {
    readonly id: string
    readonly role: "user" | "assistant"
    readonly body: string
    readonly quote?: string
    readonly quoteLanguage?: string
    readonly isPartial?: boolean
    readonly courseAdvisor?: CourseAdvisorMetadata
}

/** Summary of one persisted conversation offered by history mode. */
export type StarCiAiSession = { readonly id: string; readonly title: string; readonly updatedLabel: string; readonly isArchived?: boolean }

/** Resolved presentation copy for every advisor state and control. */
export type StarCiAiChatLabels = {
    readonly eyebrow: string
    readonly subtitle: string
    readonly emptyTitle: string
    readonly emptyDescription: string
    readonly quickPrompts: ReadonlyArray<string>
    readonly recommendationList: string
    readonly generalMode: string
    readonly historyMode: string
    readonly composer: string
    readonly placeholder: string
    readonly send: string
    readonly stop: string
    readonly retry: string
    readonly clearContext: string
    readonly rename: string
    readonly archive: string
    readonly delete: string
    readonly confirmDelete: string
    readonly cancel: string
    readonly partial: string
    readonly states: Readonly<Record<StarCiAiChatState, string>>
}

/** Data already resolved by the connected owner for deterministic rendering. */
export type StarCiAiChatData = {
    readonly labels: StarCiAiChatLabels
    readonly mode: StarCiAiMode
    readonly contextSummary?: string
    readonly turns: ReadonlyArray<StarCiAiTurn>
    readonly sessions: ReadonlyArray<StarCiAiSession>
    readonly activeSessionId?: string
    readonly selection?: ContentAiSelectionContext
    readonly draft: string
    readonly draftKey: number
    readonly quotaLabel?: string
    readonly recommendationCard?: ComponentType<{ readonly recommendation: CourseAdvisorRecommendation }>
}

/** Optional intent handlers exposed by the connected advisor owner. */
export type StarCiAiChatActions = {
    readonly selectMode?: (mode: StarCiAiMode) => void
    readonly selectSession?: (id: string) => void
    readonly rename?: () => void
    readonly archive?: () => void
    readonly delete?: () => void
    readonly confirmDelete?: () => void
    readonly cancelDelete?: () => void
    readonly changeDraft?: (draft: string) => void
    readonly usePrompt?: (prompt: string) => void
    readonly send?: () => void
    readonly stop?: () => void
    readonly retry?: () => void
    readonly clearContext?: () => void
}

/** Complete state/data/action contract for the pure advisor surface. */
export type StarCiAiChatProps = { readonly state: StarCiAiChatState; readonly props: StarCiAiChatData; readonly on?: StarCiAiChatActions }

const HISTORY_STATES = new Set<StarCiAiChatState>(["historyPending", "historyReady", "searchEmpty", "historyFailed", "renaming", "archiving", "deleteConfirm"])
const PENDING_TURN_IDS = ["pending-1", "pending-2"] as const
const QUIET_GENERAL_STATES = new Set<StarCiAiChatState>(["ready", "streaming", "noSession"])

const stateNeedsRetry = (state: StarCiAiChatState): boolean => state === "sessionsFailed" || state === "historyFailed" || state === "streamFailed" || state === "quotaRejected"

const turnMarkdown = (turn: StarCiAiTurn, partialLabel: string): string => {
    const quote = turn.quote === undefined ? "" : `\n\n\`\`\`${turn.quoteLanguage ?? "code"}\n${turn.quote}\n\`\`\``
    const partial = turn.isPartial === true ? `\n\n_${partialLabel}_` : ""
    return `${turn.body}${quote}${partial}`
}

type TurnProps = { readonly turn: StarCiAiTurn; readonly partialLabel: string; readonly recommendationList: string; readonly recommendationCard?: StarCiAiChatData["recommendationCard"] }

const Turn = (props: TurnProps) => {
    const { turn, partialLabel, recommendationList, recommendationCard: RecommendationCard } = props
    const isUser = turn.role === "user"
    return <div className={isUser ? aiChatClassNames.userTurn : aiChatClassNames.assistantTurn} data-chat-role={turn.role}>
        {isUser ? null : <span className={aiChatClassNames.avatarSlot}><StarCiAiTeacher props={{ size: "sm" }} /></span>}
        <div className={isUser ? aiChatClassNames.userContent : aiChatClassNames.turnContent}>
            <div className={getAiChatBubbleClassName(turn.role)}>
                <Article props={{ body: turnMarkdown(turn, partialLabel), measure: "compact" }} isLoading={turn.isPartial === true && turn.body === ""} />
            </div>
            {isUser || RecommendationCard === undefined || turn.courseAdvisor === undefined || turn.courseAdvisor.recommendations.length === 0 ? null : <div className={aiChatClassNames.recommendationList} aria-label={recommendationList}>
                {turn.courseAdvisor.recommendations.map((recommendation) => <RecommendationCard key={recommendation.courseDisplayId} recommendation={recommendation} />)}
            </div>}
        </div>
    </div>
}

/** Draw every AI-owner state from resolved fixture data; no transport or translation lives here. */
export const StarCiAiChatBase = (props: StarCiAiChatProps) => {
    const labels = props.props.labels
    const selection = props.props.selection
    const isHistory = props.props.mode === "history" || HISTORY_STATES.has(props.state)
    const isLoading = props.state === "sessionsPending" || props.state === "historyPending"
    const stateTurn: StarCiAiTurn | undefined = QUIET_GENERAL_STATES.has(props.state) || props.state === "historyReady" ? undefined : { id: `state-${props.state}`, role: "assistant", body: labels.states[props.state] }
    const renderedTurns = stateTurn === undefined ? props.props.turns : [...props.props.turns, stateTurn]
    const disablesComposer = props.state === "offline" || props.state === "reconnecting"
    const showsComposer = !isHistory && props.state !== "sessionsPending" && props.state !== "sessionsFailed"
    const showsSessionActions = isHistory && props.props.activeSessionId !== undefined
    const showsEmpty = !isHistory && renderedTurns.length === 0 && !isLoading

    const contextNode = isHistory || props.props.contextSummary === undefined ? null : <div className={aiChatClassNames.context} data-ai-context>
        <div className={aiChatClassNames.contextCopy}><span className={aiChatClassNames.contextDot} aria-hidden="true" /><Text props={{ content: props.props.contextSummary, size: "xs", weight: "medium" }} /></div>
        {selection === undefined ? null : <Button props={{ label: labels.clearContext, variant: "ghost", size: "sm" }} on={{ press: props.on?.clearContext }} />}
    </div>

    const transcript = (() => {
        if (isHistory && props.props.sessions.length > 0) return <div className={aiChatClassNames.history}>
            {props.props.sessions.map((session) => <Button key={session.id} props={{ label: `${session.title} · ${session.updatedLabel}`, variant: session.id === props.props.activeSessionId ? "secondary" : "ghost" }} on={{ press: () => props.on?.selectSession?.(session.id) }} />)}
            {props.state === "deleteConfirm" ? <Turn turn={{ id: "delete-confirm", role: "assistant", body: labels.states.deleteConfirm }} partialLabel={labels.partial} recommendationList={labels.recommendationList} recommendationCard={props.props.recommendationCard} /> : null}
        </div>
        if (renderedTurns.length === 0 && isLoading) return PENDING_TURN_IDS.map((id) => <div key={id} className={aiChatClassNames.assistantTurn}>
            <span className={aiChatClassNames.avatarSlot}><StarCiAiTeacher props={{ size: "sm" }} isLoading /></span>
            <div className={aiChatClassNames.turnContent}><div className={aiChatClassNames.assistantBubble}><Article props={{ measure: "compact" }} isLoading /></div></div>
        </div>)
        if (showsEmpty) return <section className={aiChatClassNames.empty} aria-label={labels.emptyTitle}>
            <StarCiAiTeacher props={{ size: "hero", isOnline: true }} />
            <div className={aiChatClassNames.emptyCopy}><Heading props={{ content: labels.emptyTitle, level: 2 }} /><Text props={{ content: labels.emptyDescription, size: "sm", tone: "muted" }} /></div>
            <div className={aiChatClassNames.prompts}>{labels.quickPrompts.map((prompt) => <Button key={prompt} props={{ label: prompt, variant: "outline", size: "sm" }} on={{ press: () => props.on?.usePrompt?.(prompt) }} />)}</div>
        </section>
        return renderedTurns.map((turn) => <Turn key={turn.id} turn={turn} partialLabel={labels.partial} recommendationList={labels.recommendationList} recommendationCard={props.props.recommendationCard} />)
    })()

    const sendOrStop = props.state === "streaming"
        ? <Button props={{ label: labels.stop, variant: "secondary", size: "sm" }} on={{ press: props.on?.stop }} />
        : stateNeedsRetry(props.state)
            ? <Button props={{ label: labels.retry, variant: "primary", size: "sm" }} on={{ press: props.on?.retry }} />
            : <Button props={{ label: labels.send, variant: "primary", size: "sm", icon: "send", disabled: disablesComposer || props.props.draft.trim() === "" }} on={{ press: props.on?.send }} />

    return <div className={aiChatClassNames.root} data-starci-ai-chat>
        <header className={aiChatClassNames.intro}><span className={aiChatClassNames.introAvatar}><StarCiAiTeacher props={{ size: "md", isOnline: true }} /></span><div className={aiChatClassNames.introCopy}><Text props={{ content: labels.eyebrow, size: "sm", weight: "semibold" }} /><Text props={{ content: labels.subtitle, size: "xs", tone: "muted" }} /></div></header>
        <nav className={aiChatClassNames.modes} aria-label={labels.eyebrow}><Button props={{ label: labels.generalMode, variant: props.props.mode === "general" ? "primary" : "ghost", size: "sm" }} on={{ press: () => props.on?.selectMode?.("general") }} /><Button props={{ label: labels.historyMode, variant: props.props.mode === "history" ? "primary" : "ghost", size: "sm" }} on={{ press: () => props.on?.selectMode?.("history") }} /></nav>
        {contextNode}
        <div className={aiChatClassNames.transcriptViewport}><ScrollViewport boundary="ai-transcript"><div className={aiChatClassNames.transcript} role="log" aria-live="polite">{transcript}</div></ScrollViewport></div>
        {showsSessionActions ? <div className={aiChatClassNames.historyActions}>{props.state === "deleteConfirm" ? <><Button props={{ label: labels.confirmDelete, variant: "primary", size: "sm" }} on={{ press: props.on?.confirmDelete }} /><Button props={{ label: labels.cancel, variant: "ghost", size: "sm" }} on={{ press: props.on?.cancelDelete }} /></> : <><Button props={{ label: labels.rename, variant: "ghost", size: "sm", isPending: props.state === "renaming" }} on={{ press: props.on?.rename }} /><Button props={{ label: labels.archive, variant: "ghost", size: "sm", isPending: props.state === "archiving" }} on={{ press: props.on?.archive }} /><Button props={{ label: labels.delete, variant: "ghost", size: "sm" }} on={{ press: props.on?.delete }} /></>}</div> : null}
        {showsComposer ? <div className={aiChatClassNames.composer}>
            {selection === undefined ? null : <CodeBlock props={{ code: selection.quote, language: selection.kind === "code" ? selection.path?.split(".").pop() : undefined }} />}
            <div className={aiChatClassNames.composerRow}><textarea key={props.props.draftKey} rows={2} aria-label={labels.composer} placeholder={labels.placeholder} defaultValue={props.props.draft} disabled={disablesComposer} className={aiChatClassNames.textarea} onChange={(event) => props.on?.changeDraft?.(event.target.value)} />{sendOrStop}</div>
            <div className={aiChatClassNames.quota}>{props.state === "quotaPending" || props.props.quotaLabel !== undefined ? <Text props={{ content: props.props.quotaLabel, size: "xs", tone: "muted", live: "polite" }} isLoading={props.state === "quotaPending"} /> : null}</div>
        </div> : null}
    </div>
}

/** Canonical state inventory shared by connected owners and presentation tests. */
export const STARCI_AI_CHAT_STATES: ReadonlyArray<StarCiAiChatState> = [
    "sessionsPending", "sessionsFailed", "noSession", "historyPending", "historyReady", "searchEmpty",
    "historyFailed", "renaming", "archiving", "deleteConfirm", "ready", "streaming", "quotaPending",
    "zeroPaidCredits", "quotaRejected", "offline", "reconnecting", "streamFailed", "aborted", "tangentReady", "contextCleared",
]
