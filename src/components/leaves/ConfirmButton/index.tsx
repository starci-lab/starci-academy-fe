"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/leaves/Button"

/**
 * LEAF - `ConfirmButton`: a destructive act that will not fire on one stray press.
 *
 * Target path: `src/components/leaves/ConfirmButton/index.tsx`.
 *
 * THE MECHANIC IS THE REFERENCE'S, not an invention. The legacy cart clears the basket behind an
 * inline two-step confirm - the first press arms a warning label, the window closes by itself
 * after a few seconds, and only a second press inside that window acts - and the comment beside it
 * records the rule it is obeying: a destructive action needs confirmation. That was read rather
 * than guessed at, which is why this is not a modal: the reference deliberately did not open one
 * for an act that is undone by re-adding a few courses, and a covering surface for it would be a
 * heavier apology than the act deserves.
 *
 * IT IS A SEPARATE LEAF FROM `Button` because the two differ in what a press MEANS. A button acts
 * once; this one asks first. Folding the arming into `Button` behind a flag would put a
 * confirmation step one prop away from every control in the product, and the control that most
 * needs to stay single-press is the one nobody would think to check.
 *
 * IT DISARMS ITSELF. A control left armed becomes a control that acts on the next press minutes
 * later, when the reader has forgotten it is armed - which is the accident this exists to stop,
 * arriving by a slower route.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ConfirmButtonData = {
    /** The resting label, already resolved. */
    readonly label: string
    /** The armed label - what a second press will do - already resolved. */
    readonly confirmLabel: string
    /** Whether the control is unavailable. */
    readonly disabled?: boolean
}

/** What confirming does. */
export type ConfirmButtonActions = {
    /** Called on the SECOND press, inside the window. */
    readonly confirm?: () => void
}

/** Props for {@link ConfirmButton}. Three fixed slots, no fourth. */
export type ConfirmButtonProps = { readonly props: ConfirmButtonData; readonly on?: ConfirmButtonActions; readonly isLoading?: boolean }

/** How long the armed state stays open, in milliseconds. */
const ARMED_WINDOW_MS = 3000

/**
 * Draw a control that asks before it acts.
 *
 * @param input - {@link ConfirmButtonProps}
 */
export const ConfirmButton = (props: ConfirmButtonProps) => {
    const data = props.props
    const on = props.on
    const [isArmed, setIsArmed] = useState(false)

    useEffect(() => {
        if (!isArmed) return undefined
        const timer = setTimeout(() => setIsArmed(false), ARMED_WINDOW_MS)
        return () => clearTimeout(timer)
    }, [isArmed])

    return (
        <Button
            props={{
                label: isArmed ? data.confirmLabel : data.label,
                // The armed state is drawn by OUTLINE rather than by a filled danger colour. This
                // product's `Button` has no danger variant, and adding one for a basket would put
                // a red control in the vocabulary that every later screen may reach for. An
                // outline is enough to say the control has changed: the label says what it will
                // do, and the label is the part that has to be read anyway.
                variant: isArmed ? "outline" : "secondary",
                disabled: data.disabled,
            }}
            on={{
                press: () => {
                    if (isArmed) {
                        on?.confirm?.()
                        setIsArmed(false)
                        return
                    }
                    setIsArmed(true)
                },
            }}
        />
    )
}
