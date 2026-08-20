import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { NavLink } from "@/components/leaves/NavLink"
import { IconButton } from "@/components/leaves/IconButton"
import type { IconName } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"

/**
 * BLOCK - `LearnSpine`: everything a learner can do in this course, and where they left off.
 *
 * Target path on materialization: `src/components/blocks/learn/LearnSpine/component.tsx`.
 *
 * DIRECTION A, which is the parity option: three named groups, in the reference product's own order
 * and its own words. A returning learner navigates by those names, so renaming them would be a
 * change nobody asked for wearing a redesign.
 *
 * A LOCKED MODE STAYS VISIBLE. It carries a lock at the end of its row rather than disappearing:
 * a learner who cannot open the capstone yet still needs to know the course HAS one, and hiding it
 * makes the course look smaller than it is to exactly the reader who has not paid.
 *
 * RESUME IS A CARD, NOT A ROW. It answers "where was I", which is a different question from "where
 * can I go" - a row would file it among the places instead of above them. It is the only thing in
 * the rail that acts rather than navigates, so it is the only thing wearing a surface.
 *
 * A GROUP NAME NEVER RESTS. It comes from the route rather than from the course, so it is already
 * true while the learner's own figures are still arriving - resting it would claim the frame does
 * not yet know what it is.
 *
 * A LOCKED ROW ENDS IN THE WORD, NOT A GLYPH. The icon set has a closed lock, but its MEANING there
 * is , and one name for two meanings costs exactly what it sounds like: the day a password
 * field takes a key glyph, every locked row is quietly relabelled. Adding a  meaning is the
 * right fix and it belongs to the icon leaf, not to this block - so until that lands the row says the
 * word, which needs no new vocabulary and is unambiguous at a glance.
 *
 * THE TRAILING SLOT HOLDS ONE FACT AND NEVER AN ACTION - a due count, a rank, a lock. It reads as
 * part of the row's sentence, and a control there gets pressed by somebody who meant to read it.
 */

/** One destination in the spine. */
export type LearnSpineRow = {
    readonly id: string
    /** The already-resolved words. */
    readonly label: string
    /** The meaning drawn ahead of them. */
    readonly icon: IconName
    /** Whether this is the surface the learner is on. */
    readonly isCurrent?: boolean
    /** A supporting fact at the far end - a due count, a rank. Never an action. */
    readonly fact?: string
    /** Whether the mode is closed until the learner enrols. */
    readonly isLocked?: boolean
}

/** One named run of destinations. */
export type LearnSpineGroup = {
    readonly id: string
    /** The already-resolved group name. */
    readonly label: string
    readonly rows: ReadonlyArray<LearnSpineRow>
}

/** What the spine draws. */
export type LearnSpineData = {
    /** The already-resolved word a locked row ends with. */
    readonly lockedLabel: string
    /** The accessible name of the control that compacts the rail. */
    readonly collapseLabel: string
    /** The accessible name of the control that restores rail labels. */
    readonly expandLabel: string
    /** Whether the rail currently shows icons without visible labels. */
    readonly isCollapsed: boolean
    /** The bare course destination, independent from every labelled ListBox section. */
    readonly home: LearnSpineRow
    /** Where the learner left off, when there is somewhere to go back to. */
    readonly resume?: {
        readonly label: string
        readonly title: string
        readonly percent: number
        readonly percentText: string
    }
    readonly groups: ReadonlyArray<LearnSpineGroup>
}

/** What the spine reports. */
export type LearnSpineActions = {
    readonly openRow?: (id: string) => void
    readonly resume?: () => void
    readonly toggleCollapse?: () => void
}

/** Props for {@link learnSpine}. */
export type LearnSpineProps = {
    readonly props: LearnSpineData
    readonly on?: LearnSpineActions
    readonly isLoading?: boolean
}

/**
 * Build the spine as the frame's own child.
 *
 * It returns contract content rather than an element, because the frame renders it: a block that
 * opened its own `Tree` would draw a second node around a node the frame already draws.
 *
 * @param input - {@link LearnSpineProps}
 */
