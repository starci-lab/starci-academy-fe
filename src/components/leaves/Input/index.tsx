"use client"

import { useState } from "react"
import { Input as HeroInput } from "@heroui/react"
import { OtpInput } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { inputBoxClassName, inputLoadingClassName, inputRevealClassName } from "./classNames"

/**
 * LEAF - `Input`: the box a reader types into.
 *
 * `kind` IS THE WHOLE OF IT. Which keyboard a phone offers, whether a password manager fills it,
 * and what a browser autocompletes are all decided by the type attribute - so the caller names the
 * KIND of secret or address and this file maps it. A caller passing `type` directly would be
 * choosing all three by hand, differently, on the next screen.
 *
 * IT IS UNCONTROLLED, by design: a form that re-renders on every keystroke is a form that loses a
 * character on a slow phone. The value is read at submit from the form itself.
 */

/** What is being typed. Not the HTML type - that is this file's business. */
export type InputKind = "email" | "password" | "newPassword" | "code" | "text"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type InputData = {
    /** The id the label points at. Required: a box no label names is a box nobody can reach. */
    readonly id: string
    /** The form field name, for the submitted payload. */
    readonly name: string
    /** What is being typed. */
    readonly kind?: InputKind
    /** Example shown while the box is empty. */
    readonly placeholder?: string
    /** What it starts with, for an uncontrolled box. */
    readonly defaultValue?: string
    /** Blocks typing - a request already on its way. */
    readonly disabled?: boolean
    /** Marks the box as refused, so the message beside it is announced with it. */
    readonly isInvalid?: boolean
    /** Id of supporting copy that describes this control. */
    readonly describedBy?: string
    /** Accessible name of the password reveal control while hidden. */
    readonly revealLabel?: string
    /** Accessible name of the password reveal control while visible. */
    readonly hideLabel?: string
}

/** What typing in it does. */
export type InputActions = {
    /** Called with the current value on every change. */
    readonly change?: (value: string) => void
}

/** Props for {@link Input}. */
export type InputProps = { readonly props: InputData; readonly on?: InputActions; readonly isLoading?: boolean }

/** The kind, as the platform's own type attribute plus what it should autocomplete. */
const KINDS = {
    email: { type: "email", autoComplete: "email", inputMode: "email" },
    password: { type: "password", autoComplete: "current-password", inputMode: "text" },
    newPassword: { type: "password", autoComplete: "new-password", inputMode: "text" },
    code: { type: "text", autoComplete: "one-time-code", inputMode: "numeric" },
    text: { type: "text", autoComplete: "off", inputMode: "text" },
} as const

/** The resting shape - the box at its real height, empty. */

/** The box and its intrinsic reveal affordance share one control boundary. */

/** The reveal sits inside the input's own inset. */

/**
 * Draw a box to type into.
 *
 * @param input - {@link InputProps}
 */
export const Input = (props: InputProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const [isRevealed, setIsRevealed] = useState(false)
    const kind = KINDS[data.kind ?? "text"]
    const isSecret = (data.kind ?? "text") === "password" || data.kind === "newPassword"
    const revealLabel = isRevealed ? data.hideLabel : data.revealLabel
    if (data.kind === "code") {
        return <OtpInput id={data.id} name={data.name} defaultValue={data.defaultValue} disabled={data.disabled === true || isLoading} invalid={data.isInvalid} describedBy={data.describedBy} onChange={on?.change} />
    }
    return (
        <span className={inputBoxClassName}>
            <HeroInput
                data-kind={data.kind ?? "text"}
                data-loading={isLoading ? "true" : "false"}
                id={data.id}
                name={data.name}
                type={isSecret && isRevealed ? "text" : kind.type}
                autoComplete={kind.autoComplete}
                inputMode={kind.inputMode}
                defaultValue={data.defaultValue}
                placeholder={data.placeholder}
                disabled={data.disabled === true || isLoading}
                aria-invalid={data.isInvalid === true ? true : undefined}
                aria-describedby={data.describedBy}
                fullWidth
                variant="secondary"
                className={isLoading ? inputLoadingClassName : undefined}
                onChange={(event) => on?.change?.(event.target.value)}
            />
            {!isSecret || revealLabel === undefined ? null : (
                <button
                    type="button"
                    aria-label={revealLabel}
                    className={inputRevealClassName}
                    onClick={() => setIsRevealed(!isRevealed)}
                >
                    <Icon source={iconSourceFor(isRevealed ? "hidePassword" : "revealPassword", "chip")} usage={"chip"} />
                </button>
            )}
        </span>
    )
}
