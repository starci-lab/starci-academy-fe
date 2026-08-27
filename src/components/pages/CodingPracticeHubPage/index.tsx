"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { CodingPracticeHubPageBase } from "./component"

/** Resolve only shell copy and route navigation for the practice hub. */
/** Props for the route-independent practice hub page. */
export type CodingPracticeHubPageProps = Record<never, never>
/** Render the connected practice hub route. */
export const CodingPracticeHubPage = (props: CodingPracticeHubPageProps) => {
    void props
    const t = useTranslations("practice")
    const router = useRouter()
    return <CodingPracticeHubPageBase
        navHome={t("navHome")}
        navPractice={t("title")}
        title={t("title")}
        on={{ goHome: () => router.push("/dashboard") }}
    />
}
