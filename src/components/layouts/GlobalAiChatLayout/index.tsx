"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import { usePathname } from "@/i18n/navigation"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
} from "@/components/contracts/props"
import { StarCiAiFab } from "@/components/blocks/ai/StarCiAiFab/component"
import { StarCiAiSelectionAsk } from "@/components/blocks/ai/StarCiAiSelectionAsk"
import { StarCiAiDrawer } from "@/components/overlays/ai/StarCiAiDrawer"
import {
    isContentAiRouteHidden,
    resolveContentAiRouteAnchor,
} from "@/modules/ai/content-ai-route-context"
import type { ContentAiSelectionContext } from "@/modules/ai/content-ai-selection-context"
import { GlobalAiChatContext, type GlobalAiChatContextValue } from "@/modules/ai/global-ai-chat-context"

/** One routed surface mounted below the persistent locale-root AI owner. */
export type GlobalAiChatLayoutProps = {
    readonly surface: ComponentType
}

/** Keep one AI conversation owner alive while routed product surfaces change beneath it. */
export const GlobalAiChatLayout = ({ surface: Surface }: GlobalAiChatLayoutProps) => {
    const pathname = usePathname()
    const token = useSessionToken()
    const anchor = useMemo(() => resolveContentAiRouteAnchor(pathname), [pathname])
    const [isOpen, setIsOpen] = useState(false)
    const [codeContext, setCodeContext] = useState<ContentAiSelectionContext>()
    const [tangentVersion, setTangentVersion] = useState(0)

    useEffect(() => {
        setCodeContext(undefined)
    }, [anchor.path])

    const value = useMemo<GlobalAiChatContextValue>(() => ({
        anchor,
        codeContext,
        isOpen,
        tangentVersion,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        setCodeContext,
        clearCodeContext: () => setCodeContext(undefined),
        startTangent: (context) => {
            setCodeContext(context)
            setTangentVersion((version) => version + 1)
            setIsOpen(true)
        },
    }), [anchor, codeContext, isOpen, tangentVersion])

    if (token === undefined || isContentAiRouteHidden(pathname)) {
        return (
            <GlobalAiChatContext.Provider value={value}>
                <Surface />
            </GlobalAiChatContext.Provider>
        )
    }

    return (
        <GlobalAiChatContext.Provider value={value}>
            <Tree
                contract="global-ai-layout"
                render={defineContractComponent("global-ai-layout", {
                    surface: defineLeafComponent("page", {}, () => <Surface />),
                    selection: defineContractProjection("selection-ai-actions", () => <StarCiAiSelectionAsk />),
                    trigger: defineContractProjection("floating-ai-trigger", () => (
                        <StarCiAiFab
                            props={{ label: "StarCi AI", isOpen }}
                            on={{ press: value.open }}
                        />
                    )),
                    drawer: defineContractProjection("starci-ai-drawer-column", () => <StarCiAiDrawer />),
                })}
            />
        </GlobalAiChatContext.Provider>
    )
}

export { useGlobalAiChat } from "@/modules/ai/global-ai-chat-context"

/** Source-level owner marker. */
export const meta = { world: "connected", domain: "ai" } as const
