import { Input as HeroInput, skeletonVariants } from "@heroui/react"
import type { ChangeEvent } from "react"

/**
 * ATOM - `Input`: the box a reader types into.
 *
 * This is the atom the registry's `field` role is drawn with, and it exists because the three
 * controls on the sign-in form were bare `<input>` elements: no fill, no border, no focus ring,
 * no placeholder colour - the browser's default box on a designed page, which reads as a page
 * that has not finished loading rather than as a form.
 *
 * WHAT IT DRAWS. HeroUI's `Input`, which resolves its fill, border, radius, placeholder and
 * focus ring from the field tokens in `globals.css`. Fields carry their own token family there
 * on purpose - a form control moves independently of a card - and this atom is the one place
 * that family is consumed.
 *
 * WHY THE VALUE IS UNCONTROLLED. The registry frame mounts every slot as a COMPONENT, so a slot
 * may be remounted whenever the surface above it re-renders - which is exactly what happens when
 * a request settles. `defaultValue` plus an `onChange` that mirrors into the caller's own ref is
 * what lets a remount restore what the reader wrote, instead of emptying the form under them
 * after a failed attempt.
 *
 * WHY THERE IS NO `label` PROP. The label is a sibling, not a part: `form-field` declares
 * `heading`, `field` and `meta` as three children, so the label is drawn by the `Label` atom in
 * the role above this one. An input that grew its own label would be a second, smaller form
 * layout that no registry key describes.
 *
 * NO `className`, NO `placeholder` COPY. Appearance is intrinsic; copy is data. A placeholder
 * spelled here would be spelled in English for every locale, and a placeholder is a poor label
 * anyway - it disappears exactly when the reader needs it.
 */

/**
 * What kind of value this box takes. Closed on purpose: each entry changes the keyboard a phone
 * offers and what a password manager does with the field, so it is a decision rather than a
 * pass-through of every HTML input type.
 */
export type InputKind = "email" | "password" | "text" | "code"

/** Props for {@link Input}. */
export interface InputProps {
    /** The id the label above points at. Stable across remounts, so the link always holds. */
    id: string
    /** The form field name, as the submission knows it. */
    name: string
    /** What kind of value this box takes. */
    kind?: InputKind
    /** The value the box opens with - and the one a remount restores. */
    defaultValue?: string
    /** Blocks typing. */
    disabled?: boolean
    /** Whether the last attempt refused what is in this box. */
    isInvalid?: boolean
    /** Called on every keystroke, so a caller can mirror the value somewhere that survives. */
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void
    /**
     * Renders the resting shape: same box, same height, and refuses typing while it rests.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand, which is exactly SWR's
     * `isLoading`. It does NOT mean "a request is in flight": a submission already on its way
     * is `disabled`, which leaves the reader's own text on screen where they can read it.
     */
    isLoading?: boolean
}

/**
 * Everything the browser needs to know about one kind of value, in one place.
 *
 * `one-time-code` is what lets a phone offer the code straight from the message that just
 * arrived, and `numeric` is what gets a thumb the digit keypad rather than a full keyboard -
 * two facts that belong to the KIND of field, not to the screen that happens to draw it.
 */
const KINDS = {
    email: { type: "email", autoComplete: "email", inputMode: "email" },
    password: { type: "password", autoComplete: "current-password", inputMode: "text" },
    text: { type: "text", autoComplete: "off", inputMode: "text" },
    code: { type: "text", autoComplete: "one-time-code", inputMode: "numeric" },
} as const

/** The resting shape - the same box at the same height, so the form does not reflow. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw the box a reader types into.
 *
 * @param props - {@link InputProps}
 */
export const Input = ({
    id,
    name,
    kind = "text",
    defaultValue,
    disabled = false,
    isInvalid = false,
    onChange,
    isLoading = false,
}: InputProps) => {
    const spelling = KINDS[kind]
    return (
        <HeroInput
            data-tier="atom"
            data-component="Input"
            data-kind={kind}
            data-loading={isLoading ? "true" : "false"}
            id={id}
            name={name}
            type={spelling.type}
            autoComplete={spelling.autoComplete}
            inputMode={spelling.inputMode}
            defaultValue={defaultValue}
            disabled={disabled || isLoading}
            aria-invalid={isInvalid ? true : undefined}
            fullWidth
            onChange={onChange}
            className={isLoading ? RESTING_CLASSES : undefined}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Input" } as const
