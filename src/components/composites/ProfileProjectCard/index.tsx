import { SurfaceCard } from "@starci/grammar/common"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { profileProjectActionClassName, profileProjectCardClassName, profileProjectHeaderClassName, profileProjectTechRunClassName } from "./classNames"

/** Resolved showcase facts for one pinned project. */
export type ProfileProjectCardData = {
    readonly title?: string
    readonly description?: string
    readonly kind?: string
    readonly technologies: ReadonlyArray<string>
    readonly verified?: boolean
    readonly actionLabel?: string
}

/** Optional external-project outcome reported by a pressable showcase. */
export type ProfileProjectCardActions = { readonly press?: () => void }
/** Closed composite input for one project showcase tile. */
export type ProfileProjectCardProps = { readonly props: ProfileProjectCardData; readonly on?: ProfileProjectCardActions; readonly isLoading?: boolean }

/** One pinned-project tile; unlike a proof row, its tags and verification form a bounded showcase. */
export const ProfileProjectCard = (props: ProfileProjectCardProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const badge = data.verified ? "StarCi ✓" : data.kind
    const content = <div className={profileProjectCardClassName}><div className={profileProjectHeaderClassName}>{badge ? <Badge tone={data.verified ? "success" : "neutral"} isSkeleton={isLoading}>{badge}</Badge> : <span />}{on?.press === undefined ? null : <Icon source={iconSourceFor("explore", "chip")} usage={"chip"} />}</div><Text size={"md"} weight={"semibold"} isSkeleton={isLoading}>{data.title}</Text>{data.description === undefined ? null : <Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{data.description}</Text>}{data.technologies.length === 0 ? null : <div className={profileProjectTechRunClassName}>{data.technologies.map((technology) => <Badge key={technology} isSkeleton={isLoading}>{technology}</Badge>)}</div>}{on?.press === undefined ? null : <div className={profileProjectActionClassName}><Text size={"sm"} tone={"accent"} weight={"semibold"} isSkeleton={isLoading}>{data.actionLabel}</Text></div>}</div>
    /*
     * ONE GRID, ONE KIND OF CARD. A project with a link is pressable and a project without one is
     * not, but both are the same object standing on the same ground - so the surface comes from the
     * same branch either way and only the press target differs.
     */
    return on?.press === undefined
        ? <SurfaceCard composition="joined">{content}</SurfaceCard>
        : <PressableSurface label={data.title ?? "Project"} press={on.press} isRaised>{content}</PressableSurface>
}
