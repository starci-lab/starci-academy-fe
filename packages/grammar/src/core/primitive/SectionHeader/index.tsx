import { cn } from "@heroui/react"
import { createElement, type ReactNode } from "react"

export type SectionHeaderProps = {
    readonly title: ReactNode
    readonly description?: ReactNode
    readonly eyebrow?: ReactNode
    readonly action?: ReactNode
    readonly level?: 1 | 2 | 3 | 4
    readonly className?: string
}

/** Reusable title-copy-action hierarchy shared by StarCi product sections. */
export const SectionHeader = ({
    title,
    description,
    eyebrow,
    action,
    level = 2,
    className,
}: SectionHeaderProps) => (
    <header className={cn("starci-core-section-header", className)} data-grammar-section-header="true">
        <div className="starci-core-section-header-copy">
            {eyebrow === undefined ? null : <div className="starci-core-section-eyebrow">{eyebrow}</div>}
            {createElement(`h${level}`, { className: "starci-core-section-title" }, title)}
            {description === undefined ? null : <div className="starci-core-section-description">{description}</div>}
        </div>
        {action === undefined ? null : <div className="starci-core-section-action">{action}</div>}
    </header>
)
