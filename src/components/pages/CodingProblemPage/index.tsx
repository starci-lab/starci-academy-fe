"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useQueryCodingProblemSwr } from "@/hooks/swr/useQueryCodingProblemSwr"
import { useJobVerdictSocketIo } from "@/hooks/socketio/useJobVerdictSocketIo"
import { mutationSubmitCodingSolution } from "@/modules/api/graphql/mutations/mutation-submit-coding-solution"
import { type EditorTelemetry } from "@/components/leaves/CodeEditor"
import { type JudgeVerdictState } from "@/components/blocks/coding/JudgeStatusStrip/component"
import { type ProblemReadingTab } from "@/components/blocks/coding/ProblemReadingColumn/component"
import { _CodingProblemPage } from "./component"

/** Props for {@link CodingProblemPage}. */
export interface CodingProblemPageProps {
    /** The problem's URL slug, from the route segment. */
    slug: string
}

/** The languages the server accepts, in the order a reader scans them. */
const LANGUAGES = ["python", "javascript", "typescript", "java", "cpp"] as const

/**
 * One problem, connected.
 *
 * THE VERDICT COMES OVER A SOCKET, NOT FROM THE MUTATION. `submitCodingSolution` answers with a
 * `submissionId` and a `jobId`; the judging result arrives later on that job. Everything about this
 * file's shape follows from that: the submit handler stores a job id and stops, and the strip above
 * the editor is driven by what the socket says afterwards.
 *
 * A LOST SOCKET IS NOT A FAILED SUBMISSION. Judging carries on server-side while the client is
 * deaf, so a pending job with no connection reports `socket-lost` and offers a re-read. Reporting a
 * failure there would invite a resubmit, and a resubmit enqueues a second judging of work already
 * done.
 *
 * ONE DRAFT PER LANGUAGE. The editor is uncontrolled, so switching language hands it a different
 * `defaultValue` and the buffer it had is kept here rather than discarded - somebody who wrote
 * thirty lines of Python and glanced at the Java starter must get their Python back.
 *
 * TELEMETRY IS COLLECTED AND SENT, because the server scores an attempt's honesty with it. The
 * clock starts when this page mounts, which is the closest thing a client has to "opened the
 * problem".
 */
export const CodingProblemPage = ({ slug }: CodingProblemPageProps) => {
    const t = useTranslations("practice")
    const problem = useQueryCodingProblemSwr(slug)

    const [tab, setTab] = useState<ProblemReadingTab>("statement")
    const [language, setLanguage] = useState<string>("python")
    const [jobId, setJobId] = useState<string | undefined>(undefined)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const drafts = useRef<Map<string, string>>(new Map())
    const telemetry = useRef<EditorTelemetry | undefined>(undefined)
    const openedAt = useRef<number>(Date.now())

    const { verdict, isConnected } = useJobVerdictSocketIo(jobId)

    const starter = problem.data?.starterCodes.find((row) => row.language === language)?.code
    const source = drafts.current.get(language) ?? starter

    const submit = useCallback(async () => {
        if (problem.data === undefined || problem.data === null) return
        setIsSubmitting(true)
        try {
            const result = await mutationSubmitCodingSolution({
                slug,
                language,
                sourceCode: drafts.current.get(language) ?? starter ?? "",
                telemetry: {
                    ...telemetry.current,
                    elapsedMs: Date.now() - openedAt.current,
                },
            })
            setJobId(result.data?.submitCodingSolution?.data?.jobId)
        } finally {
            setIsSubmitting(false)
        }
    }, [problem.data, slug, language, starter])

    /*
     * THE STRIP'S SITUATION, derived in one place.
     *
     * Order matters: a job that exists with no connection is `socket-lost` BEFORE it is `pending`,
     * because the honest thing to say is that we stopped hearing rather than that we are waiting.
     */
    const verdictState: JudgeVerdictState = jobId === undefined
        ? "idle"
        : !isConnected
            ? "socket-lost"
            : verdict?.verdict === undefined
                ? "pending"
                : verdict.verdict === "judging"
                    ? "judging"
                    : (verdict.verdict as JudgeVerdictState)

    const readingBody = tab === "statement"
        ? problem.data?.statement
        : tab === "hint"
            ? t("hintPending")
            : t("tabEmpty")

    return (
        <_CodingProblemPage
            props={{
                reading: {
                    state: problem.data === undefined ? "pending" : "ready",
                    props: {
                        tab,
                        tabLabels: {
                            statement: t("tabStatement"),
                            hint: t("tabHint"),
                            solution: t("tabSolution"),
                            submissions: t("tabSubmissions"),
                            group: t("tabGroup"),
                        },
                        title: problem.data?.title,
                        difficulty: problem.data === undefined || problem.data === null
                            ? undefined
                            : t("problemFact", {
                                difficulty: t(`difficulty.${problem.data.difficulty}`),
                                points: problem.data.points,
                                ms: problem.data.timeLimitMs,
                                mb: Math.round(problem.data.memoryLimitKb / 1024),
                            }),
                        body: readingBody,
                        tags: problem.data?.tags,
                    },
                },
                verdict: {
                    state: verdictState,
                    props: {
                        verdictLabel: t(`verdict.${verdictState}`),
                        detailLabel: verdict?.totalTestcases === undefined
                            ? undefined
                            : t("verdictDetail", {
                                passed: verdict.passedTestcases ?? 0,
                                total: verdict.totalTestcases,
                            }),
                        ...(verdictState === "socket-lost" ? { actionLabel: t("reread") } : {}),
                    },
                },
                editor: {
                    state: isSubmitting ? "submitting" : jobId === undefined ? "ready" : "judged",
                    props: {
                        languages: LANGUAGES.map((id) => ({ id, label: t(`language.${id}`) })),
                        language,
                        source,
                        labels: {
                            editor: t("editorLabel"),
                            languageField: t("languageField"),
                            run: t("run"),
                            submit: t("submit"),
                            submitting: t("submitting"),
                        },
                        ...(verdict?.compileMessage === undefined ? {} : { compilerMessage: verdict.compileMessage }),
                    },
                },
            }}
            on={{
                selectTab: (next: string) => setTab(next as ProblemReadingTab),
                changeLanguage: setLanguage,
                changeSource: (code: string) => drafts.current.set(language, code),
                submit: () => { void submit() },
                verdictAct: () => { void problem.mutate() },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "coding" } as const
