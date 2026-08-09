import { useEffect, useRef, type KeyboardEvent, type SyntheticEvent } from "react"
import { Button } from "@/components/atoms/Button"
import { Heading } from "@/components/atoms/Heading"
import { Tree } from "@/components/frames/Tree"
import type { TreeSlot, TreeSlotProps } from "@/components/classNames"

/**
 * OVERLAY - `SignInOverlay`, presentational half.
 *
 * The floating surface a sign-in is summoned onto. It owns exactly one thing the flow inside
 * it must not: whether the reader is here at all, and how they get out. Escape, the close
 * control and the open flag are three ways of saying the same thing, so they all end at one
 * callback rather than at three pieces of state that can disagree.
 *
 * WHY A REAL `<dialog>`. Everything a hand-built overlay has to re-implement - the top layer,
 * the backdrop, making the rest of the page inert, sending focus in and giving it back on
 * close - the element already does, correctly, in a browser. A `<div>` with `role="dialog"`
 * would additionally be a structural node with no registry key, which is the one thing this
 * tree does not allow.
 *
 * WHY `showModal` IS FEATURE-DETECTED. The element is opened through `showModal` where it
 * exists, because only the modal path gets the backdrop and the focus trap. jsdom implements
 * `<dialog>` without that method, so the fallback sets the `open` attribute instead: the tests
 * then exercise the same component rather than a mock of it, and a browser still gets the
 * behaviour that matters.
 *
 * WHY ESCAPE IS HANDLED HERE AND THE NATIVE CANCEL IS REFUSED. A native cancel closes the
 * element behind React's back, leaving the DOM open-state and the prop disagreeing until the
 * next render. Refusing the default and dismissing through the callback keeps the flag the
 * only thing that decides whether this is on screen.
 *
 * SLOTS, NOT A BODY. What goes inside is a typed slot rather than a `ReactNode`, so the
 * overlay stays a topology and not a wrapper: a caller passes a component, and this file is
 * the one that decides where it hangs.
 */

/** Id of the title, so the dialog can be named by the heading a reader actually sees. */
const TITLE_ID = "sign-in-overlay-title"

/** Every string this overlay renders, already resolved by the connected half. */
export interface SignInOverlayLabels {
    /** The name of the surface, and the dialog's accessible name. */
    title: string
    /** The label of the control that closes it. */
    dismiss: string
}

/** What hangs inside the overlay. Typed, so the overlay owns the topology rather than a body. */
export interface SignInOverlaySlots {
    /** The sign-in flow itself, passed uncalled so the overlay can rest it with the surface. */
    body: TreeSlot
}

/** Props for {@link _SignInOverlay} - presentational; no fetch, no store, no i18n. */
export interface SignInOverlayProps {
    /** Whether the overlay is on screen. The single source of truth for the element's state. */
    isOpen: boolean
    /** Resolved copy. */
    labels: SignInOverlayLabels
    /** What hangs inside. */
    slots: SignInOverlaySlots
    /** Called for every way out - the close control, Escape, or a native cancel. */
    onDismiss: () => void
    /** Renders the surface and its body in their resting state. */
    isSkeleton?: boolean
}

/**
 * Render the sign-in overlay. See the file header for why this is a real `<dialog>`.
 *
 * @param props - {@link SignInOverlayProps}
 */
export const _SignInOverlay = ({
    isOpen,
    labels,
    slots,
    onDismiss,
    isSkeleton = false,
}: SignInOverlayProps) => {
    const dialog = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const element = dialog.current
        if (!element) return
        if (isOpen) {
            if (element.open) return
            // Modal where the platform offers it; the attribute is the honest fallback rather
            // than a re-implementation of a backdrop nobody can keep in step with the native one.
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

    /** The `heading` role of the `page-header` key. */
    const Title = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Heading level={2} isSkeleton={resting}>
            <span id={TITLE_ID}>{labels.title}</span>
        </Heading>
    )

    /** The `action` role of the `page-header` key: the way out that is visible. */
    const Dismiss = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Button variant="ghost" size="sm" isSkeleton={resting} onClick={onDismiss}>
            {labels.dismiss}
        </Button>
    )

    /** The `heading` role of the `section` key: the title line, with its close control on it. */
    const Header = ({ isSkeleton: resting }: TreeSlotProps) => (
        <Tree name="page-header" isSkeleton={resting} slots={{ heading: Title, action: Dismiss }} />
    )

    /** The `body` role of the `section` key: whatever the caller hung inside. */
    const Body = slots.body

    return (
        <dialog
            ref={dialog}
            data-tier="overlay"
            data-component="SignInOverlay"
            data-state={isOpen ? "open" : "closed"}
            aria-labelledby={TITLE_ID}
            onKeyDown={onKeyDown}
            onCancel={onCancel}
        >
            <Tree name="section" isSkeleton={isSkeleton} slots={{ heading: Header, body: Body }} />
        </dialog>
    )
}
