"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useQueryCodingProblemSwr } from "@/hooks/swr/useQueryCodingProblemSwr"
import { ProblemReadingColumnBase, type ProblemReadingTab } from "./component"

/** Route identity consumed by the connected reading block. */
export type ProblemReadingColumnProps = { readonly slug: string }

const readingBodyOf = (tab: ProblemReadingTab, statement: string | undefined, hint: string, empty: string) => tab === "statement" ? statement : tab === "hint" ? hint : empty

/** Resolve the problem statement and own the reader's tab selection. */
export const ProblemReadingColumn = (props: ProblemReadingColumnProps) => {
    const { slug } = props
    const t = useTranslations("practice")
    const problem = useQueryCodingProblemSwr(slug)
    const [tab, setTab] = useState<ProblemReadingTab>("statement")
    const data = problem.data
    return <ProblemReadingColumnBase
        state={data === undefined ? "pending" : "ready"}
        props={{
            tab,
            tabLabels: {
                statement: t("tabStatement"),
                hint: t("tabHint"),
                solution: t("tabSolution"),
                submissions: t("tabSubmissions"),
                group: t("tabGroup"),
            },
            title: data?.title,
            difficulty: data === undefined || data === null ? undefined : t("problemFact", {
                difficulty: t(`difficulty.${data.difficulty}`),
                points: data.points,
                ms: data.timeLimitMs,
                mb: Math.round(data.memoryLimitKb / 1024),
            }),
            body: readingBodyOf(tab, data?.statement, t("hintPending"), t("tabEmpty")),
            tags: data?.tags,
        }}
        on={{ selectTab: (next) => setTab(next as ProblemReadingTab) }}
    />
}

export { ProblemReadingColumnBase } from "./component"
