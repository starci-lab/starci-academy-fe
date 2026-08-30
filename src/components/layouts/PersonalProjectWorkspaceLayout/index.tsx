"use client"

import { useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"
import { PersonalProjectWorkspaceLayoutBase } from "./component"

/** Course identity and routed surface accepted by the segment shell. */
export type PersonalProjectWorkspaceLayoutProps = {
    readonly displayId: string
    readonly surface: ReactNode
}

/** Connect localized layout chrome; the roadmap block owns its own query and interaction state. */
export const PersonalProjectWorkspaceLayout = (props: PersonalProjectWorkspaceLayoutProps) => {
    const t = useTranslations("learn.project")
    const pathname = usePathname()
    const [isRoadmapOpen, setIsRoadmapOpen] = useState(false)
    const isOverview = /\/learn\/personal-project\/?$/.test(pathname)
    return (
        <PersonalProjectWorkspaceLayoutBase
            surface={props.surface}
            resizeLabel={t("resizeRail")}
            roadmapLabel={t("contentMapTitle")}
            isRoadmapOpen={isRoadmapOpen}
            onOpenRoadmap={() => setIsRoadmapOpen(true)}
            onCloseRoadmap={() => setIsRoadmapOpen(false)}
            showRoadmapNavigation={!isOverview}
        />
    )
}

export * from "./component"

/** Architectural identity for the connected personal-project layout twin. */
