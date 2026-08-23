"use client"

import { useTranslations } from "next-intl"
import { useQueryCodingProblemsSwr } from "@/hooks/swr/useQueryCodingProblemsSwr"
import { useQueryMyCodingProgressSwr } from "@/hooks/swr/useQueryMyCodingProgressSwr"
import { CodingDomainStandingBase } from "./component"

/** Route identity used to resolve the topic's catalog total. */
export type CodingDomainStandingProps = { readonly domain: string }

/** Resolve the topic's solved count and render its independent standing block. */
export const CodingDomainStanding = ({ domain }: CodingDomainStandingProps) => {
    const t = useTranslations("practice")
    const problems = useQueryCodingProblemsSwr({ domain })
    const progress = useQueryMyCodingProgressSwr()
    const solved = progress.data?.solvedProblemIds ?? []
    const total = problems.data?.total ?? 0
    const solvedHere = problems.data?.problems.filter((problem) => solved.includes(problem.id)).length ?? 0
    const name = t(`domains.${domain}`)
    return <CodingDomainStandingBase
        standingLabel={t("domainStanding")}
        standingFact={t("count", { solved: solvedHere, total })}
        meterLabel={t("meter", { name })}
        percent={total === 0 ? 0 : Math.round((solvedHere / total) * 100)}
    />
}

export { CodingDomainStandingBase } from "./component"
/** Source-level ownership marker for the connected standing block. */
export const meta = { world: "connected", domain: "coding" } as const
