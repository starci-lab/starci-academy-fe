import { Tree } from "@/components/branches/Tree"
import { Article } from "@/components/leaves/Article"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"
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
export type StarCiAiMode = "general" | "code" | "history"

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
    readonly codeMode: string
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
export const _StarCiAiChat = (input: StarCiAiChatProps) => {
    const labels = input.props.labels
    const isHistory = input.props.mode === "history" || HISTORY_STATES.has(input.state)
    const isLoading = input.state === "sessionsPending" || input.state === "historyPending"
    const stateTurn: StarCiAiTurn | undefined = ["ready", "historyReady", "streaming"].includes(input.state)
        ? undefined
        : { id: `state-${input.state}`, role: "assistant", body: labels.states[input.state] }
    const renderedTurns = stateTurn === undefined ? input.props.turns : [...input.props.turns, stateTurn]
    const disablesComposer = input.state === "offline" || input.state === "reconnecting"
    const showsComposer = !isHistory && input.state !== "sessionsPending" && input.state !== "sessionsFailed"
    const showsSessionActions = isHistory && input.props.activeSessionId !== undefined

    return (
        <>
            <Tree
                contract="starci-ai-drawer-column"
                render={defineContractComponent("starci-ai-drawer-column", {
                    mode: defineContractComponent("starci-ai-mode-row", {
                        mode: [
                            defineLeafComponent("button", {}, () => (
                                <Button
                                    props={{ label: labels.generalMode, variant: input.props.mode === "general" ? "primary" : "ghost", size: "sm" }}
                                    on={{ press: () => input.on?.selectMode?.("general") }}
                                />
                            )),
                            defineLeafComponent("button", {}, () => (
                                <Button
                                    props={{ label: labels.codeMode, variant: input.props.mode === "code" ? "primary" : "ghost", size: "sm" }}
                                    on={{ press: () => input.on?.selectMode?.("code") }}
                                />
                            )),
                            defineLeafComponent("button", {}, () => (
                                <Button
                                    props={{ label: labels.historyMode, variant: input.props.mode === "history" ? "primary" : "ghost", size: "sm" }}
                                    on={{ press: () => input.on?.selectMode?.("history") }}
                                />
                            )),
                        ],
                    }),
                    context: isHistory || input.props.contextSummary === undefined
                        ? undefined
                        : defineContractComponent("starci-ai-context-stack", {
                            context: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text props={{ content: input.props.contextSummary, size: "xs" }} />
                            )),
                            clear: input.props.selection === undefined
                                ? undefined
                                : defineLeafComponent("button", {}, () => (
                                    <Button
                                        props={{ label: labels.clearContext, variant: "ghost", size: "sm" }}
                                        on={{ press: input.on?.clearContext }}
                                    />
                                )),
                        }),
                    chat: defineContractComponent("starci-ai-turn-list", {
                        turn: isHistory && input.props.sessions.length > 0
                            ? input.props.sessions.map((session) => defineLeafComponent("button", {}, () => (
                                <Button
                                    key={session.id}
                                    props={{
                                        label: `${session.title} · ${session.updatedLabel}`,
                                        variant: session.id === input.props.activeSessionId ? "secondary" : "ghost",
                                    }}
                                    on={{ press: () => input.on?.selectSession?.(session.id) }}
                                />
                            )))
                            : renderedTurns.length === 0 && isLoading
                                ? Array.from({ length: 4 }, (_unused, index) => defineLeafComponent("article", {}, () => (
                                    <Article key={`pending-${index}`} props={{}} isLoading />
                                )))
                                : renderedTurns.map((turn) => defineLeafComponent("article", {}, () => (
                                    <Article
                                        key={turn.id}
                                        props={{ body: turnMarkdown(turn, labels.partial) }}
                                    />
                                ))),
                    }),
                })}
            />
            {showsSessionActions ? (
                <Tree
                    contract="stacked-peer-controls"
                    render={defineContractComponent("stacked-peer-controls", {
                        control: input.state === "deleteConfirm"
                            ? [
                                defineLeafComponent("button", {}, () => (
                                    <Button props={{ label: labels.confirmDelete, variant: "primary" }} on={{ press: input.on?.confirmDelete }} />
                                )),
                                defineLeafComponent("button", {}, () => (
                                    <Button props={{ label: labels.cancel, variant: "ghost" }} on={{ press: input.on?.cancelDelete }} />
                                )),
                            ]
                            : [
                                defineLeafComponent("button", {}, () => (
                                    <Button props={{ label: labels.rename, variant: "ghost", isPending: input.state === "renaming" }} on={{ press: input.on?.rename }} />
                                )),
                                defineLeafComponent("button", {}, () => (
                                    <Button props={{ label: labels.archive, variant: "ghost", isPending: input.state === "archiving" }} on={{ press: input.on?.archive }} />
                                )),
                                defineLeafComponent("button", {}, () => (
                                    <Button props={{ label: labels.delete, variant: "ghost" }} on={{ press: input.on?.delete }} />
                                )),
                            ],
                    })}
                />
            ) : null}
            {showsComposer ? (
                <Tree
                    contract="starci-ai-composer"
                    render={defineContractComponent("starci-ai-composer", {
                        selection: input.props.selection === undefined
                            ? undefined
                            : defineLeafComponent("code-block", {}, () => (
                                <CodeBlock
                                    props={{
                                        code: input.props.selection?.quote ?? "",
                                        language: input.props.selection?.kind === "code"
                                            ? input.props.selection.path?.split(".").pop()
                                            : undefined,
                                    }}
                                />
                            )),
                        input: defineLeafComponent("textarea", {}, () => (
                            <textarea
                                key={input.props.draftKey}
                                aria-label={labels.composer}
                                placeholder={labels.placeholder}
                                defaultValue={input.props.draft}
                                disabled={disablesComposer}
                                onChange={(event) => input.on?.changeDraft?.(event.target.value)}
                            />
                        )),
                        sendOrStop: defineLeafComponent("button", {}, () => (
                            input.state === "streaming"
                                ? <Button props={{ label: labels.stop, variant: "primary" }} on={{ press: input.on?.stop }} />
                                : stateNeedsRetry(input.state)
                                    ? <Button props={{ label: labels.retry, variant: "primary" }} on={{ press: input.on?.retry }} />
                                    : <Button
                                        props={{
                                            label: labels.send,
                                            variant: "primary",
                                            icon: "send",
                                            disabled: disablesComposer || input.props.draft.trim() === "",
                                        }}
                                        on={{ press: input.on?.send }}
                                    />
                        )),
                        quota: input.state === "quotaPending" || input.props.quotaLabel !== undefined
                            ? defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text
                                    props={{ content: input.props.quotaLabel, size: "xs", live: "polite" }}
                                    isLoading={input.state === "quotaPending"}
                                />
                            ))
                            : undefined,
                    })}
                />
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

/** Source-level ownership marker. */
export const meta = { shape: "block", world: "pure", domain: "ai" } as const
