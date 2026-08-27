"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { CodingDomainPageBase } from "./component"

/** Route input supplied by the application segment. */
export type CodingDomainPageProps = { readonly domain: string }

/** Resolve only route identity and shell navigation for one coding domain. */
export const CodingDomainPage = (props: CodingDomainPageProps) => {
    const { domain } = props
    const t = useTranslations("practice")
    const router = useRouter()
    return <CodingDomainPageBase
        domain={domain}
        navHome={t("navHome")}
        navPractice={t("title")}
        title={t(`domains.${domain}`)}
        on={{ goHome: () => router.push("/dashboard"), goPractice: () => router.push("/practice") }}
    />
}
