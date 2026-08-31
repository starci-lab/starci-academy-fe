import { useId, type ReactNode } from "react"
import { assertPresentationState, treatmentFor, type PresentationState } from "../../state.js"
import { VerticalScrollRegion } from "../../composite/VerticalScrollRegion/index.js"
import { Label } from "../../primitive/Label/index.js"
import { getSurfaceFrameClassName, surfaceCardClassName, surfaceContentClassName, surfaceHighlightClassName, surfaceHighlightSweepClassName, surfaceLabelClassName } from "./classNames.js"

export type WholeCardAction =
    | {
        readonly kind: "link"
        readonly href: string
        readonly label: string
    }
    | {
        readonly kind: "button"
        readonly press: () => void
        readonly label: string
    }

type LabelledSurfaceCard = {
    readonly label: string
    readonly ariaLabel?: string
}

type SelfNamedSurfaceCard = {
    readonly label?: undefined
    readonly ariaLabel: string
}

export type SurfaceCardProps = (LabelledSurfaceCard | SelfNamedSurfaceCard) & {
    readonly children: ReactNode
    readonly fact?: string
    /** Optional content at the end of the external label row. It takes the fact's single place. */
    readonly labelEnd?: ReactNode
    readonly depth?: "top" | "nested"
    readonly state?: PresentationState
    readonly wholeAction?: WholeCardAction
    /** Frameless content already owns its visible boundaries, so Core must not draw another shell. */
    readonly frame?: "bounded" | "frameless"
    /** Contained content has exactly one internal scroll owner. */
    readonly scroll?: "page" | "contained"
    /** Convenience capability: make the content region a HeroUI Vertical ScrollShadow. */
    readonly isScrollable?: boolean
    /** Draw one legacy accent sweep behind this surface; use for one featured card only. */
    readonly isHighlight?: boolean
}

export const SurfaceCard = (props: SurfaceCardProps) => {
    const {
        label,
        ariaLabel,
        children,
        fact,
        labelEnd,
        depth = "top",
        state = "neutral",
        wholeAction,
        frame = "bounded",
        scroll = "page",
        isScrollable = false,
        isHighlight = false,
    } = props
    assertPresentationState(state)
    const headingId = useId()
    const treatment = treatmentFor(state)
    const disabled = state === "unavailable" || state === "pending"
    const accessibleName = ariaLabel ?? label
    const contained = isScrollable || scroll === "contained"

    const action = wholeAction?.kind === "link" ? (
        <a
            aria-disabled={disabled || undefined}
            aria-label={wholeAction.label}
            data-grammar-whole-action="link"
            href={disabled ? undefined : wholeAction.href}
            tabIndex={disabled ? -1 : undefined}
        />
    ) : wholeAction?.kind === "button" ? (
        <button
            aria-label={wholeAction.label}
            data-grammar-whole-action="button"
            disabled={disabled}
            onClick={wholeAction.press}
            type="button"
        />
    ) : null

    const surface = (
        <div
            aria-label={label === undefined ? accessibleName : undefined}
            aria-labelledby={label === undefined ? undefined : headingId}
            className={getSurfaceFrameClassName(frame)}
            data-grammar-frame={frame}
            data-grammar-scroll={contained ? "contained" : "page"}
            data-grammar-state={state}
            data-grammar-surface-depth={depth}
            data-grammar-treatment={treatment.tone}
        >
            <VerticalScrollRegion className={surfaceContentClassName} data-grammar-surface-content="true" isScrollable={contained}>
                {children}
            </VerticalScrollRegion>
            {action}
        </div>
    )
    const highlightedSurface = isHighlight && state !== "pending" ? (
        <div className={surfaceHighlightClassName} data-grammar-highlight="true">
            <div aria-hidden className={surfaceHighlightSweepClassName} />
            {surface}
        </div>
    ) : surface

    return (
        <section
            className={surfaceCardClassName}
            data-grammar-frame={frame}
            data-grammar-interaction={wholeAction === undefined ? "static" : "whole-action"}
            data-grammar-surface-card="true"
        >
            {label === undefined ? null : (
                <div className={surfaceLabelClassName} data-grammar-surface-label="true">
                    <Label id={headingId}>{label}</Label>
                    {labelEnd ?? (fact === undefined ? null : <span>{fact}</span>)}
                </div>
            )}
            {highlightedSurface}
        </section>
    )
}
