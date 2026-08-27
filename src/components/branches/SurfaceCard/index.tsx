import type { ReactNode } from "react"
import { Card } from "@heroui/react"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { surfaceCardClassName, surfaceContentClassName, surfaceLabelClassName, surfaceClassName } from "./classNames"

/** Resolved copy and presentation options for the surface. */
export type SurfaceCardData = { readonly label?: string; readonly fact?: string; readonly seeMoreLabel?: string; readonly isFrameless?: boolean }
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
    const surface = data.isFrameless === true
        ? <div className={surfaceClassName} data-grammar-frame="frameless" data-grammar-state={grammarState} data-grammar-treatment={isLoading ? "pending" : "quiet"}><div className={surfaceContentClassName}>{children}</div></div>
        : <Card className={surfaceClassName}><Card.Content className={surfaceContentClassName}>{children}</Card.Content></Card>
    if (data.label === undefined) return <div className={surfaceCardClassName}>{surface}</div>
    return <div className={surfaceCardClassName}><div className={surfaceLabelClassName}><Heading props={{ content: data.label, level: 3 }} />{end}</div>{surface}</div>
}
