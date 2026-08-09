import type { ReactNode } from "react"

/**
 * ATOM - `Button`: the thing a reader presses.
 *
 * This is the atom behind the registry's `action` role. It owns the press target and how that
 * target looks; it owns nothing about where the target sits, because `page-header`, `content-row`,
 * `list-row` and `empty-state` each already decided that and they disagree with each other on
 * purpose.
 *
 * WHY THE PADDING LIVES HERE AND THE MARGIN DOES NOT. The inset of a control is part of the
 * control - shrink it and the press target stops being reachable with a thumb, which is a
 * property of the button itself and true on every screen it appears on. The gap BETWEEN this
 * button and whatever sits next to it is the opposite: it is a fact about the pair, and the pair
 * is the registry node's business. That line is why `px-4` is here and `ml-2` never can be.
 *
 * WHY `variant` AND NOT `className`. Three variants is a closed set a reader can learn, and a
 * fourth appearance is a real design decision that should be made once here rather than typed
 * into one call site. The moment a caller can pass a class, "the secondary button" stops being a
 * thing that exists and becomes a thing each screen re-derives.
 *
 * COPY IS DATA. There is no default label and no built-in text, because an atom that spelled one
 * would spell it in English and every other locale would silently lose it.
 */

/** The closed set of appearances. `primary` is the one honest main action of a surface. */
export type ButtonVariant = "primary" | "secondary" | "ghost"

/** Control heights. Two, because a third is a size nobody can pick consistently. */
export type ButtonSize = "sm" | "md"

/** What pressing the button means to the form around it. */
export type ButtonType = "button" | "submit" | "reset"

/** Props for {@link Button}. */
export interface ButtonProps {
    /** The already-resolved label. Copy arrives translated; an atom never spells it. */
    children: ReactNode
    /** Which of the three appearances this press target wears. */
    variant?: ButtonVariant
    /** The control height. */
    size?: ButtonSize
    /** Form semantics. Defaults to `button` so a stray control cannot submit by accident. */
    type?: ButtonType
    /** Blocks the press and dims the control. */
    disabled?: boolean
    /** Called on press. Named `on*` because it is a handler, not a thing that happens. */
    onClick?: () => void
    /**
     * Renders the resting shape and refuses the press while it rests.
     *
     * MEANS "nothing to show YET" - the first load, no data in hand, which is exactly SWR's
     * `isLoading`. It does NOT mean "a request is in flight": that is `disabled`, which is the
     * prop for a submit already on its way, and routing SWR's `isValidating` here would make a
     * button the reader was about to press go dead on every focus revalidation.
     */
    isLoading?: boolean
}

/** Shape, focus ring and disabled behaviour - true of every button regardless of variant. */
const BASE_CLASSES = [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium",
    "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
    "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ")

/** Height and inset per size. The inset is part of the press target, so it belongs to the atom. */
const SIZE_CLASSES = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
} as const

/**
 * The three appearances, decided once here rather than at each call site.
 *
 * Only `primary` carries ink of its own, because only `primary` claims to be the main action of
 * a surface. The other two inherit the page ink and take their edge from `globals.css`, which
 * already owns the seam colour - restating either here would give the theme a second place to
 * disagree with itself.
 */
const VARIANT_CLASSES = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500",
    secondary: "border bg-transparent hover:bg-slate-500/10",
    ghost: "bg-transparent hover:bg-slate-500/10",
} as const

/**
 * The resting shape. The control keeps its own height and inset so the row it sits in does not
 * reflow when the real label arrives - the whole point of resting as itself. It REPLACES the
 * variant rather than layering over it: two `bg-*` utilities on one node resolve by stylesheet
 * order, not by the order they were typed, so a fill that only usually wins is not a shape.
 */
const RESTING_CLASSES = "animate-pulse select-none bg-slate-500/20 text-transparent"

/**
 * Draw a press target.
 *
 * @param props - {@link ButtonProps}
 */
export const Button = ({
    children,
    variant = "secondary",
    size = "md",
    type = "button",
    disabled = false,
    onClick,
    isLoading = false,
}: ButtonProps) => {
    const classes = [BASE_CLASSES, SIZE_CLASSES[size], isLoading ? RESTING_CLASSES : VARIANT_CLASSES[variant]]
        .filter(Boolean)
        .join(" ")
    return (
        <button
            data-tier="atom"
            data-component="Button"
            data-variant={variant}
            data-size={size}
            data-loading={isLoading ? "true" : "false"}
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={classes}
        >
            {children}
        </button>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Button" } as const
