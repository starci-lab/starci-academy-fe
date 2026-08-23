"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { CodingPracticeHubPageBase } from "./component"

/** Resolve only shell copy and route navigation for the practice hub. */
export const CodingPracticeHubPage = () => {
    const t = useTranslations("practice")
    const router = useRouter()
    return <CodingPracticeHubPageBase
        navHome={t("navHome")}
        navPractice={t("title")}
        title={t("title")}
        on={{ goHome: () => router.push("/dashboard") }}
    />
}

/** Source-level ownership marker for the connected page shell. */
export const meta = { world: "connected", domain: "coding" } as const
