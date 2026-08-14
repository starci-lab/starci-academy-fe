"use client"

import { createContext, useContext } from "react"
import type { ContentAiRouteAnchor } from "@/modules/ai/content-ai-route-context"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"

/** State and actions owned by the one locale-root AI host. */
export type GlobalAiChatContextValue = {
    readonly anchor: ContentAiRouteAnchor
    readonly codeContext?: ContentAiSelectionContext
    readonly isOpen: boolean
    readonly tangentVersion: number
    readonly open: () => void
    readonly close: () => void
    readonly setCodeContext: (context: ContentAiSelectionContext) => void
    readonly clearCodeContext: () => void
    readonly startTangent: (context: ContentAiSelectionContext) => void
}

/** Shared context consumed by the persistent layout and its routed AI surfaces. */
export const GlobalAiChatContext = createContext<GlobalAiChatContextValue | undefined>(undefined)

/** Read the persistent global AI owner; using it outside the root is an architecture error. */
export const useGlobalAiChat = (): GlobalAiChatContextValue => {
    const value = useContext(GlobalAiChatContext)
    if (value === undefined) throw new Error("useGlobalAiChat must be used inside GlobalAiChatLayout")
    return value
}
