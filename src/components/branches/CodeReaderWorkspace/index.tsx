"use client"

import { useMemo } from "react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import type { SandpackFiles } from "@codesandbox/sandpack-react"
import { SourceFileTree } from "@/components/branches/SourceFileTree"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import {
    normalizeSandboxPath,
    sandboxFileCode,
    sandboxLanguage,
    type SandboxCodeSelection,
} from "@/modules/code/sandbox-repo"

/** One immutable repository snapshot and the file currently being read. */
export type CodeReaderWorkspaceData = {
    readonly files: SandpackFiles
    readonly activePath: string
    readonly filesLabel: string
    readonly editorLabel: string
}

/** Local file navigation and exact code selection reported to the owning page. */
export type CodeReaderWorkspaceActions = {
    readonly activateFile?: (path: string) => void
    readonly selectionChange?: (selection?: SandboxCodeSelection) => void
}

/** Props for the readonly source-code workspace branch. */
export type CodeReaderWorkspaceProps = {
    readonly props: CodeReaderWorkspaceData
    readonly on?: CodeReaderWorkspaceActions
}

const grammarFor = (path: string) => {
    const language = sandboxLanguage(path)
    if (language === "typescript") return javascript({ typescript: true, jsx: path.endsWith("x") })
    if (language === "javascript") return javascript({ jsx: path.endsWith("x") })
    if (language === "python") return python()
    if (language === "java") return java()
    if (language === "cpp") return cpp()
    return []
}

/** Read one synchronized repository without exposing edit or runtime controls. */
export const CodeReaderWorkspace = (input: CodeReaderWorkspaceProps) => {
    const data = input.props
    const on = input.on
    const activePath = normalizeSandboxPath(data.activePath)
    const code = sandboxFileCode(data.files, activePath)
    const extensions = useMemo(() => [grammarFor(activePath), EditorView.lineWrapping], [activePath])

    return (
        <Tree
            contract="source-code-reader-grid"
            render={defineContractComponent("source-code-reader-grid", {
                files: defineContractProjection("source-file-navigation", () => (
                    <SourceFileTree
                        props={{
                            label: data.filesLabel,
                            files: Object.keys(data.files).map((path) => ({ path })),
                            activePath,
                        }}
                        on={{ activate: on?.activateFile }}
                    />
                )),
                editor: defineContractComponent("source-code-editor-frame", {
                    editor: defineLeafComponent("code-editor", {}, () => (
                        <CodeMirror
                            aria-label={data.editorLabel}
                            value={code}
                            theme={vscodeDark}
                            height="100%"
                            editable={false}
                            extensions={extensions}
                            onUpdate={(update) => {
                                if (!update.selectionSet) return
                                const range = update.state.selection.main
                                if (range.empty) {
                                    on?.selectionChange?.(undefined)
                                    return
                                }
                                on?.selectionChange?.({
                                    path: activePath,
                                    startLine: update.state.doc.lineAt(range.from).number,
                                    endLine: update.state.doc.lineAt(range.to).number,
                                    text: update.state.sliceDoc(range.from, range.to),
                                })
                            }}
                        />
                    )),
                }),
            })}
        />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "branch", world: "pure" } as const
