import { useEffect, useRef, type KeyboardEvent, type SyntheticEvent } from "react"
import type { ContractSlot } from "@/components/contracts"
import { AUTHENTICATION_PANEL_TITLE_ID } from "@/components/blocks/auth/AuthenticationPanel/component"

/**
 * OVERLAY - `SignInOverlay`, presentational half.
 *
 * The floating surface authentication is summoned onto. It owns exactly one thing the panel inside
 * it must not: whether the reader is here at all, and how they get out. Escape, the close control
 * and the open flag are three ways of saying the same thing, so they all end at one callback rather
 * than at three pieces of state that can disagree.
 *
 * WHAT IT NO LONGER DRAWS, AND WHY. It used to draw a title line of its own, which meant the
 * surface and the panel each had an opinion about what the reader was doing - and the moment the
 * panel could also open an account or reset a password, the dialog's fixed "Sign in" was simply
 * wrong two thirds of the time. The title belongs to the panel, which is the thing that knows, and
 * the dialog is NAMED BY that heading through `aria-labelledby`: one string, read by the reader and
 * announced to the one who cannot see it, rather than two that can drift apart.
 *
 * The visible close control travels the same way. It is composed onto the panel's title line by
 * the connected half rather than drawn here, because a control drawn here would either float free
 * of any row or force a second header above the panel's own - on a small floating surface, two
 * header rows is the whole of the space.
 *
 * WHY A REAL `<dialog>`. Everything a hand-built overlay has to re-implement - the top layer, the
 * backdrop, making the rest of the page inert, sending focus in and giving it back on close - the
 * element already does, correctly, in a browser. A `<div>` with `role="dialog"` would additionally
 * be a structural node with no registry key, which is the one thing this tree does not allow.
 *
 * WHY `showModal` IS FEATURE-DETECTED. The element is opened through `showModal` where it exists,
 * because only the modal path gets the backdrop and the focus trap. jsdom implements `<dialog>`
 * without that method, so the fallback sets the `open` attribute instead: the tests then exercise
 * the same component rather than a mock of it, and a browser still gets the behaviour that matters.
 *
 * WHY ESCAPE IS HANDLED HERE AND THE NATIVE CANCEL IS REFUSED. A native cancel closes the element
 * behind React's back, leaving the DOM open-state and the prop disagreeing until the next render.
 * Refusing the default and dismissing through the callback keeps the flag the only thing that
 * decides whether this is on screen.
 */

/**
 * The floating surface itself.
 *
 * These are LEAF classes, not structure: the dialog holds one component and decides nothing about
 * how its children sit. What it does decide is that a floating surface is bounded, sits on the
 * overlay token rather than on the page, and dims what is behind it - three facts about being
 * floating, which is exactly what this element is.
 *
 * The measure is `max-w-md` because the form inside is `max-w-sm`: the dialog is one padding step
 * wider than the widest thing in it, so the form never touches the edge. The radius pairs with that
 * padding - `rounded-2xl` outside, and the smaller steps inside it.
 */
const DIALOG_CLASSES = [
    "w-full max-w-md rounded-2xl border bg-overlay p-6 text-foreground shadow-overlay",
    "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
].join(" ")

/**
 * Every string the FLOATING composition renders that the panel does not.
 *
 * There is one, and it is resolved by the connected half rather than passed through here: the
 * close control is composed onto the panel's title line, so the copy travels with the control
 * instead of arriving at a surface that no longer draws it.
 */
export interface SignInOverlayLabels {
    /** The label of the control that closes the overlay. */
    dismiss: string
}

/** What hangs inside the overlay. Typed, so the overlay owns the topology rather than a body. */
export interface SignInOverlaySlots {
    /** The authentication panel, passed uncalled so the overlay can rest it with the surface. */
    body: ContractSlot
}

/** Props for {@link _SignInOverlay} - presentational; no fetch, no store, no i18n. */
export interface SignInOverlayProps {
    /** Whether the overlay is on screen. The single source of truth for the element's state. */
    isOpen: boolean
    /** What hangs inside. */
    slots: SignInOverlaySlots
    /** Called for every way out - the close control, Escape, or a native cancel. */
    onDismiss: () => void
    /** Renders the surface and its body in their resting state. */
    isLoading?: boolean
}

/**
 * Render the sign-in overlay. See the file header for why this is a real `<dialog>`.
 *
 * @param props - {@link SignInOverlayProps}
 */
export const _SignInOverlay = ({
    isOpen,
    slots,
    onDismiss,
    isLoading = false,
}: SignInOverlayProps) => {
    const dialog = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const element = dialog.current
        if (!element) return
        if (isOpen) {
            if (element.open) return
            // Modal where the platform offers it; the attribute is the honest fallback rather than
            // a re-implementation of a backdrop nobody can keep in step with the native one.
            if (typeof element.showModal === "function") {
                element.showModal()
                return
            }
            element.setAttribute("open", "")
            return
        }
        if (!element.open) return
        if (typeof element.close === "function") {
            element.close()
            return
        }
        element.removeAttribute("open")
    }, [isOpen])

    /** Escape means the same thing as pressing close, so it ends in the same place. */
    const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
        if (event.key !== "Escape") return
        event.preventDefault()
        onDismiss()
    }

    /** Refuse the native close so the open flag stays the only thing that decides. */
    const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
        event.preventDefault()
    }

    /** Whatever the caller hung inside - in practice, the authentication panel. */
    const Body = slots.body

    return (
        <dialog
            ref={dialog}
            data-tier="overlay"
            data-component="SignInOverlay"
            data-state={isOpen ? "open" : "closed"}
            aria-labelledby={AUTHENTICATION_PANEL_TITLE_ID}
            className={DIALOG_CLASSES}
            onKeyDown={onKeyDown}
            onCancel={onCancel}
        >
            <Body isLoading={isLoading} />
        </dialog>
    )
}
