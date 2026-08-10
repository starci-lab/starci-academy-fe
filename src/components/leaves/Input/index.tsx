import { Input as HeroInput, skeletonVariants } from "@heroui/react"
import type { LeafProps } from "@/components/contracts/props"

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
export type InputKind = "email" | "password" | "code" | "text"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type InputData = {
    /** The id the label points at. Required: a box no label names is a box nobody can reach. */
    readonly id: string
    /** The form field name, for the submitted payload. */
    readonly name: string
    /** What is being typed. */
    readonly kind?: InputKind
    /** What it starts with, for an uncontrolled box. */
    readonly defaultValue?: string
    /** Blocks typing - a request already on its way. */
    readonly disabled?: boolean
    /** Marks the box as refused, so the message beside it is announced with it. */
    readonly isInvalid?: boolean
}

/** What typing in it does. */
export type InputActions = {
    /** Called with the current value on every change. */
    readonly change?: (value: string) => void
}

/** Props for {@link Input}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type InputProps = LeafProps<InputData, InputActions>

/** The kind, as the platform's own type attribute plus what it should autocomplete. */
const KINDS = {
    email: { type: "email", autoComplete: "email", inputMode: "email" },
    password: { type: "password", autoComplete: "current-password", inputMode: "text" },
    code: { type: "text", autoComplete: "one-time-code", inputMode: "numeric" },
    text: { type: "text", autoComplete: "off", inputMode: "text" },
} as const

/** The resting shape - the box at its real height, empty. */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "h-10 w-full",
})

/**
 * Draw a box to type into.
 *
 * @param input - {@link InputProps}
 */
export const Input = ({ props, on, isLoading = false }: InputProps) => {
    const kind = KINDS[props.kind ?? "text"]
    return (
        <HeroInput
            data-tier="leaf"
            data-component="Input"
            data-kind={props.kind ?? "text"}
            data-loading={isLoading ? "true" : "false"}
            id={props.id}
            name={props.name}
            type={kind.type}
            autoComplete={kind.autoComplete}
            inputMode={kind.inputMode}
            defaultValue={props.defaultValue}
            disabled={props.disabled === true || isLoading}
            aria-invalid={props.isInvalid === true ? true : undefined}
            fullWidth
            className={isLoading ? RESTING_CLASSES : undefined}
            onChange={(event) => on?.change?.(event.target.value)}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
