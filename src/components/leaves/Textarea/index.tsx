import { TextArea } from "@heroui/react"

/**
 * LEAF - `Textarea`: the box a reader writes prose into.
 *
 * Target path: `src/components/leaves/Textarea/index.tsx`.
 *
 * IT IS NOT `Input` WITH A TALLER PROP, and that distinction is the reason this file exists. `Input`
 * owns a one-line well with a reveal affordance for masked values; this owns a growing well with a
 * resize edge and no notion of masking. Extending `InputKind` with `multiline` would have renamed a
 * different control rather than reused the same one, and the first author to pass
 * `kind: "multiline"` alongside `revealLabel` would have found out at runtime.
 *
 * IT IS UNCONTROLLED. The value is read at submit from the form that owns it, so a reader typing a
 * paragraph does not repaint the surface around them once per keystroke.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type TextareaData = {
    /** The id its label points at. Required: a box no label names is a box nobody can reach. */
    readonly id: string
    /** The form field name, for the submitted payload. */
    readonly name: string
    /** The already-resolved accessible name, for the cases where the visible label is elsewhere. */
    readonly label: string
    /** The already-resolved example shown while the box is empty. */
    readonly placeholder?: string
    /** What it starts with, for an uncontrolled box. */
    readonly defaultValue?: string
    /** How many lines it rests at before it grows. */
    readonly rows?: number
    /** Whether the line beneath it is a refusal, so the box is marked and announced. */
    readonly isInvalid?: boolean
    /** Whether the box refuses input, because something above it is already in flight. */
    readonly disabled?: boolean
}

/** What writing in it reports. */
export type TextareaActions = {
    /** Called with the current text on every change, for the callers that need it live. */
    readonly change?: (value: string) => void
}

/** Props for {@link Textarea}. */
export type TextareaProps = { readonly props: TextareaData; readonly on?: TextareaActions; readonly isLoading?: boolean }

/**
 * Draw the multi-line box.
 *
 * @param input - {@link TextareaProps}
 */
export const Textarea = (props: TextareaProps) => {
    const data = props.props
    const on = props.on
    return (
        <TextArea
            fullWidth
            id={data.id}
            name={data.name}
            aria-label={data.label}
            placeholder={data.placeholder}
            defaultValue={data.defaultValue}
            rows={data.rows ?? 4}
            // `aria-invalid` and `disabled` rather than `isInvalid`/`isDisabled`: the vendor's textarea
            // is React Aria's own `TextArea`, which takes native textarea props, while the vendor's
            // Input is a HeroUI wrapper that takes the `is`-prefixed pair. They look like the same
            // family and their prop names are not, so the compiler is the only thing that catches this.
            aria-invalid={data.isInvalid}
            disabled={data.disabled}
            onChange={(event) => on?.change?.(event.target.value)}
        />
    )
}
