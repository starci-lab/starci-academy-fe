import { Button as HeroButton, skeletonVariants } from "@heroui/react"
import type { ReactNode } from "react"
import { Icon, type IconName } from "@/components/atoms/Icon"

/**
 * ATOM - `Button`: the thing a reader presses.
 *
 * This is the atom behind the registry's `action` role. It owns the press target and how that
 * target looks; it owns nothing about where the target sits, because `page-header`, `content-row`,
 * `list-row` and `empty-state` each already decided that and they disagree with each other on
 * purpose.
 *
 * WHAT IT DRAWS. HeroUI's `Button`, which brings the fill, the hover, the focus ring, the
 * disabled treatment and the press behaviour of a real control - all of them resolved from the
 * theme tokens in `globals.css`. The vendor is imported HERE and only here: a block that reached
 * for it directly would be re-deciding an appearance this atom already fixed, and the two would
 * then drift one screen at a time.
 *
 * WHY THE INSET IS THE VENDOR'S AND THE MARGIN IS NOBODY'S. The inset of a control is part of
 * the control - shrink it and the press target stops being reachable with a thumb - so it comes
 * with the size step. The gap BETWEEN this button and whatever sits next to it is the opposite:
 * it is a fact about the pair, and the pair is the registry node's business.
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
    /** The meaning drawn before the label. It inherits the label's colour, never its own. */
    icon?: IconName
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

/**
 * The three appearances, decided once here rather than at each call site, as the vendor's own
 * variants - so the fill and its foreground always travel together and contrast is the theme's
 * problem rather than a guess made per screen.
 */
const VARIANTS = {
    primary: "primary",
    secondary: "secondary",
    ghost: "ghost",
} as const

/** The size step, as the vendor names it. */
const SIZES = {
    sm: "sm",
    md: "md",
} as const

/**
 * The resting shape. The control keeps its own height and inset so the row it sits in does not
 * reflow when the real label arrives - the whole point of resting as itself. It wears the
 * vendor's skeleton fill, and the label goes transparent rather than being removed, because the
 * width of the label is what the row was laid out around.
 */
const RESTING_CLASSES = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

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
    icon,
    disabled = false,
    onClick,
    isLoading = false,
}: ButtonProps) => (
    <HeroButton
        data-tier="atom"
        data-component="Button"
        data-variant={variant}
        data-size={size}
        data-loading={isLoading ? "true" : "false"}
        type={type}
        variant={VARIANTS[variant]}
        size={SIZES[size]}
        isDisabled={disabled || isLoading}
        onPress={onClick}
        className={isLoading ? RESTING_CLASSES : undefined}
    >
        {icon === undefined || isLoading ? null : <Icon name={icon} size="sm" />}
        {children}
    </HeroButton>
)

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "atom", name: "Button" } as const
