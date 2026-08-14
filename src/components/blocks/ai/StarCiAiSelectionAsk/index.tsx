"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useGlobalAiChat } from "@/components/layouts/GlobalAiChatLayout/context"
import {
    normalizeContentAiSelection,
    type ContentAiSelectionContext,
} from "@/modules/ai/content-ai-selection-context"
import { _StarCiAiSelectionAsk } from "./component"

type ActiveSelection = {
    readonly context: ContentAiSelectionContext
    readonly position: { readonly x: number; readonly y: number }
}

const selectedRoot = (selection: Selection): HTMLElement | null => {
    if (selection.rangeCount === 0) return null
    const container = selection.getRangeAt(0).commonAncestorContainer
    const element = container instanceof HTMLElement ? container : container.parentElement
    return element?.closest<HTMLElement>("[data-ai-selectable=true]") ?? null
}

/** Listen only inside opted-in reading/editor roots and hand validated evidence to the global owner. */
export const StarCiAiSelectionAsk = () => {
    const t = useTranslations("globalAi.selection")
    const chat = useGlobalAiChat()
    const [active, setActive] = useState<ActiveSelection>()

    useEffect(() => {
        const readSelection = () => {
            const selection = window.getSelection()
            if (selection === null || selection.isCollapsed) { setActive(undefined); return }
            const root = selectedRoot(selection)
            if (root === null) { setActive(undefined); return }
            const context = normalizeContentAiSelection({
                kind: root.dataset.aiKind === "code" ? "code" : "prose",
                quote: selection.toString(),
                path: root.dataset.aiPath,
                startLine: root.dataset.aiStartLine === undefined ? undefined : Number(root.dataset.aiStartLine),
                endLine: root.dataset.aiEndLine === undefined ? undefined : Number(root.dataset.aiEndLine),
                hasLocalEdit: root.dataset.aiLocalEdit === "true",
                runtimeError: root.dataset.aiRuntimeError,
            })
            if (context === null) { setActive(undefined); return }
            const rect = selection.getRangeAt(0).getBoundingClientRect()
            setActive({ context, position: { x: rect.left + rect.width / 2, y: rect.top } })
        }
        document.addEventListener("selectionchange", readSelection)
        return () => document.removeEventListener("selectionchange", readSelection)
    }, [])

    if (active === undefined) return <_StarCiAiSelectionAsk state="hidden" />
    return (
        <_StarCiAiSelectionAsk
            state="ready"
            props={{
                selection: active.context,
                appendLabel: t("append"),
                tangentLabel: t("tangent"),
                dismissLabel: t("dismiss"),
                position: active.position,
            }}
            on={{
                append: () => {
                    chat.setCodeContext(active.context)
                    chat.open()
                    setActive(undefined)
                },
                tangent: () => {
                    chat.startTangent(active.context)
                    setActive(undefined)
                },
                dismiss: () => setActive(undefined),
            }}
        />
    )
}

export * from "./component"
export const meta = { world: "connected", domain: "ai" } as const
