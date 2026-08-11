import { Button as HeroButton, skeletonVariants } from "@heroui/react"
import { Icon, type IconName } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `Button`: the thing a reader presses.
 *
 * `label` IS REQUIRED EVEN WHILE LOADING, deliberately: the resting control keeps its REAL width,
 * and its real width is the width of its label. A skeleton drawn without one would be a different
 * size from the control it stands in for, and the row would jump the moment data landed.
 *
 * `disabled` IS NOT `isLoading`. `disabled` is a request already on its way; `isLoading` is
 * nothing here yet. A control reading the two as one goes dead on every focus revalidation.
 */

/**
 * The closed set of appearances.
 *
 * `primary` is the one honest main action of a surface. `outline` is the alternative a reader may
 * take INSTEAD of the main action - a sign-in shortcut beside a form - and it reads as an equal
 * offer rather than a lesser one, which a filled `secondary` does not.
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost"

/** Control heights. Two, because a third is a size nobody can pick consistently. */
export type ButtonSize = "sm" | "md"

/** What pressing the button means to the form around it. */
export type ButtonType = "button" | "submit" | "reset"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ButtonData = {
    /** The already-resolved label. Required at rest too - see the file header. */
    readonly label: string
    /** Which of the three appearances this press target wears. */
    readonly variant?: ButtonVariant
    /** The control height. */
    readonly size?: ButtonSize
    /** Form semantics. Defaults to `button` so a stray control cannot submit by accident. */
    readonly type?: ButtonType
    /** The meaning drawn before the label. It inherits the label's colour, never its own. */
    readonly icon?: IconName
    /** Blocks the press and dims the control - a request already on its way. */
    readonly disabled?: boolean
}

/** What pressing it does. Handlers travel apart from data: a function is not a `DataValue`. */
export type ButtonActions = {
    /** Called on press. */
    readonly press?: () => void
}

/** Props for {@link Button}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type ButtonProps = LeafProps<ButtonData, ButtonActions>

/** The four appearances, as the vendor names them, so fill and foreground travel together. */
const VARIANTS = { primary: "primary", secondary: "secondary", outline: "outline", ghost: "ghost" } as const

/** The size step, as the vendor names it. */
const SIZES = { sm: "sm", md: "md" } as const

/**
 * The resting shape. The label goes transparent rather than being removed, because its width is
 * what the row was laid out around.
 */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/**
 * Draw a press target.
 *
 * @param input - {@link ButtonProps}
 */
export const Button = ({ props, on, isLoading = false }: ButtonProps) => {
    const variant = props.variant ?? "secondary"
    const size = props.size ?? "md"
    return (
        <HeroButton
            data-tier="leaf"
            data-component="Button"
            data-variant={variant}
            data-size={size}
            data-loading={isLoading ? "true" : "false"}
            type={props.type ?? "button"}
            variant={VARIANTS[variant]}
            size={SIZES[size]}
            isDisabled={props.disabled === true || isLoading}
            onPress={on?.press}
            className={isLoading ? RESTING_CLASSES : undefined}
        >
            {props.icon === undefined || isLoading ? null : <Icon props={{ name: props.icon, role: "chip" }} />}
            {props.label}
        </HeroButton>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
