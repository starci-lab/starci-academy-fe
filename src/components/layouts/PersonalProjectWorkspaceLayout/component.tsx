import type { ReactNode } from "react"
import { Tree } from "@/components/branches/Tree"
import { RailDivider } from "@/components/leaves/RailDivider"
import { PersonalProjectContentMap } from "@/components/blocks/learn/PersonalProjectContentMap"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"

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

/** Pure workspace frame data and routed surface contract. */
export type PersonalProjectWorkspaceLayoutProps = {
    /** The routed surface - the one thing the frame does not decide. */
    readonly surface: ReactNode
    /** The accessible name of the separator the reader drags to rewidth the rail. */
    readonly resizeLabel: string
}

/** Keeps the shared course map mounted around dashboard, task and result surfaces. */
export const PersonalProjectWorkspaceLayoutBase = (input: PersonalProjectWorkspaceLayoutProps) => (
    <Tree
        contract="personal-project-workspace-frame"
        render={defineContractComponent("personal-project-workspace-frame", {
            rail: defineContractComponent("personal-project-milestone-rail", {
                panel: defineContractProjection("content-map-panel", () => (
                    <PersonalProjectContentMap />
                )),
            }),
            // Milestone labels are authored content, so this route rail resizes instead of
            // collapsing them into an icon-only state that cannot preserve their meaning.
            divider: defineLeafComponent("rail-divider", {}, () => (
                <RailDivider
                    props={{
                        label: input.resizeLabel,
                        storageKey: "starci.learn.milestoneMap.width",
                        defaultWidth: 320,
                        minWidth: 256,
                        maxWidth: 560,
                    }}
                />
            )),
            body: defineContractComponent("learn-routed-body", {
                page: defineLeafComponent("page", {}, () => <>{input.surface}</>),
            }),
        })}
    />
)

/** Architectural identity for the pure personal-project layout twin. */
export const meta = { shape: "layout", world: "pure", domain: "learn" } as const
