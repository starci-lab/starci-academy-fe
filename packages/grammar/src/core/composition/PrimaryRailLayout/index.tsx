import { cn } from "@heroui/react"
import type { ReactNode } from "react"

export type PrimaryRailLayoutProps = {
    readonly primary: ReactNode
    readonly rail?: ReactNode
    readonly railWidth?: "compact" | "standard" | "wide"
    readonly align?: "start" | "stretch"
    readonly className?: string
}

/**
 * Dominant product content plus one subordinate rail. The composition changes
 * to a single reading flow when the owning container becomes constrained.
 */
export const PrimaryRailLayout = ({
    primary,
    rail,
    railWidth = "standard",
    align = "start",
    className,
}: PrimaryRailLayoutProps) => (
    <div className={cn("starci-core-primary-rail-container", className)}>
        <div
            className="starci-core-primary-rail-layout"
            data-grammar-layout-align={align}
            data-grammar-layout-rail={rail === undefined ? "absent" : "present"}
            data-grammar-layout-rail-width={railWidth}
        >
            <div className="starci-core-primary-region" data-grammar-primary-region="true">{primary}</div>
            {rail === undefined ? null : <div className="starci-core-rail-region" data-grammar-rail-region="true">{rail}</div>}
        </div>
    </div>
)
