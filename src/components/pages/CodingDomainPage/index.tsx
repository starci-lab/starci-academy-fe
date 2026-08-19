"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCodingProblemsSwr } from "@/hooks/swr/useQueryCodingProblemsSwr"
import { useQueryMyCodingProgressSwr } from "@/hooks/swr/useQueryMyCodingProgressSwr"
import { CodingDomainPageBase } from "./component"

/** Props for {@link CodingDomainPage}. */
export interface CodingDomainPageProps {
    /** The domain enum value, from the route segment. */
    domain: string
}

/**
 * One topic, connected.
 *
 * SOLVED STATE IS A SECOND ANSWER, joined by id. The catalog knows nothing about this viewer, so a
 * tick comes from `myCodingProgress.solvedProblemIds` rather than from the problem row - which is
 * why the list can be cached across viewers and the ticks cannot.
 *
 * ALL-SOLVED IS ITS OWN SITUATION, not an empty list. A topic finished should congratulate and point
 * onward; a topic with nothing in it should say the problems are still being written. Rendering the
 * same notice for both would tell a learner who did everything that there was nothing to do.
 */
export const CodingDomainPage = ({ domain }: CodingDomainPageProps) => {
    const t = useTranslations("practice")
    const router = useRouter()
    const problems = useQueryCodingProblemsSwr({ domain })
    const progress = useQueryMyCodingProgressSwr()

    const solved = new Set(progress.data?.solvedProblemIds ?? [])
    const attempted = new Set(progress.data?.attemptedProblemIds ?? [])

    const rows = (problems.data?.problems ?? []).map((problem) => {
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
    const total = problems.data?.total ?? 0
    const solvedHere = rows.filter((row) => row.isSolved).length
    const name = t(`domains.${domain}`)

    const state = problems.data === undefined && !failed
        ? "pending" as const
        : rows.length === 0
            ? "empty" as const
            : solvedHere === rows.length
                ? "all-solved" as const
                : "ready" as const

    return (
        <CodingDomainPageBase
            props={{
                labels: {
                    navHome: t("navHome"),
                    navPractice: t("title"),
                    title: name,
                    standingLabel: t("domainStanding"),
                    standingFact: t("count", { solved: solvedHere, total }),
                    meterLabel: t("meter", { name }),
                },
                percent: total === 0 ? 0 : Math.round((solvedHere / total) * 100),
                problems: {
                    state,
                    items: rows,
                    ...(state === "empty" ? {
                        noticeMessage: t("emptyDomain"),
                        noticeDescription: t("emptyDomainDetail"),
                        noticeActionLabel: t("backToDomains"),
                    } : {}),
                    ...(state === "all-solved" ? {
                        noticeMessage: t("allSolved"),
                        noticeDescription: t("allSolvedDetail", { total }),
                        noticeActionLabel: t("backToDomains"),
                    } : {}),
                },
            }}
            on={{
                goHome: () => router.push("/dashboard"),
                goPractice: () => router.push("/practice"),
                openProblem: (slug: string) => router.push(`/practice/problem/${slug}`),
                recover: () => router.push("/practice"),
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "coding" } as const
