import { buttonVariants, cn, skeletonVariants } from "@heroui/react"
import type { ReactNode } from "react"
import type { ButtonSize, ButtonVariant } from "../Button/index.js"
import { getActionClassName, type ActionAppearance, type ActionTextSize } from "../actionStyles.js"

type TextLinkAppearance = {
    readonly appearance?: ActionAppearance
    readonly size?: ActionTextSize
    readonly buttonVariant?: never
    readonly buttonSize?: never
}

type ButtonLinkAppearance = {
    readonly appearance: "button"
    readonly size?: never
    readonly buttonVariant?: ButtonVariant
    readonly buttonSize?: ButtonSize
}

export type LinkProps = (TextLinkAppearance | ButtonLinkAppearance) & {
    /** A real browser destination. State-only actions use TextAction. */
    readonly href: string
    readonly children: ReactNode
    readonly startContent?: ReactNode
    readonly endContent?: ReactNode
    readonly isCurrent?: boolean
    readonly isSkeleton?: boolean
    readonly target?: "_blank" | "_self"
    readonly rel?: string
    readonly download?: boolean | string
    readonly onFollow?: () => void
}

const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base({
    className: "inline-flex w-16 shrink-0 select-none text-transparent",
})

/** Native destination owner; browser navigation semantics are never optional. */
export const Link = ({
    href,
    children,
    startContent,
    endContent,
    appearance = "inline",
    size = "sm",
    isCurrent = false,
    isSkeleton = false,
    target,
    rel,
    download,
    onFollow,
    ...appearanceProps
}: LinkProps) => {
    const className = appearance === "button"
        ? buttonVariants({ variant: appearanceProps.buttonVariant ?? "secondary", size: appearanceProps.buttonSize ?? "md" })
        : getActionClassName(appearance, size)

    if (isSkeleton) {
        return <span data-tier="atom" data-component="Link" data-loading="true" aria-hidden className={cn(className, SKELETON_CLASS_NAME)}>&nbsp;</span>
    }

    return (
        <a
            data-tier="atom"
            data-component="Link"
            data-appearance={appearance}
            data-current={isCurrent ? "true" : "false"}
            data-loading="false"
            href={href}
            aria-current={isCurrent ? "page" : undefined}
            className={className}
            {...(target === undefined ? {} : { target })}
            {...(rel === undefined ? target === "_blank" ? { rel: "noopener noreferrer" } : {} : { rel })}
            {...(download === undefined ? {} : { download })}
            {...(onFollow === undefined ? {} : { onClick: onFollow })}
        >
            {startContent}
            <span>{children}</span>
            {endContent}
        </a>
    )
}

export type LinkAppearance = ActionAppearance | "button"
export type { ActionTextSize as LinkSize }
