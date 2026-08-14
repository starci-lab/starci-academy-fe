import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"

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
 * A GUEST SEES NOTHING, AND THAT IS THE SERVER'S ANSWER RATHER THAN A CHOICE MADE HERE. The review
 * recorded this state as "the topics without personal figures", and the running page proved that
 * wrong: `codingDomainSummary` sits behind `KeycloakAuthGraphQLGuard`, so a signed-out reader gets
 * `KEYCLOAK_AUTH_HEADER_MISSING_EXCEPTION` and there are no topics to show either. The block says so
 * instead of drawing an empty field.
 *
 * NOTHING TO SHOW IS ALWAYS A SENTENCE, NEVER A BLANK. Three different situations end with an empty
 * list - no session, a failed catalog, a catalog with nothing in it - and each names itself. The
 * first render of the real route showed a title over white space, which tells a reader nothing about
 * whether to sign in, retry, or come back later.
 */

/** The situations this grid can be in. */
export type DomainMasteryGridState =
    | "pending"
    | "ready"
    | "guest"
    | "progress-failed"
    | "catalog-failed"
    | "empty"

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
    /** The sentence shown when there is no field to draw. */
    readonly noticeMessage?: string
    /** Its supporting sentence. */
    readonly noticeDescription?: string
    /** The way out - sign in, or try again. */
    readonly noticeActionLabel?: string
}

/** What choosing a topic reports. */
export type DomainMasteryGridActions = {
    /** Called with the domain id the reader chose. */
    readonly open?: (id: string) => void
    /** Called from the notice - sign in, or retry the catalog. */
    readonly recover?: () => void
}

/** Props for {@link _DomainMasteryGrid}. */
export type DomainMasteryGridProps =
    BlockProps<DomainMasteryGridState, DomainMasteryGridData> & {
        readonly on?: DomainMasteryGridActions
    }

/** How many cards rest while the two answers are in flight. */
const RESTING_COUNT = 6

/**
 * Draw the topic field.
 *
 * @param input - {@link _DomainMasteryGrid}
 */
export const _DomainMasteryGrid = (input: DomainMasteryGridProps) => {
    const isLoading = input.state === "pending"
    const showsFigures = input.state === "ready"
    const showsNotice = input.state === "guest"
        || input.state === "catalog-failed"
        || input.state === "empty"

    // An empty field says nothing about WHY it is empty, so each of the three reasons speaks.
    if (showsNotice) {
        return (
            <EmptyNotice
                props={{
                    icon: input.state === "guest" ? "signIn" : input.state === "catalog-failed" ? "retry" : "practice",
                    message: input.props.noticeMessage ?? "",
                    description: input.props.noticeDescription,
                    actionLabel: input.props.noticeActionLabel,
                }}
                on={{ act: input.on?.recover }}
            />
        )
    }

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
