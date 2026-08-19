import { Tree } from "@/components/branches/Tree"
import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"

/** Render data for one valid source or prose selection action surface. */
export type StarCiAiSelectionAskData = {
    readonly selection: ContentAiSelectionContext
    readonly appendLabel: string
    readonly tangentLabel: string
    readonly dismissLabel: string
    readonly position: { readonly x: number; readonly y: number }
}

/** Mutually exclusive intents emitted for the current selection. */
export type StarCiAiSelectionAskActions = {
    readonly append?: () => void
    readonly tangent?: () => void
    readonly dismiss?: () => void
}

/** Hidden or ready projection of the transient selection surface. */
export type StarCiAiSelectionAskProps =
    | { readonly state: "hidden"; readonly props?: undefined; readonly on?: undefined }
    | { readonly state: "ready"; readonly props: StarCiAiSelectionAskData; readonly on?: StarCiAiSelectionAskActions }

/** Draw actions tied to one validated quote; invalid or stale selections have no surface. */
export const StarCiAiSelectionAskBase = (input: StarCiAiSelectionAskProps) => {
    if (input.state === "hidden") return null
    return (
        <Tree
            contract="selection-ai-actions"
            render={defineContractComponent("selection-ai-actions", {
                quote: defineLeafComponent("code-block", {}, () => (
                    <CodeBlock
                        props={{
                            code: input.props.selection.quote,
                            language: input.props.selection.kind === "code" ? input.props.selection.path?.split(".").pop() : undefined,
                        }}
                    />
                )),
                action: [
                    defineLeafComponent("button", {}, () => (
                        <Button props={{ label: input.props.appendLabel, variant: "primary", size: "sm" }} on={{ press: input.on?.append }} />
                    )),
                    defineLeafComponent("button", {}, () => (
                        <Button props={{ label: input.props.tangentLabel, variant: "secondary", size: "sm" }} on={{ press: input.on?.tangent }} />
                    )),
                    defineLeafComponent("button", {}, () => (
                        <Button props={{ label: input.props.dismissLabel, variant: "ghost", size: "sm" }} on={{ press: input.on?.dismiss }} />
                    )),
                ],
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { shape: "block", world: "pure", domain: "ai" } as const
