import { Article } from "@/components/branches/Article"
import { Badge } from "@/components/leaves/Badge"
import { ExtendedTabs } from "@/components/leaves/ExtendedTabs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "@/components/contracts/props"

/**
 * BLOCK - `ProblemReadingColumn`: everything about the problem that is read rather than written.
 *
 * Target path: `src/components/blocks/coding/ProblemReadingColumn/component.tsx`.
 *
 * FOUR TABS, ONE COLUMN. Statement, hint, reference solution and this viewer's own submissions are
 * four answers to "what do I need to know", and they replace each other rather than stacking,
 * because a reader consults one at a time while the editor beside them keeps its place.
 *
 * THE HINT CAN BE GENUINELY ABSENT. `codingProblemHint` is documented as returning null when the
 * problem has none, so that tab renders a settled nothing rather than an error.
 *
 * THE PROSE IS THE SHIPPED `Article` LEAF. A `MarkdownProse` leaf was written for this candidate
 * and withdrawn: `Article` already renders authored Markdown, and its own comment records that
 * canon refused `react-markdown` in that file twice. A second owner would have repeated both
 * refusals and added a dependency to do it.
 *
 * REVEALING THE SOLUTION IS A RECORDED ACT, and the tab says so BEFORE it is opened.
 * `revealCodingSolution` writes into the viewer's `revealedProblemIds`, which is a permanent mark on
 * their own record - so the control that does it states the consequence rather than discovering it.
 */

/** Which reading this column is showing. */
export type ProblemReadingTab = "statement" | "hint" | "solution" | "submissions"

/** The situations this column can be in. */
export type ProblemReadingColumnState = "pending" | "ready" | "hint-absent" | "solution-hidden"

/** What the column draws. */
export type ProblemReadingColumnData = {
    /** Which tab is open. */
    readonly tab: ProblemReadingTab
    /** Already-resolved tab words. */
    readonly tabLabels: {
        readonly statement: string
        readonly hint: string
        readonly solution: string
        readonly submissions: string
        readonly group: string
    }
    /** The problem title. */
    readonly title?: string
    /** Difficulty, already worded. */
    readonly difficulty?: string
    /** The Markdown under the heading - statement, hint, or the reference solution. */
    readonly body?: string
    /** The problem's own tags. */
    readonly tags?: ReadonlyArray<string>
}

/** What the column reports. */
export type ProblemReadingColumnActions = {
    /** Called with the tab the reader moved to. */
    readonly selectTab?: (tab: string) => void
}

/** Props for {@link ProblemReadingColumnBase}. */
export type ProblemReadingColumnProps =
    BlockProps<ProblemReadingColumnState, ProblemReadingColumnData> & {
        readonly on?: ProblemReadingColumnActions
    }

/**
 * Draw the reading half of the problem page.
 *
 * @param input - {@link ProblemReadingColumnProps}
 */
export const ProblemReadingColumnBase = (input: ProblemReadingColumnProps) => {
    const isLoading = input.state === "pending"
    const labels = input.props.tabLabels
    const tags = input.props.tags ?? []

    return (
        <Tree
            contract="problem-reading-column"
            render={defineContractComponent("problem-reading-column", {
                tabs: defineLeafComponent("extended-tabs", {}, () => (
                    <ExtendedTabs
                        props={{
                            label: labels.group,
                            selectedKey: input.props.tab,
                            tabs: [
                                { id: "statement", label: labels.statement, icon: "course" },
                                { id: "hint", label: labels.hint, icon: "review" },
                                { id: "solution", label: labels.solution, icon: "complete" },
                                { id: "submissions", label: labels.submissions, icon: "practice" },
                            ],
                        }}
                        on={{ select: input.on?.selectTab }}
                    />
                )),
                body: defineContractComponent("problem-statement-stack", {
                    heading: defineContractComponent("title-with-baseline-fact", {
                        title: defineLeafComponent("heading", {}, () => (
                            <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />
                        )),
                        fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text
                                props={{ content: input.props.difficulty, size: "sm", tone: "muted" }}
                                isLoading={isLoading}
                            />
                        )),
                    }),
                    prose: defineLeafComponent("article", {}, () => (
                        <Article props={{ body: input.props.body }} isLoading={isLoading} />
                    )),
                    ...(tags.length === 0 ? {} : {
                        tags: defineContractComponent("profile-topic-chip-run", {
                            topic: tags.map((tag) => defineLeafComponent("badge", {}, () => (
                                <Badge props={{ content: tag, tone: "neutral" }} />
                            ))),
                        }),
                    }),
                }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "coding" } as const
