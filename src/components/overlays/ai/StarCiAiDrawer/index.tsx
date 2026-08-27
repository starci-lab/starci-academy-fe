"use client"

import { useCallback } from "react"
import { useTranslations } from "next-intl"
import { StarCiAiChat } from "@/components/blocks/ai/StarCiAiChat"
import { useGlobalAiChat } from "@/modules/ai/global-ai-chat-context"
import { StarCiAiDrawerBase } from "./component"

/** Resolve global owner state and responsive shell placement before drawing the pure overlay. */
/** Props for the global AI drawer owner; the drawer is route-independent. */
export type StarCiAiDrawerProps = Record<never, never>
/** Render the connected global AI drawer. */
export const StarCiAiDrawer = (props: StarCiAiDrawerProps) => {
    void props
    const t = useTranslations("globalAi")
    const owner = useGlobalAiChat()
    const Chat = useCallback(() => <StarCiAiChat />, [])
    return (
        <StarCiAiDrawerBase
            state={owner.isOpen ? "ready" : "closed"}
            props={{
                isOpen: owner.isOpen,
                placement: typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches ? "bottom" : "right",
                title: t("title"),
                description: t("description"),
            }}
            on={{ dismiss: owner.close }}
            chat={Chat}
        />
    )
}

export * from "./component"
