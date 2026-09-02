import type { ReactNode } from "react"
import { RailDivider } from "@/components/leaves/RailDivider"
import { Button } from "@starci/grammar/common"
import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { PersonalProjectContentMap } from "@/components/blocks/learn/PersonalProjectContentMap"
import {
    personalProjectWorkspaceClassName,
    personalProjectWorkspaceDividerClassName,
    personalProjectWorkspaceMobileBarClassName,
    personalProjectWorkspaceRailClassName,
    personalProjectWorkspaceSurfaceClassName,
} from "./classNames"

/**
 * LAYOUT - `PersonalProjectWorkspaceLayoutBase`: the frame every personal-project surface is read
 * inside.
 *
 * ITS RAIL IS THE COURSE MAP, NOT A SECOND ONE. A capstone roadmap is the same collection the
 * course outline is - ordered groups, ordered destinations inside them, a completion figure on each
 * group and one destination the reader is standing on - so it resolves to the same grammar outcomes
 * and therefore the same renderer. A rail rebuilt here would drift the moment either side changed,
 * and it had: this frame drew flat rows while the outline drew a searchable accordion, and the
 * project's own task titles never reached the reader at all.
 *
 * The milestone is the module and the task is the lesson. That mapping is the whole adaptation;
 * everything below it - disclosure mechanics, the ListBox, the pinned controls, the scroll owner -
 * belongs to the shared panel.
 */

/** Pure workspace frame data and routed surface content. */
export type PersonalProjectWorkspaceLayoutProps = {
    /** The routed surface - the one thing the frame does not decide. */
    readonly surface: ReactNode
    /** Client-only connected roadmap; omission keeps the pure renderer directly testable. */
    readonly roadmap?: ReactNode
    /** The accessible name of the separator the reader drags to rewidth the rail. */
    readonly resizeLabel: string
    /** Compact entry into the project roadmap when the persistent rail is not viable. */
    readonly roadmapLabel?: string
    readonly isRoadmapOpen?: boolean
    readonly onOpenRoadmap?: () => void
    readonly onCloseRoadmap?: () => void
    /** The overview already owns the roadmap; task and result surfaces need the navigation rail. */
    readonly showRoadmapNavigation?: boolean
}

/** Keeps the shared course map mounted around dashboard, task and result surfaces. */
export const PersonalProjectWorkspaceLayoutBase = (props: PersonalProjectWorkspaceLayoutProps) => {
    const showRoadmapNavigation = props.showRoadmapNavigation !== false
    const roadmap = props.roadmap ?? <PersonalProjectContentMap />
    return (
        <div className={personalProjectWorkspaceClassName} data-roadmap-navigation={showRoadmapNavigation ? "visible" : "owned-by-surface"}>
            {showRoadmapNavigation ? <>
                <div className={personalProjectWorkspaceMobileBarClassName}>
                    <Button variant="outline" size="sm" onPress={props.onOpenRoadmap}>{props.roadmapLabel ?? "Project roadmap"}</Button>
                </div>
                <aside className={personalProjectWorkspaceRailClassName}>{props.isRoadmapOpen === true ? null : roadmap}</aside>
                {/* Milestone labels are authored content, so this route rail resizes instead of
                        collapsing them into an icon-only state that cannot preserve their meaning. */}
                <div className={personalProjectWorkspaceDividerClassName}>
                    <RailDivider
                        props={{
                            label: props.resizeLabel,
                            storageKey: "starci.learn.milestoneMap.width",
                            defaultWidth: 320,
                            minWidth: 256,
                            maxWidth: 560,
                        }}
                    />
                </div>
            </> : null}
            <div className={personalProjectWorkspaceSurfaceClassName}>{props.surface}</div>
            {showRoadmapNavigation ? <DrawerBranch isOpen={props.isRoadmapOpen === true} placement="left" title={props.roadmapLabel ?? "Project roadmap"} onDismiss={() => props.onCloseRoadmap?.()}>
                {props.isRoadmapOpen === true ? roadmap : null}
            </DrawerBranch> : null}
        </div>
    )
}
