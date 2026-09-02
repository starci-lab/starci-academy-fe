import { Button as HeroButton, Spinner as HeroSpinner, skeletonVariants } from "@heroui/react"
import type { ReactNode } from "react"

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "outline" | "ghost"
export type ButtonSize = "sm" | "md" | "lg"
export type ButtonType = "button" | "submit" | "reset"

export type ButtonProps = {
    /** The visible action label. It remains present while the action is pending. */
    readonly children: ReactNode
    readonly variant?: ButtonVariant
    readonly size?: ButtonSize
    readonly type?: ButtonType
    /** Decorative or explanatory content before the label. Product icon identity stays with the app. */
    readonly startContent?: ReactNode
    /** Directional or explanatory content after the label. */
    readonly endContent?: ReactNode
    readonly isDisabled?: boolean
    /** Initial unresolved-content geometry. It is distinct from action-owned pending. */
    readonly isSkeleton?: boolean
    /** Pending belongs to the action that started the work and blocks duplicate presses. */
    readonly isPending?: boolean
    readonly onPress?: () => void
}

const VARIANTS = {
    primary: "primary",
    secondary: "secondary",
    tertiary: "tertiary",
    outline: "outline",
    ghost: "ghost",
} as const

const SIZES = { sm: "sm", md: "md", lg: "lg" } as const
const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base({
    className: "select-none text-transparent",
})

/** Core action owner with canonical disabled and pending vocabulary. */
export const Button = ({
    children,
    variant = "secondary",
    size = "md",
    type = "button",
    startContent,
    endContent,
    isDisabled = false,
    isSkeleton = false,
    isPending = false,
    onPress,
}: ButtonProps) => (
    <HeroButton
        data-tier="atom"
        data-component="Button"
        data-loading={isSkeleton ? "true" : "false"}
        data-action-pending={isPending ? "true" : "false"}
        type={type}
        variant={VARIANTS[variant]}
        size={SIZES[size]}
        isDisabled={isDisabled || isPending || isSkeleton}
        isPending={isPending}
        {...(isSkeleton ? { className: SKELETON_CLASS_NAME } : {})}
        {...(isDisabled || isPending || isSkeleton || onPress === undefined ? {} : { onPress })}
    >
        {isSkeleton ? null : isPending ? <HeroSpinner size="sm" color="current" /> : startContent}
        <span aria-busy={isPending || undefined} aria-hidden={isSkeleton || undefined}>{children}</span>
        {isPending || isSkeleton ? null : endContent}
    </HeroButton>
)
