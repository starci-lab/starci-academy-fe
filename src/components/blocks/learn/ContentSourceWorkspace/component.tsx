import { SandpackShell, type SandpackShellData } from "@/components/shells/SandpackShell"
import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { StatusDot } from "@/components/leaves/StatusDot"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { SandboxCodeSelection } from "@/modules/code/sandbox-repo"

/** Source workspace states owned independently from the article request. */
export type ContentSourceWorkspaceState = "pending" | "ready" | "failed"

/** Product copy and runtime data for the selected Source face. */
export type ContentSourceWorkspaceData = SandpackShellData & {
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

const toolbar = (
    state: ContentSourceWorkspaceState,
    props: ContentSourceWorkspaceData,
    on?: ContentSourceWorkspaceActions,
) => {
    const hasEdits = (props.editedPaths?.length ?? 0) > 0
    const identity = state === "pending" ? props.loadingLabel : state === "failed" ? props.failedLabel : props.identity
    const actions = state === "failed"
        ? [defineLeafComponent("button", {}, () => (
            <Button props={{ label: props.retryLabel, variant: "primary", size: "sm" }} on={{ press: on?.retry }} />
        ))]
        : state === "pending"
            ? [defineLeafComponent("button", {}, () => (
                <Button props={{ label: props.resetLabel, size: "sm" }} isLoading />
            ))]
            : [
                defineLeafComponent("button", {}, () => (
                    <Button props={{ label: props.resetLabel, size: "sm", disabled: !hasEdits }} on={{ press: on?.reset }} />
                )),
                ...(props.runtimeError === undefined ? [] : [defineLeafComponent("button", {}, () => (
                    <Button props={{ label: props.askErrorLabel, size: "sm", variant: "primary" }} on={{ press: on?.askError }} />
                ))]),
            ]

    return defineContractComponent("source-workspace-toolbar", {
        identity: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text props={{ content: identity, size: "sm", weight: "semibold" }} isLoading={state === "pending"} />
        )),
        action: actions,
        ...((state === "ready" && (hasEdits || props.runtimeError !== undefined)) ? {
            status: defineLeafComponent("status-dot", {}, () => (
                <StatusDot props={{
                    tone: props.runtimeError === undefined ? "warning" : "danger",
                    label: props.runtimeError === undefined ? props.localChangesLabel : props.runtimeErrorLabel,
                }} />
            )),
        } : {}),
    })
}

/** Render source loading/failure or the editable Sandpack workspace. */
export const ContentSourceWorkspace = ({ state, props, on }: ContentSourceWorkspaceProps) => (
    <div data-component="ContentSourceWorkspace" data-state={state}>
        <Tree contract="source-workspace-toolbar" render={toolbar(state, props, on)} />
        {state === "ready" ? (
            <SandpackShell
                props={props}
                on={{
                    activateFile: on?.activateFile,
                    updateFile: on?.updateFile,
                    selectionChange: on?.selectCode,
                    runtimeError: on?.runtimeError,
                    reset: on?.reset,
                }}
            />
        ) : null}
    </div>
)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
