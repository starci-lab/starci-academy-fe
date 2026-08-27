"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCodingProblemsSwr } from "@/hooks/swr/useQueryCodingProblemsSwr"
import { useQueryMyCodingProgressSwr } from "@/hooks/swr/useQueryMyCodingProgressSwr"
import { CodingProblemListBase, type CodingProblemRow, type CodingProblemListState } from "./component"

/** Route identity consumed by the connected problem list. */
export type CodingProblemListProps = { readonly domain: string }

/** Resolve topic problems, viewer completion and the list's own state and actions. */
export const CodingProblemList = (props: CodingProblemListProps) => {
    const { domain } = props
    const t = useTranslations("practice")
    const router = useRouter()
    const problems = useQueryCodingProblemsSwr({ domain })
    const progress = useQueryMyCodingProgressSwr()
    const solved = new Set(progress.data?.solvedProblemIds ?? [])
    const attempted = new Set(progress.data?.attemptedProblemIds ?? [])
    const rows: ReadonlyArray<CodingProblemRow> = (problems.data?.problems ?? []).map((problem) => {
        const isSolved = solved.has(problem.id)
        return {
            slug: problem.slug,
            title: problem.title,
            fact: !isSolved && attempted.has(problem.id)
                ? t("rowFactAttempted", { difficulty: t(`difficulty.${problem.difficulty}`), points: problem.points })
                : t("rowFact", { difficulty: t(`difficulty.${problem.difficulty}`), points: problem.points }),
            isSolved,
            label: t("openProblem", { title: problem.title }),
        }
    })
    const failed = problems.error !== undefined || problems.data === null
    const state: CodingProblemListState = problems.data === undefined && !failed
        ? "pending"
        : failed
            ? "failed"
            : rows.length === 0
                ? "empty"
                : rows.every((row) => row.isSolved) ? "all-solved" : "ready"
    const total = problems.data?.total ?? 0
    const notice = state === "failed"
        ? { noticeMessage: t("catalogFailed"), noticeActionLabel: t("retry") }
        : state === "empty"
            ? { noticeMessage: t("emptyDomain"), noticeDescription: t("emptyDomainDetail"), noticeActionLabel: t("backToDomains") }
            : state === "all-solved"
                ? { noticeMessage: t("allSolved"), noticeDescription: t("allSolvedDetail", { total }), noticeActionLabel: t("backToDomains") }
                : {}
    return <CodingProblemListBase
        state={state}
        props={{ problems: rows, ...notice }}
        on={{
            open: (slug) => router.push(`/practice/problem/${slug}`),
            recover: () => { void (state === "failed" ? problems.mutate() : router.push("/practice")) },
        }}
    />
}

export { CodingProblemListBase } from "./component"
export type { CodingProblemRow, CodingProblemListData, CodingProblemListActions, CodingProblemListState } from "./component"
