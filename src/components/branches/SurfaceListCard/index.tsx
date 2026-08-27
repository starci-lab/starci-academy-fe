import { Text } from "@/components/leaves/Text"
import { Button } from "@/components/leaves/Button"
import { SurfaceListCard as GrammarSurfaceListCard } from "@starci/grammar/core"
import type { ReactNode } from "react"

/** Copy and optional outcome drawn around a joined list surface. */
export type SurfaceListCardData = {
    readonly label: string
    /** A supporting status or figure at the end of the list label line. */
    readonly fact?: string
    readonly description?: string
    readonly actionLabel?: string
    /** A list bounded inside another surface uses an outline, never a second elevation. */
    readonly isNested?: boolean
    /** The enclosing surface already names this list; keep the name as data without drawing it twice. */
    readonly isLabelHidden?: boolean
    /**
     * The rows of THIS list carry data verdict bands on their leading edge.
     *
     * It owns the body's corner treatment and nothing else. A rounded body clips its first and
     * last rows, so a straight two-pixel band at the top of the list gets shaved into a curve by
     * the surface above it - and the list, not the row, is the only thing that can stop that.
     *
     * It cannot square the ROW. That radius lives on the row's own surface, and a branch reaching
     * down to restyle a child would make this card the row's second owner.
     */
    readonly isVerdict?: boolean
}

/** The optional whole-list action reported below the joined surface. */
export type SurfaceListCardActions = {
    readonly act?: () => void
}

/** Traditional children props for the joined-list surface branch. */
export type SurfaceListCardProps<D extends SurfaceListCardData> = {
    readonly props: D
    readonly on?: SurfaceListCardActions
    readonly isLoading?: boolean
    readonly children: ReactNode
}

/**
 * Draw a labelled, joined list while the child owns its row identity and count.
 */
export const SurfaceListCard = <D extends SurfaceListCardData>(props: SurfaceListCardProps<D>) => {
    const { props: surfaceProps, on, children, isLoading = false } = props
    const footer = surfaceProps.actionLabel !== undefined && (isLoading || on?.act !== undefined) ? (
        <Button props={{ label: surfaceProps.actionLabel, size: "sm", variant: "primary" }} on={{ press: on?.act }} isLoading={isLoading} />
    ) : surfaceProps.description === undefined ? undefined : (
        <Text props={{ content: surfaceProps.description, size: "xs", tone: "muted" }} isLoading={isLoading} />
    )

    return (
        <GrammarSurfaceListCard
            label={surfaceProps.label}
            fact={surfaceProps.fact}
            labelHidden={surfaceProps.isLabelHidden === true}
            footer={footer}
            depth={surfaceProps.isNested === true ? "nested" : "top"}
            isLoading={isLoading}
            isVerdict={surfaceProps.isVerdict === true}
        >
            {children}
        </GrammarSurfaceListCard>
    )
}
