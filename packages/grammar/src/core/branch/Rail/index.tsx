import { useId, type ReactNode } from "react"
import { assertPresentationState, treatmentFor, type PresentationState } from "../../state.js"

type ComplementaryRailProps = {
    readonly label: string
    readonly landmark?: "complementary"
}

type ContentNavigationRailProps = {
    readonly label?: never
    /** The child owns the single navigation landmark; Core must not wrap it in another landmark. */
    readonly landmark: "content-navigation"
}

export type RailProps = (ComplementaryRailProps | ContentNavigationRailProps) & {
    readonly children: ReactNode
    readonly footer?: ReactNode
    readonly mode?: "flow" | "sticky"
    readonly width?: "compact" | "standard" | "wide"
    readonly state?: PresentationState
    readonly collapse?: "expanded" | "collapsed"
    readonly motion?: "static" | "animated" | "reduced"
}

export const Rail = ({
    label,
    landmark = "complementary",
    children,
    footer,
    mode = "flow",
    width = "standard",
    state = "neutral",
    collapse = "expanded",
    motion = "static",
}: RailProps) => {
    assertPresentationState(state)
    const headingId = useId()
    const treatment = treatmentFor(state)

    const frame = (
        <div className="starci-core-rail-frame" data-grammar-rail-frame="true">
            {landmark === "content-navigation" ? null : <h2 data-grammar-rail-heading="true" id={headingId}>{label}</h2>}
            <div className="starci-core-rail-body" data-grammar-rail-body="true">{children}</div>
            {footer === undefined ? null : (
                <div className="starci-core-rail-footer" data-grammar-rail-footer="true">{footer}</div>
            )}
        </div>
    )
    const shared = {
        className: "starci-core-rail",
        "data-grammar-collapse": collapse,
        "data-grammar-contract": "core.rail",
        "data-grammar-landmark": landmark,
        "data-grammar-motion": motion,
        "data-grammar-rail": "true",
        "data-grammar-rail-mode": mode,
        "data-grammar-rail-width": width,
        "data-grammar-state": state,
        "data-grammar-treatment": treatment.tone,
    } as const

    if (landmark === "content-navigation") return <div {...shared}>{frame}</div>
    return (
        <aside
            aria-labelledby={headingId}
            {...shared}
        >
            {frame}
        </aside>
    )
}

export const meta = { shape: "branch", grammar: "core", contract: "core.branch.rail" } as const
