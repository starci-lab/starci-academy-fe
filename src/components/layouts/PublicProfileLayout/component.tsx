import type { ComponentType } from "react"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ProfileHero } from "@/components/blocks/profile/ProfileHero"
import { ProfileTabsBase, type ProfileTabsData } from "@/components/blocks/profile/ProfileTabs"
import { profileInsetClassName, profileMeasureClassName, profileRailClassName, profileSplitClassName, profileTabsFrameClassName } from "./classNames"

/** Screen-level situations settled by the persistent public-profile layout. */
export type PublicProfileLayoutProps = {
    readonly state: "loading" | "failed" | "not-found" | "locked" | "ready"
    readonly props: {
        readonly notFoundMessage: string
        readonly failedMessage: string
        readonly lockedMessage: string
        readonly lockedDescription: string
        readonly homeLabel: string
        readonly retryLabel: string
        readonly browseLabel: string
        readonly tabs: ProfileTabsData
    }
    readonly on: {
        readonly home: () => void
        readonly browse: () => void
        readonly retry: () => void
        readonly selectTab: (key: string) => void
    }
    readonly body: ComponentType
}

/** Draw persistent profile chrome and its screen-level alternatives. */
export const PublicProfileLayoutBase = (props: PublicProfileLayoutProps) => {
    const Body = props.body
    if (props.state === "failed") {
        return <SurfaceCard><EmptyNotice props={{ icon: "retry", message: props.props.failedMessage, actionLabel: props.props.retryLabel }} on={{ act: props.on.retry }} /></SurfaceCard>
    }
    if (props.state === "not-found") {
        return <SurfaceCard><EmptyNotice props={{ icon: "account", message: props.props.notFoundMessage, actionLabel: props.props.homeLabel }} on={{ act: props.on.home }} /></SurfaceCard>
    }
    if (props.state === "locked") {
        return <div className={profileMeasureClassName}><div className={profileInsetClassName}><div className={profileSplitClassName}><aside className={profileRailClassName}><ProfileHero /></aside><main><SurfaceCard><EmptyNotice props={{ icon: "password", message: props.props.lockedMessage, description: props.props.lockedDescription, actionLabel: props.props.browseLabel }} on={{ act: props.on.browse }} /></SurfaceCard></main></div></div></div>
    }
    return <div className={profileTabsFrameClassName}>
        <ProfileTabsBase props={props.props.tabs} on={{ select: props.on.selectTab }} />
        <div className={profileMeasureClassName}><div className={profileInsetClassName}><div className={profileSplitClassName}><aside className={profileRailClassName}><ProfileHero /></aside><main><Body /></main></div></div></div>
    </div>
}
