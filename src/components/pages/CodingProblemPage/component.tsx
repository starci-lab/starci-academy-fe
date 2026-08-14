import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
} from "@/components/contracts/props"
import {
    _JudgeStatusStrip,
    type JudgeStatusStripData,
    type JudgeVerdictState,
} from "@/components/blocks/coding/JudgeStatusStrip/component"
import {
    _ProblemReadingColumn,
    type ProblemReadingColumnData,
    type ProblemReadingColumnState,
} from "@/components/blocks/coding/ProblemReadingColumn/component"
import {
    _SolutionEditor,
    type SolutionEditorData,
    type SolutionEditorState,
} from "@/components/blocks/coding/SolutionEditor/component"

/**
 * PAGE - `CodingProblemPage`: read the problem, write the solution, watch the verdict.
 *
 * Target path: `src/components/pages/CodingProblemPage/component.tsx`.
 *
 * THREE BLOCKS, THREE QUESTIONS, AND THE PAGE OWNS NONE OF THEM. The reading column knows whether
 * the hint exists; the editor knows whether a submission is in flight; the verdict strip knows what
 * the judge last said. They land independently, which is the whole of PAGE-3: a socket message
 * about a verdict must not make the statement re-render, and a tab change must not touch the
 * editor's buffer.
 *
 * READING AND WRITING SIT SIDE BY SIDE because the statement is consulted WHILE the solution is
 * written - not before it. Below the breakpoint they stack, because two columns of forty characters
 * are worse than one of eighty.
 *
 * THE VERDICT IS PINNED ABOVE THE EDITOR rather than inside the tray below it. Judging is
 * asynchronous - the mutation returns a job id and the answer arrives over a socket - so there is a
 * stretch of time in which the reader is doing nothing but watching one spot. The legacy page put
 * that answer in a console tab, which is the spot they are not watching.
 */

/** What the page draws: one situation and one payload per block. */
export type CodingProblemPageData = {
    readonly reading: {
        readonly state: ProblemReadingColumnState
        readonly props: ProblemReadingColumnData
    }
    readonly verdict: {
        readonly state: JudgeVerdictState
        readonly props: JudgeStatusStripData
    }
    readonly editor: {
        readonly state: SolutionEditorState
        readonly props: SolutionEditorData
    }
}

/** What the page reports. Each handler belongs to exactly one block below it. */
export type CodingProblemPageActions = {
    readonly selectTab?: (tab: string) => void
    readonly verdictAct?: () => void
    readonly changeLanguage?: (id: string) => void
    readonly changeSource?: (code: string) => void
    readonly run?: () => void
    readonly submit?: () => void
}

/** Props for {@link _CodingProblemPage}. */
export type CodingProblemPageProps = {
    readonly props: CodingProblemPageData
    readonly on?: CodingProblemPageActions
}

/**
 * Draw the problem screen.
 *
 * @param input - {@link CodingProblemPageProps}
 */
export const _CodingProblemPage = (input: CodingProblemPageProps) => (
    <Tree
        contract="coding-problem-page"
        render={defineContractComponent("coding-problem-page", {
            reading: defineContractProjection("problem-reading-column", () => (
                <_ProblemReadingColumn
                    state={input.props.reading.state}
                    props={input.props.reading.props}
                    on={{ selectTab: input.on?.selectTab }}
                />
            )),
            work: defineContractComponent("problem-work-column", {
                verdict: defineContractProjection("judge-status-strip", () => (
                    <_JudgeStatusStrip
                        state={input.props.verdict.state}
                        props={input.props.verdict.props}
                        on={{ act: input.on?.verdictAct }}
                    />
                )),
                work: defineContractProjection("editor-over-console", () => (
                    <_SolutionEditor
                        state={input.props.editor.state}
                        props={input.props.editor.props}
                        on={{
                            changeLanguage: input.on?.changeLanguage,
                            changeSource: input.on?.changeSource,
                            run: input.on?.run,
                            submit: input.on?.submit,
                        }}
                    />
                )),
            }),
        })}
    />
)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "coding" } as const
