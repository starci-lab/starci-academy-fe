import { ProgressBar } from "@heroui/react"
import { progressClassName, progressRestingClassName } from "./classNames"

/**
 * LEAF - `Progress`: how far along something is, as a bar.
 *
 * `label` IS REQUIRED AND IS NOT DRAWN. A bar is a picture, so the only thing a screen reader has
 * to go on is the name given here - a bar without one announces a percentage of nothing.
 *
 * THE FIGURE IS CLAMPED BY WHOEVER RESOLVES IT, not here. A payload reporting 104 percent is a bug
 * upstream, and a leaf quietly correcting it is a leaf hiding the bug.
 */

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type ProgressData = {
    /** Completion, 0 to 100. Absent while loading. */
    readonly value?: number
    /** What the bar is measuring, for assistive technology. Never drawn. */
    readonly label: string
}

/** Props for {@link Progress}. */
export type ProgressProps = { readonly props: ProgressData; readonly isLoading?: boolean }

/** The bar takes the width it is given. */

/**
 * Draw a progress bar.
 *
 * @param input - {@link ProgressProps}
 */
export const Progress = (props: ProgressProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    // A resting bar is decoration, not a zero-valued measurement. Rendering the vendor progress
    // primitive before its label exists makes React Aria announce an unnamed control and emit an
    // accessibility warning; the inert span preserves the exact visual seam without lying.
    if (isLoading) {
        return (
            <span
                data-loading="true"
                aria-hidden
                className={progressRestingClassName}
            />
        )
    }

    return (
        <ProgressBar
            data-loading="false"
            aria-label={data.label}
            value={data.value ?? 0}
            minValue={0}
            maxValue={100}
            color="accent"
            size="sm"
            className={progressClassName}
        >
            <ProgressBar.Track>
                <ProgressBar.Fill />
            </ProgressBar.Track>
        </ProgressBar>
    )
}
