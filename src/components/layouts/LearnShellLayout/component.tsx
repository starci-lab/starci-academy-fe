import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { learnSpine, type LearnSpineActions, type LearnSpineData } from "@/components/blocks/learn/LearnSpine/component"
import { NavLink } from "@/components/leaves/NavLink"
import type { IconName } from "@/components/leaves/Icon"
import type { ReactNode } from "react"

/**
 * LAYOUT - `_LearnShellLayout`: the frame every learn surface is read inside.
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
    /** Everything the learner can do in this course. */
    readonly spine: LearnSpineData
    /**
     * What the bottom bar offers below the rail's breakpoint.
     *
     * THE SURFACE CONTRIBUTES ITS OWN, and that is the whole of this choice: on a phone the
     * reader's contents map and its on-this-page outline have nowhere else to live, so they fold
     * into the same bar the course does. One bar, not a bar plus a drawer plus a second bar -
     * which is what the reference product settled on and why its reader has a tab bar of its own.
     */
    readonly mobileTabs?: ReadonlyArray<LearnMobileTab>
    /** Focused work sessions remove course furniture and give the routed surface the full frame. */
    readonly isFullBleed: boolean
}

/** What the frame reports. */
export type LearnShellLayoutActions = LearnSpineActions & {
    readonly openMobileTab?: (id: string) => void
}

/** Props for {@link _LearnShellLayout}. */
export type LearnShellLayoutProps = {
    readonly props: LearnShellLayoutData
    readonly on?: LearnShellLayoutActions
    readonly isLoading?: boolean
    /** The routed surface - the one thing the frame does not decide. */
    readonly surface: ReactNode
}

/**
 * Draw the learn frame.
 *
 * @param input - {@link LearnShellLayoutProps}
 */
export const _LearnShellLayout = (input: LearnShellLayoutProps) => (
    <Tree
        contract="learn-shell-frame"
        render={defineContractComponent("learn-shell-frame", {
            ...(input.props.isFullBleed ? {} : {
                spine: learnSpine({ props: input.props.spine, on: input.on, isLoading: input.isLoading ?? false }),
            }),
            body: defineLeafComponent("page", {}, () => <>{input.surface}</>),
            ...((input.props.mobileTabs ?? []).length === 0 ? {} : {
                bar: defineContractComponent("learn-mobile-tab-bar", {
                    tab: (input.props.mobileTabs ?? []).map((tab) => defineLeafComponent("nav-link", { kind: "tab" }, () => (
                        <NavLink
                            props={{ label: tab.label, icon: tab.icon, kind: "tab", isCurrent: tab.isCurrent }}
                            on={{ press: () => input.on?.openMobileTab?.(tab.id) }}
                        />
                    ))),
                }),
            }),
        })}
    />
)

/** Source-level tier marker. */
export const meta = { shape: "layout", world: "pure", domain: "learn" } as const
