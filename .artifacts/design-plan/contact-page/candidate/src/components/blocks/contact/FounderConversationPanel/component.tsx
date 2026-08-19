import { Avatar } from "@/components/leaves/Avatar"
import { Button } from "@/components/leaves/Button"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror - see the note in
// `ContactChannelTile`. On materialization these specifiers become `@/`.
import { SurfaceFormCard } from "~candidate/components/branches/SurfaceFormCard"
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
} from "~candidate/components/contracts/props"
import { MessageBubble, type MessageStatus } from "~candidate/components/leaves/MessageBubble"
import { Textarea } from "~candidate/components/leaves/Textarea"

/**
 * BLOCK - `FounderConversationPanel`: the door for a reader who is signed in.
 *
 * Target path: `src/components/blocks/contact/FounderConversationPanel/component.tsx`.
 *
 * IT IS NOT A NEW IDEA, WHICH IS WHY IT IS HERE. The server already describes
 * `myFounderConversation` as the viewer's PRIVATE FOUNDER DM conversation, and already carries
 * `chatMessages` and `sendChatMessage` beside it. This block draws a capability that exists rather
 * than proposing one, and the design record's backend-enabler list is empty because of that.
 *
 * WHY A LEARNER GETS THIS AND A GUEST GETS THE FORM. The form asks for a name and an email because
 * there is no session to answer through. Asking a learner who is already signed in to retype both
 * is asking them to introduce themselves to a product that knows them - and the reply would land
 * in a mailbox rather than in a thread they can come back to.
 *
 * THE COMPOSER NEVER MOVES. It sits below the thread and outside it, so a message arriving while
 * somebody is mid-sentence changes what is above the box and never the position of the box.
 *
 * `sending` KEEPS THE MESSAGE VISIBLE. The just-typed message is drawn in the thread at reduced
 * weight rather than held back until the server confirms it, because a message that vanishes on
 * send reads as a message that was lost. `send-failed` is the same message marked, with the retry
 * inside its own bubble beside the words it would resend.
 */

/** The situations this panel can be in. */
export type FounderConversationPanelState =
    | "resting"
    | "empty"
    | "ready"
    | "sending"
    | "send-failed"
    | "thread-failed"

/** One message, as the panel draws it. */
export type ConversationMessage = {
    /** Stable identity, for the React key and for a retry to name its own message. */
    readonly id: string
    /** The message itself. */
    readonly content: string
    /** Whose it is. */
    readonly author: "viewer" | "other"
    /** The already-formatted time. */
    readonly timeLabel: string
    /** Where it has got to. Absent means simply sent. */
    readonly status?: MessageStatus
}

/** Every already-resolved string the panel renders. */
export type FounderConversationPanelLabels = {
    /** The founder's name. */
    readonly founderName: string
    /** What they are to the reader. */
    readonly founderRole: string
    /** The composer's prompt. */
    readonly composerPlaceholder: string
    /** The composer's accessible name. */
    readonly composerLabel: string
    /** The send control. */
    readonly send: string
    /** The send control while a message is in flight. */
    readonly sending: string
    /** Offered inside a message that did not make it. */
    readonly retry: string
}

/** What the panel draws once resolved. */
export type FounderConversationPanelData = {
    readonly labels: FounderConversationPanelLabels
    /** The founder's picture. Absent draws the leaf's own initials fallback. */
    readonly founderAvatar?: string
    /** A small line beside the identity - when they last replied, or that they are away. */
    readonly statusLabel?: string
    /** The thread, oldest first. */
    readonly messages?: ReadonlyArray<ConversationMessage>
    /** The sentence shown when the conversation has no messages, or could not be read. */
    readonly noticeMessage?: string
    /** Its supporting sentence. */
    readonly noticeDescription?: string
    /** The way out of a failed thread. */
    readonly noticeActionLabel?: string
}

/** What the panel reports. */
export type FounderConversationPanelActions = {
    /** Called with the text when the reader sends. */
    readonly send?: (text: string) => void
    /** Called when the reader retries a message that failed, named by its id. */
    readonly retry?: (id: string) => void
    /** Called from the failed-thread notice. */
    readonly recover?: () => void
}

/** Props for {@link FounderConversationPanelBase}. */
export type FounderConversationPanelProps =
    BlockProps<FounderConversationPanelState, FounderConversationPanelData> & {
        readonly on?: FounderConversationPanelActions
    }

/** The composer's box id, so its label reaches it. */
const COMPOSER_ID = "founder-composer"

/** How many bubbles rest while the thread is in flight. */
const RESTING_COUNT = 3

