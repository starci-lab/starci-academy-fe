"use client"

import { useCallback, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useQueryCodingProblemSwr } from "@/hooks/swr/useQueryCodingProblemSwr"
import { useJobVerdictSocketIo, type JobVerdict } from "@/hooks/socketio/useJobVerdictSocketIo"
import { mutationSubmitCodingSolution } from "@/modules/api/graphql/mutations/mutation-submit-coding-solution"
import type { EditorTelemetry } from "@/components/leaves/CodeEditor"
import type { JudgeVerdictState } from "@/components/blocks/coding/JudgeStatusStrip/component"
import { CodingProblemWorkBase } from "./component"

/** Route identity consumed by the connected work-column owner. */
export type CodingProblemWorkProps = { readonly slug: string }
const LANGUAGES = ["python", "javascript", "typescript", "java", "cpp"] as const

const verdictStateOf = (jobId: string | undefined, isConnected: boolean, verdict: JobVerdict | undefined): JudgeVerdictState => {
    if (jobId === undefined) return "idle"
    if (!isConnected) return "socket-lost"
    if (verdict?.verdict === undefined) return "pending"
    if (verdict.verdict === "judging") return "judging"
    return verdict.verdict as JudgeVerdictState
}

const editorStateOf = (isSubmitting: boolean, jobId: string | undefined) => isSubmitting ? "submitting" as const : jobId === undefined ? "ready" as const : "judged" as const

/** Own editor drafts, submit mutation and verdict socket state for one problem's work column. */
export const CodingProblemWork = ({ slug }: CodingProblemWorkProps) => {
    const t = useTranslations("practice")
    const problem = useQueryCodingProblemSwr(slug)
    const [language, setLanguage] = useState("python")
    const [jobId, setJobId] = useState<string>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const drafts = useRef<Map<string, string>>(new Map())
    const telemetry = useRef<EditorTelemetry | undefined>(undefined)
    const openedAt = useRef(Date.now())
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
                telemetry: { ...telemetry.current, elapsedMs: Date.now() - openedAt.current },
            })
            setJobId(result.data?.submitCodingSolution?.data?.jobId)
        } finally {
            setIsSubmitting(false)
        }
    }, [problem.data, slug, language, starter])
    const verdictState = verdictStateOf(jobId, isConnected, verdict)
    return <CodingProblemWorkBase
        verdict={{
            state: verdictState,
            props: {
                verdictLabel: t(`verdict.${verdictState}`),
                detailLabel: verdict?.totalTestcases === undefined ? undefined : t("verdictDetail", { passed: verdict.passedTestcases ?? 0, total: verdict.totalTestcases }),
                ...(verdictState === "socket-lost" ? { actionLabel: t("reread") } : {}),
            },
        }}
        editor={{
            state: editorStateOf(isSubmitting, jobId),
            props: {
                languages: LANGUAGES.map((id) => ({ id, label: t(`language.${id}`) })),
                language,
                source,
                labels: { editor: t("editorLabel"), languageField: t("languageField"), run: t("run"), submit: t("submit"), submitting: t("submitting") },
                ...(verdict?.compileMessage === undefined ? {} : { compilerMessage: verdict.compileMessage }),
            },
        }}
        on={{
            changeLanguage: setLanguage,
            changeSource: (code) => drafts.current.set(language, code),
            reportTelemetry: (reading) => { telemetry.current = reading },
            submit: () => { void submit() },
            verdictAct: () => { void problem.mutate() },
        }}
    />
}

export { CodingProblemWorkBase } from "./component"
/** Source-level ownership marker for the connected work-column block. */
export const meta = { world: "connected", domain: "coding" } as const
