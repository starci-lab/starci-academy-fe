"use client"

import { Spinner, skeletonVariants } from "@heroui/react"
import { useRef, type ReactNode } from "react"
import { getActionClassName, type ActionAppearance, type ActionTextSize } from "../actionStyles.js"

type ActionBase = {
    readonly children: ReactNode
    readonly startContent?: ReactNode
    readonly endContent?: ReactNode
    readonly appearance?: ActionAppearance
    readonly size?: ActionTextSize
    readonly isCurrent?: boolean
    readonly isDisabled?: boolean
    readonly isPending?: boolean
    readonly isSkeleton?: boolean
}

/**
 * A real browser destination. It renders an anchor, so middle-click, copy-link, and the `link` role
 * come from the platform. While pending or disabled the href is withheld and the anchor is marked
 * unavailable; it is never turned into a button to express that state.
 */
type DestinationAction = {
    readonly href: string
    readonly target?: "_blank" | "_self"
    readonly rel?: string
    readonly download?: boolean | string
    /** Runs alongside navigation. It cannot cancel the destination. */
    readonly onFollow?: () => void
    readonly onPress?: never
}

/** A same-document command. It renders a button and owns pending against duplicate presses. */
type CommandAction = {
    readonly onPress?: () => void
    readonly href?: never
    readonly target?: never
    readonly rel?: never
    readonly download?: never
    readonly onFollow?: never
}

/**
 * The text-shaped action. The element is decided by which of `href` or `onPress` is present, and
 * the type forbids both, so a destination cannot be written as a button by choosing the wrong leaf.
 */
export type TextActionProps = ActionBase & (DestinationAction | CommandAction)

const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base({
    className: "inline-flex w-16 shrink-0 select-none text-transparent",
})

/** Text-shaped action: an anchor for a destination, a button for a command. */
export const TextAction = (props: TextActionProps) => {
    const {
        children,
        startContent,
        endContent,
        appearance = "inline",
        size = "sm",
        isCurrent = false,
        isDisabled = false,
        isPending = false,
        isSkeleton = false,
    } = props
    const pressLockRef = useRef(false)
    const unavailable = isDisabled || isPending

    if (isSkeleton) {
        return <span data-tier="atom" data-component="TextAction" data-loading="true" aria-hidden className={SKELETON_CLASS_NAME}>&nbsp;</span>
    }

    const shared = {
        "data-tier": "atom",
        "data-component": "TextAction",
        "data-appearance": appearance,
        "data-current": isCurrent ? "true" : "false",
        "data-action-pending": isPending ? "true" : "false",
        "aria-busy": isPending || undefined,
        className: getActionClassName(appearance, size),
    } as const
    const content = (
        <>
            {isPending ? <Spinner size="sm" color="current" aria-hidden="true" /> : startContent}
            <span>{children}</span>
            {isPending ? null : endContent}
        </>
    )

    if (props.href !== undefined) {
        const { href, target, rel, download, onFollow } = props
        return (
            <a
                {...shared}
                data-element="a"
                role={unavailable ? "link" : undefined}
                aria-disabled={unavailable || undefined}
                aria-current={isCurrent ? appearance === "route" ? "page" : "true" : undefined}
                {...(unavailable ? {} : { href })}
                {...(target === undefined ? {} : { target })}
                {...(rel === undefined ? target === "_blank" ? { rel: "noopener noreferrer" } : {} : { rel })}
                {...(download === undefined ? {} : { download })}
                {...(onFollow === undefined || unavailable ? {} : { onClick: onFollow })}
            >
                {content}
            </a>
        )
    }

    const { onPress } = props
    const press = () => {
        if (unavailable || pressLockRef.current || onPress === undefined) return
        pressLockRef.current = true
        onPress()
        globalThis.setTimeout(() => { pressLockRef.current = false }, 300)
    }

    return (
        <button
            {...shared}
            data-element="button"
            type="button"
            disabled={unavailable}
            aria-current={isCurrent ? appearance === "route" ? "page" : "true" : undefined}
            onClick={press}
        >
            {content}
        </button>
    )
}

export type { ActionAppearance as TextActionAppearance, ActionTextSize as TextActionSize }
