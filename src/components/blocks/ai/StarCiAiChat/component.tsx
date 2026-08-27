import { Article } from "@/components/branches/Article"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Text } from "@/components/leaves/Text"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"

/** Every settled state owned by sessions, history, mutations, realtime and quota. */
export type StarCiAiChatState =
    | "sessionsPending"
    | "sessionsFailed"
    | "noSession"
    | "historyPending"
    | "historyReady"
    | "searchEmpty"
    | "historyFailed"
    | "renaming"
    | "archiving"
    | "deleteConfirm"
    | "ready"
    | "streaming"
    | "quotaPending"
    | "zeroPaidCredits"
    | "quotaRejected"
    | "offline"
    | "reconnecting"
    | "streamFailed"
    | "aborted"
    | "tangentReady"
    | "contextCleared"

/** The drawer body selected by its one finite disclosure row. */
export type StarCiAiMode = "general" | "history"

/** One render-ready learner or assistant entry in the ordered transcript. */
export type StarCiAiTurn = {
    readonly id: string
    readonly role: "user" | "assistant"
    readonly body: string
    readonly quote?: string
    readonly quoteLanguage?: string
    readonly isPartial?: boolean
}

/** One selectable persisted conversation summary in History mode. */
export type StarCiAiSession = {
    readonly id: string
    readonly title: string
    readonly updatedLabel: string
    readonly isArchived?: boolean
}

/** Resolved locale copy consumed by the pure drawer body. */
export type StarCiAiChatLabels = {
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

/** Closed render data for all chat, history, credit and context states. */
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
}

/** User intents emitted by the pure drawer body. */
export type StarCiAiChatActions = {
    readonly selectMode?: (mode: StarCiAiMode) => void
    readonly selectSession?: (id: string) => void
    readonly rename?: () => void
    readonly archive?: () => void
    readonly delete?: () => void
    readonly confirmDelete?: () => void
    readonly cancelDelete?: () => void
    readonly changeDraft?: (draft: string) => void
    readonly send?: () => void
    readonly stop?: () => void
    readonly retry?: () => void
    readonly clearContext?: () => void
}

/** Pure chat input with state, resolved data and optional intents kept apart. */
export type StarCiAiChatProps = {
    readonly state: StarCiAiChatState
    readonly props: StarCiAiChatData
    readonly on?: StarCiAiChatActions
}

const HISTORY_STATES = new Set<StarCiAiChatState>([
    "historyPending",
    "historyReady",
    "searchEmpty",
    "historyFailed",
    "renaming",
    "archiving",
    "deleteConfirm",
])
const PENDING_TURN_IDS = ["pending-1", "pending-2", "pending-3", "pending-4"] as const

const stateNeedsRetry = (state: StarCiAiChatState): boolean =>
    state === "sessionsFailed" || state === "historyFailed" || state === "streamFailed" || state === "quotaRejected"

const turnMarkdown = (turn: StarCiAiTurn, partialLabel: string): string => {
    const quote = turn.quote === undefined
        ? ""
        : `\n\n\`\`\`${turn.quoteLanguage ?? "code"}\n${turn.quote}\n\`\`\``
    const partial = turn.isPartial === true ? `\n\n_${partialLabel}_` : ""
    return `${turn.body}${quote}${partial}`
}

