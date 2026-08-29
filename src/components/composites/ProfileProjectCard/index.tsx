import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { Badge } from "@/components/leaves/Badge"
import { Text } from "@/components/leaves/Text"
import { profileProjectCardClassName, profileProjectTechRunClassName } from "./classNames"

/** Resolved showcase facts for one pinned project. */
export type ProfileProjectCardData = {
    readonly title?: string
    readonly description?: string
    readonly kind?: string
    readonly technologies: ReadonlyArray<string>
    readonly verified?: boolean
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
    const content = <div className={profileProjectCardClassName}><Badge props={{ content: data.verified ? "Verified by StarCi" : data.kind ?? "External", tone: data.verified ? "success" : "neutral" }} isLoading={isLoading} /><Text props={{ content: data.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />{data.description === undefined ? null : <Text props={{ content: data.description, size: "xs" }} isLoading={isLoading} />}{data.technologies.length === 0 ? null : <div className={profileProjectTechRunClassName}>{data.technologies.map((technology) => <Badge key={technology} props={{ content: technology }} isLoading={isLoading} />)}</div>}</div>
    /*
     * ONE GRID, ONE KIND OF CARD. A project with a link is pressable and a project without one is
     * not, but both are the same object standing on the same ground - so the surface comes from the
     * same branch either way and only the press target differs.
     */
    return on?.press === undefined
        ? <SurfaceCard>{content}</SurfaceCard>
        : <PressableSurface label={data.title ?? "Project"} press={on.press} isRaised>{content}</PressableSurface>
}
