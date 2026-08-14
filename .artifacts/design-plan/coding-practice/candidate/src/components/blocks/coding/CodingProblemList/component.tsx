import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror - see the note in
// `DomainMasteryGrid`. On materialization these specifiers become `@/`.
import { PressableSurface } from "~candidate/components/branches/PressableSurface"
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
} from "~candidate/components/contracts/props"

/**
 * BLOCK - `CodingProblemList`: the problems of one topic, and which of them are done.
 *
 * Target path: `src/components/blocks/coding/CodingProblemList/component.tsx`.
 *
 * IT REUSES THE MARKED-ROW LIST AND ITS ROW. `marked-row-list` already owns "rows that each carry a
 * completion mark are peers of one joined list", and `task-mark-title-fact-row` already owns the
 * mark-title-fact anatomy. Writing a second list entry would have produced an identical class list,
 * which is exactly what `no-duplicate-entry-shape` refuses.
 *
 * WHAT IT DOES NOT REUSE IS THE `TaskProgressRow` COMPOSITE, and the reason is a fact rather than a
 * preference: that composite renders its own `Tree`, so its rows cannot be PRESSED. A problem row
 * must open the problem, which means focus, keyboard and a pressed state - link semantics the
 * composite does not carry. The list entry was widened to admit the row CONTRACT so the same
 * anatomy can be wrapped in `PressableSurface` instead.
 *
 * THE MARK IS BINARY AND THE FACT CARRIES THE REST. The server splits `solvedProblemIds` from
 * `attemptedProblemIds`, so three situations exist - solved, attempted, untouched - and the icon
 * vocabulary holds two that mean progress. Rather than press a third glyph into service and have it
 * mean something it does not, the tick says solved-or-not and the quiet fact beside it says how many
 * attempts a started problem has taken. That choice is on this revision's open-questions list.
 */

/** The situations this list can be in. */
export type CodingProblemListState = "pending" | "ready" | "empty" | "all-solved"

/** One problem, as the list draws it. */
export type CodingProblemRow = {
    /** Stable identity; also the route segment. */
    readonly slug: string
    /** The already-resolved problem title. */
    readonly title: string
    /** Difficulty, points and - for a started problem - its attempt count, already worded. */
    readonly fact: string
    /** Whether this viewer has an accepted submission for it. */
    readonly isSolved: boolean
    /** The already-resolved accessible name for the row. */
    readonly label: string
}

/** What the list draws. */
export type CodingProblemListData = {
    /** The problems, in the order the topic declares them. */
    readonly problems?: ReadonlyArray<CodingProblemRow>
    /** The sentence shown when there is nothing to list, or nothing left to do. */
    readonly noticeMessage?: string
    /** Its supporting sentence. */
    readonly noticeDescription?: string
    /** The way onward from a finished topic. */
    readonly noticeActionLabel?: string
}

/** What the list reports. */
export type CodingProblemListActions = {
    /** Called with the slug of the problem the reader opened. */
    readonly open?: (slug: string) => void
    /** Called from the notice - go back to the topics. */
    readonly recover?: () => void
}

/** Props for {@link _CodingProblemList}. */
export type CodingProblemListProps =
    BlockProps<CodingProblemListState, CodingProblemListData> & {
        readonly on?: CodingProblemListActions
    }

/** How many rows rest while the page is in flight. */
const RESTING_COUNT = 5

/**
 * Draw the topic's problems.
 *
 * @param input - {@link CodingProblemListProps}
 */
export const _CodingProblemList = (input: CodingProblemListProps) => {
    const isLoading = input.state === "pending"
    const showsNotice = input.state === "empty" || input.state === "all-solved"

    if (showsNotice) {
        return (
            <EmptyNotice
                props={{
                    icon: input.state === "all-solved" ? "complete" : "practice",
                    message: input.props.noticeMessage ?? "",
                    description: input.props.noticeDescription,
                    actionLabel: input.props.noticeActionLabel,
                }}
                on={{ act: input.on?.recover }}
            />
        )
    }

    const resting: ReadonlyArray<CodingProblemRow> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({
            slug: `resting-${index + 1}`,
            title: "",
            fact: "",
            isSolved: false,
            label: "",
        }),
    )

    const problems = isLoading ? resting : (input.props.problems ?? [])

    return (
        <Tree
            contract="marked-row-list"
            render={defineContractComponent("marked-row-list", {
                row: problems.map((problem) => defineContractProjection("task-mark-title-fact-row", () => (
                    <PressableSurface
                        contract="task-mark-title-fact-row"
                        label={problem.label}
                        press={() => input.on?.open?.(problem.slug)}
                        hover="surface"
                        disabled={isLoading}
                        render={defineContractComponent("task-mark-title-fact-row", {
                            mark: defineLeafComponent("icon", {}, () => (
                                <Icon
                                    props={{
                                        name: problem.isSolved ? "complete" : "pending",
                                        role: "leading",
                                    }}
                                    isLoading={isLoading}
                                />
                            )),
                            title: defineLeafComponent("text", {}, () => (
                                <Text props={{ content: problem.title }} isLoading={isLoading} />
                            )),
                            fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text
                                    props={{ content: problem.fact, size: "xs", tone: "muted" }}
                                    isLoading={isLoading}
                                />
                            )),
                        })}
                    />
                ))),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "coding" } as const