/** Draw every AI-owner state from resolved fixture data; no transport or translation lives here. */
export const StarCiAiChatBase = (props: StarCiAiChatProps) => {
    const labels = props.props.labels
    const selection = props.props.selection
    const isHistory = props.props.mode === "history" || HISTORY_STATES.has(props.state)
    const isLoading = props.state === "sessionsPending" || props.state === "historyPending"
    const stateTurn: StarCiAiTurn | undefined = ["ready", "historyReady", "streaming"].includes(props.state)
        ? undefined
        : { id: `state-${props.state}`, role: "assistant", body: labels.states[props.state] }
    const renderedTurns = stateTurn === undefined ? props.props.turns : [...props.props.turns, stateTurn]
    const disablesComposer = props.state === "offline" || props.state === "reconnecting"
    const showsComposer = !isHistory && props.state !== "sessionsPending" && props.state !== "sessionsFailed"
    const showsSessionActions = isHistory && props.props.activeSessionId !== undefined
    const contextNode = (() => {
        if (isHistory || props.props.contextSummary === undefined) return undefined
        const clear = selection === undefined ? null : (
            <Button
                props={{ label: labels.clearContext, variant: "ghost", size: "sm" }}
                on={{ press: props.on?.clearContext }}
            />
        )
        return <div><Text props={{ content: props.props.contextSummary, size: "xs" }} />{clear}</div>
    })()
    const turnNodes = (() => {
        if (isHistory && props.props.sessions.length > 0) {
            return props.props.sessions.map((session) => (
                <Button
                    key={session.id}
                    props={{
                        label: `${session.title} · ${session.updatedLabel}`,
                        variant: session.id === props.props.activeSessionId ? "secondary" : "ghost",
                    }}
                    on={{ press: () => props.on?.selectSession?.(session.id) }}
                />
            ))
        }
        if (renderedTurns.length === 0 && isLoading) {
            return PENDING_TURN_IDS.map((id) => <Article key={id} props={{}} isLoading />)
        }
        return renderedTurns.map((turn) => <Article key={turn.id} props={{ body: turnMarkdown(turn, labels.partial) }} />)
    })()
    const sendOrStop = (() => {
        if (props.state === "streaming") return <Button props={{ label: labels.stop, variant: "primary" }} on={{ press: props.on?.stop }} />
        if (stateNeedsRetry(props.state)) return <Button props={{ label: labels.retry, variant: "primary" }} on={{ press: props.on?.retry }} />
        return <Button
            props={{
                label: labels.send,
                variant: "primary",
                icon: "send",
                disabled: disablesComposer || props.props.draft.trim() === "",
            }}
            on={{ press: props.on?.send }}
        />
    })()

    return (
        <>
            <div>
                <div>
                    <Button
                        props={{ label: labels.generalMode, variant: props.props.mode === "general" ? "primary" : "ghost", size: "sm" }}
                        on={{ press: () => props.on?.selectMode?.("general") }}
                    />
                    <Button
                        props={{ label: labels.historyMode, variant: props.props.mode === "history" ? "primary" : "ghost", size: "sm" }}
                        on={{ press: () => props.on?.selectMode?.("history") }}
                    />
                </div>
                {contextNode}
                <div>{turnNodes}</div>
            </div>
            {showsSessionActions ? (
                <div>
                    {props.state === "deleteConfirm" ? <>
                        <Button props={{ label: labels.confirmDelete, variant: "primary" }} on={{ press: props.on?.confirmDelete }} />
                        <Button props={{ label: labels.cancel, variant: "ghost" }} on={{ press: props.on?.cancelDelete }} />
                    </> : <>
                        <Button props={{ label: labels.rename, variant: "ghost", isPending: props.state === "renaming" }} on={{ press: props.on?.rename }} />
                        <Button props={{ label: labels.archive, variant: "ghost", isPending: props.state === "archiving" }} on={{ press: props.on?.archive }} />
                        <Button props={{ label: labels.delete, variant: "ghost" }} on={{ press: props.on?.delete }} />
                    </>}
                </div>
            ) : null}
            {showsComposer ? (
                <div>
                    {selection === undefined ? null : (
                        <CodeBlock
                            props={{
                                code: selection.quote,
                                language: selection.kind === "code"
                                    ? selection.path?.split(".").pop()
                                    : undefined,
                            }}
                        />
                    )}
                    <textarea
                        key={props.props.draftKey}
                        aria-label={labels.composer}
                        placeholder={labels.placeholder}
                        defaultValue={props.props.draft}
                        disabled={disablesComposer}
                        onChange={(event) => props.on?.changeDraft?.(event.target.value)}
                    />
                    {sendOrStop}
                    {props.state === "quotaPending" || props.props.quotaLabel !== undefined ? (
                        <Text
                            props={{ content: props.props.quotaLabel, size: "xs", live: "polite" }}
                            isLoading={props.state === "quotaPending"}
                        />
                    ) : null}
                </div>
            ) : null}
        </>
    )
}

/** Exhaustive fixture source for every state owned by the connected chat. */
export const STARCI_AI_CHAT_STATES: ReadonlyArray<StarCiAiChatState> = [
    "sessionsPending", "sessionsFailed", "noSession", "historyPending", "historyReady", "searchEmpty",
    "historyFailed", "renaming", "archiving", "deleteConfirm", "ready", "streaming", "quotaPending",
    "zeroPaidCredits", "quotaRejected", "offline", "reconnecting", "streamFailed", "aborted",
    "tangentReady", "contextCleared",
]
