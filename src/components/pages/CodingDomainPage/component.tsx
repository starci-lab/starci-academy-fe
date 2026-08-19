import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import {
    CodingProblemListBase,
    type CodingProblemListState,
    type CodingProblemRow,
} from "@/components/blocks/coding/CodingProblemList/component"

/**
 * PAGE - `CodingDomainPage`: one interview topic, and the problems in it.
 *
 * Target path: `src/components/pages/CodingDomainPage/component.tsx`.
 *
 * IT IS THE PAGE THE DIRECTION COSTS. A flat catalog needs no such route; grouping by topic does,
 * and that is stated in the plan record rather than folded in quietly.
 *
 * IT OPENS ON THE STANDING, because that is the question the hub sent the reader here holding. They
 * pressed a card that said nine of twelve; the first thing this page owes them is the same figure,
 * so they know they arrived where they meant to.
 *
 * THE LIST IS THE BLOCK'S OWN QUESTION. Whether the topic is empty, full or still loading belongs
 * to `CodingProblemList`; this page settles only which topic is being read.
 */

/** Every already-resolved string the page itself renders. */
export type CodingDomainPageLabels = {
    readonly navHome: string
    readonly navPractice: string
    readonly title: string
    readonly standingLabel: string
    readonly standingFact: string
    readonly meterLabel: string
}

/** What the page draws. */
export type CodingDomainPageData = {
    readonly labels: CodingDomainPageLabels
    /** Solved out of total, as a percentage the meter can draw. */
    readonly percent?: number
    /** The list's own situation and content. */
    readonly problems: {
        readonly state: CodingProblemListState
        readonly items?: ReadonlyArray<CodingProblemRow>
        readonly noticeMessage?: string
        readonly noticeDescription?: string
        readonly noticeActionLabel?: string
    }
}

/** What the page reports. */
export type CodingDomainPageActions = {
    readonly goHome?: () => void
    readonly goPractice?: () => void
    readonly openProblem?: (slug: string) => void
    readonly recover?: () => void
}

/** Props for {@link CodingDomainPageBase}. */
export type CodingDomainPageProps = {
    readonly props: CodingDomainPageData
    readonly on?: CodingDomainPageActions
}

/**
 * Draw one topic.
 *
 * @param input - {@link CodingDomainPageProps}
 */
export const CodingDomainPageBase = (input: CodingDomainPageProps) => {
    const labels = input.props.labels
    const showsList = input.props.problems.state !== "empty" && input.props.problems.state !== "all-solved"

    return (
        <Tree
            contract="coding-domain-page"
            render={defineContractComponent("coding-domain-page", {
                header: defineContractComponent("page-header-stack", {
                    trail: defineLeafComponent("breadcrumbs", {}, () => (
                        <Breadcrumbs
                            props={{
                                label: labels.title,
                                steps: [
                                    { id: "home", label: labels.navHome },
                                    { id: "practice", label: labels.navPractice },
                                    { id: "domain", label: labels.title },
                                ],
                            }}
                            on={{ home: input.on?.goHome, practice: input.on?.goPractice }}
                        />
                    )),
                    title: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: labels.title, level: 1 }} />
                    )),
                }),
                standing: defineContractComponent("label-fact-over-progress", {
                    line: defineContractComponent("label-with-muted-fact-row", {
                        label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                            <Text props={{ content: labels.standingLabel, size: "sm", weight: "semibold" }} />
                        )),
                        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                            <Text props={{ content: labels.standingFact, size: "xs", tone: "muted" }} />
                        )),
                    }),
                    // `Progress` reads 0..100, never a ratio.
                    progress: defineLeafComponent("progress", {}, () => (
                        <Progress props={{ label: labels.meterLabel, value: input.props.percent ?? 0 }} />
                    )),
                }),
                ...(showsList ? {
                    problems: defineContractProjection("marked-row-list", () => (
                        <CodingProblemListBase
                            state={input.props.problems.state}
                            props={{ problems: input.props.problems.items }}
                            on={{ open: input.on?.openProblem }}
                        />
                    )),
                } : {
                    // The block draws an `EmptyNotice` in these two states, so the projection is
                    // declared as that composite rather than as the list it is NOT drawing. A slot
                    // records what actually lands in it; naming the other branch here would make
                    // the registry describe a tree that never renders.
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <CodingProblemListBase
                            state={input.props.problems.state}
                            props={{
                                noticeMessage: input.props.problems.noticeMessage,
                                noticeDescription: input.props.problems.noticeDescription,
                                noticeActionLabel: input.props.problems.noticeActionLabel,
                            }}
                            on={{ recover: input.on?.recover }}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "coding" } as const
