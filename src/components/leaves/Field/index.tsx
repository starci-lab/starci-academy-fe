"use client"

import { useState } from "react"
import { Input as HeroInput, skeletonVariants } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Field`: one labelled box, with its hint or its refusal underneath.
 *
 * A CLUSTER LEAF. Its interior is fixed - a name, a box, and at most one line under it - at every
 * screen and forever, so it owns the seam between them.
 *
 * WHY THE LABEL AND THE BOX ARE ONE LEAF. They are tied by `htmlFor`, and a pair held together by
 * an id is a pair that breaks silently when somebody moves one of them. Keeping them in one file
 * means there is no arrangement to get wrong.
 *
 * THE REVEAL IS THE FIELD'S OWN STATE, and the one place a leaf holds any. Whether a password is
 * showing is not a fact about the product, nothing above it can act on it, and lifting it would
 * put a boolean on every form for a control that owns it.
 *
 * `kind` IS THE WHOLE OF IT. Which keyboard a phone offers, whether a password manager fills the
 * box and what a browser autocompletes all follow from the type attribute, so the caller names the
 * KIND and this file maps all three at once.
 */

/** What is being typed. Not the HTML type - that is this file's business. */
export type FieldKind = "email" | "password" | "code" | "text"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type FieldData = {
    /** The id the label points at. Required: a box no label names is a box nobody can reach. */
    readonly id: string
    /** The form field name, for the submitted payload. */
    readonly name: string
    /** The already-resolved name of the box. Copy, so it never rests. */
    readonly label: string
    /** What is being typed. */
    readonly kind?: FieldKind
    /** The already-resolved example shown in an empty box. */
    readonly placeholder?: string
    /** The already-resolved line under the box - a hint, or a refusal. */
    readonly hint?: string
    /** Whether that line is a refusal, so it is announced and the box is marked. */
    readonly isInvalid?: boolean
    /** Blocks typing - a request already on its way. */
    readonly disabled?: boolean
    /** What the reveal control is called when the secret is hidden. */
    readonly revealLabel?: string
    /** What it is called when the secret is showing. */
    readonly hideLabel?: string
}

/** What typing in it does. */
export type FieldActions = {
    /** Called with the current value on every change. */
    readonly change?: (value: string) => void
}

/** Props for {@link Field}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type FieldProps = LeafProps<FieldData, FieldActions>

/** The kind, as the platform's own type attribute plus what it should autocomplete. */
const KINDS = {
    email: { type: "email", autoComplete: "email", inputMode: "email" as const, icon: "email" as IconName },
    password: { type: "password", autoComplete: "current-password", inputMode: "text" as const, icon: "password" as IconName },
    code: { type: "text", autoComplete: "one-time-code", inputMode: "numeric" as const, icon: "code" as IconName },
    text: { type: "text", autoComplete: "off", inputMode: "text" as const, icon: undefined },
}

/** The name over the box, tight to it, because the two are one thing. */
const FIELD_CLASSES = "flex flex-col gap-2"

/** The name, with its glyph on the same baseline. */
const LABEL_CLASSES = "inline-flex items-center gap-2 text-sm font-medium"

/** The box and its reveal control share one line box. */
const BOX_CLASSES = "relative flex flex-row items-center"

/** The reveal sits inside the box's own inset rather than beside it. */
const REVEAL_CLASSES = "absolute right-3 text-xs text-muted underline-offset-4 hover:underline"

/** The resting shape - the box at its real height, empty. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "h-10 w-full",
})

/**
 * Draw a labelled box.
 *
 * @param input - {@link FieldProps}
 */
export const Field = ({ props, on, isLoading = false }: FieldProps) => {
    const [isRevealed, setIsRevealed] = useState(false)
    const kind = KINDS[props.kind ?? "text"]
    const isSecret = (props.kind ?? "text") === "password"
    const revealLabel = isRevealed ? props.hideLabel : props.revealLabel
    return (
        <div data-tier="leaf" data-component="Field" className={FIELD_CLASSES}>
            <label htmlFor={props.id} className={LABEL_CLASSES}>
                {kind.icon === undefined ? null : <Icon props={{ name: kind.icon, role: "chip" }} />}
                {props.label}
            </label>
            <div className={BOX_CLASSES}>
                <HeroInput
                    id={props.id}
                    name={props.name}
                    type={isSecret && isRevealed ? "text" : kind.type}
                    autoComplete={kind.autoComplete}
                    inputMode={kind.inputMode}
                    placeholder={props.placeholder}
                    disabled={props.disabled === true || isLoading}
                    aria-invalid={props.isInvalid === true ? true : undefined}
                    aria-describedby={props.hint === undefined ? undefined : `${props.id}-hint`}
                    fullWidth
                    variant="secondary"
                    className={isLoading ? RESTING_CLASSES : undefined}
                    onChange={(event) => on?.change?.(event.target.value)}
                />
                {!isSecret || revealLabel === undefined ? null : (
                    <button
                        type="button"
                        className={REVEAL_CLASSES}
                        onClick={() => setIsRevealed(!isRevealed)}
                    >
                        {revealLabel}
                    </button>
                )}
            </div>
            {props.hint === undefined ? null : (
                <span id={`${props.id}-hint`}>
                    <Text
                        props={{
                            content: props.hint,
                            size: "sm",
                            tone: props.isInvalid === true ? "default" : "muted",
                            live: props.isInvalid === true ? "assertive" : "off",
                        }}
                    />
                </span>
            )}
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
