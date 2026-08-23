import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { CollapsibleRail } from "@/components/branches/CollapsibleRail"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { ScrollViewport } from "@/components/branches/ScrollViewport"
import { Tree } from "@/components/branches/Tree"
import { IconButton } from "@/components/leaves/IconButton"
import type { IconName } from "@/components/leaves/Icon"
import { SelectionList, type SelectionListItem } from "@/components/leaves/SelectionList"
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

const selectionItemsOf = (
    rows: ReadonlyArray<LearnSpineRow>,
    lockedLabel: string,
): ReadonlyArray<SelectionListItem> => rows.map((row) => ({
    id: row.id,
    textValue: row.label,
    title: row.label,
    icon: row.icon,
    badge: row.isLocked === true ? lockedLabel : row.fact,
    badgeTone: row.isLocked === true ? "warning" : row.fact === undefined ? undefined : "accent",
    isCurrent: row.isCurrent,
}))

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
        toggle: defineContractComponent("learn-course-rail-collapse-toggle-collapsed", {
            control: defineLeafComponent("icon-button", {}, () => (
                <IconButton
                    props={{ icon: "collapseRail", label: props.expandLabel, isActive: true }}
                    on={{ press: on?.toggleCollapse }}
                />
            )),
        }),
        home: defineContractComponent("learn-course-home-navigation-row", {
            list: defineLeafComponent("selection-list", { variant: "navigation-collapsed" }, () => (
                <SelectionList
                    props={{
                        label: props.home.label,
                        items: selectionItemsOf([props.home], props.lockedLabel),
                        selectedKey: props.home.isCurrent === true ? props.home.id : undefined,
                        variant: "navigation-collapsed",
                    }}
                    on={{ activate: on?.openRow }}
                />
            )),
        }),
        groups: defineContractProjection("learn-course-navigation-groups-scroll", () => (
            <ScrollViewport
                boundary="learn-navigation-groups"
                render={defineContractComponent("learn-course-navigation-groups-scroll", {
                    group: props.groups.map((group) => defineContractComponent("learn-nav-group-collapsed", {
                        list: defineLeafComponent("selection-list", { variant: "navigation-collapsed" }, () => (
                            <SelectionList
                                props={{
                                    label: group.label,
                                    items: selectionItemsOf(group.rows, props.lockedLabel),
                                    selectedKey: group.rows.find((row) => row.isCurrent === true)?.id,
                                    variant: "navigation-collapsed",
                                }}
                                on={{ activate: on?.openRow }}
                            />
                        )),
                    })),
                })}
            />
        )),
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
                list: defineLeafComponent("selection-list", { variant: "navigation" }, () => (
                    <SelectionList
                        props={{
                            label: props.home.label,
                            items: selectionItemsOf([props.home], lockedLabel),
                            selectedKey: props.home.isCurrent === true ? props.home.id : undefined,
                            variant: "navigation",
                        }}
                        on={{ activate: on?.openRow }}
                    />
                )),
            }),
            groups: defineContractProjection("learn-course-navigation-groups-scroll", () => (
                <ScrollViewport
                    boundary="learn-navigation-groups"
                    render={defineContractComponent("learn-course-navigation-groups-scroll", {
                        group: props.groups.map((group) => defineContractComponent("learn-nav-group", {
                            label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text props={{ content: group.label, size: "xs" }} />
                            )),
                            list: defineLeafComponent("selection-list", { variant: "navigation" }, () => (
                                <SelectionList
                                    props={{
                                        label: group.label,
                                        items: selectionItemsOf(group.rows, lockedLabel),
                                        selectedKey: group.rows.find((row) => row.isCurrent === true)?.id,
                                        variant: "navigation",
                                    }}
                                    on={{ activate: on?.openRow }}
                                />
                            )),
                        })),
                    })}
                />
            )),
        })
    )
}

/** Build the same labelled course destinations for the narrow left drawer, without rail controls. */
export const learnSpineDrawer = ({ props, on, isLoading = false }: LearnSpineProps) => {
    const resume = props.resume
    return defineContractComponent("learn-course-navigation-drawer", {
        ...(resume === undefined ? {} : {
            resume: defineContractProjection("learn-resume-card", () => (
                <PressableSurface
                    contract="learn-resume-card"
                    label={resume.title}
                    press={on?.resume}
                    isRaised
                    render={defineContractComponent("learn-resume-card", {
                        label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: resume.label, size: "xs" }} />),
                        progress: defineCompositeComponent("labelled-progress-row", {}, () => <LabelledProgressRow props={{ id: "resume", title: resume.title, percent: resume.percent, percentText: resume.percentText }} isLoading={isLoading} />),
                    })}
                />
            )),
        }),
        home: defineContractComponent("learn-course-home-navigation-row", {
            list: defineLeafComponent("selection-list", { variant: "navigation" }, () => <SelectionList props={{ label: props.home.label, items: selectionItemsOf([props.home], props.lockedLabel), selectedKey: props.home.isCurrent === true ? props.home.id : undefined, variant: "navigation" }} on={{ activate: on?.openRow }} />),
        }),
        groups: defineContractProjection("learn-course-navigation-groups-scroll", () => (
            <ScrollViewport boundary="learn-navigation-groups" render={defineContractComponent("learn-course-navigation-groups-scroll", {
                group: props.groups.map((group) => defineContractComponent("learn-nav-group", {
                    label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: group.label, size: "xs" }} />),
                    list: defineLeafComponent("selection-list", { variant: "navigation" }, () => <SelectionList props={{ label: group.label, items: selectionItemsOf(group.rows, props.lockedLabel), selectedKey: group.rows.find((row) => row.isCurrent === true)?.id, variant: "navigation" }} on={{ activate: on?.openRow }} />),
                })),
            })} />
        )),
    })
}

/** Complete pure spine surface, including the persistent rail mechanics. */
export type LearnSpineBaseProps = LearnSpineProps & { readonly isCollapsed: boolean; readonly presentation?: "rail" | "drawer" }

/** Render the expanded/collapsed spine through one stable rail host. */
export const LearnSpineBase = (input: LearnSpineBaseProps) => input.presentation === "drawer"
    ? <Tree contract="learn-course-navigation-drawer" render={learnSpineDrawer(input)} />
    : <CollapsibleRail
        isCollapsed={input.isCollapsed}
        expanded={learnSpine({ props: input.props, on: input.on })}
        collapsed={learnSpineCollapsed({ props: input.props, on: input.on })}
    />

/** Pure collapsed spine renderer retained for direct contract fixtures. */
export const LearnSpineCollapsedBase = (input: LearnSpineProps) => learnSpineCollapsed(input)

/** Source-level ownership marker. */
export const meta = { shape: "block", world: "pure", domain: "learn" } as const
