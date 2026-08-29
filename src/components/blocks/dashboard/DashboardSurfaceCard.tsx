import { SurfaceCard as GrammarSurfaceCard } from "@starci/grammar/core"
import type { ReactNode } from "react"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
import { dashboardSurfaceContentClassName } from "./classNames"

type DashboardSurfaceIdentity =
    | { readonly label: string; readonly ariaLabel?: never }
    | { readonly label?: never; readonly ariaLabel: string }

/** Dashboard-owned labels, facts and frame selection for one grammar surface. */
export type DashboardSurfaceCardData = DashboardSurfaceIdentity & {
    readonly fact?: string
    readonly seeMoreLabel?: string
    readonly isFrameless?: boolean
}

/** Content and optional action used to draw one dashboard surface. */
export type DashboardSurfaceCardProps = {
    readonly props: DashboardSurfaceCardData
    readonly on?: { readonly seeMore?: () => void }
    readonly children: ReactNode
    readonly isLoading?: boolean
}

/** Map Dashboard-owned copy and actions into the exact Core surface object. */
export const DashboardSurfaceCard = (props: DashboardSurfaceCardProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    const labelEnd = data.seeMoreLabel !== undefined && props.on?.seeMore !== undefined
        ? <SeeMoreLink props={{ label: data.seeMoreLabel }} on={{ press: props.on.seeMore }} />
        : data.fact === undefined ? undefined : <Text props={{ content: data.fact, size: "sm", tone: "muted" }} isLoading={isLoading} />
    const content = <div className={dashboardSurfaceContentClassName}>{props.children}</div>
    const shared = {
        children: content,
        frame: data.isFrameless === true ? "frameless" as const : "bounded" as const,
        labelEnd,
        state: isLoading ? "pending" as const : "neutral" as const,
    }

    return data.label === undefined
        ? <GrammarSurfaceCard {...shared} ariaLabel={data.ariaLabel} />
        : <GrammarSurfaceCard {...shared} label={data.label} />
}