/**
 * Draw the conversation.
 *
 * @param input - {@link FounderConversationPanelProps}
 */
export const FounderConversationPanelBase = (input: FounderConversationPanelProps) => {
    const labels = input.props.labels
    const isResting = input.state === "resting"
    const isSending = input.state === "sending"
    const showsNotice = input.state === "empty" || input.state === "thread-failed"

    const restingMessages: ReadonlyArray<ConversationMessage> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({
            id: `resting-${index + 1}`,
            content: "",
            author: index % 2 === 0 ? "other" : "viewer",
            timeLabel: "",
        }),
    )

    const messages = isResting ? restingMessages : (input.props.messages ?? [])

    const identity = defineContractComponent("founder-identity-row", {
        avatar: defineLeafComponent("avatar", {}, () => (
            <Avatar
                props={{ name: labels.founderName, src: input.props.founderAvatar, size: "md" }}
                isLoading={isResting}
            />
        )),
        // The name is plain text rather than a link: there is no founder profile route to open,
        // and a link that navigates nowhere is a promise the page cannot keep. That is the exact
        // reason the shared entry's `name` slot admits both.
        identity: defineContractComponent("name-over-handle", {
            name: defineLeafComponent("text", { size: "sm" }, () => (
                <Text props={{ content: labels.founderName, size: "sm", weight: "semibold" }} isLoading={isResting} />
            )),
            handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: labels.founderRole, size: "xs", tone: "muted" }} isLoading={isResting} />
            )),
        }),
        // The status line is a KNOWN fact about the person, not part of the payload being fetched,
        // so it renders as itself while the thread rests rather than shimmering beside a name that
        // does not.
        ...(input.props.statusLabel === undefined ? {} : {
            status: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: input.props.statusLabel, size: "xs", tone: "muted" }} />
            )),
        }),
    })

    const thread = defineContractComponent("conversation-thread", {
        message: messages.map((message) => {
            const row = message.author === "viewer"
                ? "conversation-message-row-viewer" as const
                : "conversation-message-row-other" as const
            return defineContractProjection(row, () => (
                <Tree
                    contract={row}
                    render={defineContractComponent(row, {
                        message: defineLeafComponent("message-bubble", {}, () => (
                            <MessageBubble
                                props={{
                                    content: message.content,
                                    author: message.author,
                                    timeLabel: message.timeLabel,
                                    status: message.status,
                                    retryLabel: message.status === "failed" ? labels.retry : undefined,
                                }}
                                on={{ retry: () => input.on?.retry?.(message.id) }}
                                isLoading={isResting}
                            />
                        )),
                    })}
                />
            ))
        }),
    })

    const composer = defineContractComponent("message-composer-row", {
        input: defineLeafComponent("textarea", {}, () => (
            <Textarea
                props={{
                    id: COMPOSER_ID,
                    name: "message",
                    label: labels.composerLabel,
                    placeholder: labels.composerPlaceholder,
                    rows: 2,
                    disabled: isResting || isSending,
                }}
            />
        )),
        send: defineLeafComponent("button", {}, () => (
            <Button
                props={{
                    label: isSending ? labels.sending : labels.send,
                    variant: "primary",
                    icon: "send",
                    isPending: isSending,
                    disabled: isResting,
                }}
                on={{ press: () => input.on?.send?.("") }}
            />
        )),
    })

    return (
        // REVISION 1.1 - the conversation is bounded for the same reason the form is: a thread
        // drawn straight onto the page has no edge, and without one the composer at the bottom
        // reads as a page control rather than as this conversation's own.
        <SurfaceFormCard
            contract="founder-conversation-panel"
            render={defineContractComponent("founder-conversation-panel", {
                identity,
                // The thread and the notice are ALTERNATIVES. A conversation with no messages has
                // no thread to draw, and one that failed to load has none either - so the empty
                // slot is absent rather than holding an empty list that would still take its gap.
                ...(showsNotice ? {} : { thread }),
                ...(showsNotice ? {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: input.state === "thread-failed" ? "retry" : "community",
                                message: input.props.noticeMessage ?? "",
                                description: input.props.noticeDescription,
                                actionLabel: input.props.noticeActionLabel,
                            }}
                            on={{ act: input.on?.recover }}
                        />
                    )),
                } : {}),
                // The composer exists in EVERY state, including the failed one: a thread that could
                // not be read is not a reason to take away the ability to write, and the message
                // would otherwise have nowhere to go but the guest form this reader cannot see.
                composer,
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "contact" } as const
