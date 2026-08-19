import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror, and ONLY because `ContractKey` is
// closed over the table on disk: the entries this case proposes are not in it yet. The mirror is
// `src/components/contracts/*` and the branches this file uses, copied verbatim with their imports
// repointed. On materialization these specifiers become `@/` and the body is unchanged.
import { PressableSurface } from "~candidate/components/branches/PressableSurface"
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
} from "~candidate/components/contracts/props"

/**
 * BLOCK - `DomainMasteryGrid`: where this learner is strong and where they are not.
 *
 * Target path: `src/components/blocks/coding/DomainMasteryGrid/component.tsx`.
 *
 * IT IS THE DIRECTION'S WHOLE ARGUMENT. A flat catalog makes the learner choose between a hundred
 * and twenty problems; this makes them choose between twenty topics they can see their own standing
 * in. The server agrees: `CodingProblemEntity.domain` documents itself as the field the problem
 * list is grouped by.
 *
 * IT COMPOSES TWO ANSWERS AND THE SEAM IS DELIBERATE. `codingDomainSummary` gives the catalog size
 * per domain and `myCodingProgress.byDomain` gives this viewer's solved count. Neither knows about
 * the other, and a domain the learner has never solved in is ABSENT from the second - a GROUP BY
 * produces no row for an empty group. So the twenty are walked from the ENUM and the solved count
 * defaults to zero, rather than the server being asked to keep a second copy of the enum in step.
 *
 * A GUEST SEES THE TOPICS AND NOT THEMSELVES. Mastery is per-viewer, so without a session the cards
 * carry the totals and no personal figure. Zero would be a claim; absence is the truth.
 */

/** The situations this grid can be in. */
export type DomainMasteryGridState = "pending" | "ready" | "guest" | "progress-failed"

/** One topic, as the grid draws it. */
export type DomainMastery = {
    /** The domain enum value, which is also the route segment. */
    readonly id: string
    /** The already-resolved topic name. */
    readonly name: string
    /** How many problems the topic holds. */
    readonly total: number
    /** How many this viewer has solved. Absent when there is no viewer to count for. */
    readonly solved?: number
    /** The already-resolved solved-of-total line, e.g. "9 / 12 problems". */
    readonly countLabel: string
    /** The already-resolved accessible name for the whole card. */
    readonly label: string
    /** The already-resolved accessible name for the meter. */
    readonly meterLabel: string
}

/** What the grid draws. */
export type DomainMasteryGridData = {
    /** The topics, in the order they should be read. */
    readonly domains?: ReadonlyArray<DomainMastery>
}

/** What choosing a topic reports. */
export type DomainMasteryGridActions = {
    /** Called with the domain id the reader chose. */
    readonly open?: (id: string) => void
}

/** Props for {@link DomainMasteryGridBase}. */
export type DomainMasteryGridProps =
    BlockProps<DomainMasteryGridState, DomainMasteryGridData> & {
        readonly on?: DomainMasteryGridActions
    }

/** How many cards rest while the two answers are in flight. */
const RESTING_COUNT = 6

/**
 * Draw the topic field.
 *
 * @param input - {@link DomainMasteryGridBase}
 */
export const DomainMasteryGridBase = (input: DomainMasteryGridProps) => {
    const isLoading = input.state === "pending"
    const showsFigures = input.state === "ready"

    const resting: ReadonlyArray<DomainMastery> = Array.from(
        { length: RESTING_COUNT },
        (_unused, index) => ({
            id: `resting-${index + 1}`,
            name: "",
            total: 0,
            countLabel: "",
            label: "",
            meterLabel: "",
        }),
    )

    const domains = isLoading ? resting : (input.props.domains ?? [])

    return (
        <Tree
            contract="domain-mastery-grid"
            render={defineContractComponent("domain-mastery-grid", {
                domain: domains.map((domain) => defineContractProjection("domain-mastery-card", () => (
                    <PressableSurface
                        contract="domain-mastery-card"
                        label={domain.label}
                        press={() => input.on?.open?.(domain.id)}
                        hover="surface"
                        isRaised
                        disabled={isLoading}
                        render={defineContractComponent("domain-mastery-card", {
                            name: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                                <Text
                                    props={{ content: domain.name, size: "sm", weight: "semibold" }}
                                    isLoading={isLoading}
                                />
                            )),
                            count: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text
                                    props={{ content: domain.countLabel, size: "xs", tone: "muted" }}
                                    isLoading={isLoading}
                                />
                            )),
                            // `Progress` reads 0..100, not a ratio - a bar handed 0.75 draws
                            // three-quarters of one percent and announces nothing, which this
                            // workspace has already shipped once.
                            meter: defineLeafComponent("progress", {}, () => (
                                <Progress
                                    props={{
                                        label: domain.meterLabel,
                                        value: showsFigures && domain.total > 0
                                            ? Math.round(((domain.solved ?? 0) / domain.total) * 100)
                                            : 0,
                                    }}
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
