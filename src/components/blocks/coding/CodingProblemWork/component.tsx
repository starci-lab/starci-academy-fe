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
export const CodingProblemWorkBase = (props: CodingProblemWorkProps) => <div><JudgeStatusStripBase state={props.verdict.state} props={props.verdict.props} on={{ act: props.on?.verdictAct }} /><SolutionEditorBase state={props.editor.state} props={props.editor.props} on={{ changeLanguage: props.on?.changeLanguage, changeSource: props.on?.changeSource, reportTelemetry: props.on?.reportTelemetry, run: props.on?.run, submit: props.on?.submit }} /></div>
