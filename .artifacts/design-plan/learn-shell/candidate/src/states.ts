import type { LearnShellLayoutProps } from "~candidate/components/layouts/LearnShellLayout/component"
import type { LearnSpineData, LearnSpineRow } from "~candidate/components/blocks/learn/LearnSpine/component"
import fixture from "~candidate/fixtures/spine.json"

/**
 * THE STATE INVENTORY, as data rather than as a table in a document.
 *
 * One entry per rendered state, classified by the owner that can change: the spine is what varies,
 * and the surface beside it is held constant on purpose - a frame compared against two different
 * surfaces proves nothing about the frame.
 *
 * THE COPY LIVES IN A FIXTURE, not in this file. It is the reference product's own Vietnamese, and
 * source authoring here is written in one language; a fixture is data from outside the program and
 * is narrowed at its boundary, which is what the two casts below are.
 */

/** Whether this run draws a viewer who has enrolled. */
export interface SpineOptions {
    /** A trial viewer sees the gated modes locked rather than open. */
    readonly locked: boolean
}

/** One row as the fixture writes it - every field widened to what JSON can carry. */
interface FixtureRow {
    readonly id: string
    readonly label: string
    readonly icon: string
    readonly isCurrent?: boolean
    readonly fact?: string
    readonly gated?: boolean
}

/** The glyph names this spine draws with. A name outside the set is a fixture bug, not a render. */
const ICONS = ["course", "practice", "review", "talents", "explore", "code", "blog", "league", "community"] as const

/** Narrow one glyph name with a check the compiler follows rather than an erasure. */
const iconOf = (name: string): LearnSpineRow["icon"] => {
    const found = ICONS.find((candidate) => candidate === name)
    if (found === undefined) throw new Error(`fixture names a glyph this spine does not draw: ${name}`)
    return found
}

/** JSON widens every string, so the row shape is narrowed once, here. */
const rows = (list: ReadonlyArray<FixtureRow>, options: SpineOptions): ReadonlyArray<LearnSpineRow> =>
    list.map((row) => ({
        id: row.id,
        label: row.label,
        icon: iconOf(row.icon),
        isCurrent: row.isCurrent,
        fact: row.fact,
        isLocked: row.gated === true && options.locked,
    }))

/** The three groups, in the reference product's order. */
const groups = (options: SpineOptions): LearnSpineData["groups"] =>
    fixture.groups.map((group) => ({
        id: group.id,
        label: group.label,
        rows: rows(group.rows, options),
    }))

/** One rendered state: what it is called, why it exists, and the exact props that produce it. */
export interface RenderedState {
    readonly id: string
    readonly note: string
    readonly props: Omit<LearnShellLayoutProps, "surface">
}

/** The bottom bar the phone gets: the course, plus what the routed surface folds in. */
const tabs = fixture.tabs.map((tab) => ({ ...tab, icon: iconOf(tab.icon) }))

/** Every state this candidate renders, in the order a reviewer meets them. */
export const STATES: ReadonlyArray<RenderedState> = [
    {
        id: "spine-enrolled",
        note: "The ordinary case: an enrolled learner, everything open, two facts showing - twenty cards due and rank twelve.",
        props: { props: { tabs, spine: { lockedLabel: fixture.lockedLabel, resume: fixture.resume, groups: groups({ locked: false }) } } },
    },
    {
        id: "spine-trial",
        note: "A trial viewer. The capstone and the mock interview stay VISIBLE with a lock rather than disappearing - the course must not look smaller to the reader who has not paid yet.",
        props: { props: { tabs, spine: { lockedLabel: fixture.lockedLabel, resume: fixture.resume, groups: groups({ locked: true }) } } },
    },
    {
        id: "spine-fresh",
        note: "Enrolled, nothing started. No resume card, because there is nowhere to go back to - furniture that appears with the data teaches a reader the frame changed shape.",
        props: { props: { tabs, spine: { lockedLabel: fixture.lockedLabel, groups: groups({ locked: false }) } } },
    },
    {
        id: "spine-pending",
        note: "The course is still arriving. The group names are known from the route and stay true; only the learner's own facts rest.",
        props: { isLoading: true, props: { tabs, spine: { lockedLabel: fixture.lockedLabel, resume: fixture.resume, groups: groups({ locked: false }) } } },
    },
    {
        id: "spine-phone",
        note: "Below the rail breakpoint. The rail is ABSENT rather than narrower, and the ways into the course pin to the bottom edge - together with the panels the routed surface folds in, because on a phone they have nowhere else to live.",
        props: { props: { tabs, spine: { lockedLabel: fixture.lockedLabel, resume: fixture.resume, groups: groups({ locked: false }) } } },
    },
]
