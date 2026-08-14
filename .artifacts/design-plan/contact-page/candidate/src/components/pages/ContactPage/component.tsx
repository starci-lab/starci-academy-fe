import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror - see the note in
// `ContactChannelTile`. On materialization these specifiers become `@/`.
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "~candidate/components/contracts/props"
import {
    _ContactChannelTile,
    type ContactChannelTileData,
} from "~candidate/components/blocks/contact/ContactChannelTile/component"
import {
    _ContactMessageForm,
    type ContactMessageFormData,
    type ContactMessageFormState,
} from "~candidate/components/blocks/contact/ContactMessageForm/component"
import {
    _FounderConversationPanel,
    type FounderConversationPanelData,
    type FounderConversationPanelState,
} from "~candidate/components/blocks/contact/FounderConversationPanel/component"

/**
 * PAGE - `ContactPage`: reach the person who built StarCi.
 *
 * Target path: `src/components/pages/ContactPage/component.tsx`.
 *
 * THE SELECTED DIRECTION, `direction-one-door`. The page asks who the reader is before anything
 * else and then shows ONE writing surface: a guest gets the public form, a signed-in learner gets
 * their own founder conversation with its history. Two doors never compete for the same screen,
 * which is what the legacy two-column grid did - a tall form owning half the width for readers who
 * came to press one channel.
 *
 * WHAT THIS PAGE OWNS IS THE SESSION, AND NOTHING ELSE. PAGE-2 draws that line and this screen is
 * the clearest case of it: whether there is a session is precisely the question no block below can
 * answer for itself. Whether the form is submitting, whether the thread failed to load - those are
 * the form's and the panel's own questions, and each block keeps them. An earlier state list for
 * this case ran thirteen situations across one flat page prop, which would have made the fastest
 * region on the screen wait for the slowest.
 *
 * READING ORDER: who you are reaching, the four ways to reach them, then the one surface for
 * writing. The channels sit above the writing surface because they depend on NO request at all -
 * with every query on the page failed, a reader can still open Zalo. A page that puts its only
 * guaranteed path last has been ordered by its implementation rather than by what survives.
 */

/** The screen-level situation, which is the session and only the session. */
export type ContactPageSession = "guest" | "signed-in"

/** Every already-resolved string the page itself renders. */
export type ContactPageLabels = {
    /** Breadcrumb root crumb. */
    readonly navHome: string
    /** Breadcrumb current crumb. */
    readonly navContact: string
    /** Page title. */
    readonly title: string
    /** The invitation under the title. */
    readonly intro: string
    /** The honest condition on that invitation. */
    readonly responseTime: string
}

/** What the page draws. */
export type ContactPageData = {
    readonly labels: ContactPageLabels
    /** The ways to reach the founder, in the order they should be tried. */
    readonly channels: ReadonlyArray<ContactChannelTileData & { readonly id: string }>
    /** The guest form's own situation and content. Present only for a guest. */
    readonly form?: {
        readonly state: ContactMessageFormState
        readonly props: ContactMessageFormData
    }
    /** The conversation's own situation and content. Present only for a signed-in reader. */
    readonly conversation?: {
        readonly state: FounderConversationPanelState
        readonly props: FounderConversationPanelData
    }
}

/**
 * What the page reports.
 *
 * EVERY HANDLER IS NAMED, and there is deliberately no open index signature. The catalog page needs
 * one because it carries a handler per course row and `resume:<uuid>` cannot be spelled in advance.
 * Here the channel is DATA - four rows the connected half already holds - so one `openChannel(id)`
 * says the same thing with a type the compiler can still check. An index signature would have made
 * `send` and `retryMessage` unassignable at the same time, because a catch-all typed
 * `(...args: never[]) => void` cannot be narrowed back to a real parameter.
 */
export type ContactPageActions = {
    /** Called when the reader follows the breadcrumb home. */
    readonly goHome?: () => void
    /** Called with a channel id when the reader chooses one of the four. */
    readonly openChannel?: (id: string) => void
    /** Called with the message text when a signed-in reader sends. */
    readonly send?: (text: string) => void
    /** Called with a message id when a signed-in reader retries a failed one. */
    readonly retryMessage?: (id: string) => void
    /** Called when a signed-in reader recovers a thread that could not be read. */
    readonly recoverThread?: () => void
    /** Called when a guest submits the form. */
    readonly submit?: () => void
    /** Called with the chosen category id. */
    readonly chooseCategory?: (id: string) => void
    /** Called from the form's settled outcome. */
    readonly recoverForm?: () => void
}

/** Props for {@link _ContactPage}. */
export type ContactPageProps = {
    readonly session: ContactPageSession
    readonly props: ContactPageData
    readonly on?: ContactPageActions
}

/**
 * Draw the contact screen.
 *
 * @param input - {@link ContactPageProps}
 */
export const _ContactPage = (input: ContactPageProps) => {
    const labels = input.props.labels

    const intro = defineContractComponent("contact-intro-stack", {
        header: defineContractComponent("page-header-stack", {
            trail: defineLeafComponent("breadcrumbs", {}, () => (
                <Breadcrumbs
                    props={{
                        label: labels.title,
                        steps: [
                            { id: "home", label: labels.navHome },
                            { id: "contact", label: labels.navContact },
                        ],
                    }}
                    on={{ home: input.on?.goHome }}
                />
            )),
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: labels.title, level: 1 }} />
            )),
        }),
        promise: defineContractComponent("contact-promise-stack", {
            intro: defineLeafComponent("text", {}, () => (
                <Text props={{ content: labels.intro }} />
            )),
            responseTime: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                <Text props={{ content: labels.responseTime, size: "sm", tone: "muted" }} />
            )),
        }),
    })

    const channels = defineContractComponent("contact-channel-strip", {
        channel: input.props.channels.map((channel) => defineContractProjection("contact-channel-tile", () => (
            <_ContactChannelTile
                state="ready"
                props={channel}
                onOpen={() => input.on?.openChannel?.(channel.id)}
            />
        ))),
    })

    const conversation = input.props.conversation
    const form = input.props.form

    return (
        <Tree
            contract="contact-page"
            render={defineContractComponent("contact-page", {
                intro,
                channels,
                // Exactly one writing surface exists, and the session picks which. An absent one is
                // an ABSENT SLOT rather than a slot holding null, so the page never reserves a gap
                // for a door this reader does not have.
                ...(input.session === "signed-in" && conversation !== undefined ? {
                    conversation: defineContractProjection("founder-conversation-panel", () => (
                        <_FounderConversationPanel
                            state={conversation.state}
                            props={conversation.props}
                            on={{
                                send: input.on?.send,
                                retry: input.on?.retryMessage,
                                recover: input.on?.recoverThread,
                            }}
                        />
                    )),
                } : {}),
                ...(input.session === "guest" && form !== undefined ? {
                    form: defineContractProjection("contact-message-form", () => (
                        <_ContactMessageForm
                            state={form.state}
                            props={form.props}
                            on={{
                                submit: input.on?.submit,
                                chooseCategory: input.on?.chooseCategory,
                                recover: input.on?.recoverForm,
                            }}
                        />
                    )),
                } : {}),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "contact" } as const
