"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { CommunityTabBase } from "./component"

/** Props for the connected Community destination. */
export type CommunityTabProps = Record<string, never>

/** Connect the leaderboard destination. */
export const CommunityTab = (props: CommunityTabProps) => {
    void props
    const t = useTranslations("community")
    const router = useRouter()
    return (
        <CommunityTabBase
            props={{ seeMoreLabel: t("seeMore") }}
            on={{ seeMore: () => router.push("/league") }}
        />
    )
}
