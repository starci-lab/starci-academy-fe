import { Button } from "@/components/leaves/Button"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Input } from "@/components/leaves/Input"
import { Label } from "@/components/leaves/Label"
import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror - see the note in
// `ContactChannelTile`. On materialization these specifiers become `@/`.
import { SurfaceFormCard } from "~candidate/components/branches/SurfaceFormCard"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "~candidate/components/contracts/props"
import { Select, type SelectOption } from "~candidate/components/leaves/Select"
import { Textarea } from "~candidate/components/leaves/Textarea"

/**
 * BLOCK - `ContactMessageForm`: the door for a reader who has no account.
 *
 * Target path: `src/components/blocks/contact/ContactMessageForm/component.tsx`.
 *
 * IT EXISTS BECAUSE THE OTHER DOOR CANNOT SERVE EVERYONE. `myFounderConversation` is described by
 * the server as the VIEWER's private conversation, so it needs a token; `/contact` is a public
 * route and the person most likely to need it is the one who has not signed up yet. The two doors
 * are therefore not alternatives to choose between but two readers to serve, and this is the one
 * carrying its own `email` field precisely because there is no session to reply through.
 *
 * SUBMITTED IS A STATE, NOT A BANNER. The controls are gone once the message is sent, because a
 * form still standing under a thank-you invites a second identical send while the first is being
 * read. `failed` is the opposite: the controls STAY, filled, because the paragraph the reader wrote
 * is the one thing a retry must not cost them - so its notice sits ABOVE the form rather than
 * instead of it.
 *
 * FOUR FIELDS, AND THE ORDER IS THE ARGUMENT. Who you are, where to answer you, what this is about,
 * then what you want to say - the long box last, so nothing follows the field a reader dwells in.
 *
 * A REFUSAL IS THE HINT, ANNOUNCED. That is not a colour decision made here; it is what the shipped
 * `Field` composite already does - the box is marked `isInvalid`, the sentence under it is the same
 * hint slot, and `live: "assertive"` is what makes a screen reader say it. This block writes each
 * field out rather than reaching for `Field` because two of the four are a select and a textarea,
 * which that composite does not carry.
 */

/** The situations this form can be in. */
export type ContactMessageFormState =
    | "ready"
    | "invalid"
    | "submitting"
    | "submitted"
    | "failed"

/** Every already-resolved string the form renders. */
export type ContactMessageFormLabels = {
    /** Name field label. */
    readonly name: string
    /** Name field example. */
    readonly namePlaceholder: string
    /** Email field label. */
    readonly email: string
    /** Email field example. */
    readonly emailPlaceholder: string
    /** Category field label. */
    readonly category: string
    /** Message field label. */
    readonly message: string
    /** Message field example. */
    readonly messagePlaceholder: string
    /** Submit control, at rest. */
    readonly submit: string
    /** Submit control, while the request is in flight. */
    readonly submitting: string
}

/** What the form draws once resolved. */
export type ContactMessageFormData = {
    readonly labels: ContactMessageFormLabels
    /** The reasons a reader may pick, already worded and in reading order. */
    readonly categories?: ReadonlyArray<SelectOption>
    /** Which reason is chosen. */
    readonly selectedCategory?: string
    /** Refusals, keyed by the field they belong under. Present only in `invalid`. */
    readonly refusals?: {
        readonly name?: string
        readonly email?: string
        readonly message?: string
    }
    /** The headline of a settled outcome - the thank-you, or the failure. */
    readonly outcomeMessage?: string
    /** Its supporting sentence. */
    readonly outcomeDescription?: string
    /** The way out of a settled outcome - send another, or try the failed one again. */
    readonly outcomeActionLabel?: string
}

/** What the form reports. */
export type ContactMessageFormActions = {
    /** Called when the reader submits. */
    readonly submit?: () => void
    /** Called with the chosen category id. */
    readonly chooseCategory?: (id: string) => void
    /** Called from a settled outcome - send another message, or retry the failed one. */
    readonly recover?: () => void
}

/** Props for {@link _ContactMessageForm}. */
export type ContactMessageFormProps =
    BlockProps<ContactMessageFormState, ContactMessageFormData> & {
        readonly on?: ContactMessageFormActions
    }

/** Field ids, so every label reaches the box it names and every refusal reaches its box. */
const FIELD_IDS = {
    name: "contact-name",
    email: "contact-email",
    category: "contact-category",
    message: "contact-message",
} as const

/**
 * Draw the form.
 *
 * @param input - {@link ContactMessageFormProps}
 */
