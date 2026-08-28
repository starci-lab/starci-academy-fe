import { Link as HeroLink, Spinner } from "@heroui/react"
import { useRef } from "react"
import { getTextLinkClassName } from "./classNames"

/**
 * LEAF - `TextLink`: words that change what is on screen without going anywhere.
 *
 * IT IS A BUTTON, NOT A LINK, and that is the whole reason it is a separate leaf from `Link`.
 * "Sign up instead" does not navigate - it swaps the panel under the reader - so an `<a href>`
 * would lie to a screen reader, offer a middle-click that opens nothing, and put a URL in the
 * status bar that leads somewhere it will not go.
 *
 * IT LOOKS LIKE A LINK because to the reader it is the same gesture, and it is the smallest
 * possible target for a decision that is not the surface's main action.
 */

/**
 * The reading steps ordinary body copy uses, plus the reserved caption step.
 *
 * `xs` IS NOT A THIRD SIZE TO PICK FROM. It exists for the one relationship the type scale already
 * reserves twelve pixels for: an action that belongs to a supporting caption and is read with it -
 * "why this price?" beside "you save 4,250". Set a step larger than the fact it explains, the
 * question outranks the answer, which is the rank backwards.
 */
export type TextLinkSize = "xs" | "sm" | "md"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type TextLinkData = {
    /** The already-resolved words. */
    readonly label: string
    /** The reading step, matched to the sentence this action completes. */
    readonly size?: TextLinkSize
    /** Whether this peer choice is selected. Omit outside a fixed choice set. */
    readonly isSelected?: boolean
    /** The action is already running; retain its words, add progress, and refuse another press. */
    readonly isPending?: boolean
    /** The action is unavailable because another owner is currently running. */
    readonly disabled?: boolean
}

/** What pressing it does. */
export type TextLinkActions = {
    /** Called on press. */
    readonly press?: () => void
}

/** Props for {@link TextLink}. Three fixed slots, no fourth. */
export type TextLinkProps = { readonly props: TextLinkData; readonly on?: TextLinkActions; readonly isLoading?: boolean }

/** HeroUI Link owns interaction styling; this leaf adds only the house reading step. */

/**
 * Draw a word that acts.
 *
 * @param input - {@link TextLinkProps}
 */
export const TextLink = (props: TextLinkProps) => {
    const data = props.props
    const on = props.on
    const isPending = data.isPending === true
    const isDisabled = data.disabled === true || isPending
    // React Aria can still finish a press sequence that began before the parent rendered pending.
    // A live ref makes that stale gesture consult the CURRENT state instead of the old closure.
    const disabledRef = useRef(isDisabled)
    // `isPending` arrives from the owner on the next render. Two browser presses can finish before
    // that commit, so the leaf also owns a short synchronous lock at the interaction boundary.
    // This is not another loading state: the owner still renders pending and decides when the
    // request settles. It only prevents the same text action from dispatching twice in one gesture.
    const pressLockRef = useRef(false)
    disabledRef.current = isDisabled
    const press = () => {
        if (disabledRef.current || pressLockRef.current) return
        pressLockRef.current = true
        on?.press?.()
        window.setTimeout(() => {
            pressLockRef.current = false
        }, 300)
    }
    return (
        <HeroLink
            data-size={data.size ?? "md"}
            data-selected={data.isSelected}
            data-action-pending={isPending ? "true" : "false"}
            aria-current={data.isSelected === true ? "true" : undefined}
            isDisabled={isDisabled}
            onPress={on?.press === undefined ? undefined : press}
            className={getTextLinkClassName(data.size ?? "md", data.isSelected)}
        >
            {isPending ? <Spinner size="sm" color="current" aria-hidden="true" /> : null}
            <span>{data.label}</span>
        </HeroLink>
    )
}
