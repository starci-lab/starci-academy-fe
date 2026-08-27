import { Button } from "@/components/leaves/Button"
import { CodeBlock } from "@/components/leaves/CodeBlock"
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
export const StarCiAiSelectionAskBase = (props: StarCiAiSelectionAskProps) => {
    if (props.state === "hidden") return null
    return (
        <div>
            <CodeBlock
                props={{
                    code: props.props.selection.quote,
                    language: props.props.selection.kind === "code" ? props.props.selection.path?.split(".").pop() : undefined,
                }}
            />
            <Button props={{ label: props.props.appendLabel, variant: "primary", size: "sm" }} on={{ press: props.on?.append }} />
            <Button props={{ label: props.props.tangentLabel, variant: "secondary", size: "sm" }} on={{ press: props.on?.tangent }} />
            <Button props={{ label: props.props.dismissLabel, variant: "ghost", size: "sm" }} on={{ press: props.on?.dismiss }} />
        </div>
    )
}
