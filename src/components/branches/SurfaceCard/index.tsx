import type { ReactNode } from "react"
import { Card, ScrollShadow } from "@heroui/react"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { getSurfaceCardClassName, getSurfaceContentClassName, surfaceContentClassName, surfaceLabelClassName, surfaceClassName, surfaceScrollableContentClassName } from "./classNames"

/** Resolved copy and presentation options for the surface. */
export type SurfaceCardData = {
    readonly label?: string
    readonly fact?: string
    readonly seeMoreLabel?: string
    readonly isFrameless?: boolean
    readonly inset?: "none" | "compact"
    readonly measure?: "form" | "formCompact"
    readonly isScrollable?: boolean
}
/** Actions available from the surface label row. */
export type SurfaceCardActions = { readonly seeMore?: () => void }
/** Traditional React children API for a surface card. */
export type SurfaceCardProps = { readonly props?: SurfaceCardData; readonly on?: SurfaceCardActions; readonly children: ReactNode; readonly isLoading?: boolean }

/** Draw one labelled or frameless surface around ordinary React children. */
export const SurfaceCard = (props: SurfaceCardProps) => {
    const data = props.props ?? {}
    const on = props.on
    const children = props.children
    const isLoading = props.isLoading ?? false
    const grammarState = isLoading ? "pending" : "neutral"
    const hasSeeMore = data.seeMoreLabel !== undefined && on?.seeMore !== undefined
    const end = hasSeeMore ? <SeeMoreLink props={{ label: data.seeMoreLabel }} on={{ press: on.seeMore }} /> : data.fact === undefined ? null : <Text props={{ content: data.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />
    const boundedContent = data.isScrollable === true
        ? <ScrollShadow className={surfaceScrollableContentClassName} orientation="vertical">{children}</ScrollShadow>
        : <Card.Content className={getSurfaceContentClassName(data.inset)}>{children}</Card.Content>
    const surface = data.isFrameless === true
        ? <div className={surfaceClassName} data-grammar-frame="frameless" data-grammar-state={grammarState} data-grammar-treatment={isLoading ? "pending" : "quiet"}><div className={surfaceContentClassName}>{children}</div></div>
        : <Card className={surfaceClassName}>{boundedContent}</Card>
    if (data.label === undefined) return <div className={getSurfaceCardClassName(data.measure)}>{surface}</div>
    return <div className={getSurfaceCardClassName(data.measure)}><div className={surfaceLabelClassName}><Heading props={{ content: data.label, level: 3 }} />{end}</div>{surface}</div>
}
