import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { CodeEditor, type EditorTelemetry } from "@/components/leaves/CodeEditor"
import { Select, type SelectOption } from "@/components/leaves/Select"
/** Editor lifecycle states. */
export type SolutionEditorState = "ready" | "submitting" | "judged"
/** One testcase result shown below the editor. */
export type TestcaseOutcome = { readonly id: string; readonly label: string; readonly passed?: boolean }
/** Resolved editor content and labels. */
export type SolutionEditorData = { readonly languages: ReadonlyArray<SelectOption>; readonly language: string; readonly source?: string; readonly labels: { readonly editor: string; readonly languageField: string; readonly run: string; readonly submit: string; readonly submitting: string }; readonly testcases?: ReadonlyArray<TestcaseOutcome>; readonly compilerMessage?: string }
/** Callbacks emitted by editor controls. */
export type SolutionEditorActions = { readonly changeLanguage?: (id: string) => void; readonly changeSource?: (code: string) => void; readonly reportTelemetry?: (reading: EditorTelemetry) => void; readonly run?: () => void; readonly submit?: () => void }
/** Traditional props for the solution editor. */
export type SolutionEditorProps = { readonly state: SolutionEditorState; readonly props: SolutionEditorData; readonly on?: SolutionEditorActions }
/** Draw the editable solution and its judge feedback. */
export const SolutionEditorBase = (props: SolutionEditorProps) => {
    const busy = props.state === "submitting"; const { props: data, on } = props
    return <div><div><Select props={{ id: "coding-solution-language", name: "language", label: data.labels.languageField, options: data.languages, selectedKey: data.language, disabled: busy }} on={{ select: on?.changeLanguage }} /><Button variant="outline" size="sm" isDisabled={busy} onPress={on?.run}>{data.labels.run}</Button><Button variant="primary" size="sm" isPending={busy} onPress={on?.submit}>{busy ? data.labels.submitting : data.labels.submit}</Button></div><CodeEditor props={{ id: "coding-solution-editor", language: data.language, label: data.labels.editor, defaultValue: data.source, readOnly: busy }} on={{ change: on?.changeSource, telemetry: on?.reportTelemetry }} />{data.testcases && data.testcases.length > 0 && <div>{data.testcases.map((test) => <Badge key={test.id} tone={test.passed === undefined ? "neutral" : test.passed ? "success" : "danger"}>{test.label}</Badge>)}{data.compilerMessage && <CodeBlock props={{ code: data.compilerMessage }} />}</div>}</div>
}
