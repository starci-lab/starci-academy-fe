"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { CodingDomainPageBase } from "./component"

/** Route input supplied by the application segment. */
export interface CodingDomainPageRouteProps { readonly domain: string }

/** Resolve only route identity and shell navigation for one coding domain. */
export const CodingDomainPage = ({ domain }: CodingDomainPageRouteProps) => {
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

/** Source-level ownership marker for the connected topic page shell. */
export const meta = { world: "connected", domain: "coding" } as const
