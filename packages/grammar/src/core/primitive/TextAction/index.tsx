"use client"

import { Spinner, skeletonVariants } from "@heroui/react"
import { useRef, type ReactNode } from "react"
import { getActionClassName, type ActionAppearance, type ActionTextSize } from "../actionStyles.js"

export type TextActionProps = {
    readonly children: ReactNode
    readonly startContent?: ReactNode
    readonly endContent?: ReactNode
    readonly appearance?: ActionAppearance
    readonly size?: ActionTextSize
    readonly isCurrent?: boolean
    readonly isDisabled?: boolean
    readonly isPending?: boolean
    readonly isSkeleton?: boolean
    readonly onPress?: () => void
}

const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base({
    className: "inline-flex w-16 shrink-0 select-none text-transparent",
})

/** Button-semantic action using the shared text/navigation visual vocabulary. */
export const TextAction = ({
    children,
    startContent,
    endContent,
    appearance = "inline",
    size = "sm",
    isCurrent = false,
    isDisabled = false,
    isPending = false,
    isSkeleton = false,
    onPress,
}: TextActionProps) => {
    const pressLockRef = useRef(false)
    const disabled = isDisabled || isPending || isSkeleton
    const press = () => {
        if (disabled || pressLockRef.current || onPress === undefined) return
        pressLockRef.current = true
        onPress()
        globalThis.setTimeout(() => { pressLockRef.current = false }, 300)
    }

    if (isSkeleton) {
        return <span data-tier="atom" data-component="TextAction" data-loading="true" aria-hidden className={SKELETON_CLASS_NAME}>&nbsp;</span>
    }

    return (
        <button
            data-tier="atom"
            data-component="TextAction"
            data-appearance={appearance}
            data-current={isCurrent ? "true" : "false"}
            data-action-pending={isPending ? "true" : "false"}
            type="button"
            disabled={disabled}
            aria-current={isCurrent ? appearance === "route" ? "page" : "true" : undefined}
            aria-busy={isPending || undefined}
            className={getActionClassName(appearance, size)}
            onClick={press}
        >
            {isPending ? <Spinner size="sm" color="current" aria-hidden="true" /> : startContent}
            <span>{children}</span>
            {isPending ? null : endContent}
        </button>
    )
}

export type { ActionAppearance as TextActionAppearance, ActionTextSize as TextActionSize }
