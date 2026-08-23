import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import { JudgeStatusStripBase, type JudgeStatusStripData, type JudgeVerdictState } from "@/components/blocks/coding/JudgeStatusStrip/component"
import { SolutionEditorBase, type SolutionEditorData, type SolutionEditorState } from "@/components/blocks/coding/SolutionEditor/component"
import type { EditorTelemetry } from "@/components/leaves/CodeEditor"

/** Pure coordinated work-column inputs; verdict and editor states remain separate blocks. */
export type CodingProblemWorkProps = {
    readonly verdict: { readonly state: JudgeVerdictState; readonly props: JudgeStatusStripData }
    readonly editor: { readonly state: SolutionEditorState; readonly props: SolutionEditorData }
    readonly on?: {
        readonly verdictAct?: () => void
        readonly changeLanguage?: (id: string) => void
        readonly changeSource?: (code: string) => void
        readonly reportTelemetry?: (reading: EditorTelemetry) => void
        readonly run?: () => void
        readonly submit?: () => void
    }
}

/** Draw the stable work column and compose its verdict and editor block renderers. */
export const CodingProblemWorkBase = (input: CodingProblemWorkProps) => <Tree contract="problem-work-column" render={defineContractComponent("problem-work-column", {
    verdict: defineContractProjection("judge-status-strip", () => <JudgeStatusStripBase state={input.verdict.state} props={input.verdict.props} on={{ act: input.on?.verdictAct }} />),
    work: defineContractProjection("editor-over-console", () => <SolutionEditorBase state={input.editor.state} props={input.editor.props} on={{ changeLanguage: input.on?.changeLanguage, changeSource: input.on?.changeSource, reportTelemetry: input.on?.reportTelemetry, run: input.on?.run, submit: input.on?.submit }} />),
})} />

/** Source-level ownership marker for the pure work-column composition. */
export const meta = { world: "pure", domain: "coding" } as const
