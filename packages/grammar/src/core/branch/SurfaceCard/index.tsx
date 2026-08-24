import { useId, type ReactNode } from "react"
import { assertPresentationState, treatmentFor, type PresentationState } from "../../state.js"

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
    readonly depth?: "top" | "nested"
    readonly state?: PresentationState
    readonly wholeAction?: WholeCardAction
}

export const SurfaceCard = ({
    label,
    ariaLabel,
    children,
    fact,
    depth = "top",
    state = "neutral",
    wholeAction,
}: SurfaceCardProps) => {
    assertPresentationState(state)
    const headingId = useId()
    const treatment = treatmentFor(state)
    const disabled = state === "unavailable" || state === "pending"
    const accessibleName = ariaLabel ?? label

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

    return (
        <section className="starci-core-surface-card" data-grammar-surface-card="true">
            {label === undefined ? null : (
                <div className="starci-core-surface-label" data-grammar-surface-label="true">
                    <h3 id={headingId}>{label}</h3>
                    {fact === undefined ? null : <span>{fact}</span>}
                </div>
            )}
            <div
                aria-label={label === undefined ? accessibleName : undefined}
                aria-labelledby={label === undefined ? undefined : headingId}
                className="starci-core-surface"
                data-grammar-state={state}
                data-grammar-surface="true"
                data-grammar-surface-depth={depth}
                data-grammar-treatment={treatment.tone}
            >
                <div className="starci-core-surface-content" data-grammar-surface-content="true">
                    {children}
                </div>
                {action}
            </div>
        </section>
    )
}

export const meta = { shape: "branch", grammar: "core", contract: "core.branch.surface-card" } as const
