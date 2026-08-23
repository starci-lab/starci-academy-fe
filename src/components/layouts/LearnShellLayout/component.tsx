import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { LearnSpine } from "@/components/blocks/learn/LearnSpine"
import { Button } from "@/components/leaves/Button"
import { NavLink } from "@/components/leaves/NavLink"
import { Text } from "@/components/leaves/Text"
import type { IconName } from "@/components/leaves/Icon"
import type { ReactNode } from "react"

/**
 * LAYOUT - `LearnShellLayoutBase`: the frame every learn surface is read inside.
 *
 * Target path on materialization: `src/components/layouts/LearnShellLayout/component.tsx`.
 *
 * IT DRAWS THE FRAME AND NOTHING INSIDE IT, and it does NOT open the document's main landmark:
 * that belongs to the route file, and a layout that drew one would put a second main landmark in
 * the document. The spine is a block it renders; the surface is the routed page, handed in as a
 * COMPONENT rather than as `children`. A layout that took children
 * would accept markup already built, whose shape nothing can check - and this frame's whole promise
 * is that every learn surface sits in the same place, at the same measure, beside the same rail.
 *
 * THE SPINE IS A SIBLING OF THE ROUTED MAIN, never a parent. Changing surface repaints the body and
 * leaves the rail standing, which is what lets a learner move between eleven modes without the frame
 * flickering under them - and it is why the rail keeps its own scroll rather than riding the page's.
 */

/** One way into the course from the bottom edge of a phone. */
export interface LearnMobileTab {
    readonly id: string
    /** The already-resolved words. */
    readonly label: string
    /** The meaning drawn ahead of them. */
    readonly icon: IconName
    /** Whether this is the panel already open. */
    readonly isCurrent?: boolean
}

/** The finite mobile panels owned by the learn segment. */
export type LearnMobileView =
    | "today"
    | "course"
    | "progress"
    | "contents"
    | "lesson"
    | "outline"

/** What the frame draws. */
export type LearnShellLayoutData = {
    /**
     * What the bottom bar offers below the rail's breakpoint.
     *
     * THE SURFACE CONTRIBUTES ITS OWN, and that is the whole of this choice: on a phone the
     * reader's contents map and its on-this-page outline have nowhere else to live, so they fold
     * into the same bar the course does. One bar, not a bar plus a drawer plus a second bar -
     * which is what the reference product settled on and why its reader has a tab bar of its own.
     */
    readonly mobileTabs?: ReadonlyArray<LearnMobileTab>
    /** The compact course location that opens the persistent spine as a left drawer. */
    readonly mobileCourseNavigation?: { readonly label: string; readonly currentLabel: string; readonly isOpen: boolean }
    /** Focused work sessions remove course furniture and give the routed surface the full frame. */
    readonly isFullBleed: boolean
}

/** What the frame reports. */
export type LearnShellLayoutActions = {
    readonly openMobileTab?: (id: string) => void
    readonly openCourseNavigation?: () => void
    readonly closeCourseNavigation?: () => void
}

/** Props for {@link LearnShellLayoutBase}. */
export type LearnShellLayoutProps = {
    readonly displayId: string
    readonly mobileTabs?: ReadonlyArray<LearnMobileTab>
    readonly mobileCourseNavigation?: LearnShellLayoutData["mobileCourseNavigation"]
    readonly isFullBleed: boolean
    readonly on?: LearnShellLayoutActions
    /** The routed surface - the one thing the frame does not decide. */
    readonly surface: ReactNode
}

/**
 * Draw the learn frame.
 *
 * @param input - {@link LearnShellLayoutProps}
 */
export const LearnShellLayoutBase = (input: LearnShellLayoutProps) => {
    const mobileTabs = input.mobileTabs ?? []
    const mobileBar = mobileTabs.length === 0 ? {} : {
        bar: defineContractComponent("learn-mobile-tab-bar", {
            tab: mobileTabs.map((tab) => defineLeafComponent("nav-link", { kind: "tab" }, () => (
                <NavLink
                    props={{ label: tab.label, icon: tab.icon, kind: "tab", isCurrent: tab.isCurrent }}
                    on={{ press: () => input.on?.openMobileTab?.(tab.id) }}
                />
            ))),
        }),
    }
    const body = defineContractComponent("learn-routed-body", {
        page: defineLeafComponent("page", {}, () => <>{input.surface}</>),
    })
    const mobileCourseNavigation = input.mobileCourseNavigation === undefined ? undefined : defineContractComponent("learn-mobile-course-map-row", {
        action: defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.mobileCourseNavigation?.label ?? "", variant: "outline", size: "sm", icon: "course" }} on={{ press: input.on?.openCourseNavigation }} />
        )),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: input.mobileCourseNavigation?.currentLabel ?? "", size: "xs", tone: "muted" }} />
        )),
    })
    return (
        <>
            <Tree
                contract="learn-shell-frame"
                render={defineContractComponent("learn-shell-frame", {
                    ...(input.isFullBleed ? {} : { spine: defineContractProjection("learn-course-navigation-rail", () => <LearnSpine displayId={input.displayId} />) }),
                    mobileCourseNavigation,
                    body,
                    ...mobileBar,
                })}
            />
            {input.mobileCourseNavigation === undefined ? null : (
                <DrawerBranch
                    isOpen={input.mobileCourseNavigation.isOpen}
                    placement="left"
                    title={input.mobileCourseNavigation.label}
                    onDismiss={() => input.on?.closeCourseNavigation?.()}
                    contract="learn-course-navigation-drawer-host"
                    render={defineContractComponent("learn-course-navigation-drawer-host", {
                        navigation: defineLeafComponent("page", {}, () => <LearnSpine displayId={input.displayId} presentation="drawer" onNavigate={input.on?.closeCourseNavigation} />),
                    })}
                />
            )}
        </>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "layout", world: "pure", domain: "learn" } as const
