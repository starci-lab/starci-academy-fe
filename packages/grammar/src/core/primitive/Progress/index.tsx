import { ProgressBar, skeletonVariants } from "@heroui/react"

export type ProgressProps = {
    /** What the bar measures. Required because the visible bar has no drawn label. */
    readonly label: string
    /** Completion from 0 to 100. Validation remains with the resolving application. */
    readonly value?: number
    /** Initial unresolved-content geometry, not a zero-valued measurement. */
    readonly isSkeleton?: boolean
}

const SKELETON_CLASS_NAME = skeletonVariants({ animationType: "shimmer" }).base({
    className: "h-2 w-full",
})

/** Accessible, full-width completion bar with an inert initial-loading shape. */
export const Progress = ({ label, value = 0, isSkeleton = false }: ProgressProps) => {
    if (isSkeleton) {
        return (
            <span
                data-tier="atom"
                data-component="Progress"
                data-loading="true"
                aria-hidden
                className={SKELETON_CLASS_NAME}
            />
        )
    }

    return (
        <ProgressBar
            data-tier="atom"
            data-component="Progress"
            data-loading="false"
            aria-label={label}
            value={value}
            minValue={0}
            maxValue={100}
            color="accent"
            size="sm"
            className="w-full"
        >
            <ProgressBar.Track>
                <ProgressBar.Fill />
            </ProgressBar.Track>
        </ProgressBar>
    )
}
