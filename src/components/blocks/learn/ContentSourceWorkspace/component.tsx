import { SandpackWorkspace, type SandpackWorkspaceData } from "@/components/branches/SandpackWorkspace"
import { CodeReaderWorkspace } from "@/components/branches/CodeReaderWorkspace"
import { Button } from "@/components/leaves/Button"
import { StatusDot } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import type { SandboxCodeSelection } from "@/modules/code/sandbox-repo"
import { sourceWorkspaceClassName, sourceWorkspaceToolbarClassName } from "./classNames"

/** Source workspace states owned independently from the article request. */
export type ContentSourceWorkspaceState = "pending" | "ready" | "failed"

/** Product copy and runtime data for the selected Source face. */
export type ContentSourceWorkspaceData = SandpackWorkspaceData & {
    readonly mode: "reader" | "sandbox"
    readonly identity: string
    readonly loadingLabel: string
    readonly failedLabel: string
    readonly retryLabel: string
    readonly resetLabel: string
    readonly localChangesLabel: string
    readonly runtimeErrorLabel: string
    readonly askErrorLabel: string
    readonly runtimeError?: string
}

/** Source actions stay browser-local except the explicit AI context callbacks. */
export type ContentSourceWorkspaceActions = {
    readonly activateFile?: (path: string) => void
    readonly updateFile?: (path: string, code: string) => void
    readonly selectCode?: (selection?: SandboxCodeSelection) => void
    readonly runtimeError?: (message?: string) => void
    readonly askError?: () => void
    readonly reset?: () => void
    readonly retry?: () => void
}

/** Props for the pure source workspace block. */
export type ContentSourceWorkspaceProps = {
    readonly state: ContentSourceWorkspaceState
    readonly props: ContentSourceWorkspaceData
    readonly on?: ContentSourceWorkspaceActions
}

type SourceWorkspaceToolbarProps = ContentSourceWorkspaceProps

/** Draw the source identity, actions, and local status as one toolbar. */
const SourceWorkspaceToolbar = (props: SourceWorkspaceToolbarProps) => {
    const hasEdits = (props.props.editedPaths?.length ?? 0) > 0
    const identity = props.state === "pending"
        ? props.props.loadingLabel
        : props.state === "failed" ? props.props.failedLabel : props.props.identity

    return <div className={sourceWorkspaceToolbarClassName}>
        <Text
            props={{ content: identity, size: "sm", weight: "semibold" }}
            isLoading={props.state === "pending"}
        />
        {props.state === "failed" ? (
            <Button
                props={{ label: props.props.retryLabel, variant: "primary", size: "sm" }}
                on={{ press: props.on?.retry }}
            />
        ) : props.state === "pending" ? (
            <Button props={{ label: props.props.resetLabel, size: "sm" }} isLoading />
        ) : props.props.mode === "reader" ? null : <>
            <Button
                props={{ label: props.props.resetLabel, size: "sm", disabled: !hasEdits }}
                on={{ press: props.on?.reset }}
            />
            {props.props.runtimeError === undefined ? null : (
                <Button
                    props={{ label: props.props.askErrorLabel, size: "sm", variant: "primary" }}
                    on={{ press: props.on?.askError }}
                />
            )}
        </>}
        {props.state === "ready" && (hasEdits || props.props.runtimeError !== undefined) ? (
            <StatusDot props={{
                tone: props.props.runtimeError === undefined ? "warning" : "danger",
                label: props.props.runtimeError === undefined
                    ? props.props.localChangesLabel
                    : props.props.runtimeErrorLabel,
            }} />
        ) : null}
    </div>
}

/** Render source loading/failure or the editable Sandpack workspace. */
export const ContentSourceWorkspace = (props: ContentSourceWorkspaceProps) => (
    <div className={sourceWorkspaceClassName}>
        <SourceWorkspaceToolbar {...props} />
        {props.state !== "ready" ? null : props.props.mode === "reader" ? (
            <CodeReaderWorkspace
                props={props.props}
                on={{
                    activateFile: props.on?.activateFile,
                    selectionChange: props.on?.selectCode,
                }}
            />
        ) : (
            <SandpackWorkspace
                props={props.props}
                on={{
                    activateFile: props.on?.activateFile,
                    updateFile: props.on?.updateFile,
                    selectionChange: props.on?.selectCode,
                    runtimeError: props.on?.runtimeError,
                    reset: props.on?.reset,
                }}
            />
        )}
    </div>
)
