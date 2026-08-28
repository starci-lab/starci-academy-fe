import { Button as HeroButton, Spinner } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { buttonActiveClassName, buttonLoadingClassName, buttonTrailingGlyphClassName } from "./classNames"

/**
 * LEAF - `Button`: the thing a reader presses.
 *
 * `label` IS REQUIRED EVEN WHILE LOADING, deliberately: the resting control keeps its REAL width,
 * and its real width is the width of its label. A skeleton drawn without one would be a different
 * size from the control it stands in for, and the row would jump the moment data landed.
 *
 * `disabled`, `isPending` AND `isLoading` ARE THREE DIFFERENT FACTS. `disabled` means the action is
 * unavailable before a press. `isPending` means this exact action is running and draws a spinner.
 * `isLoading` is the shared data-loading slot and draws the same skeleton state as every leaf.
 */

/**
 * The closed set of appearances.
 *
 * `primary` is the one honest main action of a surface. `outline` is the alternative a reader may
 * take INSTEAD of the main action - a sign-in shortcut beside a form - and it reads as an equal
 * offer rather than a lesser one, which a filled `secondary` does not.
 */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost"

/**
 * Control heights. `sm` belongs inside a row or compact cluster; `md` anchors a standalone action.
 * Size follows placement, independently of visual priority.
 */
export type ButtonSize = "sm" | "md"

/** What pressing the button means to the form around it. */
export type ButtonType = "button" | "submit" | "reset"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ButtonData = {
    /** The already-resolved label. Required at rest too - see the file header. */
    readonly label: string
    /** Which of the three appearances this press target wears. */
    readonly variant?: ButtonVariant
    /** The control height selected from placement, never from variant or label length. */
    readonly size?: ButtonSize
    /** Form semantics. Defaults to `button` so a stray control cannot submit by accident. */
    readonly type?: ButtonType
    /** The meaning drawn beside the label. It inherits the label's colour, never its own. */
    readonly icon?: IconName
    /**
     * Which side the glyph sits on. `leading` is the default and stays the default: a glyph that
     * NAMES the action belongs before the words, the way a provider mark or a retry arrow does.
     *
     * `trailing` is for a glyph that points at the CONSEQUENCE rather than naming the action - the
     * forward arrow on "continue", which is about where the press takes you. Putting that one in
     * front makes it read as decoration on the verb; putting it last makes it the direction the
     * sentence ends in, which is why every call-to-action in the product's own catalogue draws it
     * that way.
     */
    readonly iconPlacement?: "leading" | "trailing"
    /** Blocks the press because the action is unavailable before it starts. */
    readonly disabled?: boolean
    /** The action is already running; block another press and show progress in this control. */
    readonly isPending?: boolean
}

/** What pressing it does. Handlers travel apart from data: a function is not a `DataValue`. */
export type ButtonActions = {
    /** Called on press. */
    readonly press?: () => void
}

/** Props for {@link Button}. */
export type ButtonProps = { readonly props: ButtonData; readonly on?: ButtonActions; readonly isLoading?: boolean }

/** The four appearances, as the vendor names them, so fill and foreground travel together. */
const VARIANTS = {
    primary: "primary",
    secondary: "secondary",
    tertiary: "tertiary",
    outline: "outline",
    ghost: "ghost",
} as const

/** The size step, as the vendor names it. */
const SIZES = { sm: "sm", md: "md" } as const

/** Data-loading paint shared with the other leaves; action progress uses a spinner instead. */

/**
 * The glyph travels a step on hover, and only when it trails.
 *
 * A leading glyph names the action and has nowhere to go; a trailing one points at where the press
 * leads, so moving it that way is the control repeating its own promise rather than decoration. The
 * distance is one step of the scale and `motion-reduce` removes it outright - a reader who has
 * asked the system for less movement is not asking about this one control.
 */

/**
 * Draw a press target.
 *
 * @param input - {@link ButtonProps}
 */
export const Button = (props: ButtonProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const variant = data.variant ?? "secondary"
    const size = data.size ?? "md"
    const isPending = data.isPending === true
    const placement = data.iconPlacement ?? "leading"
    const glyph = isLoading || isPending || data.icon === undefined
        ? null
        : placement === "trailing"
            ? (
                <span className={buttonTrailingGlyphClassName}>
                    <Icon props={{ name: data.icon, role: "chip" }} />
                </span>
            )
            : <Icon props={{ name: data.icon, role: "chip" }} />
    return (
        <HeroButton
            data-variant={variant}
            data-size={size}
            data-icon-placement={placement}
            data-loading={isLoading ? "true" : "false"}
            data-action-pending={isPending ? "true" : "false"}
            type={data.type ?? "button"}
            variant={VARIANTS[variant]}
            size={SIZES[size]}
            isDisabled={data.disabled === true || isLoading || isPending}
            isPending={isPending}
            onPress={on?.press}
            // `group` so the trailing glyph can answer a hover on the whole control rather than on
            // itself: a reader aiming at the words is hovering the button, not the arrow.
            className={isLoading ? buttonLoadingClassName : buttonActiveClassName}
        >
            {isPending ? <Spinner size="sm" color="current" aria-hidden="true" /> : null}
            {placement === "leading" ? glyph : null}
            <span>{data.label}</span>
            {placement === "trailing" ? glyph : null}
        </HeroButton>
    )
}
