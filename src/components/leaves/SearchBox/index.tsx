"use client"

import { useRef, useState } from "react"
import { InputGroup } from "@heroui/react"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { searchBoxClassName, searchBoxClearClassName, searchBoxShortcutClassName } from "./classNames"

/**
 * LEAF - `SearchBox`: the one field that lives in the bar.
 *
 * One search control - its glyph and keyboard hint are intrinsic affordances, so it owns
 * the seam between them.
 *
 * THE SHORTCUT IS SHOWN, not merely bound. A reader who does not know the key never presses it, so
 * printing it in the field is the only thing that makes the shortcut exist for anyone but its
 * author. It is drawn as a hint rather than a control, because it is a fact about the keyboard and
 * not a thing to click.
 *
 * IT IS UNCONTROLLED like every other box. Search runs on submit, and a field that re-rendered the
 * whole bar on each keystroke would repaint the navigation while somebody typed.
 *
 * IT OWNS ITS CLEAR CONTROL, and that is a correction. `type="search"` summons one from the user
 * agent, and this product cannot reach it: it is painted from a fixed mask, so it answers to no
 * token, ignores the `Icon` leaf every other glyph comes from, and does not exist at all in
 * Firefox. The reset lives in `globals.css`; the replacement lives here, where the field that owns
 * the seam between its glyph and its hint can own this one too.
 *
 * WHETHER IT HAS TEXT IS THE ONLY THING THIS TRACKS. Not the query - the field still holds that,
 * so nothing above re-renders as somebody types. The boolean flips twice in a search: once on the
 * first character, once on the last one removed.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type SearchBoxData = {
    /** The already-resolved prompt shown in an empty box. */
    readonly placeholder: string
    /** The already-resolved accessible name. Read, never seen. */
    readonly label: string
    /** The already-resolved name of the clear control. Read, never seen - it draws as a glyph. */
    readonly clearLabel: string
    /** The keyboard shortcut, already written the way a reader would press it. */
    readonly shortcut?: string
}

/** What searching does. */
export type SearchBoxActions = {
    /** Called with the query when the reader submits. */
    readonly search?: (query: string) => void
}

/** Props for {@link SearchBox}. Three fixed slots, no fourth. */
export type SearchBoxProps = { readonly props: SearchBoxData; readonly on?: SearchBoxActions; readonly isLoading?: boolean }

/** The hint is set as a key, not as a word. */

/**
 * The clear control is a GLYPH, not a button with a ground.
 *
 * It stands inside the field's own well, and a filled pill in there reads as a second control
 * sitting on the input rather than as part of it - which is what a tertiary `IconButton` drew. So
 * the affordance is carried by weight alone: quiet until it is pointed at.
 */

/**
 * Draw the search field.
 *
 * THE VENDOR OWNS THE WELL, and that is a correction. This leaf used to draw its own rounded,
 * filled box and place a `HeroInput` inside it - and the input brings its own well, so the control
 * rendered as a pill inside a pill, a glyph adrift in the outer one. The vendor already ships the
 * shape this is: `InputGroup` is one control with a prefix and a suffix, so the glyph sits in the
 * SAME well as the text instead of beside it.
 *
 * @param input - {@link SearchBoxProps}
 */
export const SearchBox = (props: SearchBoxProps) => {
    const data = props.props
    const on = props.on
    const formRef = useRef<HTMLFormElement>(null)
    const [hasText, setHasText] = useState(false)

    /** The field itself, read the same way submitting already reads it. */
    const field = (): HTMLInputElement | null => {
        const found = formRef.current?.elements.namedItem("q")
        return found instanceof HTMLInputElement ? found : null
    }

    return (
        <form
            ref={formRef}
            role="search"
            className={searchBoxClassName}
            onSubmit={(event) => {
                event.preventDefault()
                on?.search?.(field()?.value ?? "")
            }}
        >
            <InputGroup fullWidth>
                <InputGroup.Prefix>
                    <Icon source={iconSourceFor("search", "chip")} usage={"chip"} />
                </InputGroup.Prefix>
                <InputGroup.Input
                    name="q"
                    type="search"
                    aria-label={data.label}
                    placeholder={data.placeholder}
                    onChange={(event) => setHasText(event.target.value !== "")}
                    onKeyDown={(event) => {
                        if (event.key !== "Enter" || event.nativeEvent.isComposing) return
                        // HeroUI's input host consumes the native form submit in the browser. Own
                        // the keyboard promise here so the visible search works the same way as an
                        // explicit form submit, without firing twice in hosts that do submit.
                        event.preventDefault()
                        on?.search?.(event.currentTarget.value)
                    }}
                />
                {/*
                 * CLEARING SEARCHES AGAIN, because a box emptied over a filtered list leaves the
                 * reader looking at results for a query that is no longer on screen. The keyboard
                 * hint gives way to it rather than sitting beside it: a shortcut into a field
                 * somebody is already typing in has nothing left to offer.
                 */}
                {hasText ? (
                    <InputGroup.Suffix>
                        <button
                            type="button"
                            className={searchBoxClearClassName}
                            aria-label={data.clearLabel}
                            onClick={() => {
                                const input = field()
                                if (input !== null) {
                                    input.value = ""
                                    input.focus()
                                }
                                setHasText(false)
                                on?.search?.("")
                            }}
                        >
                            <Icon source={iconSourceFor("close", "chip")} usage={"chip"} />
                        </button>
                    </InputGroup.Suffix>
                ) : data.shortcut === undefined ? null : (
                    <InputGroup.Suffix>
                        <kbd className={searchBoxShortcutClassName}>{data.shortcut}</kbd>
                    </InputGroup.Suffix>
                )}
            </InputGroup>
        </form>
    )
}
