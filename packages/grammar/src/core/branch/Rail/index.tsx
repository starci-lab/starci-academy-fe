import { useId, type ReactNode } from "react"
import { assertPresentationState, treatmentFor, type PresentationState } from "../../state.js"

export type RailProps = {
    readonly label: string
    readonly children: ReactNode
    readonly footer?: ReactNode
    readonly mode?: "flow" | "sticky"
    readonly width?: "compact" | "standard" | "wide"
    readonly state?: PresentationState
}

export const Rail = ({
    label,
    children,
    footer,
    mode = "flow",
    width = "standard",
    state = "neutral",
}: RailProps) => {
    assertPresentationState(state)
    const headingId = useId()
    const treatment = treatmentFor(state)

    return (
        <aside
            aria-labelledby={headingId}
            className="starci-core-rail"
            data-grammar-rail="true"
            data-grammar-rail-mode={mode}
            data-grammar-rail-width={width}
            data-grammar-state={state}
            data-grammar-treatment={treatment.tone}
        >
            <div className="starci-core-rail-frame" data-grammar-rail-frame="true">
                <h2 data-grammar-rail-heading="true" id={headingId}>{label}</h2>
                <div className="starci-core-rail-body" data-grammar-rail-body="true">{children}</div>
                {footer === undefined ? null : (
                    <div className="starci-core-rail-footer" data-grammar-rail-footer="true">{footer}</div>
                )}
            </div>
        </aside>
    )
}

export const meta = { shape: "branch", grammar: "core", contract: "core.branch.rail" } as const
