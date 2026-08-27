"use client"

import { useEffect, useMemo } from "react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import {
    SandpackPreview,
    SandpackProvider,
    useSandpack,
    type SandpackFiles,
    type SandpackPredefinedTemplate,
} from "@codesandbox/sandpack-react"
import { SourceFileTree } from "@/components/branches/SourceFileTree"
import {
    normalizeSandboxPath,
    sandboxFileCode,
    sandboxLanguage,
    type SandboxCodeSelection,
} from "@/modules/code/sandbox-repo"

/** Runtime data owned by the Sandpack mechanics boundary. */
export type SandpackWorkspaceData = {
    readonly files: SandpackFiles
    readonly dependencies?: Readonly<Record<string, string>>
    readonly activePath: string
    readonly template?: SandpackPredefinedTemplate
    readonly filesLabel: string
    readonly editorLabel: string
    readonly previewLabel: string
    readonly editedPaths?: ReadonlyArray<string>
    readonly editedLabel?: string
}

/** Events emitted from controlled editor and Sandpack runtime state. */
export type SandpackWorkspaceActions = {
    readonly activateFile?: (path: string) => void
    readonly updateFile?: (path: string, code: string) => void
    readonly selectionChange?: (selection?: SandboxCodeSelection) => void
    readonly runtimeError?: (message?: string) => void
    readonly reset?: () => void
}

/** Props for {@link SandpackWorkspace}. */
export type SandpackWorkspaceProps = {
    readonly props: SandpackWorkspaceData
    readonly on?: SandpackWorkspaceActions
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

const runtimeErrorMessage = (error: unknown): string | undefined => {
    if (error === null || error === undefined) return undefined
    if (typeof error === "string") return error
    if (typeof error === "object" && "message" in error && typeof error.message === "string") return error.message
    return String(error)
}

const SandpackRuntime = (input: SandpackWorkspaceProps) => {
    const data = input.props
    const on = input.on
    const { sandpack } = useSandpack()
    const activePath = normalizeSandboxPath(data.activePath)
    const code = sandboxFileCode(data.files, activePath)
    const extensions = useMemo(() => [grammarFor(activePath), EditorView.lineWrapping], [activePath])

    useEffect(() => {
        if (sandpack.files[activePath] !== undefined && sandpack.activeFile !== activePath) sandpack.openFile(activePath)
    }, [activePath, sandpack])

    useEffect(() => {
        on?.runtimeError?.(runtimeErrorMessage(sandpack.error))
    }, [on, sandpack.error])

    const activateFile = (path: string) => {
        sandpack.openFile(path)
        on?.activateFile?.(path)
    }

    return (
        <div>
            <SourceFileTree
                props={{
                    label: data.filesLabel,
                    files: Object.keys(data.files).map((path) => ({
                        path,
                        isEdited: data.editedPaths?.includes(path),
                    })),
                    activePath,
                    editedLabel: data.editedLabel,
                }}
                on={{ activate: activateFile }}
            />
            <CodeMirror
                aria-label={data.editorLabel}
                value={code}
                theme={vscodeDark}
                height="100%"
                extensions={extensions}
                onChange={(nextCode) => {
                    sandpack.updateFile(activePath, nextCode, true)
                    on?.updateFile?.(activePath, nextCode)
                }}
                onUpdate={(update) => {
                    if (!update.selectionSet) return
                    const range = update.state.selection.main
                    if (range.empty) {
                        on?.selectionChange?.(undefined)
                        return
                    }
                    const startLine = update.state.doc.lineAt(range.from).number
                    const endLine = update.state.doc.lineAt(range.to).number
                    on?.selectionChange?.({
                        path: activePath,
                        startLine,
                        endLine,
                        text: update.state.sliceDoc(range.from, range.to),
                    })
                }}
            />
            <SandpackPreview
                aria-label={data.previewLabel}
                showNavigator={false}
                showOpenInCodeSandbox={false}
                showSandpackErrorOverlay
                style={{ minHeight: 320, width: "100%" }}
            />
        </div>
    )
}

/** Sandpack provider with a custom controlled CodeMirror editor; no vendor DOM is inspected. */
export const SandpackWorkspace = (props: SandpackWorkspaceProps) => (
    <SandpackProvider
        template={props.props.template ?? "react-ts"}
        files={props.props.files}
        customSetup={{ dependencies: { ...props.props.dependencies } }}
        options={{
            activeFile: normalizeSandboxPath(props.props.activePath),
            recompileMode: "delayed",
            recompileDelay: 600,
            startRoute: "/?sandbox=1",
        }}
    >
        <SandpackRuntime props={props.props} on={props.on} />
    </SandpackProvider>
)
