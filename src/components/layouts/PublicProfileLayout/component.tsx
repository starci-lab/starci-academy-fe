import type { ComponentType } from "react"
import { SurfaceCard } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { EmptyNotice } from "@starci/grammar/common"
import { ProfileHero } from "@/components/blocks/profile/ProfileHero"
import { ProfileTabsBase, type ProfileTabsData } from "@/components/blocks/profile/ProfileTabs"
import {
    profileBodyClassName,
    profileContentStackClassName,
    profileIdentityClassName,
    profileInsetClassName,
    profileMeasureClassName,
    profileStateClassName,
    profileTabsFrameClassName,
} from "./classNames"

/** Screen-level situations settled by the persistent public-profile layout. */
export type PublicProfileLayoutProps = {
    readonly state: "loading" | "failed" | "not-found" | "locked" | "ready"
    readonly props: {
        readonly notFoundMessage: string
        readonly failedMessage: string
        readonly lockedMessage: string
        readonly lockedDescription: string
        readonly retryLabel: string
        readonly retryPending: boolean
        readonly browseLabel: string
        readonly tabs: ProfileTabsData
    }
    readonly on: {
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
        return <div className={profileStateClassName}><SurfaceCard composition="joined"><EmptyNotice message={props.props.failedMessage} actionLabel={props.props.retryLabel} isActionPending={props.props.retryPending} iconSource={iconSourceFor("retry", "leading")} actionStartContent={<Icon source={iconSourceFor("retry", "chip")} usage="chip" />} onAction={({ act: props.on.retry })?.act} /></SurfaceCard></div>
    }
    if (props.state === "not-found") {
        return <div className={profileStateClassName}><SurfaceCard composition="joined"><EmptyNotice message={props.props.notFoundMessage} actionLabel={props.props.browseLabel} iconSource={iconSourceFor("account", "leading")} actionStartContent={<Icon source={iconSourceFor("explore", "chip")} usage="chip" />} onAction={({ act: props.on.browse })?.act} /></SurfaceCard></div>
    }
    if (props.state === "locked") {
        return <div className={profileMeasureClassName}><div className={profileInsetClassName}><div className={profileContentStackClassName}><section className={profileIdentityClassName} aria-label="Profile identity"><ProfileHero /></section><div className={profileBodyClassName}><SurfaceCard composition="joined"><EmptyNotice message={props.props.lockedMessage} description={props.props.lockedDescription} actionLabel={props.props.browseLabel} iconSource={iconSourceFor("password", "leading")} actionStartContent={<Icon source={iconSourceFor("explore", "chip")} usage="chip" />} onAction={({ act: props.on.browse })?.act} /></SurfaceCard></div></div></div></div>
    }
    return <div className={profileTabsFrameClassName}>
        <ProfileTabsBase props={props.props.tabs} on={{ select: props.on.selectTab }} />
        <div className={profileMeasureClassName}><div className={profileInsetClassName}><div className={profileContentStackClassName}><section className={profileIdentityClassName} aria-label="Profile identity"><ProfileHero /></section><div className={profileBodyClassName}><Body /></div></div></div></div>
    </div>
}