export const _ContactMessageForm = (input: ContactMessageFormProps) => {
    const labels = input.props.labels
    const refusals = input.props.refusals
    const isBusy = input.state === "submitting"
    const isSubmitted = input.state === "submitted"

    /** One field, written the way the shipped `Field` composite writes one. */
    const refusalHint = (id: string, refusal: string | undefined) =>
        refusal === undefined ? {} : {
            hint: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ id: `${id}-hint`, content: refusal, size: "xs", live: "assertive" }} />
            )),
        }

    const notice = input.props.outcomeMessage === undefined ? {} : {
        notice: defineCompositeComponent("empty-notice", {}, () => (
            <EmptyNotice
                props={{
                    icon: isSubmitted ? "complete" : "retry",
                    message: input.props.outcomeMessage ?? "",
                    description: input.props.outcomeDescription,
                    // The way out is the submit slot below, so the notice does not offer a second
                    // one: two controls saying "try again" is a reader choosing between identical
                    // doors.
                }}
            />
        )),
    }

    return (
        // REVISION 1.1 - THE FORM SITS ON A SURFACE. In 1.0 it rendered through a bare `Tree`, so
        // four controls floated directly on the page background with nothing bounding them; the
        // legacy page put the same form in a card and it was right to. `SurfaceFormCard` is the
        // branch that already owns exactly this - a bounded form surface that adds no title and no
        // second layout node - so nothing here writes a class to get it.
        <SurfaceFormCard
            contract="contact-message-form"
            render={defineContractComponent("contact-message-form", {
                ...notice,
                // A sent message leaves nothing to fill in. The run becomes empty rather than the
                // fields being hidden by something drawn over them.
                field: isSubmitted ? [] : [
                    defineContractComponent("label-field-hint", {
                        label: defineLeafComponent("label", {}, () => (
                            <Label props={{ htmlFor: FIELD_IDS.name, content: labels.name }} />
                        )),
                        field: defineLeafComponent("input", {}, () => (
                            <Input
                                props={{
                                    id: FIELD_IDS.name,
                                    name: "name",
                                    kind: "text",
                                    placeholder: labels.namePlaceholder,
                                    disabled: isBusy,
                                    isInvalid: refusals?.name !== undefined,
                                    describedBy: refusals?.name === undefined ? undefined : `${FIELD_IDS.name}-hint`,
                                }}
                            />
                        )),
                        ...refusalHint(FIELD_IDS.name, refusals?.name),
                    }),
                    defineContractComponent("label-field-hint", {
                        label: defineLeafComponent("label", {}, () => (
                            <Label props={{ htmlFor: FIELD_IDS.email, content: labels.email }} />
                        )),
                        field: defineLeafComponent("input", {}, () => (
                            <Input
                                props={{
                                    id: FIELD_IDS.email,
                                    name: "email",
                                    kind: "email",
                                    placeholder: labels.emailPlaceholder,
                                    disabled: isBusy,
                                    isInvalid: refusals?.email !== undefined,
                                    describedBy: refusals?.email === undefined ? undefined : `${FIELD_IDS.email}-hint`,
                                }}
                            />
                        )),
                        ...refusalHint(FIELD_IDS.email, refusals?.email),
                    }),
                    defineContractComponent("label-field-hint", {
                        label: defineLeafComponent("label", {}, () => (
                            <Label props={{ htmlFor: FIELD_IDS.category, content: labels.category }} />
                        )),
                        field: defineLeafComponent("select", {}, () => (
                            <Select
                                props={{
                                    id: FIELD_IDS.category,
                                    name: "category",
                                    label: labels.category,
                                    options: input.props.categories ?? [],
                                    selectedKey: input.props.selectedCategory,
                                    disabled: isBusy,
                                }}
                                on={{ select: input.on?.chooseCategory }}
                            />
                        )),
                    }),
                    defineContractComponent("label-field-hint", {
                        label: defineLeafComponent("label", {}, () => (
                            <Label props={{ htmlFor: FIELD_IDS.message, content: labels.message }} />
                        )),
                        field: defineLeafComponent("textarea", {}, () => (
                            <Textarea
                                props={{
                                    id: FIELD_IDS.message,
                                    name: "message",
                                    label: labels.message,
                                    placeholder: labels.messagePlaceholder,
                                    rows: 5,
                                    disabled: isBusy,
                                    isInvalid: refusals?.message !== undefined,
                                }}
                            />
                        )),
                        ...refusalHint(FIELD_IDS.message, refusals?.message),
                    }),
                ],
                submit: defineLeafComponent("button", {}, () => (
                    <Button
                        props={{
                            label: isSubmitted
                                ? (input.props.outcomeActionLabel ?? "")
                                : isBusy ? labels.submitting : labels.submit,
                            variant: isSubmitted ? "secondary" : "primary",
                            // `isPending` is the ACTION being in flight; `isLoading` is the shared
                            // data-loading slot and would draw a skeleton where a working button
                            // belongs. The leaf's own comment draws that line, and this is the
                            // side of it a submit is on.
                            isPending: isBusy,
                        }}
                        on={{ press: isSubmitted ? input.on?.recover : input.on?.submit }}
                    />
                )),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "contact" } as const
