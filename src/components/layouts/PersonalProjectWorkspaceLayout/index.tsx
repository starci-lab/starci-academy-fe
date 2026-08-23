"use client"

import type { ReactNode } from "react"
import { useTranslations } from "next-intl"
import { PersonalProjectWorkspaceLayoutBase } from "./component"

/** Course identity and routed surface accepted by the segment shell. */
export type PersonalProjectWorkspaceLayoutProps = {
    readonly displayId: string
    readonly surface: ReactNode
}

/** Connect localized layout chrome; the roadmap block owns its own query and interaction state. */
export const PersonalProjectWorkspaceLayout = (input: PersonalProjectWorkspaceLayoutProps) => {
    const t = useTranslations("learn.project")
    return (
        <PersonalProjectWorkspaceLayoutBase
            surface={input.surface}
            resizeLabel={t("resizeRail")}
        />
    )
}

export * from "./component"

/** Architectural identity for the connected personal-project layout twin. */
export const meta = { world: "connected", domain: "learn" } as const
