import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { SeeMoreLink } from "@/components/leaves/SeeMoreLink"
import { Text } from "@/components/leaves/Text"
import { RankedUserRow } from "@/components/composites/RankedUserRow"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import {
    _DomainMasteryGrid,
    type DomainMastery,
    type DomainMasteryGridState,
} from "@/components/blocks/coding/DomainMasteryGrid/component"

/**
 * PAGE - `CodingPracticeHubPage`: where to practise next.
 *
 * Target path: `src/components/pages/CodingPracticeHubPage/component.tsx`.
 *
 * THE SELECTED DIRECTION, `direction-path-first`. Twenty interview topics are a curriculum rather
 * than a filter, so the hub opens on a field of topics carrying this learner's own standing instead
 * of a flat list of a hundred and twenty problems. The entity says so itself: `domain` documents
 * itself as the field the problem list is grouped by.
 *
 * WHAT THIS PAGE OWNS IS THE SESSION. Whether there is a viewer to have mastery decides whether the
 * grid shows figures at all. Whether the leaderboard has loaded is the leaderboard's own question,
 * and whether the topics have is the grid's - PAGE-3 keeps them apart so the fastest region does
 * not wait on the slowest.
 *
 * READING ORDER: carry on, then choose, then compare. The resume card is first because the cheapest
 * next move is the one already half-made; the topic field follows because it answers what to do
 * when there is nothing half-made; the ranking is last because it is the only region that says
 * nothing about what to do next.
 */

/** The screen-level situation, which is the session and only the session. */
export type CodingPracticeHubSession = "guest" | "signed-in"

/** Every already-resolved string the page itself renders. */
export type CodingPracticeHubLabels = {
    readonly navHome: string
    readonly navPractice: string
    readonly title: string
    readonly standingLabel: string
    readonly standingMore: string
}

/** What the page draws. */
export type CodingPracticeHubData = {
    readonly labels: CodingPracticeHubLabels
    /** The topic field's own situation and content, including why it may be empty. */
    readonly domains: {
        readonly state: DomainMasteryGridState
        readonly items?: ReadonlyArray<DomainMastery>
        /** The sentence shown when there is no field to draw. */
        readonly noticeMessage?: string
        /** Its supporting sentence. */
        readonly noticeDescription?: string
        /** The way out - sign in, or try again. */
        readonly noticeActionLabel?: string
    }
    /** The half-finished problem, when there is one. */
    readonly resume?: {
        readonly title: string
        readonly kind: string
        readonly actionLabel: string
    }
    /** The ranking rows, already worded. Absent while the ranking is in flight. */
    readonly standing?: ReadonlyArray<{
        readonly id: string
        readonly rank: number
        readonly username: string
        readonly fact: string
        readonly isViewer: boolean
    }>
}

/** What the page reports. */
export type CodingPracticeHubActions = {
    readonly goHome?: () => void
    readonly openDomain?: (id: string) => void
    /** Called from the topic field's notice - sign in, or retry the catalog. */
    readonly recoverDomains?: () => void
    readonly resume?: () => void
    readonly openStanding?: () => void
}

/** Props for {@link _CodingPracticeHubPage}. */
export type CodingPracticeHubPageProps = {
    readonly session: CodingPracticeHubSession
    readonly props: CodingPracticeHubData
    readonly on?: CodingPracticeHubActions
}

/**
 * Draw the practice hub.
 *
 * @param input - {@link CodingPracticeHubPageProps}
 */
export const _CodingPracticeHubPage = (input: CodingPracticeHubPageProps) => {
    const labels = input.props.labels
    const resume = input.props.resume
    const standing = input.props.standing

    return (
        <Tree
            contract="coding-practice-page"
            render={defineContractComponent("coding-practice-page", {
                header: defineContractComponent("page-header-stack", {
                    trail: defineLeafComponent("breadcrumbs", {}, () => (
                        <Breadcrumbs
                            props={{
                                label: labels.title,
                                steps: [
                                    { id: "home", label: labels.navHome },
                                    { id: "practice", label: labels.navPractice },
                                ],
                            }}
                            on={{ home: input.on?.goHome }}
                        />
                    )),
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: labels.title, level: 1 }} />
                    )),
                }),
                // An ABSENT slot, not a slot holding null: a learner with nothing half-done should
                // not be shown an empty shelf where the way back would be.
                ...(resume === undefined ? {} : {
                    resume: defineContractComponent("resume-item-card", {
                        title: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
                            <Text props={{ content: resume.title, size: "sm", weight: "medium" }} />
                        )),
                        kind: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: resume.kind, size: "sm", tone: "muted" }} />
                        )),
                        resume: defineLeafComponent("see-more-link", {}, () => (
                            <SeeMoreLink
                                props={{ label: resume.actionLabel }}
                                on={{ press: input.on?.resume }}
                            />
                        )),
                    }),
                }),
                domains: defineContractProjection("domain-mastery-grid", () => (
                    <_DomainMasteryGrid
                        state={input.session === "guest" ? "guest" : input.props.domains.state}
                        // The whole payload, not just the list. Forwarding only `items` dropped the
                        // three notice fields, and the block then drew a notice with no words in it
                        // - which is how the real route rendered a title over white space.
                        props={{
                            domains: input.props.domains.items,
                            noticeMessage: input.props.domains.noticeMessage,
                            noticeDescription: input.props.domains.noticeDescription,
                            noticeActionLabel: input.props.domains.noticeActionLabel,
                        }}
                        on={{ open: input.on?.openDomain, recover: input.on?.recoverDomains }}
                    />
                )),
                ...(standing === undefined ? {} : {
                    // `leaderboard-card` holds the viewer's own standing above the joined list of
                    // ranked identities, which is exactly what a summary of a ranking is. The
                    // viewer's row is the same composite as everyone else's - being the reader is a
                    // fact about WHICH row, not a different kind of row.
                    standing: defineContractProjection("leaderboard-card", () => (
                        <SurfaceCard
                            contract="leaderboard-card"
                            props={{ label: labels.standingLabel, seeMoreLabel: labels.standingMore }}
                            on={{ seeMore: input.on?.openStanding }}
                            render={defineContractComponent("leaderboard-card", {
                                list: defineContractComponent("ranked-user-list", {
                                    user: standing.map((row) => defineCompositeComponent("ranked-user-row", {}, () => (
                                        <RankedUserRow
                                            props={{
                                                id: row.id,
                                                rank: row.rank,
                                                name: row.username,
                                                points: row.fact,
                                            }}
                                        />
                                    ))),
                                }),
                            })}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "coding" } as const