export const learnSpineCollapsed = ({ props, on }: LearnSpineProps) => (
    defineContractComponent("learn-course-navigation-rail-collapsed", {
        toggle: defineContractComponent("learn-course-rail-collapse-toggle", {
            control: defineLeafComponent("icon-button", {}, () => (
                <IconButton
                    props={{ icon: "collapseRail", label: props.expandLabel, isActive: true }}
                    on={{ press: on?.toggleCollapse }}
                />
            )),
        }),
        home: defineContractComponent("learn-course-home-navigation-row", {
            link: defineLeafComponent("nav-link", { kind: "route" }, () => (
                <NavLink
                    props={{ label: props.home.label, icon: props.home.icon, kind: "route", isCurrent: props.home.isCurrent, showLabel: false }}
                    on={{ press: () => on?.openRow?.(props.home.id) }}
                />
            )),
        }),
        group: props.groups.map((group) => defineContractComponent("learn-nav-group-collapsed", {
            row: group.rows.map((row) => defineContractComponent("learn-nav-row-collapsed", {
                link: defineLeafComponent("nav-link", { kind: "route" }, () => (
                    <NavLink
                        props={{ label: row.label, icon: row.icon, kind: "route", isCurrent: row.isCurrent, showLabel: false }}
                        on={{ press: () => on?.openRow?.(row.id) }}
                    />
                )),
            })),
        })),
    })
)

/**
 * Build the labelled course spine as the frame's expanded child.
 *
 * @param input - {@link LearnSpineProps}
 */
export const learnSpine = ({ props, on, isLoading = false }: LearnSpineProps) => {
    const lockedLabel = props.lockedLabel
    const resume = props.resume
    return (
        defineContractComponent("learn-course-navigation-rail", {
            toggle: defineContractComponent("learn-course-rail-collapse-toggle", {
                control: defineLeafComponent("icon-button", {}, () => (
                    <IconButton
                        props={{ icon: "collapseRail", label: props.collapseLabel }}
                        on={{ press: on?.toggleCollapse }}
                    />
                )),
            }),
            ...(resume === undefined ? {} : {
                resume: defineContractProjection("learn-resume-card", () => (
                    <PressableSurface
                        contract="learn-resume-card"
                        label={resume.title}
                        press={on?.resume}
                        isRaised
                        render={defineContractComponent("learn-resume-card", {
                            label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text props={{ content: resume.label, size: "xs" }} />
                            )),
                            progress: defineCompositeComponent("labelled-progress-row", {}, () => (
                                <LabelledProgressRow
                                    props={{
                                        id: "resume",
                                        title: resume.title,
                                        percent: resume.percent,
                                        percentText: resume.percentText,
                                    }}
                                    isLoading={isLoading}
                                />
                            )),
                        })}
                    />
                )),
            }),
            home: defineContractComponent("learn-course-home-navigation-row", {
                link: defineLeafComponent("nav-link", { kind: "route" }, () => (
                    <NavLink
                        props={{ label: props.home.label, icon: props.home.icon, kind: "route", isCurrent: props.home.isCurrent }}
                        on={{ press: () => on?.openRow?.(props.home.id) }}
                    />
                )),
            }),
            group: props.groups.map((group) => defineContractComponent("learn-nav-group", {
                label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: group.label, size: "xs" }} />
                )),
                row: group.rows.map((row) => defineContractComponent("learn-nav-row", {
                    link: defineLeafComponent("nav-link", { kind: "route" }, () => (
                        <NavLink
                            props={{ label: row.label, icon: row.icon, kind: "route", isCurrent: row.isCurrent }}
                            on={{ press: () => on?.openRow?.(row.id) }}
                        />
                    )),
                    ...(row.isLocked === true ? {
                        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: lockedLabel, size: "xs" }} />
                        )),
                    } : row.fact === undefined ? {} : {
                        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: row.fact, size: "xs" }} />
                        )),
                    }),
                })),
            })),
        })
    )
}

/** Source-level ownership marker. */
export const meta = { shape: "block", world: "pure", domain: "learn" } as const
